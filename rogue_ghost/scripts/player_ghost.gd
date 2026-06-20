# ==============================================================================
# RogueGhost: 3D Tactical Player Stealth Controller (Godot 4.6 GDScript)
# Requires: CharacterBody3D as the root node of the Player scene
# ==============================================================================
class_name PlayerGhost
extends CharacterBody3D

# Signals
signal health_changed(current: float, max_val: float)
signal stealth_changed(current: float, max_val: float)
signal hostages_changed(rescued: int, total: int)
signal fired_weapon()

# Exported Configuration
@export var speed: float = 5.0
@export var crouch_speed: float = 2.2
@export var prone_speed: float = 1.0
@export var slide_speed: float = 10.0
@export var acceleration: float = 12.0
@export var gravity: float = 9.8
@export var jump_force: float = 4.5
@export var stamina_max: float = 100.0

# Player stats
var max_health: float = 100.0
var health: float = 100.0
var max_stealth: float = 100.0
var stealth_level: float = 100.0 # 100 = invisible/hidden in shadow, 0 = fully revealed
var stamina: float = 100.0

# Posture & Actions
var active_weapon: String = "Silenced DMR Rifle"
var is_crouching: bool = false
var is_prone: bool = false
var is_sliding: bool = false
var is_active: bool = true
var slide_timer: float = 0.0
var slide_direction: Vector3 = Vector3.ZERO

# Leaning state
var lean_angle: float = 0.0
var lean_offset: float = 0.0

# Zoom / Scope settings
var current_zoom_state: int = 0 # 0=normal, 1=ADS, 2=DMR
var is_holding_breath: bool = false
var is_thermal_mode: bool = false
var breath_stamina_decay: float = 25.0
var footstep_timer: float = 0.0

# Camera variables
var camera_sensitivity: float = 0.003
var mouse_captured: bool = false
var recoil_pitch: float = 0.0
var recoil_yaw: float = 0.0

# Node references (setup onready)
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera: Camera3D = $CameraPivot/Camera3D
@onready var muzzle: Marker3D = $Muzzle

func _ready() -> void:
	# Add to groups for global access
	add_to_group("player")
	
	# Initial UI updates
	health_changed.emit(health, max_health)
	stealth_changed.emit(stealth_level, max_stealth)

func _unhandled_input(event: InputEvent) -> void:
	if not is_active:
		return
		
	# Toggle mouse lock for camera rotation
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT:
		if event.pressed:
			mouse_captured = !mouse_captured
			if mouse_captured:
				Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
			else:
				Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
				
	# Middle click toggles weapon scope zoom level
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			current_zoom_state = (current_zoom_state + 1) % 3
			_apply_zoom()

	# Key-based triggers
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_Z:
			# Toggle prone posture
			_set_prone(!is_prone)
		elif event.keycode == KEY_T:
			is_thermal_mode = !is_thermal_mode
			SoundManager.play("clue")
			print("🕶️ THERMAL ACTIVE: ", is_thermal_mode)

	# Mouse look rotation
	if event is InputEventMouseMotion and mouse_captured:
		# Reduce sensitivity when scoped in
		var sens = camera_sensitivity
		if current_zoom_state == 1: sens = camera_sensitivity * 0.4
		elif current_zoom_state == 2: sens = camera_sensitivity * 0.15
		
		# Rotate parent Y
		rotate_y(-event.relative.x * sens)
		# Rotate camera pivot X (clamp vertical looking)
		camera_pivot.rotate_x(-event.relative.y * sens)
		camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, -deg_to_rad(65.0), deg_to_rad(65.0))

