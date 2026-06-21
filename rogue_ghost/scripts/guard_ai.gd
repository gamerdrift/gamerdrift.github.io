# ==============================================================================
# RogueGhost: 3D Security Guard AI Controller (Godot 4.6 GDScript)
# Supports patrol guards AND stationary truck/tower gunners.
# Requires: CharacterBody3D as the root node of the Guard scene
# ==============================================================================
class_name GuardAI
extends CharacterBody3D

# Signals
signal alert_level_changed(current: float)
signal player_spotted()

# State Enum
enum State { PATROL, CHASE, RETURN }

# Exported Variables
@export var patrol_points: Array[Vector3] = []
@export var speed: float = 2.0
@export var chase_speed: float = 3.8
@export var acceleration: float = 8.0
@export var vision_range: float = 22.0
@export var vision_angle_deg: float = 55.0
@export var alert_rate: float = 100.0
@export var damage_per_sec: float = 25.0
## Stationary guards (truck/tower) stay in place and only aim+fire
@export var is_stationary: bool = false
## Longer range for elevated tower sniper
@export var fire_cooldown: float = 2.0

# AI States
var current_state: State = State.PATROL
var current_patrol_idx: int = 0
var alert_level: float = 0.0
var active_target: PlayerGhost = null
var initial_position: Vector3

# Physics
var gravity: float = 9.8

# Cover & squad state
var squad_alert_timer: float = 0.0
var is_in_cover: bool = false
var cover_position: Vector3 = Vector3.ZERO
var cover_timer: float = 0.0

# Firing state
var fire_timer: float = 0.0
var is_dead: bool = false

# Node references
@onready var vision_area: Area3D = $VisionArea
@onready var raycast: RayCast3D = $RayCast3D
@onready var spotlight: SpotLight3D = $SpotLight3D
@onready var visuals: Node3D = $Visuals

func _ready() -> void:
	add_to_group("guards")
	initial_position = global_position
	fire_timer = randf_range(0.0, fire_cooldown)  # stagger so all guards don't fire at once

	if not is_stationary and patrol_points.size() == 0:
		patrol_points.append(global_position)
		patrol_points.append(global_position + transform.basis.x * 6.0)
		patrol_points.append(global_position - transform.basis.x * 6.0)

func _physics_process(delta: float) -> void:
	if is_dead:
		return

	if not is_on_floor() and not is_stationary:
		velocity.y -= gravity * delta

	_perform_stealth_check(delta)

	if is_stationary:
		_process_stationary(delta)
	else:
		match current_state:
			State.PATROL:
				_process_patrol(delta)
			State.CHASE:
				_process_chase(delta)
			State.RETURN:
				_process_return(delta)
		move_and_slide()

func _perform_stealth_check(delta: float) -> void:
	var players = get_tree().get_nodes_in_group("player")
	if players.size() == 0:
		return

	var player = players[0] as PlayerGhost
	if not player or not player.is_active:
		active_target = null
		if current_state == State.CHASE:
			current_state = State.RETURN
		return

	var to_player = player.global_position - global_position
	var dist = to_player.length()

	var facing = -global_transform.basis.z.normalized()
	var angle_to_player = rad_to_deg(facing.angle_to(to_player.normalized()))

	var inside_cone = dist < vision_range and angle_to_player < vision_angle_deg
	var player_spotted_now = false

	if inside_cone:
		if raycast:
			raycast.global_position = global_position + Vector3.UP * 0.8
			raycast.target_position = raycast.to_local(player.global_position + Vector3.UP * 0.8)
			raycast.force_raycast_update()
			if raycast.is_colliding():
				var collider = raycast.get_collider()
				if collider == player:
					player_spotted_now = true

	if player_spotted_now:
		active_target = player
		var stealth_factor = 1.0 - (player.stealth_level / 100.0)
		var detection_modifier = max(0.2, stealth_factor)

		alert_level = min(100.0, alert_level + alert_rate * detection_modifier * delta)
		alert_level_changed.emit(alert_level)

		if spotlight:
			spotlight.light_color = Color(1.0, 0.3, 0.0) if alert_level < 80.0 else Color(1.0, 0.0, 0.0)

		if alert_level >= 100.0 and current_state != State.CHASE:
			current_state = State.CHASE
			player_spotted.emit()
			SoundManager.play_3d("guard_alert", global_position)
			print("🚨 TARGET LOCKED! Commencing attack sequence.")
	else:
		alert_level = max(0.0, alert_level - 18.0 * delta)
		alert_level_changed.emit(alert_level)

		if spotlight:
			spotlight.light_color = Color(1.0, 1.0, 0.8)

		if alert_level <= 0.0 and current_state == State.CHASE and not is_stationary:
			current_state = State.RETURN
			active_target = null
			print("🔍 Lost trace of target. Returning to patrol grid.")

