// procedural textures and military characters
class ProceduralTextures {
    static generateCamo(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Color palettes for different environments
        let colors = [];
        if (type === 'forest') {
            colors = ['#2d4a22', '#1a3311', '#3b2612', '#4d5c43']; // Greens and browns
        } else if (type === 'desert') {
            colors = ['#c2a678', '#d6be96', '#9c8158', '#4d412e']; // Sand, tan, brown
        } else if (type === 'snowy') {
            colors = ['#e6ecef', '#bec5c8', '#8c9597', '#42484a']; // Whites and grays
        } else if (type === 'navy') {
            colors = ['#1d2d44', '#3e5c76', '#748cab', '#0d1321']; // Navy, dark blues
        } else { // urban / default
            colors = ['#3d3d3d', '#1f1f1f', '#6b6b6b', '#121212']; // Grays and blacks
        }

        // Fill base color
        ctx.fillStyle = colors[0];
        ctx.fillRect(0, 0, 256, 256);

        // Draw camo patches
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * (colors.length - 1)) + 1];
            ctx.beginPath();
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const r = 15 + Math.random() * 25;
            
            // Draw blob
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Blobs next to it for camo look
            ctx.beginPath();
            ctx.arc(x + r*0.5, y + r*0.3, r * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add fabric texture noise overlay
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let x = 0; x < 256; x += 4) {
            for (let y = 0; y < 256; y += 4) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        return texture;
    }

    static generateMetalPlates() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#444c56';
        ctx.fillRect(0, 0, 256, 256);

        // Draw metal plates seams
        ctx.strokeStyle = '#222831';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 252, 252);
        ctx.beginPath();
        ctx.moveTo(128, 0); ctx.lineTo(128, 256);
        ctx.moveTo(0, 128); ctx.lineTo(256, 128);
        ctx.stroke();

        // Highlights
        ctx.strokeStyle = '#6b7582';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 4, 248, 248);

        // Rivets
        ctx.fillStyle = '#222831';
        const drawRivet = (rx, ry) => {
            ctx.beginPath();
            ctx.arc(rx, ry, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6b7582';
            ctx.beginPath();
            ctx.arc(rx - 1, ry - 1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#222831';
        };

        drawRivet(20, 20); drawRivet(236, 20);
        drawRivet(20, 236); drawRivet(236, 236);
        drawRivet(148, 20); drawRivet(148, 236);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
}

// Particle System Manager
class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    spawn(pos, colorHex, count = 10, speed = 4, size = 0.15) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({ color: colorHex });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);

            // Add random offset
            mesh.position.x += (Math.random() - 0.5) * 0.2;
            mesh.position.y += (Math.random() - 0.5) * 0.2;
            mesh.position.z += (Math.random() - 0.5) * 0.2;

            // Random velocities
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                (Math.random() - 0.3) * speed + 2, // upwards bias
                (Math.random() - 0.5) * speed
            );

            const life = 0.5 + Math.random() * 0.6; // duration in seconds
            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life, maxLife: life });
        }
    }

    spawnTracer(start, end, colorHex = 0xffaa00) {
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.8
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.particles.push({ mesh: line, velocity: new THREE.Vector3(), life: 0.1, maxLife: 0.1, isTracer: true });
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                if (Array.isArray(p.mesh.material)) {
                    p.mesh.material.forEach(m => m.dispose());
                } else if (p.mesh.material) {
                    p.mesh.material.dispose();
                }
                this.particles.splice(i, 1);
            } else {
                if (!p.isTracer) {
                    // Apply gravity
                    p.velocity.y -= 9.8 * delta;
                    // Move
                    p.mesh.position.addScaledVector(p.velocity, delta);
                    // Fade / Scale down
                    const scale = p.life / p.maxLife;
                    p.mesh.scale.set(scale, scale, scale);
                } else {
                    // Fade tracer line
                    p.mesh.material.opacity = p.life / p.maxLife;
                }
            }
        }
    }

    clear() {
        this.particles.forEach(p => {
            this.scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        });
        this.particles = [];
    }
}

// Enemy base class
class Enemy {
    constructor(scene, camoType, position, type = 'soldier') {
        this.scene = scene;
        this.type = type;
        this.camoType = camoType;
        this.position = position.clone();
        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        
        this.shootTimer = 0.5 + Math.random() * 2;
        this.state = 'hiding'; // hiding, aiming, shooting, dead
        this.stateTimer = Math.random() * 2;
        
        this.laserMesh = null; // sniper laser sight
        this.buildModel();
        this.scene.add(this.mesh);
    }