func _physics_process(delta: float) -> void:
	if not is_active:
		return
		
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Check slide/crouch transitions
	var is_sprinting = Input.is_key_pressed(KEY_SHIFT) and velocity.length() > 0.5 and not is_crouching and not is_prone
	
	if is_sliding:
		slide_timer -= delta
		if slide_timer <= 0.0:
			is_sliding = false
			_set_crouch(true)
	elif is_sprinting and Input.is_key_pressed(KEY_CTRL) and not is_sliding:
		is_sliding = true
		slide_timer = 0.8
		slide_direction = -transform.basis.z.normalized()
		_set_crouch(true)
		stealth_level = clamp(stealth_level - 15.0, 0.0, max_stealth)

	# Check crouch toggle (fallback if not sliding)
	if not is_sliding:
		if Input.is_key_pressed(KEY_CTRL):
			if not is_crouching:
				_set_crouch(true)
				_set_prone(false)
		else:
			if is_crouching:
				_set_crouch(false)

	# Handle jump (cannot jump when prone/sliding)
	if Input.is_key_pressed(KEY_SPACE) and is_on_floor() and not is_prone and not is_sliding:
		velocity.y = jump_force
		stealth_level = clamp(stealth_level - 10.0, 0.0, max_stealth)
		stealth_changed.emit(stealth_level, max_stealth)

	# Camera leaning Q/E
	var target_lean_angle = 0.0
	var target_lean_offset = 0.0
	if Input.is_key_pressed(KEY_Q):
		target_lean_angle = deg_to_rad(6.0)
		target_lean_offset = -0.4
	elif Input.is_key_pressed(KEY_E):
		target_lean_angle = -deg_to_rad(6.0)
		target_lean_offset = 0.4
		
	lean_angle = move_toward(lean_angle, target_lean_angle, 10.0 * delta)
	lean_offset = move_toward(lean_offset, target_lean_offset, 6.0 * delta)
	
	if camera:
		camera.rotation.z = lean_angle
		camera.position.x = lean_offset

	# Hold breath sway adjustments
	is_holding_breath = Input.is_key_pressed(KEY_SHIFT) and current_zoom_state > 0 and stamina > 5.0
	if is_holding_breath:
		stamina = max(0.0, stamina - breath_stamina_decay * delta)
	else:
		stamina = min(stamina_max, stamina + 15.0 * delta)

	# Calculate movement vectors based on camera direction
	var input_dir := Vector3.ZERO
	if not is_sliding:
		if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
			input_dir -= transform.basis.z
		if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
			input_dir += transform.basis.z
		if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
			input_dir -= transform.basis.x
		if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
			input_dir += transform.basis.x
		input_dir = input_dir.normalized()
	else:
		input_dir = slide_direction

	# Determine speed multiplier
	var current_speed = speed
	if is_sliding:
		current_speed = slide_speed
	elif is_prone:
		current_speed = prone_speed
	elif is_crouching:
		current_speed = crouch_speed
	elif is_sprinting:
		current_speed = speed * 1.5

	# Move character
	var target_velocity_xz = input_dir * current_speed
	velocity.x = move_toward(velocity.x, target_velocity_xz.x, acceleration * delta)
	velocity.z = move_toward(velocity.z, target_velocity_xz.z, acceleration * delta)

	move_and_slide()

	# Trigger Footstep SFX
	var foot_threshold = 2.2
	if is_prone: foot_threshold = 3.6
	elif is_crouching: foot_threshold = 2.8
	elif is_sprinting: foot_threshold = 1.6
	
	var horiz_vel = Vector3(velocity.x, 0.0, velocity.z)
	if is_on_floor() and horiz_vel.length() > 0.1 and not is_sliding:
		footstep_timer += horiz_vel.length() * delta
		if footstep_timer >= foot_threshold:
			footstep_timer = 0.0
			var is_desert = false
			var weather_nodes = get_tree().get_nodes_in_group("weather")
			if weather_nodes.size() > 0:
				var ws = weather_nodes[0]
				if is_instance_valid(ws) and ws.get("environment_type") == 1:
					is_desert = true
			if is_desert:
				SoundManager.play("footstep_desert")
			else:
				SoundManager.play("footstep_snow")

	# Manage dynamic stealth recovery
	if velocity.length() < 0.2:
		# Staying still or crawling restores stealth
		var recovery = 35.0 if is_prone else (25.0 if is_crouching else 10.0)
		stealth_level = min(max_stealth, stealth_level + recovery * delta)
	else:
		# Moving drains stealth based on speed & posture
		var drain = 1.0 if is_prone else (3.0 if is_crouching else 8.0)
		if is_sprinting: drain = 15.0
		stealth_level = max(0.0, stealth_level - drain * delta)
		
	stealth_changed.emit(stealth_level, max_stealth)

	# Apply recoil decay
	if recoil_pitch > 0.0 or recoil_yaw != 0.0:
		var rec_p = move_toward(recoil_pitch, 0.0, 4.0 * delta)
		var rec_y = move_toward(recoil_yaw, 0.0, 4.0 * delta)
		var diff_p = rec_p - recoil_pitch
		var diff_y = rec_y - recoil_yaw
		recoil_pitch = rec_p
		recoil_yaw = rec_y
		
		if camera_pivot:
			camera_pivot.rotate_x(diff_p)
			camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, -deg_to_rad(65.0), deg_to_rad(65.0))
		rotate_y(diff_y)

	# Shooting handler (Left Mouse Button)
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		_shoot_weapon()