# Stationary guards (truck + tower): only rotate to face player and fire
func _process_stationary(delta: float) -> void:
	if active_target and is_instance_valid(active_target) and alert_level >= 80.0:
		# Aim at player
		var to_player = active_target.global_position - global_position
		to_player.y = 0
		if to_player.length() > 0.1:
			var target_look = global_position + to_player.normalized()
			look_at(target_look, Vector3.UP)
			rotation.x = 0
			rotation.z = 0

		# Fire bursts
		fire_timer -= delta
		if fire_timer <= 0.0:
			fire_timer = fire_cooldown + randf_range(-0.3, 0.5)
			_fire_ak_burst()

func _process_patrol(delta: float) -> void:
	if patrol_points.size() == 0:
		return

	var target_pt = patrol_points[current_patrol_idx]
	var dir_to_pt = target_pt - global_position
	dir_to_pt.y = 0

	if dir_to_pt.length() < 0.4:
		current_patrol_idx = (current_patrol_idx + 1) % patrol_points.size()
	else:
		var move_dir = dir_to_pt.normalized()
		velocity.x = move_toward(velocity.x, move_dir.x * speed, acceleration * delta)
		velocity.z = move_toward(velocity.z, move_dir.z * speed, acceleration * delta)

		var target_look = global_position + move_dir
		look_at(target_look, Vector3.UP)
		rotation.x = 0
		rotation.z = 0

func _process_chase(delta: float) -> void:
	if not active_target or not active_target.is_active:
		current_state = State.RETURN
		return

	var to_player = active_target.global_position - global_position
	to_player.y = 0
	var dist = to_player.length()

	var move_dir = to_player.normalized()
	if is_in_cover:
		cover_timer -= delta
		if cover_timer <= 0.0 or global_position.distance_to(cover_position) < 1.0:
			is_in_cover = false
		else:
			move_dir = (cover_position - global_position).normalized()
			move_dir.y = 0

	velocity.x = move_toward(velocity.x, move_dir.x * chase_speed, acceleration * delta)
	velocity.z = move_toward(velocity.z, move_dir.z * chase_speed, acceleration * delta)

	var target_look = global_position + move_dir
	look_at(target_look, Vector3.UP)
	rotation.x = 0
	rotation.z = 0

	# Fire at player when close enough
	fire_timer -= delta
	if fire_timer <= 0.0 and dist < 20.0:
		fire_timer = fire_cooldown + randf_range(-0.2, 0.4)
		_fire_ak_burst()
		# Only deal contact damage when very close
		if dist < 5.0:
			active_target.take_damage(damage_per_sec * delta * 3.0)

	squad_alert_timer -= delta
	if squad_alert_timer <= 0.0:
		squad_alert_timer = 1.5
		_broadcast_alert()

func _fire_ak_burst() -> void:
	if not active_target or not is_instance_valid(active_target):
		return

	# Play AK burst sound from this guard's world position
	SoundManager.play_3d("shot_ak_burst", global_position)

	# Spawn muzzle flash at muzzle tip
	_spawn_muzzle_flash()

	# Damage player if in realistic range with accuracy falloff
	var dist = global_position.distance_to(active_target.global_position)
	if dist < 25.0:
		var accuracy = clamp(1.0 - (dist / 25.0), 0.15, 0.9)
		# Each AK burst fires 3 rounds; each has a random hit chance
		for _i in range(3):
			if randf() < accuracy * 0.45:
				active_target.take_damage(8.0)

