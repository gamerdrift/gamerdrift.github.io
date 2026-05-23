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

    static generateCamoBump() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f'; // Neutral height
        ctx.fillRect(0, 0, 128, 128);

        // Burlap texture bump lines
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let x = 0; x < 128; x += 3) {
            ctx.fillRect(x, 0, 1, 128);
        }
        for (let y = 0; y < 128; y += 3) {
            ctx.fillRect(0, y, 128, 1);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let x = 1; x < 128; x += 3) {
            ctx.fillRect(x, 0, 1, 128);
        }
        for (let y = 1; y < 128; y += 3) {
            ctx.fillRect(0, y, 128, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
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

        // Add some rust and wear patches
        ctx.fillStyle = 'rgba(100, 50, 20, 0.15)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    static generateMetalPlatesBump() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f';
        ctx.fillRect(0, 0, 256, 256);

        // Deep seams
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 4);
        ctx.fillRect(0, 0, 4, 256);
        ctx.fillRect(0, 252, 256, 4);
        ctx.fillRect(252, 0, 4, 256);
        ctx.fillRect(126, 0, 4, 256);
        ctx.fillRect(0, 126, 256, 4);

        // Raised plates details (bevels)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 4, 120, 2);
        ctx.fillRect(4, 4, 2, 120);
        ctx.fillRect(130, 4, 120, 2);
        ctx.fillRect(130, 4, 2, 120);
        ctx.fillRect(4, 130, 120, 2);
        ctx.fillRect(4, 130, 2, 120);
        ctx.fillRect(130, 130, 120, 2);
        ctx.fillRect(130, 130, 2, 120);

        // Rivets (raised bumps)
        const drawRivetBump = (rx, ry) => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(rx, ry, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(rx + 1, ry + 1, 6, 0, Math.PI * 2);
            ctx.fill();
        };

        drawRivetBump(20, 20); drawRivetBump(236, 20);
        drawRivetBump(20, 236); drawRivetBump(236, 236);
        drawRivetBump(148, 20); drawRivetBump(148, 236);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    static generateSteelGrain() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f'; // Neutral bump
        ctx.fillRect(0, 0, 128, 128);

        // Brushed noise lines
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const w = 10 + Math.random() * 20;
            ctx.fillRect(x, y, w, 1);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const w = 10 + Math.random() * 20;
            ctx.fillRect(x, y, w, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static generateConcreteBump() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f';
        ctx.fillRect(0, 0, 256, 256);

        // Speckled stone grain noise
        for (let i = 0; i < 6000; i++) {
            const val = Math.floor(Math.random() * 60) - 30;
            ctx.fillStyle = val > 0 ? `rgba(255,255,255,${val/255})` : `rgba(0,0,0,${-val/255})`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    static generateWoodGrain() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f';
        ctx.fillRect(0, 0, 128, 128);

        // Draw wood plank lines
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, 128, 3);
        ctx.fillRect(0, 125, 128, 3);

        // Draw vertical wood grain lines
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * 128;
            ctx.fillRect(x, 0, 1 + Math.random()*2, 128);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * 128;
            ctx.fillRect(x, 0, 1 + Math.random()*2, 128);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static generateSandbagWeave() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f';
        ctx.fillRect(0, 0, 64, 64);

        // Burlap cross stitch
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        for (let x = 0; x < 64; x += 4) {
            ctx.fillRect(x, 0, 2, 64);
        }
        for (let y = 0; y < 64; y += 4) {
            ctx.fillRect(0, y, 64, 2);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        for (let x = 2; x < 64; x += 4) {
            ctx.fillRect(x, 0, 2, 64);
        }
        for (let y = 2; y < 64; y += 4) {
            ctx.fillRect(0, y, 64, 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    static generateCorrugatedMetal() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#7f7f7f';
        ctx.fillRect(0, 0, 128, 128);

        // Sine wave pattern for height
        for (let x = 0; x < 128; x++) {
            const val = Math.floor(128 + Math.sin((x / 128) * Math.PI * 8) * 60);
            ctx.fillStyle = `rgb(${val},${val},${val})`;
            ctx.fillRect(x, 0, 1, 128);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
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

    spawnCasing(pos, direction = 'right') {
        // Miniature shiny brass cylinder for shell casing
        const geometry = new THREE.CylinderGeometry(0.008, 0.008, 0.025, 6);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xd4af37, // golden brass
            metalness: 0.9, 
            roughness: 0.15 
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        
        // Eject velocity: sideways and slightly upwards/backwards
        const forceX = direction === 'left' ? -(1.8 + Math.random() * 1.2) : (1.8 + Math.random() * 1.2);
        const velocity = new THREE.Vector3(
            forceX,
            1.5 + Math.random() * 1.0,
            0.5 - Math.random() * 1.2
        );

        // Rapid spin
        const rotVelocity = new THREE.Vector3(
            Math.random() * 15 - 7.5,
            Math.random() * 15 - 7.5,
            Math.random() * 15 - 7.5
        );

        this.scene.add(mesh);
        this.particles.push({ 
            mesh, 
            velocity, 
            rotVelocity, 
            life: 1.0 + Math.random() * 0.4, 
            maxLife: 1.4, 
            isCasing: true 
        });
    }

    spawnSmoke(pos, count = 4) {
        // Gun barrel smoke puff
        const geometry = new THREE.SphereGeometry(0.06, 5, 5);
        
        for (let i = 0; i < count; i++) {
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xcccccc, 
                transparent: true, 
                opacity: 0.25 + Math.random() * 0.15 
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);
            
            // Random offset
            mesh.position.x += (Math.random() - 0.5) * 0.05;
            mesh.position.y += (Math.random() - 0.5) * 0.05;
            mesh.position.z += (Math.random() - 0.5) * 0.05;

            // Slow drift upwards and forwards
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                0.3 + Math.random() * 0.4,
                -(0.2 + Math.random() * 0.3)
            );

            this.scene.add(mesh);
            this.particles.push({ 
                mesh, 
                velocity, 
                life: 0.6 + Math.random() * 0.5, 
                maxLife: 1.1, 
                isSmoke: true 
            });
        }
    }

    spawnBloodSpurt(pos, normal, count = 12) {
        // Dynamic blood spray that squirts along normal and drips
        const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
        const material = new THREE.MeshBasicMaterial({ color: 0x7a0000 }); // Deep crimson blood

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);

            // Spray velocity along normal with some random cone spread
            const spread = 2.0;
            const velocity = normal.clone().multiplyScalar(2.5 + Math.random() * 2.0);
            velocity.x += (Math.random() - 0.5) * spread;
            velocity.y += (Math.random() - 0.3) * spread + 0.5; // slight upward lift
            velocity.z += (Math.random() - 0.5) * spread;

            const life = 0.4 + Math.random() * 0.4;
            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life, maxLife: life, isBlood: true });
        }
    }

    spawnSparks(pos, normal, colorHex = 0xffaa00, count = 8) {
        // High-velocity sparks that ricochet off hard surfaces
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const material = new THREE.MeshBasicMaterial({ color: colorHex });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);

            // Ricochet velocity vector
            const spread = 3.0;
            const velocity = normal.clone().multiplyScalar(4.0 + Math.random() * 4.0);
            velocity.x += (Math.random() - 0.5) * spread;
            velocity.y += (Math.random() - 0.5) * spread + 1.0;
            velocity.z += (Math.random() - 0.5) * spread;

            const life = 0.25 + Math.random() * 0.3;
            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life, maxLife: life, isSpark: true });
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
        this.particles.push({ mesh: line, velocity: new THREE.Vector3(), life: 0.08, maxLife: 0.08, isTracer: true });
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
                if (p.isTracer) {
                    // Fade tracer line
                    p.mesh.material.opacity = p.life / p.maxLife;
                } else if (p.isCasing) {
                    // Apply gravity
                    p.velocity.y -= 9.8 * delta;
                    // Move
                    p.mesh.position.addScaledVector(p.velocity, delta);
                    // Rotate rapidly
                    if (p.rotVelocity) {
                        p.mesh.rotation.x += p.rotVelocity.x * delta;
                        p.mesh.rotation.y += p.rotVelocity.y * delta;
                        p.mesh.rotation.z += p.rotVelocity.z * delta;
                    }
                    // Fade in last 0.2 seconds
                    if (p.life < 0.2) {
                        p.mesh.material.transparent = true;
                        p.mesh.material.opacity = p.life / 0.2;
                    }
                } else if (p.isSmoke) {
                    // Slow drift
                    p.mesh.position.addScaledVector(p.velocity, delta);
                    // Fade out & expand
                    p.mesh.material.opacity = (p.life / p.maxLife) * 0.35;
                    const grow = 1.0 + (1.0 - p.life / p.maxLife) * 2.0;
                    p.mesh.scale.set(grow, grow, grow);
                } else {
                    // Standard sparks/particles/blood
                    // Gravity physics
                    p.velocity.y -= (p.isBlood ? 12.0 : 8.0) * delta; // blood drops drip faster
                    p.mesh.position.addScaledVector(p.velocity, delta);
                    
                    // Fade / Scale down
                    const scale = p.life / p.maxLife;
                    p.mesh.scale.set(scale, scale, scale);
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

// FirstPersonWeapon procedural mesh builder
class FirstPersonWeapon {
    static build(type, camoType) {
        const weaponGroup = new THREE.Group();
        
        // Dynamic procedural normal/bump maps
        const steelBump = ProceduralTextures.generateSteelGrain();
        const fabricBump = ProceduralTextures.generateCamoBump();
        
        // Materials
        const darkMetal = new THREE.MeshStandardMaterial({ 
            color: 0x1a1d1e, 
            roughness: 0.32, 
            metalness: 0.88,
            bumpMap: steelBump,
            bumpScale: 0.01
        });
        const steel = new THREE.MeshStandardMaterial({ 
            color: 0x4f5357, 
            roughness: 0.22, 
            metalness: 0.95,
            bumpMap: steelBump,
            bumpScale: 0.012
        });
        const plastic = new THREE.MeshStandardMaterial({ 
            color: 0x1f2123, 
            roughness: 0.75, 
            metalness: 0.15 
        });
        const glass = new THREE.MeshBasicMaterial({ 
            color: 0x00ff88, 
            transparent: true, 
            opacity: 0.65 
        });
        const redLens = new THREE.MeshBasicMaterial({ 
            color: 0xff3300, 
            transparent: true, 
            opacity: 0.7 
        });
        const brassShell = new THREE.MeshStandardMaterial({ 
            color: 0xd4af37, 
            roughness: 0.2, 
            metalness: 0.9 
        });
        const redPlastic = new THREE.MeshStandardMaterial({
            color: 0x9b0000,
            roughness: 0.5,
            metalness: 0.2
        });
        
        const camoMat = new THREE.MeshStandardMaterial({ 
            map: ProceduralTextures.generateCamo(camoType),
            bumpMap: fabricBump,
            bumpScale: 0.015,
            roughness: 0.65,
            metalness: 0.2
        });

        if (type === 'pistol') {
            // --- USP MATCH PISTOL (Dual Tone) ---
            // Polymer Frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.11, 0.32), plastic);
            frame.position.set(0, -0.04, 0.05);
            weaponGroup.add(frame);

            // Stainless Steel Slide
            const slide = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.36), steel);
            slide.position.set(0, 0.04, 0.05);
            weaponGroup.add(slide);

            // Slide serrations (grooves at back of slide)
            for (let z = -0.08; z <= -0.04; z += 0.01) {
                const grooveL = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.05, 0.003), darkMetal);
                grooveL.position.set(-0.028, 0.04, z + 0.05);
                const grooveR = grooveL.clone();
                grooveR.position.x = 0.028;
                weaponGroup.add(grooveL);
                weaponGroup.add(grooveR);
            }

            // Match Barrel Weight / Compensator
            const comp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.11), darkMetal);
            comp.position.set(0, 0.028, 0.24);
            weaponGroup.add(comp);
            
            // Compensator expansion ports (Top)
            const port = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.04), steel);
            port.position.set(0, 0.07, 0.23);
            weaponGroup.add(port);

            // Steel Outer Barrel tip inside compensator
            const innerBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), darkMetal);
            innerBarrel.geometry.rotateX(Math.PI / 2);
            innerBarrel.position.set(0, 0.04, 0.28);
            weaponGroup.add(innerBarrel);

            // Tactical Laser Aiming Module under barrel
            const laserBox = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.048, 0.14), plastic);
            laserBox.position.set(0, -0.04, 0.18);
            weaponGroup.add(laserBox);

            const laserLens = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 8), redLens);
            laserLens.geometry.rotateX(Math.PI / 2);
            laserLens.position.set(0, -0.04, 0.252);
            weaponGroup.add(laserLens);

            // Laser beam line (extends far forward)
            const beamGeo = new THREE.CylinderGeometry(0.002, 0.002, 25.0, 4);
            beamGeo.rotateX(Math.PI / 2);
            const beamMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.15 });
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(0, -0.04, 12.7);
            beam.name = "laser_beam";
            weaponGroup.add(beam);

            // Textured Grip
            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.19, 0.076), plastic);
            grip.position.set(0, -0.14, -0.02);
            grip.rotation.x = -Math.PI / 10;
            weaponGroup.add(grip);
            
            // Grip panel details
            const panelL = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.14, 0.05), darkMetal);
            panelL.position.set(-0.028, -0.14, -0.02);
            panelL.rotation.x = -Math.PI / 10;
            const panelR = panelL.clone();
            panelR.position.x = 0.028;
            weaponGroup.add(panelL);
            weaponGroup.add(panelR);
            
            // Trigger Guard and Trigger
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.07, 0.09), darkMetal);
            guard.position.set(0, -0.068, 0.1);
            weaponGroup.add(guard);
            
            const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.035, 0.025), steel);
            trigger.position.set(0, -0.05, 0.08);
            trigger.rotation.x = Math.PI / 6;
            weaponGroup.add(trigger);
            
        } else if (type === 'shotgun') {
            // --- SPAS-12 TACTICAL SHOTGUN ---
            // Receiver
            const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.11, 0.62), darkMetal);
            receiver.position.set(0, 0.02, 0);
            weaponGroup.add(receiver);

            // Ribbed Picatinny rail along receiver top
            for (let z = -0.25; z <= 0.25; z += 0.03) {
                const railRib = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.015, 0.015), plastic);
                railRib.position.set(0, 0.08, z);
                weaponGroup.add(railRib);
            }

            // Heavy Steel Barrel
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.95, 10), steel);
            barrel.geometry.rotateX(Math.PI / 2);
            barrel.position.set(0, 0.055, 0.7);
            weaponGroup.add(barrel);

            // Heat Shield Shroud details (barrel slots)
            const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.55, 12), darkMetal);
            shroud.geometry.rotateX(Math.PI / 2);
            shroud.position.set(0, 0.055, 0.52);
            weaponGroup.add(shroud);

            // Magazine Tube under barrel
            const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.85, 8), steel);
            magTube.geometry.rotateX(Math.PI / 2);
            magTube.position.set(0, -0.015, 0.62);
            weaponGroup.add(magTube);

            // Metal Folding Stock Arms (folded along receiver sides)
            const stockArmL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.025, 0.56), steel);
            stockArmL.position.set(-0.044, 0.06, -0.06);
            const stockArmR = stockArmL.clone();
            stockArmR.position.x = 0.044;
            weaponGroup.add(stockArmL);
            weaponGroup.add(stockArmR);

            const stockButt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.025), darkMetal);
            stockButt.position.set(0, 0.06, 0.22);
            stockButt.rotation.x = Math.PI / 24;
            weaponGroup.add(stockButt);

            // Ribbed Forearm Pump Grip
            const pumpGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.35, 12), plastic);
            pumpGrip.geometry.rotateX(Math.PI / 2);
            pumpGrip.position.set(0, 0.01, 0.46);
            weaponGroup.add(pumpGrip);
            
            // Forearm rib rings
            for (let z = 0.32; z <= 0.6; z += 0.04) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.005, 4, 12), darkMetal);
                ring.rotation.x = Math.PI / 2;
                ring.position.set(0, 0.01, z);
                weaponGroup.add(ring);
            }

            // Pistol Grip
            const pg = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.17, 0.066), plastic);
            pg.position.set(0, -0.11, -0.22);
            pg.rotation.x = -Math.PI / 7;
            weaponGroup.add(pg);
            
            // Trigger assembly
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.06, 0.08), darkMetal);
            guard.position.set(0, -0.06, -0.12);
            weaponGroup.add(guard);
            
            const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.03, 0.02), steel);
            trigger.position.set(0, -0.05, -0.13);
            trigger.rotation.x = Math.PI / 6;
            weaponGroup.add(trigger);

            // Side Shell Saddle (Holds 4 shotgun shells)
            const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.2), plastic);
            saddle.position.set(-0.045, 0.02, 0);
            weaponGroup.add(saddle);

            for (let i = 0; i < 4; i++) {
                const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 8), redPlastic);
                shell.geometry.rotateX(Math.PI / 2);
                shell.position.set(-0.058, 0.02, -0.075 + i * 0.05);
                
                const base = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.015, 8), brassShell);
                base.geometry.rotateX(Math.PI / 2);
                base.position.set(-0.058, 0.02, -0.11 + i * 0.05);
                
                weaponGroup.add(shell);
                weaponGroup.add(base);
            }

        } else if (type === 'rifle') {
            // --- M4A1 TACTICAL ASSAULT RIFLE ---
            // Receiver
            const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.12, 0.58), camoMat);
            receiver.position.set(0, 0.02, 0);
            weaponGroup.add(receiver);

            // Picatinny rails on receiver top
            for (let z = -0.24; z <= 0.24; z += 0.03) {
                const railRib = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.014), darkMetal);
                railRib.position.set(0, 0.082, z);
                weaponGroup.add(railRib);
            }

            // Curved Magazine
            const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.26, 0.11), darkMetal);
            magazine.position.set(0, -0.15, 0.1);
            magazine.rotation.x = Math.PI / 15;
            weaponGroup.add(magazine);
            
            // Magazine grooves (Detail)
            const magGroove = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.2, 0.01), plastic);
            magGroove.position.set(0, -0.15, 0.12);
            magGroove.rotation.x = Math.PI / 15;
            weaponGroup.add(magGroove);

            // Ribbed Quad Rail Handguard
            const handguard = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.5, 8), plastic);
            handguard.geometry.rotateX(Math.PI / 2);
            handguard.position.set(0, 0.02, 0.48);
            weaponGroup.add(handguard);
            
            // Quad rails (top, bottom, sides)
            const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.48), darkMetal);
            railTop.position.set(0, 0.07, 0.48);
            const railBot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.48), darkMetal);
            railBot.position.set(0, -0.03, 0.48);
            const railL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.48), darkMetal);
            railL.position.set(-0.05, 0.02, 0.48);
            const railR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.48), darkMetal);
            railR.position.set(0.05, 0.02, 0.48);
            weaponGroup.add(railTop); weaponGroup.add(railBot);
            weaponGroup.add(railL); weaponGroup.add(railR);

            // Steel Barrel and Front Sight gas block
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.72, 10), steel);
            barrel.geometry.rotateX(Math.PI / 2);
            barrel.position.set(0, 0.025, 0.92);
            weaponGroup.add(barrel);

            const flashHider = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 8), darkMetal);
            flashHider.geometry.rotateX(Math.PI / 2);
            flashHider.position.set(0, 0.025, 1.28);
            weaponGroup.add(flashHider);

            const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.11, 0.04), darkMetal);
            frontSight.position.set(0, 0.11, 1.1);
            weaponGroup.add(frontSight);

            // ACOG Tactical Scope Group
            const scopeGroup = new THREE.Group();
            scopeGroup.position.set(0, 0.12, 0.02);
            
            // Scope Base Mount
            const mount = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.05, 0.16), darkMetal);
            scopeGroup.add(mount);

            // Scope Main Body Tube
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.026, 0.22, 8), darkMetal);
            tube.geometry.rotateX(Math.PI / 2);
            tube.position.y = 0.048;
            scopeGroup.add(tube);
            
            // Scope flared objective bell
            const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.06, 8), darkMetal);
            bell.geometry.rotateX(Math.PI / 2);
            bell.position.set(0, 0.048, 0.13);
            scopeGroup.add(bell);

            // Green fiber optic light collector line on top of scope
            const fiberOptic = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.14), glass);
            fiberOptic.position.set(0, 0.084, 0.02);
            scopeGroup.add(fiberOptic);

            // Reflective scope glass lenses
            const lensFront = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.008, 8), glass);
            lensFront.geometry.rotateX(Math.PI / 2);
            lensFront.position.set(0, 0.048, 0.16);
            scopeGroup.add(lensFront);
            
            const lensBack = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.008, 8), redLens);
            lensBack.geometry.rotateX(Math.PI / 2);
            lensBack.position.set(0, 0.048, -0.11);
            scopeGroup.add(lensBack);

            weaponGroup.add(scopeGroup);

            // PEQ-15 Laser Box on side rail
            const peq15 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.12), plastic);
            peq15.position.set(-0.065, 0.04, 0.48);
            weaponGroup.add(peq15);
            
            const peqLens = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 8), redLens);
            peqLens.geometry.rotateX(Math.PI / 2);
            peqLens.position.set(-0.065, 0.04, 0.542);
            weaponGroup.add(peqLens);

            // PEQ-15 Laser beam
            const peqBeamGeo = new THREE.CylinderGeometry(0.002, 0.002, 25.0, 4);
            peqBeamGeo.rotateX(Math.PI / 2);
            const peqBeamMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.12 });
            const peqBeam = new THREE.Mesh(peqBeamGeo, peqBeamMat);
            peqBeam.position.set(-0.065, 0.04, 13.0);
            peqBeam.name = "laser_beam";
            weaponGroup.add(peqBeam);

            // Pistol Grip
            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.15, 0.066), plastic);
            grip.position.set(0, -0.11, -0.16);
            grip.rotation.x = -Math.PI / 6;
            weaponGroup.add(grip);
            
            // Trigger & Guard
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.05, 0.08), darkMetal);
            guard.position.set(0, -0.05, -0.08);
            weaponGroup.add(guard);
            
            const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.025, 0.02), steel);
            trigger.position.set(0, -0.042, -0.09);
            trigger.rotation.x = Math.PI / 6;
            weaponGroup.add(trigger);

            // Buffer Tube Stock extension (steel rod)
            const buffer = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), steel);
            buffer.geometry.rotateX(Math.PI / 2);
            buffer.position.set(0, 0.025, -0.4);
            weaponGroup.add(buffer);

            // Crane Stock
            const stock = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.15, 0.26), camoMat);
            stock.position.set(0, 0.01, -0.52);
            weaponGroup.add(stock);
            
            // Rubber Stock buttpad
            const buttpad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.02), plastic);
            buttpad.position.set(0, 0.01, -0.65);
            weaponGroup.add(buttpad);
        }

        weaponGroup.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return weaponGroup;
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
        // High-definition tactical PBR materials
        const camoMat = new THREE.MeshStandardMaterial({ 
            map: ProceduralTextures.generateCamo(this.camoType),
            bumpMap: ProceduralTextures.generateCamoBump(),
            bumpScale: 0.015,
            roughness: 0.75,
            metalness: 0.1
        });
        const vestMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1c1e, 
            roughness: 0.8, 
            metalness: 0.25 
        }); // Dark Kevlar
        const skinMat = new THREE.MeshStandardMaterial({ 
            color: 0xdfb08c, 
            roughness: 0.55 
        }); // Head/hands skin
        const maskMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0.75 
        }); // Balaclava
        const gearMat = new THREE.MeshStandardMaterial({ 
            color: 0x2d3235, 
            roughness: 0.65, 
            metalness: 0.35 
        }); // Webbing gear
        const helmetMat = new THREE.MeshStandardMaterial({ 
            color: 0x353c33, 
            roughness: 0.6, 
            metalness: 0.3 
        }); // Kevlar olive green
        const gunMat = new THREE.MeshStandardMaterial({ 
            color: 0x1f2122, 
            roughness: 0.45, 
            metalness: 0.88,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.008
        }); // Matte steel rifle
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x121212 }); // Dark goggles lens
        const nvgLensMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 }); // Green glowing NVG lens

        // Helper mesh creator
        const addPart = (geo, mat, px, py, pz, rx=0, ry=0, rz=0, name="") => {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(px, py, pz);
            mesh.rotation.set(rx, ry, rz);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (name) mesh.name = name;
            this.mesh.add(mesh);
            return mesh;
        };

        // 1. Torso (Combat Shirt)
        addPart(new THREE.BoxGeometry(0.68, 0.85, 0.38), camoMat, 0, 0.62, 0);

        // 2. Tactical Bulletproof Kevlar Vest
        addPart(new THREE.BoxGeometry(0.72, 0.72, 0.44), vestMat, 0, 0.68, 0);
        
        // Armor Plate Inserts (Detail)
        addPart(new THREE.BoxGeometry(0.52, 0.58, 0.46), vestMat, 0, 0.68, 0.01);
        addPart(new THREE.BoxGeometry(0.52, 0.58, 0.46), vestMat, 0, 0.68, -0.01);

        // Molle Webbing Strapping details on chest
        for (let row = 0.48; row <= 0.82; row += 0.08) {
            const strap = addPart(new THREE.BoxGeometry(0.48, 0.02, 0.48), gearMat, 0, row, 0.01);
            strap.castShadow = false;
        }

        // Ammo Pouches (Tactical belt / Front chest)
        addPart(new THREE.BoxGeometry(0.14, 0.22, 0.1), gearMat, -0.18, 0.48, 0.23);
        addPart(new THREE.BoxGeometry(0.14, 0.22, 0.1), gearMat, 0, 0.48, 0.23);
        addPart(new THREE.BoxGeometry(0.14, 0.22, 0.1), gearMat, 0.18, 0.48, 0.23);

        // Tactical Radio Antenna on left shoulder (extends up)
        addPart(new THREE.CylinderGeometry(0.01, 0.01, 0.45, 4), gearMat, -0.22, 1.05, -0.16);

        // Waist / Belt
        addPart(new THREE.BoxGeometry(0.66, 0.12, 0.4), gearMat, 0, 0.25, 0);
        
        // 3. Pelvis & Leg Joints
        addPart(new THREE.BoxGeometry(0.62, 0.2, 0.36), camoMat, 0, 0.15, 0);

        // Left Leg (Camouflage Pants)
        addPart(new THREE.CylinderGeometry(0.14, 0.11, 0.5, 8), camoMat, -0.22, -0.15, 0); // Thigh
        addPart(new THREE.BoxGeometry(0.16, 0.16, 0.16), gearMat, -0.22, -0.4, 0.08); // Knee Pad
        addPart(new THREE.CylinderGeometry(0.11, 0.09, 0.5, 8), camoMat, -0.22, -0.55, 0); // Shin
        addPart(new THREE.BoxGeometry(0.16, 0.18, 0.3), gearMat, -0.22, -0.85, 0.04); // Tactical Boot

        // Right Leg (Camouflage Pants)
        addPart(new THREE.CylinderGeometry(0.14, 0.11, 0.5, 8), camoMat, 0.22, -0.15, 0); // Thigh
        addPart(new THREE.BoxGeometry(0.16, 0.16, 0.16), gearMat, 0.22, -0.4, 0.08); // Knee Pad
        addPart(new THREE.CylinderGeometry(0.11, 0.09, 0.5, 8), camoMat, 0.22, -0.55, 0); // Shin
        addPart(new THREE.BoxGeometry(0.16, 0.18, 0.3), gearMat, 0.22, -0.85, 0.04); // Tactical Boot

        // Tactical Thigh Holster details (Right Leg)
        addPart(new THREE.BoxGeometry(0.06, 0.22, 0.14), gearMat, 0.38, -0.15, 0.02, 0, 0, -Math.PI/12); // holster panel
        addPart(new THREE.BoxGeometry(0.04, 0.08, 0.08), vestMat, 0.39, -0.06, 0.02, 0, 0, -Math.PI/12); // pistol grip protruding

        // 4. Detailed Tactical Head
        addPart(new THREE.SphereGeometry(0.25, 10, 10), skinMat, 0, 1.22, 0, 0, 0, 0, "head"); // Neck & Face base
        addPart(new THREE.SphereGeometry(0.254, 10, 10), maskMat, 0, 1.23, 0, 0, 0, 0, "head"); // Balaclava overlay

        // Kevlar Helmet (Realistic curved shell)
        addPart(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 12), helmetMat, 0, 1.34, 0, 0, 0, 0, "head");
        addPart(new THREE.SphereGeometry(0.27, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), helmetMat, 0, 1.35, 0, 0, 0, 0, "head"); // Top dome

        // Helmet Chin Straps
        addPart(new THREE.BoxGeometry(0.02, 0.22, 0.02), gearMat, -0.23, 1.2, 0.06, 0, 0, Math.PI/12, "head");
        addPart(new THREE.BoxGeometry(0.02, 0.22, 0.02), gearMat, 0.23, 1.2, 0.06, 0, 0, -Math.PI/12, "head");

        // Goggles
        addPart(new THREE.BoxGeometry(0.36, 0.1, 0.08), visorMat, 0, 1.28, 0.2, 0, 0, 0, "head"); // Tinted lens
        addPart(new THREE.BoxGeometry(0.38, 0.13, 0.06), helmetMat, 0, 1.28, 0.19, 0, 0, 0, "head"); // Goggles strap/frame

        // Night Vision Goggles (NVGs) mounted on front center helmet
        addPart(new THREE.BoxGeometry(0.06, 0.06, 0.08), gearMat, 0, 1.42, 0.22, 0, 0, 0, "head"); // NVG Mount block
        const nvgArm = addPart(new THREE.BoxGeometry(0.04, 0.04, 0.12), gearMat, 0, 1.40, 0.28, Math.PI/6, 0, 0, "head"); // hinge arm
        
        // Twin NVG tubes with glowing green lenses
        const nvgTubeL = addPart(new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8), gearMat, -0.09, 1.34, 0.26, Math.PI/2, 0, 0, "head");
        const nvgLensL = addPart(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), nvgLensMat, -0.09, 1.34, 0.32, Math.PI/2, 0, 0, "head");
        
        const nvgTubeR = addPart(new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8), gearMat, 0.09, 1.34, 0.26, Math.PI/2, 0, 0, "head");
        const nvgLensR = addPart(new THREE.CylinderGeometry(0.028, 0.028, 0.008, 8), nvgLensMat, 0.09, 1.34, 0.32, Math.PI/2, 0, 0, "head");

        // Radio Headset (ear protectors) on helmet sides
        addPart(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8), gearMat, -0.25, 1.26, -0.04, 0, 0, Math.PI/2, "head");
        addPart(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8), gearMat, 0.25, 1.26, -0.04, 0, 0, Math.PI/2, "head");
        
        // 5. Shoulder Pads & Arms
        addPart(new THREE.BoxGeometry(0.2, 0.2, 0.2), camoMat, -0.42, 0.95, 0); // Left shoulder pad
        addPart(new THREE.BoxGeometry(0.2, 0.2, 0.2), camoMat, 0.42, 0.95, 0); // Right shoulder pad

        // Arms pointing weapon forward
        const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.6, 8);
        const lArm = addPart(armGeo, camoMat, -0.42, 0.74, 0.16, Math.PI / 2.8, 0, -Math.PI / 8); // Upper arm left
        addPart(new THREE.BoxGeometry(0.12, 0.12, 0.12), gearMat, -0.46, 0.62, 0.35); // Elbow Pad
        
        const rArm = addPart(armGeo, camoMat, 0.42, 0.74, 0.16, Math.PI / 2.8, 0, Math.PI / 8); // Upper arm right
        addPart(new THREE.BoxGeometry(0.12, 0.12, 0.12), gearMat, 0.46, 0.62, 0.35); // Elbow Pad

        // Hands (Tactical gloves)
        const gloveMat = new THREE.MeshStandardMaterial({ color: 0x181a1b, roughness: 0.8 });
        addPart(new THREE.BoxGeometry(0.12, 0.08, 0.12), gloveMat, -0.44, 0.52, 0.52);
        addPart(new THREE.BoxGeometry(0.12, 0.08, 0.12), gloveMat, 0.44, 0.52, 0.52);

        // 6. Tactical Weapon (Assault Rifle M4 / Sniper Rifle)
        const weaponGroup = new THREE.Group();
        weaponGroup.position.set(0.15, 0.64, 0.45);
        weaponGroup.rotation.x = Math.PI / 2;

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.8, 8), gunMat);
        barrel.position.y = 0.4;
        weaponGroup.add(barrel);
        
        // Muzzle flash hider ribs
        const flashHider = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.08, 8), gunMat);
        flashHider.position.y = 0.82;
        weaponGroup.add(flashHider);

        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.32), gunMat);
        stock.position.y = -0.15;
        weaponGroup.add(stock);

        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.09), gunMat);
        mag.position.set(0, 0.12, -0.1);
        mag.rotation.x = -Math.PI / 12;
        weaponGroup.add(mag);

        const scope = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.22), gearMat);
        scope.position.set(0, 0.08, 0.15);
        weaponGroup.add(scope);

        this.mesh.add(weaponGroup);
        this.gunTip = new THREE.Vector3();
        this.weaponGroup = weaponGroup;

        // Custom features based on type
        if (this.type === 'sniper') {
            const laserMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 });
            const laserGeo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 50)
            ]);
            this.laserMesh = new THREE.Line(laserGeo, laserMat);
            this.mesh.add(this.laserMesh);
            
            // Add Ghillie leaf meshes on shoulder/helmet
            const leafGeo = new THREE.ConeGeometry(0.18, 0.3, 4);
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a6332, roughness: 0.9 });
            addPart(leafGeo, leafMat, -0.22, 1.44, 0, Math.PI/4, 0, 0, "head");
            addPart(leafGeo, leafMat, 0.22, 1.44, 0, -Math.PI/4, 0, 0, "head");
            
            // Long sniper barrel
            barrel.scale.y = 1.6;
            barrel.position.y = 0.65;
            this.health = 80;
        } else if (this.type === 'heavy') {
            this.health = 250;
            this.maxHealth = 250;
            this.mesh.scale.set(1.15, 1.15, 1.15);
            
            // Titanium armored heavy shield on left arm
            const shieldMat = new THREE.MeshStandardMaterial({ color: 0x2d3235, roughness: 0.5, metalness: 0.8 });
            const shield = addPart(new THREE.BoxGeometry(0.72, 1.4, 0.06), shieldMat, -0.74, 0.64, 0.42, 0, Math.PI / 10, 0, "shield");
            
            // Heavy metallic shoulder guards
            const plateMat = new THREE.MeshStandardMaterial({ color: 0x42494d, roughness: 0.4, metalness: 0.75 });
            addPart(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8), plateMat, -0.45, 0.96, 0, 0, 0, Math.PI/4);
            addPart(new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8), plateMat, 0.45, 0.96, 0, 0, 0, -Math.PI/4);
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
        const droneMat = new THREE.MeshStandardMaterial({ 
            color: 0x2d3238, 
            metalness: 0.85, 
            roughness: 0.25,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.005
        });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Glowing red eye
        const rotorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.1 });

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
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x2b382a, 
            roughness: 0.5, 
            metalness: 0.4,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.008
        }); // Olive green fuselage
        const steelMat = new THREE.MeshStandardMaterial({ 
            color: 0x1f1f1f, 
            roughness: 0.3, 
            metalness: 0.85,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.01
        });
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
        const desertMat = new THREE.MeshStandardMaterial({ 
            map: ProceduralTextures.generateCamo('desert'),
            bumpMap: ProceduralTextures.generateCamoBump(),
            bumpScale: 0.015,
            roughness: 0.75,
            metalness: 0.15
        });
        const metalMat = new THREE.MeshStandardMaterial({ 
            color: 0x1f1f1f, 
            roughness: 0.35, 
            metalness: 0.85,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.01
        });

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
        const forestCamo = new THREE.MeshStandardMaterial({ 
            map: ProceduralTextures.generateCamo('forest'),
            bumpMap: ProceduralTextures.generateCamoBump(),
            bumpScale: 0.015,
            roughness: 0.75,
            metalness: 0.15
        });
        const redBeretMat = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.7, metalness: 0.1 }); // Commander Beret
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xdbad88, roughness: 0.6 });
        const metalMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.35, 
            metalness: 0.85,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.01
        });

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
        const jumpsuitMat = new THREE.MeshStandardMaterial({ 
            color: 0xff4a00, 
            roughness: 0.75, 
            bumpMap: ProceduralTextures.generateCamoBump(),
            bumpScale: 0.01
        }); // Orange suit
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfb08c, roughness: 0.6 });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), jumpsuitMat);
        body.position.y = 0.45;
        this.mesh.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), skinMat);
        head.position.y = 1.05;
        this.mesh.add(head);

        // Bound hands
        const handGeo = new THREE.BoxGeometry(0.12, 0.12, 0.25);
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0x966f33, roughness: 0.9 }); // Rope
        const hands = new THREE.Mesh(handGeo, ropeMat);
        hands.position.set(0, 0.4, 0.35);
        this.mesh.add(hands);

        // 2. Prison Cage (Borders/Bars)
        this.cageMesh = new THREE.Group();
        const metalMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0.4, 
            metalness: 0.8,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.008
        });
        
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
        const lockMat = new THREE.MeshStandardMaterial({ 
            color: 0xbf9000, 
            roughness: 0.25, 
            metalness: 0.9,
            bumpMap: ProceduralTextures.generateSteelGrain(),
            bumpScale: 0.01
        }); // Yellow/Brass lock
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
