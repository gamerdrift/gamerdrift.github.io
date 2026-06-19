# ==============================================================================
# RogueGhost: Friendly Ranger AI Support Controller (Godot 4.6 GDScript)
# ==============================================================================
class_name RangerAI
extends CharacterBody3D

@export var speed: float = 3.0
@export var defend_position: Vector3

var health: float = 100.0
var max_health: float = 100.0
var is_active: bool = true
var shoot_cooldown: float = 0.0

# Node references
@onready var raycast: RayCast3D = $RayCast3D

func _ready() -> void:
	add_to_group("rangers")
	defend_position = global_position
	
	# Connect to sniper firing events to return fire
	var bosses = get_tree().get_nodes_in_group("bosses")
	for b in bosses:
		if b.has_signal("sniper_fired"):
			b.sniper_fired.connect(_on_sniper_fired)

func _physics_process(delta: float) -> void:
	if not is_active:
		return
		
	if shoot_cooldown > 0.0:
		shoot_cooldown -= delta
		
	# Stays close to defend position and looks alert
	_process_defend(delta)
	
	move_and_slide()

func _process_defend(delta: float) -> void:
	var to_defend = defend_position - global_position
	to_defend.y = 0
	if to_defend.length() > 0.5:
		var dir = to_defend.normalized()
		velocity.x = dir.x * speed
		velocity.z = dir.z * speed
		look_at(global_position + dir, Vector3.UP)
	else:
		velocity.x = 0
		velocity.z = 0

func _on_sniper_fired() -> void:
	if not is_active or shoot_cooldown > 0.0:
		return
		
	# Call out sniper position
	var callouts = [
		"🎙️ Ranger: 'Sniper fire from the northern ridge line!'",
		"🎙️ Ranger: 'Returning covering fire! Keep your head down, Ghost!'",
		"🎙️ Ranger: 'We need immediate extraction coordinates!'"
	]
	print(callouts[randi() % callouts.size()])
	
	# Open fire towards approximate direction of sniper
	shoot_cooldown = 2.0 + randf_range(0.0, 1.5)
	_fire_suppressive_rounds()

func _fire_suppressive_rounds() -> void:
	var bosses = get_tree().get_nodes_in_group("bosses")
	if bosses.size() > 0:
		var boss = bosses[0] as Node3D
		# Suppress towards boss direction
		var dir = (boss.global_position - global_position).normalized()
		print("💥 Ranger discharging service rifle towards sniper coordinates: ", boss.global_position)
		
		# Bullet tracer simulation (transient lines or debug draw)
		if raycast:
			raycast.global_position = global_position + Vector3.UP * 1.0
			raycast.target_position = raycast.to_local(boss.global_position + Vector3.UP * 1.0)
			raycast.force_raycast_update()
			if raycast.is_colliding() and raycast.get_collider() == boss:
				boss.take_damage(10.0) # Rangers deal small damage to help player

func take_damage(amount: float) -> void:
	if not is_active:
		return
	health = max(0.0, health - amount)
	print("🚨 Ranger damaged! Health: ", health)
	if health <= 0.0:
		is_active = false
		print("💀 Ranger KIA!")
		# Notify manager of ranger casualty
		var managers = get_tree().get_nodes_in_group("managers")
		if managers.size() > 0:
			var m = managers[0] as MissionManager
			if m.has_method("record_ranger_casualty"):
				m.record_ranger_casualty()
		queue_free()
