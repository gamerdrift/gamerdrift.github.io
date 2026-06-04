# ==============================================================================
# CunningCats: AI Driver Controller (Godot 4.6 GDScript)
# Requires: Node attached as a child to a VehicleController parent
# ==============================================================================
class_name AIController
extends Node

# AI Configuration
@export var path_nodes: Array[Node2D] = []
@export var mode: String = "racing" # "racing" or "derby"
@export var target_check_distance: float = 80.0

# Node References
@onready var vehicle: VehicleController = get_parent() as VehicleController
@onready var weapon_system: WeaponSystem = get_parent().get_node_or_null("WeaponSystem") as WeaponSystem

# State variables
var current_path_index: int = 0
var target_vehicle: VehicleController = null
var detection_timer: float = 0.0

func _ready() -> void:
	if vehicle:
		vehicle.is_ai = true
	else:
		push_error("AIController: Parent must be a VehicleController node!")

func _physics_process(delta: float) -> void:
	if not vehicle or vehicle.current_armor <= 0.0:
		return

	# Handle target scanning for derby mode or combat
	detection_timer += delta
	if detection_timer > 0.5:
		detection_timer = 0.0
		_scan_for_targets()

	# Steer and throttle
	_process_driving(delta)
	
	# Execute weapon use logic
	_process_weapons()

func _process_driving(_delta: float) -> void:
	var target_pos: Vector2 = Vector2.ZERO
	var has_target: bool = false

	if mode == "racing" and path_nodes.size() > 0:
		var target_node = path_nodes[current_path_index]
		if is_instance_valid(target_node):
			target_pos = target_node.global_position
			has_target = true
			
			# Check distance to current checkpoint
			if vehicle.global_position.distance_to(target_pos) < target_check_distance:
				current_path_index = (current_path_index + 1) % path_nodes.size()
	elif mode == "derby" and is_instance_valid(target_vehicle):
		target_pos = target_vehicle.global_position
		has_target = true

	if not has_target:
		# Idle / stop driving
		vehicle.target_steering = 0.0
		# Emulate no throttle
		return

	# Calculate vector to target
	var to_target = (target_pos - vehicle.global_position).normalized()
	var forward_dir = Vector2.UP.rotated(vehicle.rotation)

	# Angle difference to steer towards target
	# dot product of lateral direction gives steer direction
	var lateral_dir = Vector2.RIGHT.rotated(vehicle.rotation)
	var steer_dot = to_target.dot(lateral_dir)
	var forward_dot = to_target.dot(forward_dir)

	# Adjust vehicle inputs
	# Steering target ranges from -1.0 (left) to 1.0 (right)
	vehicle.target_steering = clamp(steer_dot * 2.0, -1.0, 1.0)

	# Driving forwards or reversing
	if forward_dot > -0.2:
		# Target is in front, drive forward
		# Slow down slightly if taking a very sharp turn
		if abs(steer_dot) > 0.7:
			vehicle.speed = move_toward(vehicle.speed, vehicle.max_speed * 0.5, vehicle.acceleration * _delta)
		else:
			vehicle.speed = move_toward(vehicle.speed, vehicle.max_speed, vehicle.acceleration * _delta)
	else:
		# Target is behind, brake / reverse
		vehicle.speed = move_toward(vehicle.speed, -vehicle.max_speed * 0.4, vehicle.acceleration * _delta)

func _scan_for_targets() -> void:
	# Find the closest active vehicle controller in the scene
	var vehicles = get_tree().get_nodes_in_group("vehicles")
	var closest_vehicle: VehicleController = null
	var min_distance: float = 999999.0

	for v in vehicles:
		if v == vehicle or v.current_armor <= 0.0:
			continue
		
		var dist = vehicle.global_position.distance_to(v.global_position)
		if dist < min_distance:
			min_distance = dist
			closest_vehicle = v as VehicleController

	target_vehicle = closest_vehicle
	
	# If in derby mode, target_vehicle is our main point of interest
	if mode == "derby" and target_vehicle:
		pass

func _process_weapons() -> void:
	if not weapon_system or weapon_system.current_pickup == WeaponSystem.PickupType.NONE:
		return

	var pickup = weapon_system.current_pickup
	var should_use: bool = false

	match pickup:
		WeaponSystem.PickupType.NITRO_BOOST:
			# Use immediately to speed up
			should_use = true
		WeaponSystem.PickupType.REPAIR_KIT:
			# Use if armor is low
			if vehicle.current_armor < (vehicle.max_armor * 0.6):
				should_use = true
		WeaponSystem.PickupType.SHIELD_GENERATOR:
			# Use immediately
			should_use = true
		WeaponSystem.PickupType.EMP_PULSE:
			# Use if target is near
			if is_instance_valid(target_vehicle) and vehicle.global_position.distance_to(target_vehicle.global_position) < 220.0:
				should_use = true
		WeaponSystem.PickupType.ROCKET_SHOT:
			# Use if target is in front
			if is_instance_valid(target_vehicle):
				var forward = Vector2.UP.rotated(vehicle.rotation)
				var to_target = (target_vehicle.global_position - vehicle.global_position).normalized()
				if forward.dot(to_target) > 0.8: # Target in a narrow cone in front
					should_use = true
		WeaponSystem.PickupType.MINE_DROP:
			# Use if target is behind
			if is_instance_valid(target_vehicle):
				var forward = Vector2.UP.rotated(vehicle.rotation)
				var to_target = (target_vehicle.global_position - vehicle.global_position).normalized()
				if forward.dot(to_target) < -0.7: # Target is behind
					should_use = true

	if should_use:
		weapon_system.use_pickup()
