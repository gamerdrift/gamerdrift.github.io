# ==============================================================================
# RogueGhost: Programmatic 8-Bit Audio Synthesis Engine (Godot 4.6 GDScript)
# Generates gameplay sound effects at runtime to maintain zero-asset footprint.
# ==============================================================================
extends Node

# Audio stream dictionary
var streams: Dictionary = {}
var music_streams: Dictionary = {}
var current_music_name: String = ""
var music_player: AudioStreamPlayer = null

func _ready() -> void:
	# Cache-generate all sound streams at load
	streams["shot_silenced"] = _generate_silenced_shot()
	streams["shot_m16_burst"] = _generate_m16_burst()
	streams["shot_ak_burst"] = _generate_ak_burst()
	streams["shot_rifle_punch"] = _generate_rifle_punch()
	streams["metal_ricochet"] = _generate_metal_ricochet()
	streams["wind_howl"] = _generate_wind_howl()
	streams["battle_ambience"] = _generate_battle_ambience()
	streams["footstep_snow"] = _generate_footstep(0.06, 120.0, 0.12)
	streams["footstep_desert"] = _generate_footstep(0.05, 240.0, 0.08)
	streams["guard_alert"] = _generate_guard_alert()
	streams["damage"] = _generate_damage()
	streams["enemy_grunt"] = _generate_enemy_grunt()
	streams["rescue"] = _generate_rescue()
	streams["clue"] = _generate_clue()
	streams["victory"] = _generate_victory()
	streams["defeat"] = _generate_defeat()
	streams["hit_marker"] = _generate_hit_marker()
	streams["shell_casing_ping"] = _generate_shell_casing_ping()
	print("🔊 SoundManager: Programmatic audio synthesis matrix initialized.")

	# Attempt to load optional longer-form music tracks from res://audio/ when present.
	var music_files = {
		"intro": "res://audio/intro_theme.ogg",
		"battle": "res://audio/battle.ogg",
		"boss_defeat": "res://audio/boss_defeat.ogg",
		"hostage_rescue": "res://audio/hostage_rescue.ogg",
		"extraction": "res://audio/extraction.ogg",
		"helicopter": "res://audio/helicopter.ogg"
	}

	for name in music_files.keys():
		var path = music_files[name]
		if ResourceLoader.exists(path):
			music_streams[name] = load(path)
			print("🔉 SoundManager: loaded music:", name, "->", path)
		else:
			match name:
				"intro": music_streams[name] = _generate_intro_music()
				"battle": music_streams[name] = _generate_battle_music()
				"boss_defeat": music_streams[name] = _generate_boss_defeat_music()
				"hostage_rescue": music_streams[name] = _generate_hostage_rescue_music()
				"extraction": music_streams[name] = _generate_extraction_music()
				"helicopter": music_streams[name] = _generate_helicopter_music()
			print("🎵 SoundManager: generated music:", name)

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

# Play background music by key (from music_streams). If not found, no-op.
func play_music(name: String, loop: bool = true) -> void:
	if not music_streams.has(name):
		print("⚠️ SoundManager: music '", name, "' not found in music_streams.")
		return

	# Stop existing music immediately
	if music_player and is_instance_valid(music_player):
		music_player.stop()
		music_player.queue_free()

	music_player = AudioStreamPlayer.new()
	music_player.stream = music_streams[name]
	music_player.bus = "Master"
	music_player.playback_speed = 1.0
	music_player.stream_paused = false
	music_player.loop = loop
	add_child(music_player)
	music_player.play()
	current_music_name = name
	print("▶️ SoundManager: playing music:", name)

func stop_music() -> void:
	if music_player and is_instance_valid(music_player):
		music_player.stop()
		music_player.queue_free()
		music_player = null
		current_music_name = ""
		print("⏹️ SoundManager: music stopped")

# Core helper — correct class name is AudioStreamWAV (all caps WAV) in Godot 4
func _create_stream(bytes: PackedByteArray, mix_rate: int) -> AudioStreamWAV:
	var stream = AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_8_BITS
	stream.mix_rate = mix_rate
	stream.stereo = false
	stream.data = bytes
	return stream
