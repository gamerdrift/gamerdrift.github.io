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

 	# Prepare tween-driven path animation
	var tween = create_tween()
	var total = path_points.size()
	if total == 0:
		tween.tween_callback(Callable(self, "_on_cinematic_done"))
		return

	var seg = duration / max(1, total - 1)
	for i in range(total):
		var target = global_transform
		# move camera to point relative to this Cinematic node
		target.origin = path_points[i]
		if i == 0:
			cam.global_transform = target
		else:
			tween.tween_property(cam, "global_transform:origin", target.origin, seg).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)

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

	var panel = Panel.new()
	panel.name = "CinePanel"
	panel.custom_minimum_size = Vector2(800, 200)
	panel.add_theme_color_override("bg_color", Color(0,0,0,0.35))
	ui_layer.add_child(panel)
	panel.anchor_right = 1.0
	panel.anchor_left = 0.0
	panel.anchor_bottom = 1.0
	panel.anchor_top = 0.8

	# Title label
	title_label = Label.new()
	title_label.name = "CineTitle"
	title_label.text = intro_text + "\n" + subtitle_text
	title_label.modulate = Color(1,1,1,0)
	title_label.add_theme_font_size_override("font_size", 26)
	title_label.align = Label.ALIGN_CENTER
	panel.add_child(title_label)

	# Fade text in
	var t = create_tween()
	t.tween_property(title_label, "modulate:a", 1.0, 0.8).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

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
