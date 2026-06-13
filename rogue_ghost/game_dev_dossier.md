# Rogue Ghost 3D: Tactical Game Dev Dossier

This file serves as the master blueprint and project context for **Rogue Ghost 3D**, developed in the Godot 4.6 engine. Share this file with any new AI agent window to immediately resume development.

---

## 🛰️ Project Overview
* **Name:** RogueGhost
* **Genre:** 3D Third-Person Tactical Infiltration / Stealth Action
* **Engine version:** Godot 4.6.3 (Forward Plus Renderer)
* **Status:** Core scene graphs, collider nodes, player movements, visual guard AI cones, raycast occlusion triggers, hostage objectives, and mission managers have been completed and validated.

---

## 🗂️ Project Directory Layout

All assets and code reside in the `rogue_ghost/` directory:
- `project.godot` — Main project configuration with Forward Plus rendering settings.
- `icon.svg` — Custom vector logo (glowing neon goggles).
- `/scenes/` — Text-based Godot `.tscn` node tree scenes.
- `/scripts/` — GDScript `.gd` code files for player physics, vision sensors, and round loops.

---

## 📐 Node Hierarchies & Scene Blueprints

### 1. Main Menu Screen (`scenes/main_menu.tscn` ➔ `scripts/main_menu.gd`)
UI layout allowing players to choose weapon loads and deploy:
- **PistolBtn / BladeBtn** — Connects selection triggers to adjust active weapon tags.
- **StartButton** — Initiates scene transition to `res://scenes/level_snowblow.tscn`.

### 2. Player Operator (`scenes/player_ghost.tscn` ➔ `scripts/player_ghost.gd`)
Third-person character controlling player WASD movement and aiming:
- **CollisionShape3D** — Capsule shape that scales height down to `1.0m` when crouching (to slide under low areas).
- **Stealth Index** — Restores rapidly when standing still or crouching. Decreases when moving, and drops instantly by `35.0` on firing weapons.
- **Aiming & Shooting** — Right-click captures mouse coordinates for looking. Left-click fires bullet projectiles from the **Muzzle** Marker3D.

### 3. Bullet Projectile (`scenes/bullet_projectile.tscn` ➔ `scripts/bullet_projectile.gd`)
Moving projectile triggered on weapon fire:
- Moves forward along its heading using `global_translate()` at `35.0m/s`.
- On entering solid bodies, calls `body.take_damage(40.0)` and deletes itself (`queue_free()`).

### 4. Patrol Guard AI (`scenes/guard_enemy.tscn` ➔ `scripts/guard_ai.gd`)
AI-guided guard patrolling and visual sweeps:
- **VisionArea** — Conical area trigger checking for player presence.
- **SpotLight3D** — Acts as a visual headlights cone (white on patrol, amber/red on alert).
- **Stealth/LOS Check** — If player is inside the vision cone, performs a `RayCast3D` sweep. If unblocked by walls, "Alert Level" rises. Reaching `100.0` switches state to `CHASE`. Chasing guards lock onto the player and deal damage over time.

### 5. Hostage Objectives (`scenes/hostage_node.tscn` ➔ `scripts/hostage_node.gd`)
Hologram cylinders placed in secure vaults:
- Rescued when player enters the trigger radius. Converts visual materials to green and alerts the manager.

### 6. Outpost Mission Manager (`scenes/level_snowblow.tscn` ➔ `scripts/mission_manager.gd`)
Coordinator of level structures and victory parameters:
- **World Layout** — Built using **CSG (Constructive Solid Geometry)** blocks (`CSGBox3D`) mapping floors, exterior fences, columns, and corridors.
- **Victory Overrides** — Entering the `ExitZone` triggers success *only if* all hostages are rescued, calculating final score bonuses.

---

## 🛠️ Developer Command Console Cheat Sheet

### Headless Validation Check
Run this command from the website project root to test compile all GDScripts and scenes:
```powershell
./Godot_v4.6.3-stable_win64_console.exe --path ./rogue_ghost/ --headless --check-only
```

### Run Native Desktop Game
1. Open the project manager: `./Godot_v4.6.3-stable_win64.exe`
2. Click **Import**, navigate to `rogue_ghost/` folder, and open.
3. Hit **Play** (or `F5`) in the top-right corner to test.

---

## 🚀 Recommended Next Development Steps
1. **Web Exporting Setup:** Configure HTML5/WebAssembly build presets inside Godot's export deck to generate `.wasm` and `.pck` files.
2. **Next.js Player Frame:** Update `app/rogueghost/page.tsx` to include an iframe loading the exported Wasm page, letting website players run the 3D game.
3. **Sound Assets:** Add tactical sound files (footsteps, alerts, silenced fire) to replace synthesized clicks.
4. **Enhanced Level Design:** Add extra rooms, ventilation shafts, and more complex patrol tracks for guards.
