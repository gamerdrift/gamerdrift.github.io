# ==============================================================================
# CunningCats: Weapon & Pickup Inventory System (Godot 4.6 GDScript)
# Requires: Node2D attached as a child to the Vehicle character body
# ==============================================================================
class_name WeaponSystem
extends Node2D

# Signals
signal pickup_collected(type: PickupType)
signal pickup_used(type: PickupType)
signal shield_state_changed(active: bool)

# Enums
enum PickupType {
	NONE,
	NITRO_BOOST,
	EMP_PULSE,
	ROCKET_SHOT,
	MINE_DROP,
	REPAIR_KIT,
	SHIELD_GENERATOR
}

# Member Variables
var current_pickup: PickupType = PickupType.NONE
var is_shield_active: bool = false
var shield_absorb_amount: float = 50.0 # shield points

# Node reference
@onready var vehicle: VehicleController = get_parent() as VehicleController

func _ready() -> void:
	if not vehicle:
		push_error("WeaponSystem: Parent must be a VehicleController node!")

func collect_pickup(type: PickupType) -> void:
	# Keep existing pickup if we already have one
	if current_pickup != PickupType.NONE:
		return
		
	current_pickup = type
	pickup_collected.emit(type)
	print("🔋 Collected pickup: ", PickupType.keys()[type])

func use_pickup() -> void:
	if current_pickup == PickupType.NONE:
		return

	var used_type = current_pickup
	current_pickup = PickupType.NONE
	pickup_used.emit(used_type)

	match used_type:
		PickupType.NITRO_BOOST:
			_activate_nitro()
		PickupType.EMP_PULSE:
			_trigger_emp()
		PickupType.ROCKET_SHOT:
			_fire_rocket()
		PickupType.MINE_DROP:
			_drop_mine()
		PickupType.REPAIR_KIT:
			_apply_repair()
		PickupType.SHIELD_GENERATOR:
			_activate_shield()

func _activate_nitro() -> void:
	if vehicle:
		vehicle.activate_nitro(3.0)
		print("🔥 Nitro Boost Activated!")

func _trigger_emp() -> void:
	print("⚡ EMP Pulse Dispatched!")
	# Query overlapping physics bodies in a radius (e.g. 200px)
	var space_state = get_world_2d().direct_space_state
	var query = PhysicsShapeQueryParameters2D.new()
	
	# Create a circle shape for regional query
	var circle = CircleShape2D.new()
	circle.radius = 250.0
	query.shape = circle
	query.transform = global_transform
	query.collision_mask = 1 # Match vehicle layer
	
	var results = space_state.intersect_shape(query)
	for res in results:
		var target = res["collider"]
		if target != vehicle && target.has_method("take_damage"):
			target.take_damage(20.0) # EMP deals light damage
			# If the target has a WeaponSystem child, we disable it briefly
			var target_weapon = target.get_node_or_null("WeaponSystem") as WeaponSystem
			if target_weapon:
				target_weapon.apply_emp_effect(2.5)

func _fire_rocket() -> void:
	print("🚀 Rocket Fired!")
	# Spawn a projectile relative to vehicle's heading
	# In actual Godot build, we load and instantiate a Rocket scene:
	# var rocket_scene = load("res://scenes/rocket.tscn")
	# var rocket = rocket_scene.instantiate()
	# get_tree().root.add_child(rocket)
	# rocket.global_position = global_position + Vector2.UP.rotated(vehicle.rotation) * 30
	# rocket.rotation = vehicle.rotation

func _drop_mine() -> void:
	print("💣 Mine Dropped!")
	# Deploys behind the car
	# var mine_scene = load("res://scenes/mine.tscn")
	# var mine = mine_scene.instantiate()
	# get_tree().root.add_child(mine)
	# mine.global_position = global_position - Vector2.UP.rotated(vehicle.rotation) * 40

func _apply_repair() -> void:
	if vehicle:
		vehicle.repair(40.0)
		print("🔧 Repair Kit Deployed (Armor Restored)!")

func _activate_shield() -> void:
	is_shield_active = true
	shield_state_changed.emit(true)
	print("🛡️ Shield Generator Active!")

# Apply EMP effect (called from another vehicle's EMP Pulse)
func apply_emp_effect(duration: float) -> void:
	print("⚡ WARNING: System disrupted by EMP!")
	# Set vehicle speed to 0 briefly and disrupt steering
	if vehicle:
		vehicle.speed *= 0.3
		# Temporarily disable accelerator
		var timer = get_tree().create_timer(duration)
		timer.timeout.connect(func():
			print("⚡ Systems restored.")
		)

# Intercept damage to check for active shields
func absorb_damage(amount: float) -> float:
	if is_shield_active:
		print("🛡️ Damage absorbed by Shield!")
		is_shield_active = false
		shield_state_changed.emit(false)
		return 0.0 # fully absorbed
	return amount
