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

var progress_bar: ProgressBar = null
var label_prompt: Label = null
var active_player: PlayerGhost = null
var is_rescuing: bool = false
var rescue_progress: float = 0.0
var rescue_time_required: float = 1.5

func _ready() -> void:
	add_to_group("hostages")
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)

func _process(delta: float) -> void:
	if is_rescued or not is_rescuing or not active_player:
		return
		
	# Check if player is holding Action key (E)
	if Input.is_key_pressed(KEY_E):
		rescue_progress += delta
		if progress_bar:
			progress_bar.value = (rescue_progress / rescue_time_required) * 100.0
			
		if rescue_progress >= rescue_time_required:
			_rescue_sequence()
	else:
		# Reset progress if let go
		rescue_progress = max(0.0, rescue_progress - delta * 2.0)
		if progress_bar:
			progress_bar.value = (rescue_progress / rescue_time_required) * 100.0

func _on_body_entered(body: Node) -> void:
	if is_rescued:
		return
		
	if body is PlayerGhost or body.is_in_group("player"):
		active_player = body
		is_rescuing = true
		rescue_progress = 0.0
		_create_rescue_ui()

func _on_body_exited(body: Node) -> void:
	if body == active_player:
		is_rescuing = false
		active_player = null
		_destroy_rescue_ui()

func _create_rescue_ui() -> void:
	# Access player's HUD CanvasLayer dynamically
	var canvas_layer = active_player.get_node_or_null("HitMarkerUI")
	if not canvas_layer:
		canvas_layer = CanvasLayer.new()
		canvas_layer.name = "HitMarkerUI"
		active_player.add_child(canvas_layer)
		
	label_prompt = Label.new()
	label_prompt.name = "RescuePrompt"
	label_prompt.text = "HOLD [E] TO DEPLOY COGNITIVE LINK"
	label_prompt.add_theme_font_size_override("font_size", 12)
	label_prompt.add_theme_color_override("font_color", Color(1.0, 1.0, 1.0, 0.9))
	label_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label_prompt.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	label_prompt.position = Vector2(0, -180)
	canvas_layer.add_child(label_prompt)
	
	progress_bar = ProgressBar.new()
	progress_bar.name = "RescueProgress"
	progress_bar.custom_minimum_size = Vector2(200, 12)
	progress_bar.show_percentage = false
	progress_bar.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	progress_bar.position = Vector2(-100, -150)
	canvas_layer.add_child(progress_bar)

func _destroy_rescue_ui() -> void:
	if is_instance_valid(label_prompt):
		label_prompt.queue_free()
	if is_instance_valid(progress_bar):
		progress_bar.queue_free()

func _rescue_sequence() -> void:
	is_rescued = true
	is_rescuing = false
	_destroy_rescue_ui()
	
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

