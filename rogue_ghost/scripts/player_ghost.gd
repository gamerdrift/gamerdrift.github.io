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
@export var acceleration: float = 12.0
@export var gravity: float = 9.8
@export var jump_force: float = 4.5

# Player stats
var max_health: float = 100.0
var health: float = 100.0
var max_stealth: float = 100.0
var stealth_level: float = 100.0 # 100 = invisible/hidden in shadow, 0 = fully revealed

# Faction equipment configs
var active_weapon: String = "Silenced Carbine"
var is_crouching: bool = false
var is_active: bool = true

# Camera variables
var camera_sensitivity: float = 0.003
var mouse_captured: bool = false

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
				
	# Mouse look rotation
	if event is InputEventMouseMotion and mouse_captured:
		# Rotate parent Y
		rotate_y(-event.relative.x * camera_sensitivity)
		# Rotate camera pivot X (clamp vertical looking)
		camera_pivot.rotate_x(-event.relative.y * camera_sensitivity)
		camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, -deg_to_rad(65.0), deg_to_rad(65.0))

func _physics_process(delta: float) -> void:
	if not is_active:
		return
		
	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Check crouch toggle
	if Input.is_key_pressed(KEY_CTRL):
		if not is_crouching:
			_set_crouch(true)
	else:
		if is_crouching:
			_set_crouch(false)

	# Handle jump
	if Input.is_key_pressed(KEY_SPACE) and is_on_floor():
		velocity.y = jump_force
		stealth_level = clamp(stealth_level - 10.0, 0.0, max_stealth)
		stealth_changed.emit(stealth_level, max_stealth)

	# Calculate movement vectors based on camera direction
	var input_dir := Vector3.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		input_dir -= transform.basis.z
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		input_dir += transform.basis.z
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		input_dir -= transform.basis.x
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		input_dir += transform.basis.x

	input_dir = input_dir.normalized()
	
	# Determine speed multiplier
	var current_speed = speed
	if is_crouching:
		current_speed = crouch_speed

	# Move character
	var target_velocity_xz = input_dir * current_speed
	velocity.x = move_toward(velocity.x, target_velocity_xz.x, acceleration * delta)
	velocity.z = move_toward(velocity.z, target_velocity_xz.z, acceleration * delta)

	move_and_slide()

	# Manage dynamic stealth recovery
	if velocity.length() < 0.2:
		# Staying still restores stealth rapidly, especially if crouching
		var recovery = 25.0 if is_crouching else 10.0
		stealth_level = min(max_stealth, stealth_level + recovery * delta)
	else:
		# Moving drains stealth slightly based on speed
		var drain = 3.0 if is_crouching else 8.0
		stealth_level = max(0.0, stealth_level - drain * delta)
		
	stealth_changed.emit(stealth_level, max_stealth)

	# Shooting handler (Left Mouse Button)
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		_shoot_weapon()

func _set_crouch(state: bool) -> void:
	is_crouching = state
	if collision_shape:
		# Adjust height of capsule collision shape
		var cap = collision_shape.shape as CapsuleShape3D
		if cap:
			cap.height = 1.0 if state else 2.0
	
	# Offset camera pivot slightly down for visual crouch
	if camera_pivot:
		camera_pivot.position.y = 0.4 if state else 0.8

var fire_cooldown: float = 0.0
func _shoot_weapon() -> void:
	var time = Time.get_ticks_msec() / 1000.0
	if time < fire_cooldown:
		return
	
	fire_cooldown = time + 0.35 # Cooldown period of 350ms
	
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
		
	# Reduce health
	health = max(0.0, health - amount)
	health_changed.emit(health, max_health)
	print("🚨 Player damaged! Current integrity: ", health, "%")
	
	if health <= 0.0:
		is_active = false
		print("💀 Player integrity depleted. Comm-line shut down.")
