# ==============================================================================
# RogueGhost: 3D Bullet Projectile Handler (Godot 4.6 GDScript)
# Requires: Area3D as the root node of the bullet scene
# ==============================================================================
class_name BulletProjectile
extends Area3D

@export var speed: float = 35.0
@export var damage: float = 40.0
@export var lifetime: float = 2.0

func _ready() -> void:
	# Autodelete round after lifetime expires
	var timer = get_tree().create_timer(lifetime)
	timer.timeout.connect(func():
		queue_free()
	)
	
	# Connect to collision body enters
	body_entered.connect(_on_body_entered)

func _physics_process(delta: float) -> void:
	# Translate bullet along its heading vector
	global_translate(-global_transform.basis.z * speed * delta)

func _on_body_entered(body: Node) -> void:
	# Avoid hitting self (handled via group exclusion or name checks)
	if body is PlayerGhost or body.is_in_group("player"):
		return
		
	# Deal damage to enemy targets
	if body.has_method("take_damage"):
		body.take_damage(damage)
		
	# Neutralize projectile on impact
	queue_free()
