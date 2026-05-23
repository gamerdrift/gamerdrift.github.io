class GameEngine {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = {};
        
        // Systems
        this.particles = null;
        
        // Waypoint Rail System
        this.checkpoints = [];
        this.currentCheckpointIndex = 0;
        this.cameraMoving = false;
        this.targetCameraPos = new THREE.Vector3();
        this.targetCameraLookAt = new THREE.Vector3();
        this.currentCameraLookAt = new THREE.Vector3();
        this.cameraTransitionSpeed = 1.8;
        
        // Active entities
        this.activeEnemies = [];
        this.prisoner = null;
        
        // Level reference meshes
        this.levelMeshes = [];
        this.currentStageIndex = 1;

        // Cover height offset
        this.coverOffset = 0;
        this.coverMaxOffset = 1.3;

        // First Person Weapon properties
        this.fpWeapon = null;
        this.fpWeaponGroup = new THREE.Group();
        this.muzzleFlashMesh = null;
        this.muzzleFlashLight = null;
        this.muzzleFlashTimer = 0;
        this.swayX = 0;
        this.swayY = 0;
        this.swayTargetX = 0;
        this.swayTargetY = 0;
        this.recoilOffsetZ = 0;
        this.recoilRotX = 0;
        this.reloadOffsetY = 0;
        this.reloadRotX = 0;
        this.barrelTipZ = 0;
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        
        // Create Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0d, 0.015);

        // Create Camera
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);
        
        // Add first-person weapon group to camera
        this.camera.add(this.fpWeaponGroup);
 
        // Create Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        this.setupLighting();

        // Particles
        this.particles = new ParticleManager(this.scene);

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Raycasting setup
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    setupFirstPersonWeapon(weaponKey, camoType) {
        // Remove existing weapon mesh
        if (this.fpWeapon) {
            this.fpWeaponGroup.remove(this.fpWeapon);
            this.fpWeapon.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
            this.fpWeapon = null;
        }

        // Remove old muzzle flash and light (already children of weapon, but dispose anyway)
        if (this.muzzleFlashMesh) {
            this.muzzleFlashMesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            this.muzzleFlashMesh = null;
        }
        this.muzzleFlashLight = null;

        // Build new weapon mesh
        this.fpWeapon = FirstPersonWeapon.build(weaponKey, camoType);
        
        // Align and position weapon based on type
        if (weaponKey === 'pistol') {
            this.fpWeapon.position.set(0.12, -0.16, -0.32);
            this.fpWeapon.rotation.set(0.02, -0.06, 0);
            this.barrelTipZ = 0.33;
        } else if (weaponKey === 'shotgun') {
            this.fpWeapon.position.set(0.15, -0.18, -0.38);
            this.fpWeapon.rotation.set(0.04, -0.08, -0.02);
            this.barrelTipZ = 0.95;
        } else if (weaponKey === 'rifle') {
            this.fpWeapon.position.set(0.14, -0.18, -0.36);
            this.fpWeapon.rotation.set(0.02, -0.08, -0.02);
            this.barrelTipZ = 1.34;
        }

        this.fpWeaponGroup.add(this.fpWeapon);

        // Build muzzle flash mesh (starburst shape)
        const flashGroup = new THREE.Group();
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.9 });
        
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), flashMat);
        flashGroup.add(core);

        const spikeGeo = new THREE.ConeGeometry(0.02, 0.18, 4);
        spikeGeo.rotateX(Math.PI / 2);
        
        const spike1 = new THREE.Mesh(spikeGeo, flashMat);
        spike1.position.z = 0.08;
        flashGroup.add(spike1);
        
        const spike2 = new THREE.Mesh(spikeGeo, flashMat);
        spike2.rotation.y = Math.PI / 2;
        spike2.position.x = 0.08;
        flashGroup.add(spike2);
        
        const spike3 = new THREE.Mesh(spikeGeo, flashMat);
        spike3.rotation.x = Math.PI / 2;
        spike3.position.y = 0.08;
        flashGroup.add(spike3);

        // Position flash at barrel tip local coordinates
        const localY = weaponKey === 'pistol' ? 0.03 : (weaponKey === 'shotgun' ? 0.05 : 0.02);
        flashGroup.position.set(0, localY, this.barrelTipZ);
        flashGroup.visible = false;
        this.muzzleFlashMesh = flashGroup;
        this.fpWeapon.add(this.muzzleFlashMesh);

        // Muzzle flash light
        this.muzzleFlashLight = new THREE.PointLight(0xffaa00, 0, 5);
        this.muzzleFlashLight.position.set(0, localY, this.barrelTipZ);
        this.fpWeapon.add(this.muzzleFlashLight);
    }

    triggerWeaponRecoil() {
        this.recoilOffsetZ = -0.08;
        this.recoilRotX = 0.15;
        this.muzzleFlashTimer = 0.05; // Flash visible for 50ms
        if (this.muzzleFlashMesh) this.muzzleFlashMesh.visible = true;
        if (this.muzzleFlashLight) this.muzzleFlashLight.intensity = 4.0;
    }

    triggerWeaponReload() {
        this.reloadOffsetY = -0.5;
        this.reloadRotX = -Math.PI / 4;
        
        const duration = window.game ? window.game.weapons[window.game.activeWeaponKey].reloadTime : 1500;
        const activeReloadTime = window.game && window.game.isCovering ? duration * 0.75 : duration;
        
        new TWEEN.Tween(this)
            .to({ reloadOffsetY: 0, reloadRotX: 0 }, activeReloadTime)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    triggerWeaponDraw() {
        this.reloadOffsetY = -0.5;
        this.reloadRotX = -Math.PI / 4;
        new TWEEN.Tween(this)
            .to({ reloadOffsetY: 0, reloadRotX: 0 }, 400)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }
 
    setupLighting() {
        // Ambient Light
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(this.lights.ambient);

        // Directional Sun Light
        this.lights.sun = new THREE.DirectionalLight(0xffffff, 1.2);
        this.lights.sun.position.set(20, 40, 20);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 1024;
        this.lights.sun.shadow.mapSize.height = 1024;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 150;
        const d = 30;
        this.lights.sun.shadow.camera.left = -d;
        this.lights.sun.shadow.camera.right = d;
        this.lights.sun.shadow.camera.top = d;
        this.lights.sun.shadow.camera.bottom = -d;
        this.scene.add(this.lights.sun);

        // Spotlight for dramatic shadows
        this.lights.spot = new THREE.SpotLight(0xff9900, 5, 60, Math.PI / 4, 0.5, 1);
        this.lights.spot.position.set(0, 20, 0);
        this.lights.spot.castShadow = true;
        this.scene.add(this.lights.spot);
    }

    setStageEnvironment(stageIndex) {
        this.currentStageIndex = stageIndex;
        this.clearLevel();

        // Preset theme settings
        let fogColor, ambientColor, sunColor, spotColor;
        
        switch(stageIndex) {
            case 1: // Container Yard (Urban Cyber / Dark Night)
                fogColor = 0x0a0a10;
                ambientColor = 0x1a1a2e;
                sunColor = 0x3d5a80; // cold blue moon
                spotColor = 0xff9900; // industrial orange
                break;
            case 2: // Cargo Ship (Overcast Stormy Sea)
                fogColor = 0x1c2530;
                ambientColor = 0x22303c;
                sunColor = 0x5a7890; // steel blue sky
                spotColor = 0x00ffcc; // safety green
                break;
            case 3: // Military Airport (Sunset Runway)
                fogColor = 0x3a1f11; // deep dusty orange
                ambientColor = 0x2b1c16;
                sunColor = 0xffaa66; // warm sun
                spotColor = 0xff5500; // sunset glare
                break;
            case 4: // Afghan Village (Bright Desert Sun)
                fogColor = 0xd9b48f; // sand dust
                ambientColor = 0x4a3d2c;
                sunColor = 0xfffaed; // hot white sun
                spotColor = 0xbf9c6f; 
                break;
            case 5: // Jungle Outpost (Mist Forest Green)
                fogColor = 0x0f1c12;
                ambientColor = 0x142b1b;
                sunColor = 0x7da47d; // green diffused sun
                spotColor = 0x88ff00; // radioactive green
                break;
        }

        // Apply colors
        this.scene.background = new THREE.Color(fogColor);
        this.scene.fog.color.setHex(fogColor);
        this.lights.ambient.color.setHex(ambientColor);
        this.lights.sun.color.setHex(sunColor);
        this.lights.spot.color.setHex(spotColor);

        // Adjust sun intensity
        this.lights.sun.intensity = stageIndex === 4 ? 1.5 : 1.0;

        // Build Stage Geometries
        this.buildStageAssets(stageIndex);
        this.buildCameraRail(stageIndex);
    }

    clearLevel() {
        this.levelMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
            } else if (mesh.material) {
                mesh.material.dispose();
            }
        });
        this.levelMeshes = [];

        // Clear active entities
        this.activeEnemies.forEach(e => this.scene.remove(e.mesh));
        this.activeEnemies = [];

        if (this.prisoner) {
            this.scene.remove(this.prisoner.mesh);
            this.prisoner = null;
        }

        this.particles.clear();
    }

    // Dynamic procedural level elements
    buildStageAssets(stage) {
        const createMesh = (geo, mat, x, y, z, rx=0, ry=0, rz=0, shadow=true) => {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, y, z);
            mesh.rotation.set(rx, ry, rz);
            mesh.receiveShadow = shadow;
            mesh.castShadow = shadow;
            this.scene.add(mesh);
            this.levelMeshes.push(mesh);
            return mesh;
        };

        // Floor
        const groundMat = new THREE.MeshLambertMaterial({ 
            color: stage === 1 ? 0x222225 : (stage === 4 ? 0xcaa06a : (stage === 5 ? 0x1a3311 : 0x3c454e)) 
        });
        const floorGeo = new THREE.PlaneGeometry(300, 300);
        const floor = createMesh(floorGeo, groundMat, 0, 0, 0, -Math.PI/2, 0, 0, true);

        if (stage === 1) {
            // --- STAGE 1: Container Yard ---
            // Colors of containers
            const containerColors = [0x9b2226, 0x005f73, 0x0a9396, 0xca6702, 0xae2012, 0x1d3557];
            const size = new THREE.BoxGeometry(3.5, 3.5, 8.0);
            
            // Spawn blocks of containers along the pathway
            for (let z = 10; z < 140; z += 20) {
                const colLeft = containerColors[Math.floor(Math.random() * containerColors.length)];
                const colRight = containerColors[Math.floor(Math.random() * containerColors.length)];

                // Left barrier
                createMesh(size, new THREE.MeshLambertMaterial({ color: colLeft }), -6, 1.75, z);
                createMesh(size, new THREE.MeshLambertMaterial({ color: colLeft }), -6, 5.25, z, 0, Math.PI/24); // stacked

                // Right barrier
                createMesh(size, new THREE.MeshLambertMaterial({ color: colRight }), 6, 1.75, z + 5);
                createMesh(size, new THREE.MeshLambertMaterial({ color: colRight }), 5.5, 1.75, z + 12);

                // Obstacles/cover on pathway
                const crateGeo = new THREE.BoxGeometry(2.0, 1.3, 2.0);
                const coverMat = new THREE.MeshLambertMaterial({ map: ProceduralTextures.generateMetalPlates() });
                createMesh(crateGeo, coverMat, 0, 0.65, z + 8);
            }

            // Giant Crane Gantry in distance
            const beamGeo = new THREE.BoxGeometry(20, 1, 2);
            const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 15);
            const craneMat = new THREE.MeshLambertMaterial({ color: 0xe0a96d });

            createMesh(beamGeo, craneMat, 0, 15, 60);
            createMesh(legGeo, craneMat, -8, 7.5, 60);
            createMesh(legGeo, craneMat, 8, 7.5, 60);

        } else if (stage === 2) {
            // --- STAGE 2: Cargo Ship ---
            // Draw Cargo Ship Deck rising above floor (water level)
            const hullGeo = new THREE.BoxGeometry(15, 6, 120);
            const hullMat = new THREE.MeshLambertMaterial({ color: 0x202830 });
            createMesh(hullGeo, hullMat, 0, 3, 70); // Hull deck

            // Animated water side panels
            const waterMat = new THREE.MeshPhongMaterial({ color: 0x002244, shininess: 80, transparent: true, opacity: 0.85 });
            const leftWater = createMesh(new THREE.PlaneGeometry(100, 120), waterMat, -25, 0.05, 70, -Math.PI/2, 0, 0);
            const rightWater = createMesh(new THREE.PlaneGeometry(100, 120), waterMat, 25, 0.05, 70, -Math.PI/2, 0, 0);

            // Animate water scaling effect to mimic waves
            this.waterRef = [leftWater, rightWater];

            // Ship superstructure / Bridge
            const bridgeGeo = new THREE.BoxGeometry(12, 10, 15);
            const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x5a6065 });
            createMesh(bridgeGeo, bridgeMat, 0, 11, 110);

            // Containers stacked on deck
            const containerGeo = new THREE.BoxGeometry(3, 3, 7);
            const cMat = new THREE.MeshLambertMaterial({ color: 0xae2012 });
            const cMat2 = new THREE.MeshLambertMaterial({ color: 0x005f73 });

            createMesh(containerGeo, cMat, -4, 7.5, 30);
            createMesh(containerGeo, cMat2, 4, 7.5, 45);
            createMesh(containerGeo, cMat, -3.8, 7.5, 65);
            createMesh(containerGeo, cMat2, 0, 7.5, 85); // blocking pathway

            // Defensive deck shields (cover)
            const ironShield = new THREE.BoxGeometry(2.5, 1.4, 0.3);
            const coverMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
            createMesh(ironShield, coverMat, 0, 6.7, 40);
            createMesh(ironShield, coverMat, -2.5, 6.7, 60);
            createMesh(ironShield, coverMat, 2.5, 6.7, 80);

        } else if (stage === 3) {
            // --- STAGE 3: Airport Hangar ---
            // Runway markings
            const markMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
            const runwayLineGeo = new THREE.PlaneGeometry(0.4, 10);
            for (let z = 10; z < 150; z += 20) {
                createMesh(runwayLineGeo, markMat, 0, 0.02, z, -Math.PI/2, 0, 0, false);
            }

            // Hangar dome building in distance
            const hangarGeo = new THREE.CylinderGeometry(15, 15, 40, 16, 1, false, 0, Math.PI);
            const hangarMat = new THREE.MeshLambertMaterial({ color: 0x4a4d52, side: THREE.DoubleSide });
            createMesh(hangarGeo, hangarMat, -20, 0, 80, 0, 0, Math.PI/2);

            // Giant Cargo Airplane parked procedurally
            const planeGroup = new THREE.Group();
            planeGroup.position.set(10, 0.2, 70);
            planeGroup.rotation.y = -Math.PI / 3;

            const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 25, 8), new THREE.MeshLambertMaterial({ color: 0xdfdfdf }));
            fuselage.position.y = 4.5;
            fuselage.rotation.x = Math.PI/2;
            planeGroup.add(fuselage);

            const wingGeo = new THREE.BoxGeometry(22, 0.2, 4);
            const wings = new THREE.Mesh(wingGeo, new THREE.MeshLambertMaterial({ color: 0xcfcfcf }));
            wings.position.set(0, 4.5, 2);
            planeGroup.add(wings);

            const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 3), new THREE.MeshLambertMaterial({ color: 0xa8201a }));
            tailFin.position.set(0, 8.0, -10);
            planeGroup.add(tailFin);

            this.scene.add(planeGroup);
            this.levelMeshes.push(planeGroup);

            // Fuel tanks / cover crates
            const cylinderGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.0, 8);
            const tankMat = new THREE.MeshLambertMaterial({ color: 0xd62828 });
            createMesh(cylinderGeo, tankMat, -3, 1.0, 25);
            createMesh(cylinderGeo, tankMat, 3, 1.0, 50);

        } else if (stage === 4) {
            // --- STAGE 4: Afghan Ruins ---
            // Sand dunes, crumbling sandstone walls
            const wallMat = new THREE.MeshLambertMaterial({ color: 0xc8a27d, roughness: 0.9 });
            const blockGeo = new THREE.BoxGeometry(3.5, 2.5, 1.2);
            const lowBlockGeo = new THREE.BoxGeometry(3.5, 1.3, 1.2);

            for (let z = 15; z < 140; z += 25) {
                // Alternating ruined gates
                if (z % 50 === 15) {
                    createMesh(blockGeo, wallMat, -5, 1.25, z, 0, Math.PI/8);
                    createMesh(blockGeo, wallMat, 5, 1.25, z, 0, -Math.PI/6);
                    createMesh(lowBlockGeo, wallMat, 0, 0.65, z + 5); // cover in center
                } else {
                    createMesh(blockGeo, wallMat, -2, 1.25, z);
                    createMesh(blockGeo, wallMat, 6, 1.25, z - 4);
                    createMesh(lowBlockGeo, wallMat, -5, 0.65, z + 8);
                }
            }

            // Scattered sandbags
            const bagGeo = new THREE.BoxGeometry(2.0, 0.5, 0.8);
            const sandbagMat = new THREE.MeshLambertMaterial({ color: 0xcaa06a });
            for (let z = 20; z < 150; z += 40) {
                createMesh(bagGeo, sandbagMat, 0, 0.25, z);
                createMesh(bagGeo, sandbagMat, 0, 0.75, z, 0, Math.PI/12); // stack
            }

        } else if (stage === 5) {
            // --- STAGE 5: Jungle Outpost & POW Rescue ---
            // Green trees, foliage watchtowers, prison cage
            const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4d3821 });
            const leafMat = new THREE.MeshLambertMaterial({ color: 0x1b4314 });
            const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 7.0, 6);
            const leafGeo = new THREE.ConeGeometry(2.2, 4.0, 5);

            const spawnTree = (tx, tz) => {
                const group = new THREE.Group();
                group.position.set(tx, 0, tz);

                const trunk = new THREE.Mesh(trunkGeo, trunkMat);
                trunk.position.y = 3.5;
                group.add(trunk);

                const leaves = new THREE.Mesh(leafGeo, leafMat);
                leaves.position.y = 6.5;
                group.add(leaves);

                this.scene.add(group);
                this.levelMeshes.push(group);
            };

            // Spawn jungle boundary trees
            for (let z = 10; z < 140; z += 15) {
                spawnTree(-6 - Math.random()*4, z);
                spawnTree(6 + Math.random()*4, z + 5);
            }

            // Wooden huts (crates/wooden sheets)
            const hutGeo = new THREE.BoxGeometry(4.0, 3.5, 4.0);
            const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c4033 });
            createMesh(hutGeo, woodMat, -5, 1.75, 40);
            createMesh(hutGeo, woodMat, 5, 1.75, 80);

            // Defensive cover logs
            const logGeo = new THREE.CylinderGeometry(0.5, 0.5, 3.5, 8);
            logGeo.rotateZ(Math.PI / 2);
            createMesh(logGeo, trunkMat, 0, 0.5, 30);
            createMesh(logGeo, trunkMat, 0, 0.5, 70);
            createMesh(logGeo, trunkMat, 0, 0.5, 110);
        }
    }

    // Camera checkpoint rail coordinates
    buildCameraRail(stage) {
        this.checkpoints = [];
        this.currentCheckpointIndex = 0;
        this.cameraMoving = false;

        const addPoint = (x, y, z, lookX, lookY, lookZ, enemiesList = []) => {
            this.checkpoints.push({
                cameraPos: new THREE.Vector3(x, y, z),
                lookAt: new THREE.Vector3(lookX, lookY, lookZ),
                enemies: enemiesList,
                cleared: false
            });
        };

        // Custom checkpoint rail setup for each stage
        if (stage === 1) {
            // Stage 1: Container Yard Waypoints
            addPoint(0, 2.5, 5, 0, 2.2, 20, [
                { type: 'soldier', pos: new THREE.Vector3(-2.5, 0, 18) },
                { type: 'soldier', pos: new THREE.Vector3(2.5, 0, 22) }
            ]);
            addPoint(0, 2.5, 30, 0, 2.2, 50, [
                { type: 'soldier', pos: new THREE.Vector3(-3.5, 0, 48) },
                { type: 'drone', pos: new THREE.Vector3(0, 4.0, 42) }
            ]);
            addPoint(0, 2.5, 60, 0, 2.2, 85, [
                { type: 'soldier', pos: new THREE.Vector3(3.0, 0, 75) },
                { type: 'soldier', pos: new THREE.Vector3(-3.0, 0, 80) },
                { type: 'sniper', pos: new THREE.Vector3(2.0, 0, 95) }
            ]);
            addPoint(0, 2.5, 100, 0, 2.2, 125, [
                { type: 'heavy', pos: new THREE.Vector3(0, 0, 115) },
                { type: 'drone', pos: new THREE.Vector3(-2.5, 3.5, 112) },
                { type: 'drone', pos: new THREE.Vector3(2.5, 3.5, 112) }
            ]);

        } else if (stage === 2) {
            // Stage 2: Cargo Ship (deck is y=6)
            addPoint(0, 8.5, 15, 0, 8.0, 30, [
                { type: 'soldier', pos: new THREE.Vector3(-2.5, 6.0, 28) },
                { type: 'soldier', pos: new THREE.Vector3(2.5, 6.0, 28) }
            ]);
            addPoint(0, 8.5, 35, 0, 8.0, 55, [
                { type: 'soldier', pos: new THREE.Vector3(-3.0, 6.0, 50) },
                { type: 'sniper', pos: new THREE.Vector3(3.0, 6.0, 58) }
            ]);
            addPoint(0, 8.5, 60, 0, 8.0, 80, [
                { type: 'heavy', pos: new THREE.Vector3(0, 6.0, 74) },
                { type: 'drone', pos: new THREE.Vector3(-2.0, 9.5, 72) }
            ]);
            addPoint(0, 9.5, 90, 0, 10.0, 115, [
                { type: 'boss', pos: new THREE.Vector3(0, 15.0, 110) } // Helicopter Boss
            ]);

        } else if (stage === 3) {
            // Stage 3: Airport
            addPoint(0, 2.5, 5, 0, 2.2, 25, [
                { type: 'soldier', pos: new THREE.Vector3(-3.0, 0, 20) },
                { type: 'drone', pos: new THREE.Vector3(2.0, 3.5, 18) }
            ]);
            addPoint(0, 2.5, 30, 0, 2.2, 55, [
                { type: 'soldier', pos: new THREE.Vector3(3.5, 0, 48) },
                { type: 'sniper', pos: new THREE.Vector3(-3.5, 0, 52) }
            ]);
            addPoint(0, 2.5, 60, 0, 2.2, 85, [
                { type: 'heavy', pos: new THREE.Vector3(-2.5, 0, 78) },
                { type: 'heavy', pos: new THREE.Vector3(2.5, 0, 78) }
            ]);
            addPoint(0, 2.5, 95, 0, 2.2, 120, [
                { type: 'soldier', pos: new THREE.Vector3(0, 0, 112) },
                { type: 'drone', pos: new THREE.Vector3(-3.0, 4.0, 110) },
                { type: 'drone', pos: new THREE.Vector3(3.0, 4.0, 110) }
            ]);

        } else if (stage === 4) {
            // Stage 4: Afghan Village
            addPoint(0, 2.5, 5, 0, 2.2, 25, [
                { type: 'soldier', pos: new THREE.Vector3(-2.5, 0, 18) },
                { type: 'soldier', pos: new THREE.Vector3(2.5, 0, 22) }
            ]);
            addPoint(0, 2.5, 30, 0, 2.2, 55, [
                { type: 'sniper', pos: new THREE.Vector3(-3.5, 0, 48) },
                { type: 'heavy', pos: new THREE.Vector3(2.0, 0, 50) }
            ]);
            addPoint(0, 2.5, 60, 0, 2.2, 85, [
                { type: 'drone', pos: new THREE.Vector3(-2.0, 4.0, 75) },
                { type: 'drone', pos: new THREE.Vector3(2.0, 4.0, 75) }
            ]);
            addPoint(0, 2.5, 95, 0, 3.0, 125, [
                { type: 'boss', pos: new THREE.Vector3(0, 0, 120) } // Tank Boss
            ]);

        } else if (stage === 5) {
            // Stage 5: Jungle Outpost & POW Rescue
            addPoint(0, 2.5, 5, 0, 2.2, 25, [
                { type: 'soldier', pos: new THREE.Vector3(-2.5, 0, 18) },
                { type: 'soldier', pos: new THREE.Vector3(2.5, 0, 22) }
            ]);
            addPoint(0, 2.5, 35, 0, 2.2, 60, [
                { type: 'heavy', pos: new THREE.Vector3(-3.0, 0, 52) },
                { type: 'sniper', pos: new THREE.Vector3(3.0, 0, 58) }
            ]);
            addPoint(0, 2.5, 70, 0, 2.2, 95, [
                { type: 'boss', pos: new THREE.Vector3(0, 0, 90) } // Commander Boss
            ]);
            addPoint(0, 2.5, 100, 0, 2.2, 115, [
                // POW Cage Checkpoint (No enemies, just rescue objective)
            ]);
        }

        // Place initial camera positioning
        const firstCP = this.checkpoints[0];
        this.camera.position.copy(firstCP.cameraPos);
        this.currentCameraLookAt.copy(firstCP.lookAt);
        this.camera.lookAt(this.currentCameraLookAt);
        
        this.targetCameraPos.copy(firstCP.cameraPos);
        this.targetCameraLookAt.copy(firstCP.lookAt);

        // Spawn first batch of enemies
        this.spawnEnemiesForCheckpoint(0);
    }

    spawnEnemiesForCheckpoint(index) {
        const cp = this.checkpoints[index];
        if (!cp || cp.cleared) return;

        // Visual camo name
        const camoNames = { 1: 'urban', 2: 'navy', 3: 'desert', 4: 'desert', 5: 'forest' };
        const camo = camoNames[this.currentStageIndex];

        // Trigger spawning entities
        cp.enemies.forEach(e => {
            let entity;
            if (e.type === 'soldier') {
                entity = new Enemy(this.scene, camo, e.pos, 'soldier');
            } else if (e.type === 'sniper') {
                entity = new Enemy(this.scene, camo, e.pos, 'sniper');
            } else if (e.type === 'heavy') {
                entity = new Enemy(this.scene, camo, e.pos, 'heavy');
            } else if (e.type === 'drone') {
                entity = new Drone(this.scene, e.pos);
            } else if (e.type === 'boss') {
                if (this.currentStageIndex === 2) {
                    entity = new HelicopterBoss(this.scene, e.pos);
                } else if (this.currentStageIndex === 4) {
                    entity = new TankBoss(this.scene, e.pos);
                } else if (this.currentStageIndex === 5) {
                    entity = new CommanderBoss(this.scene, e.pos);
                }
            }
            if (entity) {
                this.activeEnemies.push(entity);
            }
        });

        // Special: If it's the last checkpoint of Stage 5, spawn the Prisoner of War
        if (this.currentStageIndex === 5 && index === this.checkpoints.length - 1) {
            this.prisoner = new PrisonerOfWar(this.scene, new THREE.Vector3(0, 0, 112));
            window.game.updateObjective("Shoot the cage lock to rescue the Prisoner of War!");
        }
    }

    advanceCheckpoint() {
        if (this.currentCheckpointIndex + 1 >= this.checkpoints.length) {
            // Stage Complete!
            window.game.onStageComplete();
            return;
        }

        this.currentCheckpointIndex++;
        const nextCP = this.checkpoints[this.currentCheckpointIndex];

        this.targetCameraPos.copy(nextCP.cameraPos);
        this.targetCameraLookAt.copy(nextCP.lookAt);
        this.cameraMoving = true;

        window.game.updateObjective("Moving forward...");
    }

    triggerRaycast(x, y, damage) {
        // Transform screen coordinates (-1 to 1) for Raycaster
        this.mouse.x = x;
        this.mouse.y = y;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Convert enemy group models into direct children meshes for raycast checks
        const targetMeshes = [];
        const meshToEnemyMap = new Map();

        this.activeEnemies.forEach(enemy => {
            if (enemy.isDead) return;
            enemy.mesh.traverse(child => {
                if (child.isMesh) {
                    targetMeshes.push(child);
                    meshToEnemyMap.set(child, enemy);
                }
            });
        });

        // Special check: Prisoner cage lock
        if (this.prisoner && this.prisoner.cageLocked) {
            this.prisoner.mesh.traverse(child => {
                if (child.isMesh && child.name === "cage_lock") {
                    targetMeshes.push(child);
                    meshToEnemyMap.set(child, this.prisoner);
                }
            });
        }

        const intersects = this.raycaster.intersectObjects(targetMeshes);

        if (intersects.length > 0) {
            const hit = intersects[0];
            const hitMesh = hit.object;
            const enemy = meshToEnemyMap.get(hitMesh);

            if (enemy) {
                if (enemy === this.prisoner) {
                    // Shoot cage lock
                    this.prisoner.unlock();
                    window.game.onRescuePOW();
                    return { hit: true, isPOW: true };
                }

                // Call takeDamage on custom enemy object
                const hitResult = enemy.takeDamage(damage, hitMesh.name);
                
                // Spawn particles on impact
                if (hitResult.isShield) {
                    // blue energy rings
                    this.particles.spawn(hit.point, 0x00ffff, 6, 2, 0.1);
                } else if (enemy.type === 'drone' || enemy.type === 'boss') {
                    // sparks
                    this.particles.spawn(hit.point, 0xffaa00, 8, 3, 0.12);
                } else {
                    // blood splatter
                    this.particles.spawn(hit.point, 0x990000, 8, 2, 0.1);
                }

                window.gameAudio.playHit();
                return { hit: true, enemy, ...hitResult };
            }
        }

        // Draw stray bullet sparks on background geometries
        const bgIntersects = this.raycaster.intersectObjects(this.levelMeshes);
        if (bgIntersects.length > 0) {
            const hit = bgIntersects[0];
            this.particles.spawn(hit.point, 0xdddd99, 4, 1.5, 0.08);
            return { hit: false };
        }

        return { hit: false };
    }

    // Checking if all current enemies are dead
    checkEnemiesCleared() {
        if (this.activeEnemies.length === 0) return true;
        return this.activeEnemies.every(enemy => enemy.isDead);
    }

    update(delta, playerPos, playerCovering) {
        // Update first-person weapon positioning
        if (this.fpWeaponGroup && this.fpWeapon) {
            // Muzzle flash timer
            if (this.muzzleFlashTimer > 0) {
                this.muzzleFlashTimer -= delta;
                if (this.muzzleFlashTimer <= 0) {
                    if (this.muzzleFlashMesh) this.muzzleFlashMesh.visible = false;
                    if (this.muzzleFlashLight) this.muzzleFlashLight.intensity = 0.0;
                }
            }

            // Sway targets
            const targetCoverY = playerCovering ? -0.4 : 0;
            const targetCoverZ = playerCovering ? -0.2 : 0;
            
            const isADS = window.game && window.game.isAimingDownSights;
            
            this.swayTargetX = -this.mouse.x * 0.03;
            this.swayTargetY = -this.mouse.y * 0.02;

            if (isADS) {
                this.swayTargetX = 0;
                this.swayTargetY = 0;
            }

            this.swayX = THREE.MathUtils.lerp(this.swayX, this.swayTargetX, 8 * delta);
            this.swayY = THREE.MathUtils.lerp(this.swayY, this.swayTargetY, 8 * delta);

            // Recoil recovery
            this.recoilOffsetZ = THREE.MathUtils.lerp(this.recoilOffsetZ, 0, 10 * delta);
            this.recoilRotX = THREE.MathUtils.lerp(this.recoilRotX, 0, 10 * delta);

            let weaponX = this.swayX;
            let weaponY = this.swayY + targetCoverY + this.reloadOffsetY;
            let weaponZ = targetCoverZ + this.recoilOffsetZ;

            if (isADS) {
                this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 48, 10 * delta);
                this.camera.updateProjectionMatrix();

                const adsX = 0;
                const adsY = -0.1;
                const adsZ = -0.22;
                
                this.fpWeaponGroup.position.set(
                    THREE.MathUtils.lerp(this.fpWeaponGroup.position.x, adsX, 12 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.position.y, adsY + targetCoverY + this.reloadOffsetY, 12 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.position.z, adsZ + this.recoilOffsetZ, 12 * delta)
                );
                
                this.fpWeaponGroup.rotation.set(
                    THREE.MathUtils.lerp(this.fpWeaponGroup.rotation.x, this.recoilRotX + this.reloadRotX, 12 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.rotation.y, 0, 12 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.rotation.z, 0, 12 * delta)
                );
            } else {
                this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 65, 10 * delta);
                this.camera.updateProjectionMatrix();

                const time = performance.now() * 0.0025;
                const bobY = Math.sin(time) * 0.005;
                const bobX = Math.cos(time * 0.5) * 0.005;

                this.fpWeaponGroup.position.set(
                    THREE.MathUtils.lerp(this.fpWeaponGroup.position.x, weaponX + bobX, 10 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.position.y, weaponY + bobY, 10 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.position.z, weaponZ, 10 * delta)
                );

                this.fpWeaponGroup.rotation.set(
                    THREE.MathUtils.lerp(this.fpWeaponGroup.rotation.x, this.recoilRotX + this.reloadRotX, 10 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.rotation.y, 0, 10 * delta),
                    THREE.MathUtils.lerp(this.fpWeaponGroup.rotation.z, 0, 10 * delta)
                );
            }
        }

        // 1. Cover Lerping (Camera dips down and angles up)
        const targetCoverOffset = playerCovering ? this.coverMaxOffset : 0;
        this.coverOffset = THREE.MathUtils.lerp(this.coverOffset, targetCoverOffset, 10 * delta);

        // 2. Camera position & lookAt transitions
        let camY = this.targetCameraPos.y - this.coverOffset;
        let camZ = this.targetCameraPos.z - (playerCovering ? 0.5 : 0); // pull back slightly in cover

        if (this.cameraMoving) {
            // Move camera
            this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, this.targetCameraPos.x, this.cameraTransitionSpeed * delta);
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, camY, this.cameraTransitionSpeed * delta);
            this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, camZ, this.cameraTransitionSpeed * delta);

            // Interpolate lookAt focus point
            this.currentCameraLookAt.lerp(this.targetCameraLookAt, this.cameraTransitionSpeed * delta);
            this.camera.lookAt(this.currentCameraLookAt);

            // Stop moving if close enough
            const dist = this.camera.position.distanceTo(new THREE.Vector3(this.targetCameraPos.x, camY, camZ));
            if (dist < 0.15) {
                this.cameraMoving = false;
                this.spawnEnemiesForCheckpoint(this.currentCheckpointIndex);
                window.game.updateObjective("Clear all enemy threats!");
            }
        } else {
            // Keep camera steady at active position
            this.camera.position.set(this.targetCameraPos.x, camY, camZ);
            
            // Adjust camera lookAt depending on mouse aiming offset (slight look rotation)
            const aimLookAt = this.targetCameraLookAt.clone();
            if (!playerCovering) {
                aimLookAt.x += this.mouse.x * 2.5;
                aimLookAt.y += this.mouse.y * 1.5;
            } else {
                aimLookAt.y += 0.8; // look up slightly over cover obstacle
            }

            this.currentCameraLookAt.lerp(aimLookAt, 6 * delta);
            this.camera.lookAt(this.currentCameraLookAt);

            // Check if enemies are cleared to advance rail
            if (this.checkEnemiesCleared() && !this.checkpoints[this.currentCheckpointIndex].cleared) {
                // If it's stage 5 last checkpoint, wait for POW rescue
                if (this.currentStageIndex === 5 && this.currentCheckpointIndex === this.checkpoints.length - 1) {
                    // Wait for POW lock to be shot
                } else {
                    this.checkpoints[this.currentCheckpointIndex].cleared = true;
                    setTimeout(() => this.advanceCheckpoint(), 800);
                }
            }
        }

        // 3. Update entities
        this.activeEnemies.forEach(e => e.update(delta, this.camera.position, playerCovering));

        // 4. Update particles
        this.particles.update(delta);

        // 5. Water waves simulation
        if (this.waterRef) {
            const time = performance.now() * 0.001;
            this.waterRef.forEach((w, idx) => {
                w.scale.y = 1.0 + Math.sin(time + idx) * 0.05;
            });
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Export single global instance
window.engine = new GameEngine();