func _set_crouch(state: bool) -> void:
	is_crouching = state
	is_prone = false
	if collision_shape:
		var cap = collision_shape.shape as CapsuleShape3D
		if cap:
			cap.height = 1.0 if state else 2.0
	
	if camera_pivot:
		camera_pivot.position.y = 0.4 if state else 0.8

func _set_prone(state: bool) -> void:
	is_prone = state
	is_crouching = false
	if collision_shape:
		var cap = collision_shape.shape as CapsuleShape3D
		if cap:
			cap.height = 0.4 if state else 2.0
			
	if camera_pivot:
		camera_pivot.position.y = 0.2 if state else 0.8

var fov_default: float = 75.0
var fov_ads: float = 30.0
var fov_dmr: float = 12.0

func _apply_zoom() -> void:
	if not camera:
		return
	match current_zoom_state:
		0:
			camera.fov = fov_default
		1:
			camera.fov = fov_ads
		2:
			camera.fov = fov_dmr

var fire_cooldown: float = 0.0
func _shoot_weapon() -> void:
	var time = Time.get_ticks_msec() / 1000.0
	if time < fire_cooldown:
		return
	
	fire_cooldown = time + 0.35 # Cooldown period of 350ms
	
	# Play shot sound
	SoundManager.play("shot_silenced")
	
	# Add weapon kick recoil
	recoil_pitch += randf_range(0.05, 0.1)
	recoil_yaw += randf_range(-0.03, 0.03)
	
	# Instantly reduce stealth due to firing blast noise
	stealth_level = clamp(stealth_level - 35.0, 0.0, max_stealth)
	stealth_changed.emit(stealth_level, max_stealth)
	fired_weapon.emit()
	
	print("💥 DISCHARGING ", active_weapon, "!")
	
	# Instantiate bullet projectile programmatically (fallback if scenes aren't loaded)
	var bullet_class = load("res://scenes/bullet_projectile.tscn")
	if bullet_class:
		var b = bullet_class.instantiate() as Node3D
		get_tree().root.add_child(b)
		b.global_position = muzzle.global_position
		# Point bullet along the camera aim direction
		var aim_dir = -camera.global_transform.basis.z
		b.global_transform.basis = Basis.looking_at(aim_dir, Vector3.UP)
	else:
		# Cast a raycast tracer if projectile isn't created
		var space_state = get_world_3d().direct_space_state
		var origin = camera.global_position
		var target = origin + (-camera.global_transform.basis.z * 100.0)
		var query = PhysicsRayQueryParameters3D.create(origin, target)
		query.exclude = [get_rid()] # don't hit player
		
		var result = space_state.intersect_ray(query)
		if result:
			var hit_obj = result.collider
			if hit_obj.has_method("take_damage"):
				hit_obj.take_damage(40.0)
				print("🎯 Projectile hit target: ", hit_obj.name)

func take_damage(amount: float) -> void:
	if health <= 0.0:
		return
		
	# Play damage sound
	SoundManager.play("damage")
	
	# Reduce health
	health = max(0.0, health - amount)
	health_changed.emit(health, max_health)
	print("🚨 Player damaged! Current integrity: ", health, "%")
	
	if health <= 0.0:
		is_active = false
		print("💀 Player integrity depleted. Comm-line shut down.")
