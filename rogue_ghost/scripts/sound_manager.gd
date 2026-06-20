# ==============================================================================
# RogueGhost: Programmatic 8-Bit Audio Synthesis Engine (Godot 4.6 GDScript)
# Generates gameplay sound effects at runtime to maintain zero-asset footprint.
# ==============================================================================
extends Node

# Audio stream dictionary
var streams: Dictionary = {}

func _ready() -> void:
	# Cache-generate all sound streams at load
	streams["shot_silenced"] = _generate_silenced_shot()
	streams["shot_m16_burst"] = _generate_m16_burst()
	streams["footstep_snow"] = _generate_footstep(0.06, 120.0, 0.12)
	streams["footstep_desert"] = _generate_footstep(0.05, 240.0, 0.08)
	streams["guard_alert"] = _generate_guard_alert()
	streams["damage"] = _generate_damage()
	streams["rescue"] = _generate_rescue()
	streams["clue"] = _generate_clue()
	streams["victory"] = _generate_victory()
	streams["defeat"] = _generate_defeat()
	print("🔊 SoundManager: Programmatic audio synthesis matrix initialized.")

# Play sound on a transient child player
func play(sound_name: String) -> void:
	if not streams.has(sound_name):
		print("⚠️ SoundManager: Sound name '", sound_name, "' not found.")
		return

	var player = AudioStreamPlayer.new()
	player.stream = streams[sound_name]
	add_child(player)
	player.play()
	player.finished.connect(func(): player.queue_free())

# Play positional sound in 3D space
func play_3d(sound_name: String, global_pos: Vector3, parent: Node = null) -> void:
	if not streams.has(sound_name):
		return

	var player = AudioStreamPlayer3D.new()
	player.stream = streams[sound_name]
	player.max_distance = 25.0
	player.unit_size = 2.0

	if parent and is_instance_valid(parent):
		parent.add_child(player)
		player.global_position = global_pos
	else:
		get_tree().root.add_child(player)
		player.global_position = global_pos

	player.play()
	player.finished.connect(func(): player.queue_free())

# Core helper — correct class name is AudioStreamWAV (all caps WAV) in Godot 4
func _create_stream(bytes: PackedByteArray, mix_rate: int) -> AudioStreamWAV:
	var stream = AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_8_BITS
	stream.mix_rate = mix_rate
	stream.stereo = false
	stream.data = bytes
	return stream

# 1. Silenced M16 shot: short white noise with fast decay
func _generate_silenced_shot() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.12
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var envelope = exp(-t * 35.0)
		var noise = randf_range(-1.0, 1.0)
		var sample = noise * envelope * 0.45
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 2. Footstep: brief noise crunch with frequency modulation
func _generate_footstep(duration: float, freq_mod: float, volume: float) -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var noise = randf_range(-1.0, 1.0)
		var mod_val = sin(t * freq_mod) * 0.5 + 0.5
		var envelope = sin(PI * t / duration) * exp(-t * 20.0)
		var sample = noise * mod_val * envelope * volume
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 3. Guard alert alarm: dual-tone warning beep
func _generate_guard_alert() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.22
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var wave = sin(2.0 * PI * 880.0 * t) + sin(2.0 * PI * 1100.0 * t)
		var envelope = 1.0
		if t > 0.18:
			envelope = (0.22 - t) / 0.04
		var sample = wave * 0.25 * envelope
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 4. Player damage thump: deep pitch-down thump
func _generate_damage() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.2
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var freq = lerp(180.0, 40.0, t / duration)
		var wave = sin(2.0 * PI * freq * t)
		var envelope = exp(-t * 12.0)
		var sample = wave * envelope * 0.6
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 5. Hostage rescue arpeggio: rising cyber chime
func _generate_rescue() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.35
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var note_idx = int(t / 0.08)
		var freq = 523.25
		match note_idx:
			1: freq = 659.25
			2: freq = 783.99
			3, _: freq = 1046.50

		var wave = sin(2.0 * PI * freq * t)
		var note_t = t - float(note_idx) * 0.08
		var envelope = exp(-note_t * 15.0)
		var sample = wave * envelope * 0.35
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 6. Clue discovery chime: high-frequency crystal ping
func _generate_clue() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.4
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var wave = sin(2.0 * PI * 1600.0 * t) + 0.5 * sin(2.0 * PI * 2400.0 * t)
		var envelope = exp(-t * 8.0)
		var sample = wave * envelope * 0.25
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 7. Mission Victory fanfare: triumphant arpeggio theme
func _generate_victory() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.8
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var note_idx = int(t / 0.1)
		var freq = 523.25
		match note_idx:
			1: freq = 659.25
			2: freq = 783.99
			3: freq = 1046.50
			4: freq = 1318.51
			5: freq = 1567.98
			6, _: freq = 2093.00

		var wave = sin(2.0 * PI * freq * t)
		var envelope = 1.0
		if t > 0.6:
			envelope = (0.8 - t) / 0.2
		var sample = wave * envelope * 0.3
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 8. Mission Defeat: distorted pitch-drop feedback
func _generate_defeat() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.7
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var freq = lerp(120.0, 30.0, t / duration)
		var wave = sin(2.0 * PI * freq * t) + 0.7 * sin(2.0 * PI * (freq * 1.2) * t)
		var noise = randf_range(-0.3, 0.3)
		var envelope = exp(-t * 4.0)
		var sample = (wave + noise) * envelope * 0.4
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 9. M16 Burst fire sound: 3 rapid, punchy shots with metallic thud
func _generate_m16_burst() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.42
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)
	var shot_starts = [0.0, 0.09, 0.18]

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var total_sample = 0.0

		for start_t in shot_starts:
			if t >= start_t:
				var local_t = t - start_t
				var noise_env = exp(-local_t * 38.0)
				var body_env = exp(-local_t * 16.0)
				var noise = randf_range(-1.0, 1.0) * noise_env * 0.45
				var freq = lerp(420.0, 70.0, clamp(local_t * 18.0, 0.0, 1.0))
				var thud = sin(2.0 * PI * freq * local_t) * body_env * 0.5
				total_sample += noise + thud

		total_sample = clamp(total_sample * 0.55, -1.0, 1.0)
		var byte_val = int(total_sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

