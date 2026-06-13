# ==============================================================================
# RogueGhost: 3D Hostage Proximity Checkpoint (Godot 4.6 GDScript)
# Requires: Area3D as the root node of the Hostage scene
# ==============================================================================
class_name HostageNode
extends Area3D

# Signals
signal rescued_state_changed(is_rescued: bool)

# Exported properties
@export var hostage_name: String = "Hostage Scientist"
var is_rescued: bool = false

# Visual nodes
@onready var mesh: MeshInstance3D = $MeshInstance3D
@onready var light: OmniLight3D = $OmniLight3D

func _ready() -> void:
	add_to_group("hostages")
	
	# Connect collision overlap event
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if is_rescued:
		return
		
	# Check if overlapping body is the player
	if body is PlayerGhost or body.is_in_group("player"):
		_rescue_sequence()

func _rescue_sequence() -> void:
	is_rescued = true
	rescued_state_changed.emit(true)
	print("🤝 SECURED COGNITIVE LINK WITH: ", hostage_name.to_upper())
	
	# Notify mission manager directly
	var managers = get_tree().get_nodes_in_group("managers")
	for m in managers:
		if m.has_method("record_hostage_rescue"):
			m.record_hostage_rescue(self)

	# Change color of mesh to green to indicate rescue
	if mesh:
		var mat = StandardMaterial3D.new()
		mat.albedo_color = Color(0.2, 1.0, 0.2)
		mat.emission_enabled = true
		mat.emission = Color(0.2, 1.0, 0.2)
		mesh.set_surface_override_material(0, mat)
		
	# Switch light to green
	if light:
		light.light_color = Color(0.2, 1.0, 0.2)
		
	# Clean up after a short delay
	var timer = get_tree().create_timer(1.2)
	timer.timeout.connect(func():
		queue_free()
	)