    buildModel() {
        const camoMat = new THREE.MeshLambertMaterial({ 
            map: ProceduralTextures.generateCamo(this.camoType) 
        });
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xdfb08c }); // Caucasian skin
        const helmetMat = new THREE.MeshLambertMaterial({ color: 0x4a5d43 }); // Dark olive helmet
        const gunMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f }); // Steel black M4

        // 1. Torso
        const torsoGeo = new THREE.CylinderGeometry(0.5, 0.4, 1.2, 8);
        const torso = new THREE.Mesh(torsoGeo, camoMat);
        torso.position.y = 0.6;
        torso.castShadow = true;
        this.mesh.add(torso);

        // 2. Vest (Bulletproof)
        const vestGeo = new THREE.CylinderGeometry(0.55, 0.5, 0.8, 8);
        const vestMat = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Black tactical vest
        const vest = new THREE.Mesh(vestGeo, vestMat);
        vest.position.y = 0.7;
        vest.castShadow = true;
        this.mesh.add(vest);

        // 3. Head
        const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.4;
        head.name = "head"; // for headshot raycasting!
        head.castShadow = true;
        this.mesh.add(head);

        // 4. Helmet
        const helmetGeo = new THREE.SphereGeometry(0.33, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.y = 1.45;
        helmet.name = "head";
        this.mesh.add(helmet);

        // 5. Goggles / Visor
        const visorGeo = new THREE.BoxGeometry(0.4, 0.1, 0.15);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.45, 0.22);
        this.mesh.add(visor);

        // 6. Arms and Gun pointing forward
        const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 6);
        
        const leftArm = new THREE.Mesh(armGeo, camoMat);
        leftArm.position.set(-0.5, 0.9, 0.2);
        leftArm.rotation.x = Math.PI / 2.5;
        leftArm.rotation.z = -Math.PI / 6;
        this.mesh.add(leftArm);

        const rightArm = new THREE.Mesh(armGeo, camoMat);
        rightArm.position.set(0.5, 0.9, 0.2);
        rightArm.rotation.x = Math.PI / 2.5;
        rightArm.rotation.z = Math.PI / 6;
        this.mesh.add(rightArm);

        // 7. Weapon (M4/M16 look)
        const weaponGroup = new THREE.Group();
        weaponGroup.position.set(0.2, 0.8, 0.5);
        weaponGroup.rotation.x = Math.PI / 2;

        const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4);
        const barrel = new THREE.Mesh(barrelGeo, gunMat);
        barrel.position.y = 0.4;
        weaponGroup.add(barrel);

        const stockGeo = new THREE.BoxGeometry(0.1, 0.15, 0.4);
        const stock = new THREE.Mesh(stockGeo, gunMat);
        stock.position.y = -0.2;
        weaponGroup.add(stock);

        const scopeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.2);
        const scope = new THREE.Mesh(scopeGeo, gunMat);
        scope.position.set(0, 0.1, 0.15);
        weaponGroup.add(scope);

        this.mesh.add(weaponGroup);
        this.gunTip = new THREE.Vector3();
        this.weaponGroup = weaponGroup;

        // Custom features based on type
        if (this.type === 'sniper') {
            // Draw laser sight line
            const laserGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 50)
            ]);
            const laserMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 });
            this.laserMesh = new THREE.Line(laserGeo, laserMat);
            this.mesh.add(this.laserMesh);
            
            // Change helmet color to reflect elite / sniper class (e.g. desert/forest hood)
            helmet.material = new THREE.MeshLambertMaterial({ color: 0x7a6348 });
            this.health = 80;
        } else if (this.type === 'heavy') {
            // Heavy armor: metallic textures
            this.health = 250;
            this.maxHealth = 250;
            this.mesh.scale.set(1.15, 1.15, 1.15);
            // Add custom heavy shield on left side
            const shieldGeo = new THREE.BoxGeometry(0.7, 1.5, 0.08);
            const shieldMat = new THREE.MeshLambertMaterial({ color: 0x3a3d40, roughness: 0.8 });
            const shield = new THREE.Mesh(shieldGeo, shieldMat);
            shield.position.set(-0.8, 0.7, 0.4);
            shield.rotation.y = Math.PI / 10;
            shield.name = "shield";
            this.mesh.add(shield);
        }
    }

    getGunTipWorld() {
        if (!this.gunTip) this.gunTip = new THREE.Vector3();
        // Calculate position at tip of weapon
        const localTip = new THREE.Vector3(0.2, 0.8, 1.2);
        return localTip.applyMatrix4(this.mesh.matrixWorld);
    }

    takeDamage(amount, hitNodeName) {
        if (this.isDead) return 0;

        let multiplier = 1;
        let isHeadshot = false;

        if (hitNodeName === 'head') {
            multiplier = 3.0; // massive headshot bonus
            isHeadshot = true;
        } else if (hitNodeName === 'shield') {
            multiplier = 0.05; // Shield blocks 95% of damage!
        }

        const finalDamage = amount * multiplier;
        this.health -= finalDamage;

        if (this.health <= 0) {
            this.die();
        } else {
            // Flinch animation
            this.state = 'flinching';
            this.stateTimer = 0.15;
            this.mesh.rotation.x = -Math.PI / 8;
        }

        return { damage: finalDamage, isHeadshot, isShield: hitNodeName === 'shield' };
    }

    die() {
        this.isDead = true;
        this.state = 'dead';
        if (this.laserMesh) this.laserMesh.visible = false;
        
        // Ragdoll/fall-back rotation animation
        new TWEEN.Tween(this.mesh.rotation)
            .to({ x: -Math.PI / 2, y: Math.PI / 4 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
            
        new TWEEN.Tween(this.mesh.position)
            .to({ y: this.position.y - 0.5 }, 300)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    update(delta, playerPos, playerCovering) {
        if (this.isDead) return;

        this.stateTimer -= delta;

        // Force look at player
        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

        if (this.state === 'flinching') {
            if (this.stateTimer <= 0) {
                this.state = 'aiming';
                this.stateTimer = 0.5 + Math.random() * 1.5;
                this.mesh.rotation.x = 0;
            }
            return;
        }

        // Behavior loop
        if (this.state === 'hiding') {
            // Hide behind container/sandbags by lowering position
            if (this.mesh.position.y > this.position.y - 0.8) {
                this.mesh.position.y -= 3 * delta;
            }
            if (this.stateTimer <= 0) {
                this.state = 'aiming';
                this.stateTimer = 1.0 + Math.random() * 1.5;
            }
        } else if (this.state === 'aiming') {
            // Rise up to shoot
            if (this.mesh.position.y < this.position.y) {
                this.mesh.position.y += 3 * delta;
            }

            // Sniper charges laser sight
            if (this.type === 'sniper' && this.laserMesh) {
                this.laserMesh.material.opacity = Math.min(1.0, 1 - (this.stateTimer / 1.5));
            }

            if (this.stateTimer <= 0) {
                this.state = 'shooting';
                this.shootTimer = 0.1;
            }
        } else if (this.state === 'shooting') {
            this.shootTimer -= delta;
            if (this.shootTimer <= 0) {
                // Shoot at player
                this.fireAtPlayer(playerPos, playerCovering);
                
                // Transition back to hiding (or aim again if heavy class)
                if (this.type === 'heavy' && Math.random() > 0.4) {
                    this.state = 'aiming';
                    this.stateTimer = 0.5 + Math.random() * 1.0;
                } else {
                    this.state = 'hiding';
                    this.stateTimer = 0.8 + Math.random() * 1.2;
                }

                if (this.laserMesh) this.laserMesh.material.opacity = 0.0;
            }
        }
    }

    fireAtPlayer(playerPos, playerCovering) {
        if (this.isDead) return;

        // Check accuracy. If player is covering, shots always miss (hitting the obstacle)
        let hitPlayer = false;
        if (!playerCovering) {
            const accuracy = this.type === 'sniper' ? 0.95 : (this.type === 'heavy' ? 0.4 : 0.65);
            hitPlayer = Math.random() < accuracy;
        }

        // Draw tracer
        const start = this.getGunTipWorld();
        const end = playerPos.clone();
        
        if (!hitPlayer) {
            // Stray shot
            end.x += (Math.random() - 0.5) * 6;
            end.y += (Math.random() - 0.5) * 3;
            end.z += (Math.random() - 0.5) * 6;
        }

        // Trigger muzzle flash sound (procedural drone beep or gun crack)
        window.gameAudio.playDroneBeep();

        // Spawn tracer and spark effects
        window.engine.particles.spawnTracer(start, end, this.type === 'sniper' ? 0xff0000 : 0xffaa00);
        
        if (hitPlayer) {
            // Hurt player
            const damage = this.type === 'sniper' ? 45 : (this.type === 'heavy' ? 25 : 15);
            window.game.hurtPlayer(damage);
        } else {
            // Spawn spark on wall/obstacle
            window.engine.particles.spawn(end, 0xffff00, 4, 2, 0.1);
        }
    }
}

// Float Drone Enemy class
class Drone {
    constructor(scene, position) {
        this.scene = scene;
        this.type = 'drone';
        this.position = position.clone();
        this.health = 50;
        this.isDead = false;
        
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        
        this.shootTimer = 1.0 + Math.random() * 1.5;
        this.hoverOffset = Math.random() * Math.PI;

        this.buildModel();
        this.scene.add(this.mesh);
    }

    buildModel() {
        const droneMat = new THREE.MeshLambertMaterial({ color: 0x2d3238, metalness: 0.8 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Glowing red eye
        const rotorMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

        // Sphere body
        const sphereGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const body = new THREE.Mesh(sphereGeo, droneMat);
        this.mesh.add(body);

        // Core eye
        const eyeGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0, 0, 0.28);
        this.mesh.add(eye);

        // Side rotor protection rings
        const ringGeo = new THREE.TorusGeometry(0.2, 0.03, 4, 8);
        
        const ringLeft = new THREE.Mesh(ringGeo, droneMat);
        ringLeft.position.set(-0.45, 0, 0);
        ringLeft.rotation.x = Math.PI / 2;
        this.mesh.add(ringLeft);

        const ringRight = new THREE.Mesh(ringGeo, droneMat);
        ringRight.position.set(0.45, 0, 0);
        ringRight.rotation.x = Math.PI / 2;
        this.mesh.add(ringRight);

        // Rotor blades
        const bladeGeo = new THREE.BoxGeometry(0.38, 0.01, 0.04);
        this.bladeLeft = new THREE.Mesh(bladeGeo, rotorMat);
        this.bladeLeft.position.set(-0.45, 0.02, 0);
        this.mesh.add(this.bladeLeft);

        this.bladeRight = new THREE.Mesh(bladeGeo, rotorMat);
        this.bladeRight.position.set(0.45, 0.02, 0);
        this.mesh.add(this.bladeRight);
    }

    takeDamage(amount) {
        if (this.isDead) return 0;
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
        return { damage: amount, isHeadshot: false, isShield: false };
    }

    die() {
        this.isDead = true;
        // Heavy explosion drop down
        window.engine.particles.spawn(this.mesh.position, 0x333333, 15, 3, 0.25);
        window.engine.particles.spawn(this.mesh.position, 0xff5500, 10, 4, 0.15);
        window.gameAudio.playExplosion();

        new TWEEN.Tween(this.mesh.position)
            .to({ y: this.position.y - 4 }, 600)
            .easing(TWEEN.Easing.Bounce.Out)
            .start();
        
        new TWEEN.Tween(this.mesh.rotation)
            .to({ x: Math.random() * 6, z: Math.random() * 6 }, 600)
            .start();
    }

    update(delta, playerPos, playerCovering) {
        if (this.isDead) return;

        // Hover bobbing effect
        this.hoverOffset += 4 * delta;
        this.mesh.position.y = this.position.y + Math.sin(this.hoverOffset) * 0.15;

        // Rotor spinning
        this.bladeLeft.rotation.y += 25 * delta;
        this.bladeRight.rotation.y += 25 * delta;

        // Look at player
        this.mesh.lookAt(playerPos);

        // Fire timing
        this.shootTimer -= delta;
        if (this.shootTimer <= 0) {
            this.fireAtPlayer(playerPos, playerCovering);
            this.shootTimer = 1.2 + Math.random() * 1.5;
        }
    }

    fireAtPlayer(playerPos, playerCovering) {
        if (this.isDead) return;
        let hit = false;
        if (!playerCovering) hit = Math.random() < 0.5;

        const start = this.mesh.position.clone();
        const end = playerPos.clone();
        
        if (!hit) {
            end.x += (Math.random() - 0.5) * 4;
            end.y += (Math.random() - 0.5) * 3;
        }

        window.gameAudio.playDroneBeep();
        window.engine.particles.spawnTracer(start, end, 0xff3333); // Red laser tracer

        if (hit) {
            window.game.hurtPlayer(10);
        } else {
            window.engine.particles.spawn(end, 0xff3333, 4, 2, 0.1);
        }
    }
}

// Stage 2 Boss: Cargo Ship Apache Helicopter
class HelicopterBoss {
    constructor(scene, position) {
        this.scene = scene;
        this.type = 'boss';
        this.position = position.clone();
        this.health = 1000;
        this.maxHealth = 1000;
        this.isDead = false;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        this.shootTimer = 2.0;
        this.rotorAngle = 0;
        this.hoverTimer = 0;

        this.buildModel();
        this.scene.add(this.mesh);
    }

    buildModel() {
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2b382a }); // Olive green fuselage
        const steelMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f });
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x88eeff, transparent: true, opacity: 0.6 });

        // Fuselage
        const fuseGeo = new THREE.BoxGeometry(1.2, 1.2, 4.0);
        const fuse = new THREE.Mesh(fuseGeo, bodyMat);
        fuse.castShadow = true;
        this.mesh.add(fuse);

        // Cockpit canopy
        const glassGeo = new THREE.BoxGeometry(0.9, 0.8, 1.2);
        const canopy = new THREE.Mesh(glassGeo, glassMat);
        canopy.position.set(0, 0.2, 1.8);
        this.mesh.add(canopy);

        // Tail boom
        const tailGeo = new THREE.BoxGeometry(0.4, 0.4, 3.0);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.set(0, 0.3, -3.0);
        this.mesh.add(tail);

        // Tail fin
        const finGeo = new THREE.BoxGeometry(0.15, 1.0, 0.8);
        const fin = new THREE.Mesh(finGeo, bodyMat);
        fin.position.set(0, 0.9, -4.2);
        this.mesh.add(fin);

        // Main rotor shaft
        const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
        const shaft = new THREE.Mesh(shaftGeo, steelMat);
        shaft.position.y = 0.9;
        this.mesh.add(shaft);

        // Main blades (Large cross)
        this.blades = new THREE.Group();
        this.blades.position.y = 1.2;

        const bladeP1 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.02, 0.2), steelMat);
        const bladeP2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 6.0), steelMat);
        this.blades.add(bladeP1);
        this.blades.add(bladeP2);
        this.mesh.add(this.blades);

        // Rocket pods (Sides)
        const podGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 6);
        podGeo.rotateX(Math.PI / 2);
        
        const leftPod = new THREE.Mesh(podGeo, steelMat);
        leftPod.position.set(-1.0, -0.2, 0.5);
        this.mesh.add(leftPod);

        const rightPod = new THREE.Mesh(podGeo, steelMat);
        rightPod.position.set(1.0, -0.2, 0.5);
        this.mesh.add(rightPod);
    }

    takeDamage(amount) {
        if (this.isDead) return 0;
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            // Spawn metal sparks on hit
            window.engine.particles.spawn(this.mesh.position, 0xffaa00, 8, 3, 0.12);
        }
        return { damage: amount, isHeadshot: false, isShield: false };
    }

    die() {
        this.isDead = true;
        window.engine.particles.spawn(this.mesh.position, 0x333333, 50, 4, 0.4);
        window.engine.particles.spawn(this.mesh.position, 0xff7700, 30, 6, 0.25);
        window.gameAudio.playExplosion();

        // Spin down and crash
        new TWEEN.Tween(this.mesh.rotation)
            .to({ z: Math.PI / 3, x: Math.PI / 6, y: Math.PI }, 1500)
            .start();

        new TWEEN.Tween(this.mesh.position)
            .to({ y: this.position.y - 12, z: this.position.z + 10 }, 1500)
            .easing(TWEEN.Easing.Quadratic.In)
            .onComplete(() => {
                window.engine.particles.spawn(this.mesh.position, 0xff3300, 80, 8, 0.5);
                window.gameAudio.playExplosion();
                this.scene.remove(this.mesh);
            })
            .start();
    }

    update(delta, playerPos, playerCovering) {
        if (this.isDead) return;

        // Spin blades
        this.blades.rotation.y += 18 * delta;

        // Hover circle movement
        this.hoverTimer += delta;
        this.mesh.position.x = this.position.x + Math.sin(this.hoverTimer) * 5;
        this.mesh.position.y = this.position.y + Math.cos(this.hoverTimer * 2) * 0.8;

        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

        // Firing sequence (Heavy Rocket blast)
        this.shootTimer -= delta;
        if (this.shootTimer <= 0) {
            this.fireRocket(playerPos, playerCovering);
            this.shootTimer = 2.5 + Math.random() * 1.5;
        }
    }

    fireRocket(playerPos, playerCovering) {
        if (this.isDead) return;

        const start = this.mesh.position.clone();
        // Rocket shoots from left/right pod alternating
        start.x += Math.random() > 0.5 ? 1.0 : -1.0;

        const end = playerPos.clone();
        if (playerCovering) {
            // Misses and hits barrier
            end.y -= 1.5;
        }

        window.gameAudio.playExplosion(); // Heavy rocket thump

        // Draw tracer missile line
        window.engine.particles.spawnTracer(start, end, 0xff5500);

        setTimeout(() => {
            // Splash damage explosion on impact
            window.engine.particles.spawn(end, 0xff7700, 25, 4, 0.35);
            window.engine.particles.spawn(end, 0x333333, 15, 3, 0.4);
            window.gameAudio.playExplosion();

            if (!playerCovering) {
                // Rocket deals heavy damage
                window.game.hurtPlayer(40);
            }
        }, 300);
    }
}

