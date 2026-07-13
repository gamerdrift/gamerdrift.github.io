extends Node3D

signal cinematic_finished()

@export var duration: float = 4.0
@export var path_points: Array[Vector3] = [Vector3(0, 3, 12), Vector3(0, 2.4, 6), Vector3(0, 1.2, 1.0)]
@export var intro_text: String = "OPERATION: ROGUE GHOST - DEPLOY"
@export var subtitle_text: String = "Objective: Extract Intel & Rescue Hostages"
@export var music_path: String = "res://audio/intro_theme.ogg"

@onready var cam: Camera3D = $CineCamera
var ui_layer: CanvasLayer = null
var title_label: Label = null
var audio_player: AudioStreamPlayer = null

func _ready() -> void:
	# Start cinematic camera motion
	_play_camera_path()

func _play_camera_path() -> void:
	if not cam:
		emit_signal("cinematic_finished")
		queue_free()
		return

	# Prepare tween-driven path animation with a more cinematic approach.
	var tween = create_tween()
	var total = path_points.size()
	if total == 0:
		tween.tween_callback(Callable(self, "_on_cinematic_done"))
		return

	var seg = duration / max(1, total - 1)
	for i in range(total):
		var target_origin = path_points[i]
		var target_transform = Transform3D(Basis.from_euler(Vector3(-0.08 + (i * 0.01), 0.0, 0.0)), target_origin)
		if i == 0:
			cam.global_transform = target_transform
			cam.fov = 70.0
		else:
			tween.tween_property(cam, "global_transform", target_transform, seg).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
			tween.tween_property(cam, "fov", 74.0 + (i * 0.5), seg).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

	tween.finished.connect(_on_cinematic_done)
	# Setup UI and audio, then start transitions
	_setup_ui()
	_play_music()

func _on_cinematic_done() -> void:
	# Small hold then finish
	get_tree().create_timer(0.55).timeout.connect(func():
		_fade_out_ui()
		_stop_music()
		emit_signal("cinematic_finished")
		if is_instance_valid(self):
			queue_free()
	)

func _setup_ui() -> void:
	# Create a CanvasLayer for UI text
	ui_layer = CanvasLayer.new()
	ui_layer.name = "CineUI"
	add_child(ui_layer)

	var overlay = ColorRect.new()
	overlay.name = "CineOverlay"
	overlay.color = Color(0.01, 0.02, 0.03, 0.35)
	overlay.set_anchors_preset(Control.PRESET_FULLRECT)
	ui_layer.add_child(overlay)

	var panel = PanelContainer.new()
	panel.name = "CinePanel"
	panel.custom_minimum_size = Vector2(760, 220)
	panel.modulate = Color(1, 1, 1, 0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	panel.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	ui_layer.add_child(panel)
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.anchor_top = 0.5
	panel.anchor_bottom = 0.5
	panel.offset_left = -380
	panel.offset_top = -110
	panel.offset_right = 380
	panel.offset_bottom = 110

	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.02, 0.03, 0.04, 0.80)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.border_color = Color(0.0, 0.8, 1.0, 0.55)
	style.corner_radius_top_left = 12
	style.corner_radius_top_right = 12
	style.corner_radius_bottom_right = 12
	style.corner_radius_bottom_left = 12
	panel.add_theme_stylebox_override("panel", style)

	var content = VBoxContainer.new()
	content.alignment = BoxContainer.ALIGNMENT_CENTER
	panel.add_child(content)

	# Title label
	title_label = Label.new()
	title_label.name = "CineTitle"
	title_label.text = intro_text + "\n" + subtitle_text
	title_label.modulate = Color(1, 1, 1, 0)
	title_label.add_theme_font_size_override("font_size", 26)
	title_label.horizontal_alignment = Label.HORIZONTAL_ALIGNMENT_CENTER
	title_label.vertical_alignment = Label.VERTICAL_ALIGNMENT_CENTER
	title_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(title_label)

	var brief_list = VBoxContainer.new()
	brief_list.add_theme_constant_override("separation", 6)
	brief_list.alignment = BoxContainer.ALIGNMENT_CENTER
	content.add_child(brief_list)

	var objective_a = Label.new()
	objective_a.text = "• Infiltrate the AO undetected"
	objective_a.add_theme_font_size_override("font_size", 14)
	objective_a.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0, 0.95))
	brief_list.add_child(objective_a)

	var objective_b = Label.new()
	objective_b.text = "• Secure all hostages and recover the intel"
	objective_b.add_theme_font_size_override("font_size", 14)
	objective_b.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0, 0.95))
	brief_list.add_child(objective_b)

	var objective_c = Label.new()
	objective_c.text = "• Exfil with the squad before the alert grid closes"
	objective_c.add_theme_font_size_override("font_size", 14)
	objective_c.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0, 0.95))
	brief_list.add_child(objective_c)

	# Fade briefing in
	var t = create_tween()
	t.tween_property(panel, "modulate:a", 1.0, 0.9).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	t.parallel().tween_property(title_label, "modulate:a", 1.0, 0.9).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

func _fade_out_ui() -> void:
	if title_label:
		var t = create_tween()
		t.tween_property(title_label, "modulate:a", 0.0, 0.6)

func _play_music() -> void:
	# Play optional background music if present; fallback to SoundManager intro music.
	if music_path != "" and ResourceLoader.exists(music_path):
		var res = load(music_path)
		audio_player = AudioStreamPlayer.new()
		audio_player.stream = res
		audio_player.autoplay = true
		add_child(audio_player)
		audio_player.play()
		return
	
	SoundManager.play_music("intro", true)

func _stop_music() -> void:
	if audio_player and audio_player.playing:
		audio_player.stop()
