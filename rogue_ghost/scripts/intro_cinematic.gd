extends Node3D

signal cinematic_finished()

@export var duration: float = 4.0
@export var path_points: Array[Vector3] = [Vector3(0, 3, 12), Vector3(0, 2.4, 6), Vector3(0, 1.2, 1.0)]
@export var intro_text: String = "OPERATION: ROGUE GHOST - DEPLOY"

@onready var cam: Camera3D = $CineCamera

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

func _on_cinematic_done() -> void:
	# Small hold then finish
	get_tree().create_timer(0.55).timeout.connect(func():
		emit_signal("cinematic_finished")
		if is_instance_valid(self):
			queue_free()
	)