func _generate_intro_music() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var duration = 14.0
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var drone = sin(2.0 * PI * 55.0 * t) * 0.22 + sin(2.0 * PI * 110.0 * t) * 0.12
		var pulse = sin(2.0 * PI * 88.0 * t) * 0.14 * pow(sin(PI * 0.8 * t), 2)
		var step = int(t * 1.6) % 8
		var lead_freq = 220.0
		match step:
			0: lead_freq = 220.0
			1: lead_freq = 196.0
			2: lead_freq = 246.94
			3: lead_freq = 261.63
			4: lead_freq = 164.81
			5: lead_freq = 196.0
			6: lead_freq = 220.0
			_: lead_freq = 174.61
		var lead = sin(2.0 * PI * lead_freq * t) * 0.18
		var ar = float(int((t * 1.6) * 3.0) % 3) * 0.0
		var env = clamp(1.0 - abs((t - duration * 0.5) / (duration * 0.5)), 0.12, 1.0)
		var sample = clamp((drone + pulse + lead * env) * 0.32, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_battle_music() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var duration = 12.0
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var bass = sin(2.0 * PI * 65.0 * t) * 0.24
		var pulse = sin(2.0 * PI * 160.0 * t) * 0.08 * pow(sin(PI * 2.4 * t), 4)
		var stab = sin(2.0 * PI * 195.0 * t) * 0.12 * (sin(PI * 0.75 * t) * 0.5 + 0.5)
		var arp_step = int(t * 2.2) % 6
		var arp_freq = [220.0, 246.94, 261.63, 246.94, 220.0, 196.0][arp_step]
		var arp = sin(2.0 * PI * arp_freq * t) * 0.16 * exp(-fract(t * 2.2) * 3.0)
		var sample = clamp((bass + pulse + stab + arp) * 0.30, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_boss_defeat_music() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var duration = 10.0
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var motion = sin(2.0 * PI * 50.0 * t) * 0.18
		var arp_index = int(t * 1.8) % 7
		var arp_notes = [220.0, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0]
		var lead = sin(2.0 * PI * arp_notes[arp_index] * t) * 0.24 * exp(-fract(t * 1.8) * 2.2)
		var swell = sin(2.0 * PI * 440.0 * t) * 0.08 * (sin(PI * 0.4 * t) * 0.5 + 0.5)
		var sample = clamp((motion + lead + swell) * 0.34, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_hostage_rescue_music() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var duration = 10.0
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var warm = sin(2.0 * PI * 110.0 * t) * 0.22
		var shimmer = sin(2.0 * PI * 330.0 * t) * 0.14 * pow(sin(PI * 0.6 * t), 2)
		var chord = sin(2.0 * PI * 164.81 * t) + sin(2.0 * PI * 207.65 * t) + sin(2.0 * PI * 246.94 * t)
		var sample = clamp((warm + chord * 0.08 + shimmer) * 0.28, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_extraction_music() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var duration = 12.0
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var pulse = sin(2.0 * PI * 80.0 * t) * 0.22 * pow(sin(PI * 1.75 * t), 4)
		var lead = sin(2.0 * PI * 220.0 * t) * 0.14 * (sin(PI * 0.8 * t) * 0.5 + 0.5)
		var pad = sin(2.0 * PI * 110.0 * t) * 0.16
		var sample = clamp((pulse + lead + pad) * 0.31, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_helicopter_music() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var mix_rate = 22050
	var duration = 8.0
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var rotor = sin(2.0 * PI * 35.0 * t) * 0.28
		var wind = sin(2.0 * PI * 120.0 * t) * 0.10
		var shimmer = sin(2.0 * PI * 440.0 * t) * 0.05 * (sin(PI * 0.35 * t) * 0.5 + 0.5)
		var sample = clamp((rotor + wind + shimmer) * 0.26, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)
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

# 10. AK-47 Burst: sharper crack, wooden 220Hz body thud, rattle tail
func _generate_ak_burst() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.50
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)
	# 3 rounds spaced 110ms apart (AK rate of fire ~600rpm)
	var shot_starts = [0.0, 0.11, 0.22]

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var total_sample = 0.0

		for start_t in shot_starts:
			if t >= start_t:
				var local_t = t - start_t
				# Sharp high-frequency crack (fast decay noise)
				var crack_env = exp(-local_t * 55.0)
				var crack = randf_range(-1.0, 1.0) * crack_env * 0.55
				# Warm wooden body resonance at ~220Hz (lower than M16 steel)
				var freq = lerp(280.0, 60.0, clamp(local_t * 14.0, 0.0, 1.0))
				var body_env = exp(-local_t * 10.0)
				var thud = sin(2.0 * PI * freq * local_t) * body_env * 0.48
				# Mechanical rattle tail (AK bolt carrier)
				var rattle_env = exp(-local_t * 22.0) * float(local_t > 0.015)
				var rattle = randf_range(-0.3, 0.3) * rattle_env
				total_sample += crack + thud + rattle

		total_sample = clamp(total_sample * 0.50, -1.0, 1.0)
		var byte_val = int(total_sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_rifle_punch() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.16
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var wave = sin(2.0 * PI * lerp(140.0, 70.0, t / duration) * t)
		var envelope = exp(-t * 14.0)
		var sample = wave * envelope * 0.7
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_metal_ricochet() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.18
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var noise = randf_range(-1.0, 1.0) * exp(-t * 40.0)
		var ring = sin(2.0 * PI * 2400.0 * t) * exp(-t * 18.0)
		var sample = clamp((noise * 0.5 + ring * 0.35) * 0.5, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_wind_howl() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 2.0
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var noise = randf_range(-1.0, 1.0)
		var band = sin(2.0 * PI * 120.0 * t) * 0.18
		var filter = exp(-pow(t - 1.0, 2) * 3.0)
		var sample = noise * filter * 0.35 + band * 0.2
		var byte_val = int(clamp(sample, -1.0, 1.0) * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

func _generate_battle_ambience() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 3.0
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		var low_drum = sin(2.0 * PI * 55.0 * t) * 0.14
		var distant_noise = randf_range(-1.0, 1.0) * exp(-t * 1.8) * 0.2
		var pulsing = sin(2.0 * PI * 0.8 * t) * 0.08
		var sample = clamp((low_drum + distant_noise + pulsing) * 0.35, -1.0, 1.0)
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 11. Enemy grunt: short guttural impact noise on hit
func _generate_enemy_grunt() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.18
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		# Rough vocal formant at ~180Hz with noise texture
		var freq = lerp(200.0, 90.0, t / duration)
		var wave = sin(2.0 * PI * freq * t)
		var noise = randf_range(-0.4, 0.4)
		var envelope = exp(-t * 14.0)
		var sample = (wave * 0.55 + noise * 0.45) * envelope * 0.6
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 12. Tactical hit-marker indicator click sound
func _generate_hit_marker() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.05
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		# High frequency sharp tick chime
		var wave = sin(2.0 * PI * 2000.0 * t)
		var envelope = exp(-t * 70.0) # ultra-fast decay
		var sample = wave * envelope * 0.28
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)

# 13. Metallic shell casing impact ping sound effect
func _generate_shell_casing_ping() -> AudioStreamWAV:
	var bytes = PackedByteArray()
	var duration = 0.15
	var mix_rate = 22050
	var sample_count = int(duration * mix_rate)

	for i in range(sample_count):
		var t = float(i) / mix_rate
		# High-frequency metal ring (2800Hz with 3500Hz resonance overtone)
		var wave = sin(2.0 * PI * 2800.0 * t) + 0.35 * sin(2.0 * PI * 3500.0 * t)
		var envelope = exp(-t * 22.0) # fast metallic ring decay
		var sample = wave * envelope * 0.18
		var byte_val = int(sample * 127.0)
		if byte_val < 0: byte_val += 256
		bytes.append(byte_val)

	return _create_stream(bytes, mix_rate)