func _spawn_muzzle_flash() -> void:
	# Try to find Muzzle marker on this guard
	var muzzle: Node3D = null
	if has_node("Visuals/GuardRifle/Barrel/Muzzle"):
		muzzle = get_node("Visuals/GuardRifle/Barrel/Muzzle")

	var flash_pos = global_position + Vector3(0, 0.8, -0.5)
	if muzzle:
		flash_pos = muzzle.global_position

	# Orange-red flash light
	var flash_light = OmniLight3D.new()
	flash_light.light_color = Color(1.0, 0.45, 0.1, 1)
	flash_light.light_energy = 4.0
	flash_light.omni_range = 2.5
	get_tree().root.add_child(flash_light)
	flash_light.global_position = flash_pos

	# Auto-remove after 45ms
	var t = get_tree().create_timer(0.045)
	t.timeout.connect(func(): if is_instance_valid(flash_light): flash_light.queue_free())

func _broadcast_alert() -> void:
	for guard in get_tree().get_nodes_in_group("guards"):
		if guard != self and guard.global_position.distance_to(global_position) < 25.0:
			if guard.has_method("alert_squad_member"):
				guard.alert_squad_member(active_target)

func alert_squad_member(target: PlayerGhost) -> void:
	if current_state != State.CHASE or is_stationary:
		current_state = State.CHASE if not is_stationary else current_state
		active_target = target
		alert_level = 100.0
		SoundManager.play_3d("guard_alert", global_position)
		if spotlight:
			spotlight.light_color = Color(1.0, 0.0, 0.0)

func _find_nearest_cover() -> Vector3:
	var covers = get_tree().get_nodes_in_group("cover")
	if covers.size() == 0:
		return global_position + Vector3(randf_range(-4.0, 4.0), 0.0, randf_range(-4.0, 4.0))
	var nearest = covers[0].global_position
	var min_dist = global_position.distance_to(nearest)
	for c in covers:
		var d = global_position.distance_to(c.global_position)
		if d < min_dist:
			min_dist = d
			nearest = c.global_position
	return nearest

func _process_return(delta: float) -> void:
	var return_pt = patrol_points[current_patrol_idx]
	var dir_to_pt = return_pt - global_position
	dir_to_pt.y = 0

	if dir_to_pt.length() < 0.4:
		current_state = State.PATROL
	else:
		var move_dir = dir_to_pt.normalized()
		velocity.x = move_toward(velocity.x, move_dir.x * speed, acceleration * delta)
		velocity.z = move_toward(velocity.z, move_dir.z * speed, acceleration * delta)

		var target_look = global_position + move_dir
		look_at(target_look, Vector3.UP)
		rotation.x = 0
		rotation.z = 0

func take_damage(amount: float) -> void:
	if is_dead:
		return

	print("💥 Guard hit! Damage: ", amount)
	SoundManager.play_3d("enemy_grunt", global_position)
	alert_level = 100.0
	current_state = State.CHASE

	if not is_in_cover and not is_stationary and randf() < 0.7:
		cover_position = _find_nearest_cover()
		cover_timer = 3.0
		is_in_cover = true

	_broadcast_alert()

	if amount >= 35.0:
		_play_death_animation()

func _play_death_animation() -> void:
	if is_dead:
		return
	is_dead = true
	set_physics_process(false)
	print("💀 Guard neutralized.")

	# Flash red emissive on all mesh children then collapse
	var meshes = []
	_collect_meshes(self, meshes)
	for mesh_inst in meshes:
		if mesh_inst is MeshInstance3D and mesh_inst.mesh:
			var mat = StandardMaterial3D.new()
			mat.albedo_color = Color(1, 0, 0, 1)
			mat.emission_enabled = true
			mat.emission = Color(1, 0, 0, 1)
			mat.emission_energy_multiplier = 3.0
			mesh_inst.set_surface_override_material(0, mat)

	# Collapse tween (scale down on Y)
	var tween = create_tween()
	tween.tween_property(self, "scale", Vector3(1.2, 0.05, 1.2), 0.45).set_ease(Tween.EASE_IN)
	tween.tween_callback(func(): queue_free())

func _collect_meshes(node: Node, result: Array) -> void:
	if node is MeshInstance3D:
		result.append(node)
	for child in node.get_children():
		_collect_meshes(child, result)