// Stage 4 Boss: Afghan Village Armored Tank
class TankBoss {
    constructor(scene, position) {
        this.scene = scene;
        this.type = 'boss';
        this.position = position.clone();
        this.health = 1500;
        this.maxHealth = 1500;
        this.isDead = false;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        this.shootTimer = 3.0;
        this.turretAngle = 0;

        this.buildModel();
        this.scene.add(this.mesh);
    }

    buildModel() {
        const desertMat = new THREE.MeshLambertMaterial({ 
            map: ProceduralTextures.generateCamo('desert') 
        });
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f });

        // Treads Left
        const treadL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 5.0), metalMat);
        treadL.position.set(-1.8, 0.4, 0);
        treadL.castShadow = true;
        this.mesh.add(treadL);

        // Treads Right
        const treadR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 5.0), metalMat);
        treadR.position.set(1.8, 0.4, 0);
        treadR.castShadow = true;
        this.mesh.add(treadR);

        // Tank Chassis
        const bodyGeo = new THREE.BoxGeometry(3.0, 0.8, 4.4);
        const body = new THREE.Mesh(bodyGeo, desertMat);
        body.position.y = 0.8;
        body.castShadow = true;
        this.mesh.add(body);

        // Turret Base
        this.turret = new THREE.Group();
        this.turret.position.set(0, 1.2, 0);
        
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 2.4), desertMat);
        cabin.castShadow = true;
        this.turret.add(cabin);

        // Gun Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.8, 8);
        barrelGeo.rotateX(Math.PI / 2);
        const barrel = new THREE.Mesh(barrelGeo, metalMat);
        barrel.position.set(0, 0.1, 2.2);
        this.turret.add(barrel);

        this.mesh.add(this.turret);
    }

    takeDamage(amount) {
        if (this.isDead) return 0;
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            window.engine.particles.spawn(this.mesh.position, 0xffaa00, 10, 3, 0.15);
        }
        return { damage: amount, isHeadshot: false, isShield: false };
    }

    die() {
        this.isDead = true;
        window.engine.particles.spawn(this.mesh.position, 0x222222, 60, 4, 0.5);
        window.engine.particles.spawn(this.mesh.position, 0xff4400, 40, 6, 0.3);
        window.gameAudio.playExplosion();

        // Explode turret off the tank chassis
        new TWEEN.Tween(this.turret.position)
            .to({ y: 4.0, z: -2.0 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        new TWEEN.Tween(this.turret.rotation)
            .to({ x: Math.PI / 2, y: Math.PI / 4 }, 1000)
            .start();

        setTimeout(() => {
            window.engine.particles.spawn(this.turret.position, 0xff0000, 50, 6, 0.4);
            window.gameAudio.playExplosion();
        }, 900);
    }

    update(delta, playerPos, playerCovering) {
        if (this.isDead) return;

        // Rotate turret towards player slowly
        const dx = playerPos.x - this.mesh.position.x;
        const dz = playerPos.z - this.mesh.position.z;
        const angle = Math.atan2(dx, dz);
        
        // Match rotation (instant for this simplified engine, or smooth)
        this.turret.rotation.y = angle;

        // Fire cannon shell
        this.shootTimer -= delta;
        if (this.shootTimer <= 0) {
            this.fireCannon(playerPos, playerCovering);
            this.shootTimer = 3.5 + Math.random() * 1.5;
        }
    }

    fireCannon(playerPos, playerCovering) {
        if (this.isDead) return;

        // Cannon sound
        window.gameAudio.playShotgun();

        const start = new THREE.Vector3(0, 1.3, 3.6).applyMatrix4(this.mesh.matrixWorld);
        const end = playerPos.clone();
        
        if (playerCovering) end.y -= 1.0;

        // Heavy red/orange blast line
        window.engine.particles.spawnTracer(start, end, 0xff6600);
        window.engine.particles.spawn(start, 0xffcc00, 12, 4, 0.2);

        setTimeout(() => {
            window.gameAudio.playExplosion();
            window.engine.particles.spawn(end, 0xff3300, 35, 5, 0.4);
            window.engine.particles.spawn(end, 0x111111, 20, 3, 0.4);

            if (!playerCovering) {
                window.game.hurtPlayer(55); // high tank cannon damage!
            }
        }, 250);
    }
}

// Stage 5 Final Boss: Rogue Commander with Energy Shield & Heavy Railgun
class CommanderBoss {
    constructor(scene, position) {
        this.scene = scene;
        this.type = 'boss';
        this.position = position.clone();
        this.health = 2000;
        this.maxHealth = 2000;
        this.isDead = false;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);

        this.shootTimer = 2.0;
        this.shieldActive = true;
        this.shieldRecoveryTimer = 0;

        this.buildModel();
        this.scene.add(this.mesh);
    }

    buildModel() {
        const forestCamo = new THREE.MeshLambertMaterial({ 
            map: ProceduralTextures.generateCamo('forest') 
        });
        const redBeretMat = new THREE.MeshLambertMaterial({ color: 0x990000 }); // Commander Beret
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xdbad88 });
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

        // Commander is larger than usual soldier
        this.mesh.scale.set(1.4, 1.4, 1.4);

        // Body
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 1.2, 8), forestCamo);
        torso.position.y = 0.6;
        torso.castShadow = true;
        this.mesh.add(torso);

        // Red Beret Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), skinMat);
        head.position.y = 1.35;
        head.name = "head";
        this.mesh.add(head);

        const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.12, 8), redBeretMat);
        beret.position.set(0, 1.5, 0.05);
        beret.rotation.z = Math.PI / 12;
        this.mesh.add(beret);

        // Heavy Railgun weapon
        const railgun = new THREE.Group();
        railgun.position.set(0.3, 0.7, 0.5);
        railgun.rotation.x = Math.PI / 2;

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 1.2), metalMat);
        railgun.add(body);

        const glowCore = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        glowCore.rotation.x = Math.PI / 2;
        glowCore.position.z = 0.2;
        railgun.add(glowCore);

        this.mesh.add(railgun);

        // 3D Hexagonal Energy Shield sphere
        const shieldGeo = new THREE.SphereGeometry(1.2, 12, 12);
        this.shieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.15,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMaterial);
        this.shieldMesh.position.y = 0.8;
        this.shieldMesh.name = "energyshield";
        this.mesh.add(this.shieldMesh);
    }

    takeDamage(amount, hitNodeName) {
        if (this.isDead) return 0;

        let finalDamage = amount;
        let hitShield = false;

        if (this.shieldActive && (hitNodeName === 'energyshield' || Math.random() < 0.8)) {
            // Shield absorbs 90% of damage
            finalDamage = amount * 0.1;
            hitShield = true;

            // Trigger blue shield hit overlay flash in game
            window.gameAudio.playHevWarning('shield_charge');
            
            // Brighten shield mesh momentarily
            this.shieldMaterial.opacity = 0.6;
            setTimeout(() => {
                if (this.shieldMaterial) this.shieldMaterial.opacity = 0.15;
            }, 100);

            // Deplete boss shield logic
            this.health -= finalDamage;
            if (this.health <= 0) this.die();
        } else {
            // Shield down or headshot bypassed
            const isHead = hitNodeName === 'head';
            if (isHead) finalDamage *= 2.5;

            this.health -= finalDamage;
            if (this.health <= 0) {
                this.die();
            } else {
                // Spawn blood particles
                window.engine.particles.spawn(this.mesh.position, 0xaa0000, 8, 3, 0.1);
            }
        }

        return { damage: finalDamage, isHeadshot: hitNodeName === 'head', isShield: hitShield };
    }

    die() {
        this.isDead = true;
        this.shieldMesh.visible = false;
        window.engine.particles.spawn(this.mesh.position, 0xaa0000, 25, 4, 0.15);
        window.engine.particles.spawn(this.mesh.position, 0x00ffff, 40, 5, 0.2); // energy blast
        window.gameAudio.playExplosion();

        new TWEEN.Tween(this.mesh.rotation)
            .to({ x: -Math.PI / 2, y: -Math.PI / 4 }, 600)
            .start();

        new TWEEN.Tween(this.mesh.position)
            .to({ y: this.position.y - 0.7 }, 600)
            .onComplete(() => {
                // Unlock POW cage trigger in game
                window.game.unlockPOWCage();
            })
            .start();
    }

    update(delta, playerPos, playerCovering) {
        if (this.isDead) return;

        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

        // Flashing shield animation
        if (this.shieldActive) {
            this.shieldMesh.rotation.y += 0.5 * delta;
        }

        // Fire railgun
        this.shootTimer -= delta;
        if (this.shootTimer <= 0) {
            this.fireRailgun(playerPos, playerCovering);
            this.shootTimer = 2.0 + Math.random() * 1.5;
        }
    }

    fireRailgun(playerPos, playerCovering) {
        if (this.isDead) return;

        window.gameAudio.playShotgun();

        const start = this.mesh.position.clone().add(new THREE.Vector3(0.3, 0.7, 0.8));
        const end = playerPos.clone();

        if (playerCovering) end.y -= 1.0;

        // Bright blue energy beam
        window.engine.particles.spawnTracer(start, end, 0x00ffff);
        window.engine.particles.spawn(start, 0x00ffff, 15, 5, 0.15);

        setTimeout(() => {
            window.engine.particles.spawn(end, 0x00ddff, 20, 3, 0.2);
            if (!playerCovering) {
                // High railgun damage
                window.game.hurtPlayer(35);
            }
        }, 150);
    }
}

