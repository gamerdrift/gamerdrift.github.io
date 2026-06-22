# ==============================================================================
# RogueGhost: The White Reaper Boss Sniper AI (Godot 4.6 GDScript)
# ==============================================================================
class_name WhiteReaperAI
extends CharacterBody3D

# Signals
signal phase_changed(new_phase: int)
signal sniper_fired()

# Encounter Phases
enum Phase { DETECTION, TRACKING, DUEL, ESCAPE, STANDOFF }

# Configurations
@export var sniper_nest_positions: Array[Vector3] = []
@export var damage_per_shot: float = 35.0
@export var reposition_cooldown: float = 12.0

# Stats
var current_phase: Phase = Phase.DETECTION
var health: float = 250.0 # Boss has higher health pools
var max_health: float = 250.0
var active_nest_idx: int = 0
var shot_cooldown: float = 0.0
var search_timer: float = 0.0
var current_stealth: float = 95.0 # Camouflage index
var active_player: PlayerGhost = null

# Node references
@onready var spotlight: SpotLight3D = $SpotLight3D # Used for muzzle flash / target beam
@onready var raycast: RayCast3D = $RayCast3D

func _ready() -> void:
	add_to_group("bosses")
	add_to_group("guards") # So managers can track it as hostile
	
	# Fallback nests if none configured
	if sniper_nest_positions.size() == 0:
		sniper_nest_positions.append(global_position)
		sniper_nest_positions.append(global_position + Vector3(-12.0, 5.0, -10.0))
		sniper_nest_positions.append(global_position + Vector3(12.0, 5.0, -10.0))

func _physics_process(delta: float) -> void:
	# Scan for player
	_perform_tactical_scan(delta)

	# Combat loop
	if active_player and active_player.is_active:
		_process_combat_phases(delta)
		
		var laser = get_node_or_null("Visuals/SniperRifle/LaserBeam")
		if laser:
			var can_target = (current_phase in [Phase.TRACKING, Phase.DUEL, Phase.STANDOFF])
			laser.visible = can_target
			if can_target:
				var origin = global_position + Vector3(0.18, 1.2, -0.4)
				var target = active_player.global_position + Vector3(0, 0.8, 0)
				var distance = origin.distance_to(target)
				var c_mesh = laser.mesh as CylinderMesh
				if c_mesh:
					c_mesh.height = distance
				laser.position = Vector3(0, 0.2, -0.6 - (distance / 2.0))
	else:
		var laser = get_node_or_null("Visuals/SniperRifle/LaserBeam")
		if laser:
			laser.visible = false
	
	# Decays and timers
	if shot_cooldown > 0.0:
		shot_cooldown -= delta

func _perform_tactical_scan(delta: float) -> void:
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		active_player = players[0] as PlayerGhost

func _process_combat_phases(delta: float) -> void:
	var dist_to_player = global_position.distance_to(active_player.global_position)
	
	# Rotate to face player smoothly
	var to_player = (active_player.global_position - global_position).normalized()
	to_player.y = 0
	var look_target = global_position + to_player
	look_at(look_target, Vector3.UP)
	
	match current_phase:
		Phase.DETECTION:
			# Elite camouflage. Fires warning shots when player enters zone
			current_stealth = 95.0
			if dist_to_player < 25.0:
				_transition_to_phase(Phase.TRACKING)
			elif shot_cooldown <= 0.0 and dist_to_player < 50.0:
				_fire_warning_shot()
				
		Phase.TRACKING:
			# Tracking player and shooting accurate shots
			current_stealth = 80.0
			if shot_cooldown <= 0.0:
				_fire_tactical_shot()
				
			# If player gets too close, relocate
			if dist_to_player < 15.0:
				_transition_to_phase(Phase.DUEL)
				
		Phase.DUEL:
			# Counter-sniper phase. Exposes decoy muzzle flashes
			current_stealth = 60.0
			if shot_cooldown <= 0.0:
				_fire_tactical_shot()
				# Bait with decoy flash
				_trigger_decoy_flash()
				
			if health < max_health * 0.5:
				_transition_to_phase(Phase.ESCAPE)
				
		Phase.ESCAPE:
			# Relocates, drops smoke, and flees to backup nest
			current_stealth = 90.0
			_relocate_to_next_nest()
			_transition_to_phase(Phase.STANDOFF)
			
		Phase.STANDOFF:
			# Final close combat survival stance
			current_stealth = 30.0
			if shot_cooldown <= 0.0:
				_fire_tactical_shot()

