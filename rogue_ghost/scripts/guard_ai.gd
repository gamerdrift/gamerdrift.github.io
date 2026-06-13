# ==============================================================================
# RogueGhost: 3D Security Guard AI Controller (Godot 4.6 GDScript)
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
@export var vision_range: float = 12.0
@export var vision_angle_deg: float = 45.0 # Vision cone half-angle in degrees
@export var alert_rate: float = 100.0 # Alert points per second when player is spotted
@export var damage_per_sec: float = 30.0

# AI States
var current_state: State = State.PATROL
var current_patrol_idx: int = 0
var alert_level: float = 0.0 # 0 to 100
var active_target: PlayerGhost = null
var initial_position: Vector3

# Physics setup
var gravity: float = 9.8

# Node references
@onready var vision_area: Area3D = $VisionArea
@onready var raycast: RayCast3D = $RayCast3D
@onready var spotlight: SpotLight3D = $SpotLight3D

func _ready() -> void:
	add_to_group("guards")
	initial_position = global_position
	
	# If no patrol points, create simple back-and-forth points based on starting pos
	if patrol_points.size() == 0:
		patrol_points.append(global_position)
		patrol_points.append(global_position + transform.basis.x * 6.0)
		patrol_points.append(global_position - transform.basis.x * 6.0)

func _physics_process(delta: float) -> void:
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Search for player
	_perform_stealth_check(delta)

	# Execute states
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

	# 1. Proximity & Cone Check
	var facing = -global_transform.basis.z.normalized()
	var angle_to_player = rad_to_deg(facing.angle_to(to_player.normalized()))

	var inside_cone = dist < vision_range and angle_to_player < vision_angle_deg
	var player_spotted_now = false

	if inside_cone:
		# 2. Raycast Line-of-Sight Check (occluded by walls)
		# Configure raycast towards player's torso
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
		# Alert rises faster if player has low stealth index
		var stealth_factor = 1.0 - (player.stealth_level / 100.0)
		# Ensure a minimum detection speed even if player is sneaky
		var detection_modifier = max(0.2, stealth_factor)
		
		alert_level = min(100.0, alert_level + alert_rate * detection_modifier * delta)
		alert_level_changed.emit(alert_level)
		
		# Set spotlight color to warning amber/red
		if spotlight:
			spotlight.light_color = Color(1.0, 0.3, 0.0) if alert_level < 80.0 else Color(1.0, 0.0, 0.0)

		if alert_level >= 100.0 and current_state != State.CHASE:
			current_state = State.CHASE
			player_spotted.emit()
			print("🚨 TARGET LOCKED! Commencing attack sequence.")
	else:
		# Player is hidden or out of sight. Alert decays slowly.
		alert_level = max(0.0, alert_level - 18.0 * delta)
		alert_level_changed.emit(alert_level)
		
		if spotlight:
			spotlight.light_color = Color(1.0, 1.0, 0.8) # Reset to soft white

		if alert_level <= 0.0 and current_state == State.CHASE:
			current_state = State.RETURN
			active_target = null
			print("🔍 Lost trace of target. Returning to patrol grid.")

func _process_patrol(delta: float) -> void:
	if patrol_points.size() == 0:
		return
		
	var target_pt = patrol_points[current_patrol_idx]
	var dir_to_pt = target_pt - global_position
	dir_to_pt.y = 0 # keep flat
	
	if dir_to_pt.length() < 0.4:
		# Next patrol node
		current_patrol_idx = (current_patrol_idx + 1) % patrol_points.size()
	else:
		# Accelerate towards point
		var move_dir = dir_to_pt.normalized()
		velocity.x = move_toward(velocity.x, move_dir.x * speed, acceleration * delta)
		velocity.z = move_toward(velocity.z, move_dir.z * speed, acceleration * delta)
		
		# Look towards target point
		var target_look = global_position + move_dir
		look_at(target_look, Vector3.UP)
		rotation.x = 0
		rotation.z = 0

func _process_chase(delta: float) -> void:
	if not active_target or not active_target.is_active:
		current_state = State.RETURN
		return

	var to_player = active_target.global_position - global_position
	to_player.y = 0 # keep movement flat
	var dist = to_player.length()

	# Move toward player at high speed
	var move_dir = to_player.normalized()
	velocity.x = move_toward(velocity.x, move_dir.x * chase_speed, acceleration * delta)
	velocity.z = move_toward(velocity.z, move_dir.z * chase_speed, acceleration * delta)
	
	# Rotate to face player
	var target_look = global_position + move_dir
	look_at(target_look, Vector3.UP)
	rotation.x = 0
	rotation.z = 0

	# Attack player if within firing distance (e.g. 8m)
	if dist < 8.0:
		active_target.take_damage(damage_per_sec * delta)
		# Draw direct red laser beam (debug visualization)
		DebugDraw.line(global_position + Vector3.UP * 0.8, active_target.global_position + Vector3.UP * 0.5, Color.RED)

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
	print("💥 Guard hit! Damage amount: ", amount)
	# Trigger alert state on taking damage
	alert_level = 100.0
	current_state = State.CHASE
	
	# Guard is neutralized/deleted on large damage
	if amount >= 35.0:
		print("💀 Guard neutralized.")
		queue_free()

# Simple static helper class to emulate laser beams since Godot doesn't have immediate lines
class DebugDraw:
	static func line(from: Vector3, to: Vector3, color: Color) -> void:
		# In headless/editor, printing is sufficient. In real scene we can add a transient cylinder or line
		pass