// Prisoner of War (POW) 3D Model
class PrisonerOfWar {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.cageMesh = null;
        this.lockMesh = null;
        this.cageLocked = true;

        this.buildModel();
        this.scene.add(this.mesh);
    }

    buildModel() {
        // 1. Prisoner (Orange Jumpsuit model)
        const jumpsuitMat = new THREE.MeshLambertMaterial({ color: 0xff4a00 }); // Orange suit
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xdfb08c });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), jumpsuitMat);
        body.position.y = 0.45;
        this.mesh.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), skinMat);
        head.position.y = 1.05;
        this.mesh.add(head);

        // Bound hands
        const handGeo = new THREE.BoxGeometry(0.12, 0.12, 0.25);
        const ropeMat = new THREE.MeshLambertMaterial({ color: 0x966f33 }); // Rope
        const hands = new THREE.Mesh(handGeo, ropeMat);
        hands.position.set(0, 0.4, 0.35);
        this.mesh.add(hands);

        // 2. Prison Cage (Borders/Bars)
        this.cageMesh = new THREE.Group();
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x222222, roughness: 0.9 });
        
        // Cage Floor & Roof
        const slabL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.0), metalMat);
        slabL.position.y = -0.05;
        this.cageMesh.add(slabL);

        const slabU = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.0), metalMat);
        slabU.position.y = 1.6;
        this.cageMesh.add(slabU);

        // Corner bars
        const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6);
        const addBar = (bx, bz) => {
            const bar = new THREE.Mesh(barGeo, metalMat);
            bar.position.set(bx, 0.8, bz);
            this.cageMesh.add(bar);
        };
        addBar(-0.95, -0.95); addBar(0.95, -0.95);
        addBar(-0.95, 0.95); addBar(0.95, 0.95);

        // Front Gate bars (locked door side facing z+)
        this.cageDoor = new THREE.Group();
        this.cageDoor.position.set(0, 0.8, 0.95);

        const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.05), new THREE.MeshBasicMaterial({ wireframe: true, color: 0x444444 }));
        this.cageDoor.add(doorFrame);

        // Iron bars inside gate
        for (let i = -0.7; i <= 0.7; i += 0.25) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4), metalMat);
            bar.position.x = i;
            this.cageDoor.add(bar);
        }

        // 3. Huge padlock
        const lockGeo = new THREE.BoxGeometry(0.2, 0.2, 0.12);
        const lockMat = new THREE.MeshLambertMaterial({ color: 0xbf9000 }); // Yellow/Brass lock
        this.lockMesh = new THREE.Mesh(lockGeo, lockMat);
        this.lockMesh.position.set(0, 0, 0.05);
        this.lockMesh.name = "cage_lock"; // Shootalbe target!
        this.cageDoor.add(this.lockMesh);

        this.cageMesh.add(this.cageDoor);
        this.mesh.add(this.cageMesh);
    }

    unlock() {
        if (!this.cageLocked) return;
        this.cageLocked = false;
        
        // Remove lock, blow open door
        this.cageDoor.remove(this.lockMesh);
        this.lockMesh.geometry.dispose();
        this.lockMesh.material.dispose();

        // Swing open cage gate
        new TWEEN.Tween(this.cageDoor.rotation)
            .to({ y: Math.PI / 1.8 }, 1200)
            .easing(TWEEN.Easing.Bounce.Out)
            .start();

        // Synthesize metallic gate sound
        window.gameAudio.playReloadSound();
    }
}

// Global Exports
window.ParticleManager = ParticleManager;
window.Enemy = Enemy;
window.Drone = Drone;
window.HelicopterBoss = HelicopterBoss;
window.TankBoss = TankBoss;
window.CommanderBoss = CommanderBoss;
window.PrisonerOfWar = PrisonerOfWar;
