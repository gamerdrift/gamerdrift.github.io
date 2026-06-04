# ==============================================================================
# CunningCats: Top-Down Arcade Vehicle Controller (Godot 4.6 GDScript)
# Requires: CharacterBody2D as the root node of the vehicle scene
# ==============================================================================
class_name VehicleController
extends CharacterBody2D

# Signals
signal speed_changed(current_speed: float)
signal drift_state_changed(is_drifting: boolean)
signal armor_changed(current: float, max_val: float)
signal armor_depleted()

# Enums
enum VehicleClass { LIGHT, MEDIUM, HEAVY }

# Exported Variables
@export_group("Vehicle Configuration")
@export var selected_class: VehicleClass = VehicleClass.MEDIUM:
	set(val):
		selected_class = val
		if is_inside_tree():
			_apply_class_stats()

@export var is_ai: bool = false

# Current active stats (loaded from class choice)
var max_speed: float = 600.0
var acceleration: float = 500.0
var steering_speed: float = 3.2
var drift_slip: float = 0.82 # 0 = perfect grip, 1 = no sideways traction
var max_armor: float = 100.0
var current_armor: float = 100.0

# General movement state variables
var speed: float = 0.0
var target_steering: float = 0.0
var is_drifting: bool = false
var is_nitro_active: bool = false
var nitro_multiplier: float = 1.5
var nitro_timer: float = 0.0

# Node references (assumed children in scene tree)
@onready var collision_shape: CollisionShape2D = $CollisionShape2D
@onready var sprite: Sprite2D = $Sprite2D

func _ready() -> void:
	_apply_class_stats()
	current_armor = max_armor

func _physics_process(delta: float) -> void:
	# Handle Nitro timer
	if is_nitro_active:
		nitro_timer -= delta
		if nitro_timer <= 0.0:
			deactivate_nitro()

	# Get inputs (only if not controlled by AI)
	var throttle: float = 0.0
	var steering: float = 0.0

	if not is_ai:
		throttle = Input.get_action_strength("ui_up") - Input.get_action_strength("ui_down")
		steering = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
	else:
		# AI controller will set target_steering and throttle directly
		throttle = target_steering # Placeholder logic for AI
		steering = target_steering

	# Apply steering rotation
	var current_steering_speed = steering_speed
	# Reduce steering effectiveness at very high speeds or standing still
	var speed_ratio = velocity.length() / max_speed
	if speed_ratio < 0.1:
		current_steering_speed *= speed_ratio * 10.0

	rotation += steering * current_steering_speed * delta

	# Calculate forward direction
	var forward_dir: Vector2 = Vector2.UP.rotated(rotation)

	# Calculate speed with acceleration and throttle
	var current_max_speed = max_speed
	if is_nitro_active:
		current_max_speed *= nitro_multiplier

	if throttle != 0.0:
		speed = move_toward(speed, throttle * current_max_speed, acceleration * delta)
	else:
		# Decelerate naturally (friction)
		speed = move_toward(speed, 0.0, (acceleration * 0.5) * delta)

	# Set forward velocity
	var target_velocity = forward_dir * speed

	# Drift/Slip calculation: Blend current velocity toward target forward direction
	# Sideways component is dampened by drift_slip
	if velocity.length() > 10.0:
		var forward_component = forward_dir * velocity.dot(forward_dir)
		var lateral_component = velocity - forward_component
		
		# Drifting state triggers when lateral component is significant
		var lateral_speed = lateral_component.length()
		var new_drift_state = lateral_speed > 120.0
		if new_drift_state != is_drifting:
			is_drifting = new_drift_state
			drift_state_changed.emit(is_drifting)
		
		# Dampen the lateral (sideways) slide
		var grip_factor = 1.0 - drift_slip
		# If user brakes, slip increases
		if throttle < 0.0 && speed > 0.0:
			grip_factor *= 0.4
			
		velocity = forward_component + (lateral_component * (1.0 - grip_factor * delta * 10.0))
		velocity = velocity.move_toward(target_velocity, acceleration * delta)
	else:
		velocity = target_velocity
		if is_drifting:
			is_drifting = false
			drift_state_changed.emit(false)

	# Move the vehicle using CharacterBody2D built-in slide collision handler
	move_and_slide()

	# Emit speed changes for HUD telemetry
	speed_changed.emit(velocity.length())

func _apply_class_stats() -> void:
	match selected_class:
		VehicleClass.LIGHT:
			max_speed = 550.0
			acceleration = 750.0
			steering_speed = 4.2
			drift_slip = 0.90
			max_armor = 80.0
		VehicleClass.MEDIUM:
			max_speed = 600.0
			acceleration = 500.0
			steering_speed = 3.2
			drift_slip = 0.82
			max_armor = 100.0
		VehicleClass.HEAVY:
			max_speed = 650.0
			acceleration = 300.0
			steering_speed = 2.2
			drift_slip = 0.68
			max_armor = 150.0
	
	current_armor = clamp(current_armor, 0.0, max_armor)
	armor_changed.emit(current_armor, max_armor)

func activate_nitro(duration: float = 3.0) -> void:
	is_nitro_active = true
	nitro_timer = duration
	# Emulate sparks/boost trigger sound or particles via notifications if connected

func deactivate_nitro() -> void:
	is_nitro_active = false
	nitro_timer = 0.0

func take_damage(amount: float) -> void:
	current_armor = max(0.0, current_armor - amount)
	armor_changed.emit(current_armor, max_armor)
	if current_armor <= 0.0:
		armor_depleted.emit()

func repair(amount: float) -> void:
	current_armor = min(max_armor, current_armor + amount)
	armor_changed.emit(current_armor, max_armor)