func _fire_warning_shot() -> void:
	shot_cooldown = 4.0
	sniper_fired.emit()
	print("💨 Warning bullet cracked overhead! The White Reaper has detected you.")
	_flash_muzzle()

func _fire_tactical_shot() -> void:
	shot_cooldown = 3.0 + randf_range(0.0, 2.0)
	
	# Raycast check if unoccluded
	if raycast:
		raycast.global_position = global_position + Vector3.UP * 1.5
		raycast.target_position = raycast.to_local(active_player.global_position + Vector3.UP * 0.8)
		raycast.force_raycast_update()
		
		if raycast.is_colliding() and raycast.get_collider() == active_player:
			# Apply damage
			active_player.take_damage(damage_per_shot)
			print("🎯 The White Reaper hit you! Integrity critically affected.")
			_flash_muzzle()
			sniper_fired.emit()
		else:
			print("💨 Heavy sniper bullet hit the cover near you!")
			_flash_muzzle()

func _flash_muzzle() -> void:
	if spotlight:
		spotlight.light_color = Color(1.0, 0.8, 0.4)
		spotlight.light_energy = 8.0
		var t = get_tree().create_timer(0.08)
		t.timeout.connect(func():
			if spotlight: spotlight.light_energy = 0.0
		)

func _trigger_decoy_flash() -> void:
	# Spawns a false flash at an adjacent decoy position to bait counters
	print("✨ Decoy muzzle flash spotted at secondary ridge coordinates!")
	var decoy_pos = global_position + Vector3(randf_range(-5.0, 5.0), randf_range(-1.0, 1.0), randf_range(-2.0, 2.0))
	# Simulated decoy flash light
	var decoy_light = OmniLight3D.new()
	get_parent().add_child(decoy_light)
	decoy_light.global_position = decoy_pos
	decoy_light.light_color = Color(1.0, 0.8, 0.4)
	decoy_light.light_energy = 5.0
	var timer = get_tree().create_timer(0.1)
	timer.timeout.connect(func():
		decoy_light.queue_free()
	)

func _relocate_to_next_nest() -> void:
	active_nest_idx = (active_nest_idx + 1) % sniper_nest_positions.size()
	var target_nest = sniper_nest_positions[active_nest_idx]
	
	# Drop smoke screen (simulated log output & trigger particle reload)
	print("🌫️ Smoke grenade deployed! The White Reaper is relocating to nest: ", active_nest_idx)
	global_position = target_nest
	shot_cooldown = 4.0

func _transition_to_phase(new_phase: Phase) -> void:
	current_phase = new_phase
	phase_changed.emit(int(new_phase))
	print("🔄 The White Reaper transitioned to Combat Phase: ", new_phase)

func take_damage(amount: float) -> void:
	health -= amount
	print("💥 The White Reaper took damage! Current integrity: ", health)
	
	# Reposition immediately on being hit in duel/standoff
	if current_phase == Phase.DUEL or current_phase == Phase.TRACKING:
		if randf() < 0.6:
			_transition_to_phase(Phase.ESCAPE)
			
	if health <= 0.0:
		print("💀 THE WHITE REAPER IS ELIMINATED! The sector is secure.")
		# Trigger post-boss music cue if available
		if Engine.has_singleton("SoundManager"):
			SoundManager.play_music("boss_defeat")
		queue_free()
