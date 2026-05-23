class GameManager {
    constructor() {
        this.gameState = 'menu'; // menu, playing, gameover, victory, soundcheck
        this.activeMode = 'campaign'; // campaign, survival, timeattack
        
        // Player Stats
        this.health = 100;
        this.armor = 50;
        this.score = 0;
        this.kills = 0;
        this.highScore = parseInt(localStorage.getItem('arcade_highscore')) || 0;
        
        // Covering state
        this.isCovering = false;
        
        // Weapons
        this.weapons = {
            pistol: { name: 'USP Match', clip: 12, maxClip: 12, reserve: Infinity, maxReserve: Infinity, damage: 30, fireRate: 350, reloadTime: 1200, key: '1' },
            shotgun: { name: 'SPAS-12', clip: 6, maxClip: 6, reserve: 24, maxReserve: 36, damage: 15, pellets: 7, fireRate: 900, reloadTime: 2200, key: '2' },
            rifle: { name: 'M4A1 Carbine', clip: 30, maxClip: 30, reserve: 90, maxReserve: 120, damage: 20, fireRate: 110, reloadTime: 1600, key: '3' }
        };
        this.activeWeaponKey = 'pistol';
        this.isReloading = false;
        this.lastFiredTime = 0;
        
        // Timer for Time Attack / Survival
        this.stageTimer = 0;
        this.survivalWave = 1;
        this.survivalTimer = 0;
        
        this.activeStage = 1;
        this.unlockedStage = parseInt(localStorage.getItem('arcade_unlockedstage')) || 1;
        this.objectiveText = "Clear all hostiles!";

        // Pickups (dropped items from enemies that player can shoot to collect)
        this.pickups = [];

        // Game loop
        this.lastTime = 0;
    }

    init() {
        // Set up DOM interaction
        this.setupInputListeners();
        this.updateHUD();
    }

    setupInputListeners() {
        const gameContainer = document.getElementById('game-container');
        const crosshair = document.getElementById('crosshair');

        // Mouse movement: updating crosshair & engine coordinates
        gameContainer.addEventListener('mousemove', (e) => {
            if (this.gameState !== 'playing') return;

            const rect = gameContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update DOM element position
            crosshair.style.left = `${x}px`;
            crosshair.style.top = `${y}px`;

            // Convert to Normalized Device Coordinates (-1 to 1) for Raycaster
            const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (window.engine) {
                window.engine.mouse.set(ndcX, ndcY);
            }

            // Check if hovering over enemy
            this.checkCrosshairHover();
        });

        // Mouse click: shooting
        gameContainer.addEventListener('mousedown', (e) => {
            if (this.gameState !== 'playing') return;
            if (e.button === 0) { // Left click
                this.shootActiveWeapon();
            }
        });

        // Key listeners
        window.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;

            // Spacebar: Cover duck down
            if (e.code === 'Space') {
                e.preventDefault();
                this.setCoverState(true);
            }

            // Reload key
            if (e.code === 'KeyR') {
                this.reloadWeapon();
            }

            // Weapon slots
            if (e.code === 'Digit1') this.switchWeapon('pistol');
            if (e.code === 'Digit2') this.switchWeapon('shotgun');
            if (e.code === 'Digit3') this.switchWeapon('rifle');
        });

        window.addEventListener('keyup', (e) => {
            if (this.gameState !== 'playing') return;

            // Release space: stand up out of cover
            if (e.code === 'Space') {
                this.setCoverState(false);
            }
        });
    }

    checkCrosshairHover() {
        if (!window.engine) return;

        // Perform micro raycast to see if crosshair is hovering over enemy model
        window.engine.raycaster.setFromCamera(window.engine.mouse, window.engine.camera);

        const targetMeshes = [];
        window.engine.activeEnemies.forEach(enemy => {
            if (enemy.isDead) return;
            enemy.mesh.traverse(child => {
                if (child.isMesh) targetMeshes.push(child);
            });
        });

        if (this.prisoner && this.prisoner.cageLocked) {
            this.prisoner.mesh.traverse(child => {
                if (child.isMesh && child.name === "cage_lock") targetMeshes.push(child);
            });
        }

        // Check intersections
        const intersects = window.engine.raycaster.intersectObjects(targetMeshes);
        const crosshair = document.getElementById('crosshair');

        if (intersects.length > 0) {
            crosshair.classList.add('enemy-target');
        } else {
            crosshair.classList.remove('enemy-target');
        }
    }

    setCoverState(cover) {
        if (cover === this.isCovering) return;
        this.isCovering = cover;

        const coverIndicator = document.getElementById('cover-indicator');
        const screenFilter = document.getElementById('screen-filter');

        if (cover) {
            coverIndicator.style.display = 'block';
            screenFilter.className = 'filter-cover';
            // Slow tactical HEV reload boost while in cover
            if (this.isReloading) {
                // visually boosted
            }
        } else {
            coverIndicator.style.display = 'none';
            screenFilter.className = 'filter-normal';
        }
    }

    switchWeapon(weaponKey) {
        if (this.activeWeaponKey === weaponKey || this.isReloading) return;
        
        const weapon = this.weapons[weaponKey];
        // Check if unlocked (Shotgun needs Stage 2, Rifle Stage 3 in Campaign)
        if (this.activeMode === 'campaign') {
            if (weaponKey === 'shotgun' && this.activeStage < 2) return;
            if (weaponKey === 'rifle' && this.activeStage < 3) return;
        }

        this.activeWeaponKey = weaponKey;
        window.gameAudio.playHevWarning('combat_ready'); // weapon click chime
        this.updateHUD();
        this.checkCrosshairHover();
    }

    shootActiveWeapon() {
        if (this.isReloading || this.isCovering) return;

        const weapon = this.weapons[this.activeWeaponKey];
        const now = Date.now();

        // Fire rate limiter
        if (now - this.lastFiredTime < weapon.fireRate) return;
        
        // Out of ammo check
        if (weapon.clip <= 0) {
            // Dry fire click
            window.gameAudio.playReloadClick(0.5);
            this.promptWarning('RELOAD REQUIRED');
            return;
        }

        // Fire!
        this.lastFiredTime = now;
        weapon.clip--;

        // Gun kick effect (recoil)
        this.triggerRecoilEffect();

        // Shoot Audio
        if (this.activeWeaponKey === 'pistol') {
            window.gameAudio.playPistol();
        } else if (this.activeWeaponKey === 'shotgun') {
            window.gameAudio.playShotgun();
        } else if (this.activeWeaponKey === 'rifle') {
            window.gameAudio.playAssaultRifle();
        }

        // Fire raycasts into WebGL scene
        const hitData = [];
        if (this.activeWeaponKey === 'shotgun') {
            // Shotgun fires multiple spread pellets
            for (let i = 0; i < weapon.pellets; i++) {
                // Add slight offsets to cursor aiming
                const mx = window.engine.mouse.x + (Math.random() - 0.5) * 0.12;
                const my = window.engine.mouse.y + (Math.random() - 0.5) * 0.12;
                const hit = window.engine.triggerRaycast(mx, my, weapon.damage);
                if (hit.hit) hitData.push(hit);
            }
        } else {
            // Standard single bullet raycast
            const hit = window.engine.triggerRaycast(window.engine.mouse.x, window.engine.mouse.y, weapon.damage);
            if (hit.hit) hitData.push(hit);
        }

        // Process hits (Score multipliers, kills)
        hitData.forEach(h => {
            if (h.isPOW) return; // rescued lock bypasses typical soldier logic
            
            if (h.enemy.isDead) {
                this.onEnemyKilled(h.enemy);
            } else {
                // hit points reward
                this.addScore(h.isHeadshot ? 150 : 50);
            }
        });

        this.updateHUD();
        this.checkCrosshairHover();
    }

    triggerRecoilEffect() {
        const gameContainer = document.getElementById('game-container');
        // Random screen translate recoil bump
        const dx = (Math.random() - 0.5) * 12;
        const dy = -(5 + Math.random() * 8);

        gameContainer.style.transform = `translate(${dx}px, ${dy}px)`;
        setTimeout(() => {
            gameContainer.style.transform = 'translate(0px, 0px)';
        }, 50);
    }

    reloadWeapon() {
        const weapon = this.weapons[this.activeWeaponKey];
        if (this.isReloading || weapon.clip === weapon.maxClip || weapon.reserve <= 0) return;

        this.isReloading = true;
        this.updateHUD();

        window.gameAudio.playReloadSound();
        this.promptWarning('RELOADING');

        // Speed reload inside cover (25% faster)
        const activeReloadTime = this.isCovering ? (weapon.reloadTime * 0.75) : weapon.reloadTime;

        setTimeout(() => {
            this.isReloading = false;
            
            // Calculate ammo refill
            const needed = weapon.maxClip - weapon.clip;
            const transfer = Math.min(needed, weapon.reserve);
            
            weapon.clip += transfer;
            if (weapon.reserve !== Infinity) {
                weapon.reserve -= transfer;
            }

            this.hideWarning();
            this.updateHUD();
            this.checkCrosshairHover();
        }, activeReloadTime);
    }

    promptWarning(text) {
        const warn = document.getElementById('warning-prompt');
        warn.innerText = text;
        warn.style.display = 'block';
    }

    hideWarning() {
        document.getElementById('warning-prompt').style.display = 'none';
    }

    hurtPlayer(amount) {
        if (this.gameState !== 'playing' || this.isCovering) return;

        // Damage calculation: Armor absorbs 60% of damage
        let armorAbsorption = 0;
        if (this.armor > 0) {
            armorAbsorption = Math.min(this.armor, amount * 0.6);
            this.armor -= armorAbsorption;
        }

        const remainingDamage = amount - armorAbsorption;
        this.health -= remainingDamage;

        // Flash screen red
        const filter = document.getElementById('screen-filter');
        filter.className = this.armor > 0 ? 'filter-shield-hit' : 'filter-damage';
        setTimeout(() => {
            if (this.gameState === 'playing') {
                filter.className = this.isCovering ? 'filter-cover' : 'filter-normal';
            }
        }, 150);

        // Sound effects
        window.gameAudio.playPlayerHurt();

        // HEV Voice warning triggers
        if (this.health <= 0) {
            this.die();
        } else if (this.health < 25) {
            window.gameAudio.playHevWarning('critical'); // flatline beep
        } else if (amount > 30) {
            window.gameAudio.playHevWarning('major_fracture');
        } else if (Math.random() > 0.6) {
            window.gameAudio.playHevWarning('minor_lacerations');
        }

        if (this.armor <= 0 && armorAbsorption > 0) {
            window.gameAudio.playHevWarning('shield_empty');
        }

        this.updateHUD();
    }

    onEnemyKilled(enemy) {
        this.kills++;
        this.addScore(enemy.type === 'boss' ? 5000 : (enemy.type === 'heavy' ? 800 : 300));
        
        // 30% chance to drop arcade items: Health Kit or Battery
        if (Math.random() < 0.35) {
            this.spawnPickupItem(enemy.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
        }
    }

    spawnPickupItem(position) {
        if (!window.engine) return;

        const isHealth = Math.random() > 0.5;
        const pickupMat = new THREE.MeshLambertMaterial({ 
            color: isHealth ? 0xff3333 : 0x00aaff, // Red cross vs Blue cell
            emissive: isHealth ? 0x330000 : 0x003366
        });
        const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const mesh = new THREE.Mesh(geo, pickupMat);
        mesh.position.copy(position);

        window.engine.scene.add(mesh);
        window.engine.levelMeshes.push(mesh); // register for disposal

        // Add a floating animation tag
        this.pickups.push({
            mesh,
            isHealth,
            floatOffset: Math.random() * Math.PI,
            collected: false
        });

        // Set name on model mesh for raycasting click targeting!
        mesh.name = "pickup_item";

        // Map mesh reference inside engine so it can be hit!
        // We override raycast hit detection inside triggerRaycast
        const customPickupIndex = this.pickups.length - 1;
        mesh.userData = { pickupIndex: customPickupIndex };
    }

    collectPickup(index) {
        const item = this.pickups[index];
        if (!item || item.collected) return;
        item.collected = true;

        // Remove from 3D scene
        window.engine.scene.remove(item.mesh);

        if (item.isHealth) {
            this.health = Math.min(100, this.health + 25);
            window.gameAudio.playHevWarning('shield_charge'); // healing beep
        } else {
            this.armor = Math.min(100, this.armor + 25);
            window.gameAudio.playHevWarning('shield_charge'); // shield charge chime
        }

        this.addScore(500); // Collection bonus
        this.updateHUD();
    }

    addScore(amount) {
        this.score += amount;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('arcade_highscore', this.highScore);
        }
    }

    onStageComplete() {
        if (this.gameState !== 'playing') return;

        // Save stage unlocking progress
        if (this.activeStage === this.unlockedStage && this.unlockedStage < 5) {
            this.unlockedStage++;
            localStorage.setItem('arcade_unlockedstage', this.unlockedStage);
        }

        this.gameState = 'victory';
        window.gameAudio.stopMusic();
        window.gameAudio.playHevWarning('combat_ready');

        // Update Victory screen elements
        document.getElementById('screen-victory').style.display = 'flex';
        document.getElementById('victory-score').innerText = this.score;
        document.getElementById('victory-kills').innerText = this.kills;

        // Show Next Stage button only if not at final stage
        const nextBtn = document.getElementById('next-stage-btn');
        if (this.activeStage < 5) {
            nextBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'none';
        }
    }

    onRescuePOW() {
        // Delay Victory pop up for dramatic release animation
        setTimeout(() => {
            this.onStageComplete();
        }, 1500);
    }

    die() {
        this.gameState = 'gameover';
        window.gameAudio.stopMusic();
        window.gameAudio.playHevWarning('critical'); // Alarm tones

        document.getElementById('screen-gameover').style.display = 'flex';
        document.getElementById('gameover-score').innerText = this.score;
    }

    startStage(stageIndex, mode = 'campaign') {
        this.activeStage = stageIndex;
        this.activeMode = mode;
        this.gameState = 'playing';

        // Reset vitals
        this.health = 100;
        this.armor = 50;
        this.score = 0;
        this.kills = 0;
        this.isCovering = false;
        this.isReloading = false;
        this.pickups = [];

        // Reset ammo reserves
        this.weapons.pistol.clip = this.weapons.pistol.maxClip;
        this.weapons.shotgun.clip = this.weapons.shotgun.maxClip;
        this.weapons.shotgun.reserve = this.weapons.shotgun.maxReserve;
        this.weapons.rifle.clip = this.weapons.rifle.maxClip;
        this.weapons.rifle.reserve = this.weapons.rifle.maxReserve;

        // Hide overlay menus
        document.getElementById('screen-menu').style.display = 'none';
        document.getElementById('screen-victory').style.display = 'none';
        document.getElementById('screen-gameover').style.display = 'none';
        document.getElementById('screen-stages').style.display = 'none';

        // Clear indicator overlays
        document.getElementById('cover-indicator').style.display = 'none';
        this.hideWarning();

        // Set Engine environment
        if (window.engine) {
            window.engine.setStageEnvironment(stageIndex);
        }

        // Start dynamic synthesizer track and change voice announce
        window.gameAudio.setStage(stageIndex);
        window.gameAudio.startMusic();
        window.gameAudio.playHevWarning('combat_ready'); // HEV diagnostics boot

        // Set objective string
        const objectives = {
            1: "Locate supply caches inside the Container Yard. Clear guards.",
            2: "Board the Cargo Vessel. Clear deck guards & destroy the chopper.",
            3: "Secure Airport runway hangar. Terminate tactical units.",
            4: "Infiltrate desert outpost village. Destroy armored defensive tanks.",
            5: "Infiltrate Jungle Fortress ruins. Eliminate Commander. Rescue POW."
        };
        this.updateObjective(objectives[stageIndex]);

        // Start loop
        this.lastTime = performance.now();
        this.updateHUD();
    }

    updateObjective(text) {
        this.objectiveText = text;
        document.getElementById('objective-text').innerText = text;
    }

    updateHUD() {
        // Vitals HUD
        document.getElementById('hud-health').innerText = Math.max(0, Math.floor(this.health));
        document.getElementById('hud-armor').innerText = Math.floor(this.armor);
        document.getElementById('hud-score').innerText = this.score;

        // Weapons HUD
        const weapon = this.weapons[this.activeWeaponKey];
        document.getElementById('weapon-name').innerText = weapon.name;
        document.getElementById('ammo-clip').innerText = this.isReloading ? '--' : weapon.clip;
        document.getElementById('ammo-total').innerText = weapon.reserve === Infinity ? 'INF' : weapon.reserve;

        // ECG heart monitor pulse speed adjustments based on health
        const ecgLine = document.querySelector('.ecg-line');
        if (ecgLine) {
            let pulseDuration = '1.8s';
            if (this.health < 25) {
                pulseDuration = '0.5s'; // rapid warning pulse
                ecgLine.style.stroke = 'var(--hev-red)';
            } else if (this.health < 60) {
                pulseDuration = '1.0s';
                ecgLine.style.stroke = 'var(--hev-orange)';
            } else {
                ecgLine.style.stroke = 'var(--hev-orange)';
            }
            ecgLine.style.animationDuration = pulseDuration;
        }

        // Red alert style if health is low
        const hpPanel = document.getElementById('health-panel');
        if (this.health < 25) {
            hpPanel.style.borderColor = 'var(--hev-red)';
            hpPanel.style.boxShadow = '0 0 10px var(--hev-red-glow)';
            hpPanel.style.color = 'var(--hev-red)';
        } else {
            hpPanel.style.borderColor = '';
            hpPanel.style.boxShadow = '';
            hpPanel.style.color = '';
        }
    }

    runLoop(time) {
        if (this.gameState !== 'playing') return;

        const delta = Math.min(0.1, (time - this.lastTime) * 0.001); // clamp delta
        this.lastTime = time;

        // 1. Cover healing logic: if in cover and health is low (< 50), recover health slowly
        if (this.isCovering && this.health < 50) {
            this.health = Math.min(50, this.health + 4 * delta);
            this.updateHUD();
        }

        // 2. Float and update Pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const item = this.pickups[i];
            if (item.collected) continue;

            item.floatOffset += 5 * delta;
            item.mesh.position.y += Math.sin(item.floatOffset) * 0.008;
            item.mesh.rotation.y += 1.5 * delta;

            // Collect if clicked!
            // When triggerRaycast returns a target hit name 'pickup_item'
            // We read its index from mesh.userData.pickupIndex
        }

        // 3. Update WebGL engine scene
        if (window.engine) {
            window.engine.update(delta, window.engine.camera.position, this.isCovering);
        }

        // 4. Update Tween animations (camera movements, entity falls)
        TWEEN.update();

        // Loop repeat
        requestAnimationFrame((t) => this.runLoop(t));
    }
}

// Override raycast handler inside Engine to support collecting floating pickups
const origTriggerRaycast = GameEngine.prototype.triggerRaycast;
GameEngine.prototype.triggerRaycast = function(x, y, damage) {
    this.mouse.x = x;
    this.mouse.y = y;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Filter pickup meshes
    const pickupMeshes = [];
    window.game.pickups.forEach(item => {
        if (!item.collected) {
            pickupMeshes.push(item.mesh);
        }
    });

    const pickupIntersects = this.raycaster.intersectObjects(pickupMeshes);
    if (pickupIntersects.length > 0) {
        const hitMesh = pickupIntersects[0].object;
        const idx = hitMesh.userData.pickupIndex;
        window.game.collectPickup(idx);
        return { hit: true, isPickup: true };
    }

    // fallback to original soldier/boss raycast
    return origTriggerRaycast.call(this, x, y, damage);
};

// Export single global instance
window.game = new GameManager();
