# ==============================================================================
# RogueGhost: 3D Tactical Player Stealth Controller (Godot 4.6 GDScript)
# Requires: CharacterBody3D as the root node of the Player scene
# ==============================================================================
class_name PlayerGhost
extends CharacterBody3D

# Signals
signal health_changed(current: float, max_val: float)
signal stealth_changed(current: float, max_val: float)
signal hostages_changed(rescued: int, total: int)
signal fired_weapon()
signal suppressor_toggled(is_suppressed: bool)

# Exported Configuration
@export var speed: float = 5.0
@export var crouch_speed: float = 2.2
@export var prone_speed: float = 1.0
@export var slide_speed: float = 10.0
@export var acceleration: float = 12.0
@export var gravity: float = 9.8
@export var jump_force: float = 4.5
@export var stamina_max: float = 100.0

# Screen Shake Variables
var shake_intensity: float = 0.0
var shake_decay: float = 8.0
var shake_offset: Vector3 = Vector3.ZERO
var shake_rotation: Vector3 = Vector3.ZERO

# Suppressor State
var is_suppressed: bool = true # starts silenced by default

# Weapon Ammo Details
var max_clip: int = 30
var current_clip: int = 30
var is_reloading: bool = false

# Player stats
var max_health: float = 100.0
var health: float = 100.0
var max_stealth: float = 100.0
var stealth_level: float = 100.0 # 100 = invisible/hidden in shadow, 0 = fully revealed
var stamina: float = 100.0

# Posture & Actions
var active_weapon: String = "Silenced DMR Rifle"
var is_crouching: bool = false
var is_prone: bool = false
var is_sliding: bool = false
var is_active: bool = true
var slide_timer: float = 0.0
var slide_direction: Vector3 = Vector3.ZERO

# Leaning state
var lean_angle: float = 0.0
var lean_offset: float = 0.0

# Zoom / Scope settings
var current_zoom_state: int = 0 # 0=normal, 1=ADS, 2=DMR
var is_holding_breath: bool = false
var is_thermal_mode: bool = false
var is_nvg_mode: bool = false
var current_aim_distance: float = 50.0
var breath_stamina_decay: float = 25.0
var footstep_timer: float = 0.0

# Hip vs ADS weapon positions
var rifle_hip_pos: Vector3 = Vector3(0.2, -0.25, -0.45)
var rifle_ads_pos: Vector3 = Vector3(0.0, -0.178, -0.32)

var right_arm_hip_pos: Vector3 = Vector3(0.22, -0.32, -0.32)
var right_arm_ads_pos: Vector3 = Vector3(0.02, -0.24, -0.20)

var left_arm_hip_pos: Vector3 = Vector3(-0.16, -0.3, -0.45)
var left_arm_ads_pos: Vector3 = Vector3(-0.24, -0.22, -0.38)

# Burst Fire State
var burst_shots_remaining: int = 0
var burst_timer: float = 0.0
var burst_interval: float = 0.08

# Camera variables
var camera_sensitivity: float = 0.003
var mouse_captured: bool = false
var recoil_pitch: float = 0.0
var recoil_yaw: float = 0.0

# Node references (setup onready)
@onready var collision_shape: CollisionShape3D = $CollisionShape3D
@onready var camera_pivot: Node3D = $CameraPivot
@onready var camera: Camera3D = $CameraPivot/Camera3D
@onready var muzzle: Marker3D = $CameraPivot/CarbineRifle/Muzzle
@onready var laser_beam: MeshInstance3D = get_node_or_null("CameraPivot/CarbineRifle/LaserBeam")

@onready var flash_mesh: MeshInstance3D = $CameraPivot/CarbineRifle/Muzzle/FlashMesh
@onready var flash_light: OmniLight3D = $CameraPivot/CarbineRifle/Muzzle/FlashLight
@onready var carbine_rifle: Node3D = $CameraPivot/CarbineRifle
@onready var right_arm: Node3D = $CameraPivot/RightArm
@onready var left_arm: Node3D = $CameraPivot/LeftArm

func _ready() -> void:
	# Add to groups for global access
	add_to_group("player")
	
	# Initial UI updates
	health_changed.emit(health, max_health)
	stealth_changed.emit(stealth_level, max_stealth)
	
	# Auto-lock mouse on ready
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	mouse_captured = true

func _unhandled_input(event: InputEvent) -> void:
	if not is_active:
		return
		
	# Lock mouse cursor on screen click if it is visible
	if event is InputEventMouseButton and event.pressed:
		if not mouse_captured:
			mouse_captured = true
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
			get_viewport().set_input_as_handled()
			return

	# Unlock mouse cursor on Escape key
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		mouse_captured = false
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
		return

	# Right Mouse Button toggles ADS/Scope aiming
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_RIGHT and event.pressed and mouse_captured:
		if current_zoom_state == 0:
			current_zoom_state = 2 # Open scope directly
		else:
			current_zoom_state = 0 # Close scope
		_apply_zoom()
				
	# Middle click cycles all weapon scope zoom levels
	if event is InputEventMouseButton and event.pressed and mouse_captured:
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			current_zoom_state = (current_zoom_state + 1) % 3
			_apply_zoom()

	# Key-based triggers
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_Z:
			# Toggle prone posture
			_set_prone(!is_prone)
		elif event.keycode == KEY_F:
			# Toggle Silenced Suppressor
			_toggle_suppressor()
		elif event.keycode == KEY_T:
			is_thermal_mode = !is_thermal_mode
			if is_thermal_mode:
				is_nvg_mode = false
			SoundManager.play("clue")
			print("🕶️ THERMAL ACTIVE: ", is_thermal_mode)
		elif event.keycode == KEY_N:
			is_nvg_mode = !is_nvg_mode
			if is_nvg_mode:
				is_thermal_mode = false
			SoundManager.play("clue")
			print("🕶️ NVG ACTIVE: ", is_nvg_mode)
		elif event.keycode == KEY_R:
			reload_weapon()

	# Mouse look rotation
	if event is InputEventMouseMotion and mouse_captured:
		# Reduce sensitivity when scoped in
		var sens = camera_sensitivity
		if current_zoom_state == 1: sens = camera_sensitivity * 0.4
		elif current_zoom_state == 2: sens = camera_sensitivity * 0.15
		
		# Rotate parent Y
		rotate_y(-event.relative.x * sens)
		# Rotate camera pivot X (clamp vertical looking)
		camera_pivot.rotate_x(-event.relative.y * sens)
		camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, -deg_to_rad(65.0), deg_to_rad(65.0))

func _physics_process(delta: float) -> void:
	if not is_active:
		return
		
	# Apply camera screen shake decay
	_process_screen_shake(delta)

	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Check slide/crouch transitions
	var is_sprinting = Input.is_key_pressed(KEY_SHIFT) and velocity.length() > 0.5 and not is_crouching and not is_prone
	
	if is_sliding:
		slide_timer -= delta
		if slide_timer <= 0.0:
			is_sliding = false
			_set_crouch(true)
	elif is_sprinting and Input.is_key_pressed(KEY_CTRL) and not is_sliding:
		is_sliding = true
		slide_timer = 0.8
		slide_direction = -transform.basis.z.normalized()
		_set_crouch(true)
		stealth_level = clamp(stealth_level - 15.0, 0.0, max_stealth)

	# Check crouch toggle (fallback if not sliding)
	if not is_sliding:
		if Input.is_key_pressed(KEY_CTRL):
			if not is_crouching:
				_set_crouch(true)
				_set_prone(false)
		else:
			if is_crouching:
				_set_crouch(false)

	# Handle jump (cannot jump when prone/sliding)
	if Input.is_key_pressed(KEY_SPACE) and is_on_floor() and not is_prone and not is_sliding:
		velocity.y = jump_force
		stealth_level = clamp(stealth_level - 10.0, 0.0, max_stealth)
		stealth_changed.emit(stealth_level, max_stealth)

	# Camera leaning Q/E
	var target_lean_angle = 0.0
	var target_lean_offset = 0.0
	if Input.is_key_pressed(KEY_Q):
		target_lean_angle = deg_to_rad(6.0)
		target_lean_offset = -0.4
	elif Input.is_key_pressed(KEY_E):
		target_lean_angle = -deg_to_rad(6.0)
		target_lean_offset = 0.4
		
	lean_angle = move_toward(lean_angle, target_lean_angle, 10.0 * delta)
	lean_offset = move_toward(lean_offset, target_lean_offset, 6.0 * delta)
	
	if camera:
		camera.rotation.x = shake_rotation.x
		camera.rotation.z = lean_angle + shake_rotation.z
		camera.position.x = lean_offset + shake_offset.x
		camera.position.y = shake_offset.y
		camera.position.z = shake_offset.z

	# Hold breath sway adjustments
	is_holding_breath = Input.is_key_pressed(KEY_SHIFT) and current_zoom_state > 0 and stamina > 5.0
	if is_holding_breath:
		stamina = max(0.0, stamina - breath_stamina_decay * delta)
	else:
		stamina = min(stamina_max, stamina + 15.0 * delta)

	# Calculate movement vectors based on camera direction
	var input_dir := Vector3.ZERO
	if not is_sliding:
		if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
			input_dir -= transform.basis.z
		if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
			input_dir += transform.basis.z
		if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
			input_dir -= transform.basis.x
		if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
			input_dir += transform.basis.x
		input_dir = input_dir.normalized()
	else:
		input_dir = slide_direction

	# Determine speed multiplier
	var current_speed = speed
	if is_sliding:
		current_speed = slide_speed
	elif is_prone:
		current_speed = prone_speed
	elif is_crouching:
		current_speed = crouch_speed
	elif is_sprinting:
		current_speed = speed * 1.5

	# Move character
	var target_velocity_xz = input_dir * current_speed
	velocity.x = move_toward(velocity.x, target_velocity_xz.x, acceleration * delta)
	velocity.z = move_toward(velocity.z, target_velocity_xz.z, acceleration * delta)

	move_and_slide()

	var horiz_vel = Vector3(velocity.x, 0.0, velocity.z)

	# Head-bob and weapon-bob calculations
	_apply_head_bob(delta, horiz_vel, is_sprinting)

	# Trigger Footstep SFX
	var foot_threshold = 2.2
	if is_prone: foot_threshold = 3.6
	elif is_crouching: foot_threshold = 2.8
	elif is_sprinting: foot_threshold = 1.6
	if is_on_floor() and horiz_vel.length() > 0.1 and not is_sliding:
		footstep_timer += horiz_vel.length() * delta
		if footstep_timer >= foot_threshold:
			footstep_timer = 0.0
			var is_desert = false
			var weather_nodes = get_tree().get_nodes_in_group("weather")
			if weather_nodes.size() > 0:
				var ws = weather_nodes[0]
				if is_instance_valid(ws) and ws.get("environment_type") == 1:
					is_desert = true
			if is_desert:
				SoundManager.play("footstep_desert")
			else:
				SoundManager.play("footstep_snow")

	# Manage dynamic stealth recovery
	if velocity.length() < 0.2:
		# Staying still or crawling restores stealth
		var recovery = 35.0 if is_prone else (25.0 if is_crouching else 10.0)
		stealth_level = min(max_stealth, stealth_level + recovery * delta)
	else:
		# Moving drains stealth based on speed & posture
		var drain = 1.0 if is_prone else (3.0 if is_crouching else 8.0)
		if is_sprinting: drain = 15.0
		stealth_level = max(0.0, stealth_level - drain * delta)
		
	stealth_changed.emit(stealth_level, max_stealth)

	# Apply recoil decay
	if recoil_pitch > 0.0 or recoil_yaw != 0.0:
		var rec_p = move_toward(recoil_pitch, 0.0, 4.0 * delta)
		var rec_y = move_toward(recoil_yaw, 0.0, 4.0 * delta)
		var diff_p = rec_p - recoil_pitch
		var diff_y = rec_y - recoil_yaw
		recoil_pitch = rec_p
		recoil_yaw = rec_y
		
		if camera_pivot:
			camera_pivot.rotate_x(diff_p)
			camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, -deg_to_rad(65.0), deg_to_rad(65.0))
		rotate_y(diff_y)

	# Dynamic laser sight projection
	if laser_beam and is_active:
		var space_state = get_world_3d().direct_space_state
		var origin = muzzle.global_position
		var aim_dir = -muzzle.global_transform.basis.z
		var target = origin + (aim_dir * 50.0)
		var query = PhysicsRayQueryParameters3D.create(origin, target)
		query.exclude = [get_rid()]
		
		var result = space_state.intersect_ray(query)
		var distance = 50.0
		if result:
			distance = origin.distance_to(result.position)
		current_aim_distance = distance
		
		var c_mesh = laser_beam.mesh as CylinderMesh
		if c_mesh:
			c_mesh.height = distance
		laser_beam.position = Vector3(0, 0, -0.6 - (distance / 2.0))

	# Smoothly Lerp weapon/arms positions for ADS transition
	var is_aiming = current_zoom_state > 0
	var target_rifle_pos = rifle_ads_pos if is_aiming else rifle_hip_pos
	var target_right_arm_pos = right_arm_ads_pos if is_aiming else right_arm_hip_pos
	var target_left_arm_pos = left_arm_ads_pos if is_aiming else left_arm_hip_pos

	if carbine_rifle:
		carbine_rifle.position = carbine_rifle.position.lerp(target_rifle_pos, 14.0 * delta)
	if right_arm:
		right_arm.position = right_arm.position.lerp(target_right_arm_pos, 14.0 * delta)
	if left_arm:
		left_arm.position = left_arm.position.lerp(target_left_arm_pos, 14.0 * delta)

	# Firing input detection (Left Mouse Button)
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) and mouse_captured:
		_trigger_burst_fire()

	# Process active 3-round burst sequence
	if burst_shots_remaining > 0:
		burst_timer -= delta
		if burst_timer <= 0.0:
			burst_timer = burst_interval
			_fire_single_bullet()

func _set_crouch(state: bool) -> void:
	is_crouching = state
	is_prone = false
	if collision_shape:
		var cap = collision_shape.shape as CapsuleShape3D
		if cap:
			cap.height = 1.0 if state else 2.0
	
	if camera_pivot:
		camera_pivot.position.y = 0.4 if state else 0.8

func _set_prone(state: bool) -> void:
	is_prone = state
	is_crouching = false
	if collision_shape:
		var cap = collision_shape.shape as CapsuleShape3D
		if cap:
			cap.height = 0.4 if state else 2.0
			
	if camera_pivot:
		camera_pivot.position.y = 0.2 if state else 0.8

var fov_default: float = 75.0
var fov_ads: float = 30.0
var fov_dmr: float = 12.0

func _apply_zoom() -> void:
	if not camera:
		return
	match current_zoom_state:
		0:
			camera.fov = fov_default
		1:
			camera.fov = fov_ads
		2:
			camera.fov = fov_dmr

var fire_cooldown: float = 0.0
func _trigger_burst_fire() -> void:
	# Block fire if reloading or clip empty
	if is_reloading or current_clip <= 0:
		if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) and randf() < 0.05:
			# Play empty click sound
			SoundManager.play("hit_marker")
		return

	var time = Time.get_ticks_msec() / 1000.0
	if time < fire_cooldown or burst_shots_remaining > 0:
		return
		
	fire_cooldown = time + 0.48 # 480ms cooldown between bursts
	
	# Play the synthesized 3-round burst sound based on suppressor attachment!
	if is_suppressed:
		SoundManager.play("shot_silenced")
	else:
		SoundManager.play("shot_m16_burst")
	
	# Start burst sequence
	burst_shots_remaining = 3
	burst_timer = 0.0 # Trigger first bullet instantly

func _fire_single_bullet() -> void:
	burst_shots_remaining -= 1
	current_clip = max(0, current_clip - 1)
	
	# Gun kick recoil
	recoil_pitch += randf_range(0.04, 0.07)
	recoil_yaw += randf_range(-0.02, 0.02)
	
	# Dynamic camera screenshake on fire
	apply_screen_shake(0.22 if is_suppressed else 0.55, 0.06 if is_suppressed else 0.14)

	# Play weapon audio from the muzzle position for more spatial impact
	if muzzle and is_instance_valid(muzzle):
		if is_suppressed:
			SoundManager.play_3d("shot_silenced", muzzle.global_position)
		else:
			SoundManager.play_3d("shot_m16_burst", muzzle.global_position)
	
	# Visual muzzle flash (only if not suppressed or minimal flash)
	_show_muzzle_flash()
	
	# Reduce stealth from gun burst noise (suppressed: -2.0, unsuppressed: -15.0)
	var stealth_penalty = 2.0 if is_suppressed else 15.0
	stealth_level = clamp(stealth_level - stealth_penalty, 0.0, max_stealth)
	stealth_changed.emit(stealth_level, max_stealth)
	fired_weapon.emit()
	
	print("💥 DISCHARGING ROUND!")
	
	# Instantiate tracer bullet
	var bullet_class = load("res://scenes/bullet_projectile.tscn")
	if bullet_class:
		var b = bullet_class.instantiate() as Node3D
		get_tree().root.add_child(b)
		b.global_position = muzzle.global_position
		
		# Point tracer bullet along aim heading (plus tiny spread)
		var aim_dir = -camera.global_transform.basis.z
		var spread = 0.015 if current_zoom_state == 0 else 0.002
		aim_dir += Vector3(randf_range(-spread, spread), randf_range(-spread, spread), randf_range(-spread, spread))
		aim_dir = aim_dir.normalized()
		b.global_transform.basis = Basis.looking_at(aim_dir, Vector3.UP)
	else:
		# Fallback Raycast
		var space_state = get_world_3d().direct_space_state
		var origin = camera.global_position
		var target = origin + (-camera.global_transform.basis.z * 100.0)
		var query = PhysicsRayQueryParameters3D.create(origin, target)
		query.exclude = [get_rid()]
		
		var result = space_state.intersect_ray(query)
		if result:
			var hit_obj = result.collider
			if hit_obj.has_method("take_damage"):
				hit_obj.take_damage(40.0)
				print("🎯 Projectile hit target: ", hit_obj.name)
				
	# Pop spent shell casing brass
	_eject_shell_casing()

func _show_muzzle_flash() -> void:
	if flash_mesh and flash_light:
		# Suppressed weapons emit almost zero muzzle flash
		flash_mesh.visible = !is_suppressed
		flash_light.visible = !is_suppressed
		if not is_suppressed:
			get_tree().create_timer(0.04).timeout.connect(func():
				if is_instance_valid(flash_mesh): flash_mesh.visible = false
				if is_instance_valid(flash_light): flash_light.visible = false
			)

func _eject_shell_casing() -> void:
	var casing_mesh = CylinderMesh.new()
	casing_mesh.radius = 0.008
	casing_mesh.height = 0.03
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(1.0, 0.8, 0.2, 1) # gold brass
	mat.metallic = 0.8
	mat.roughness = 0.2
	casing_mesh.material = mat
	
	var casing = MeshInstance3D.new()
	casing.mesh = casing_mesh
	get_tree().root.add_child(casing)
	
	# Position at rifle eject port
	casing.global_position = carbine_rifle.global_position + carbine_rifle.global_transform.basis.x * 0.05
	
	# Trajectory velocity vector
	var velocity = (carbine_rifle.global_transform.basis.x * randf_range(1.5, 2.5) +
					carbine_rifle.global_transform.basis.y * randf_range(1.0, 1.8) -
					carbine_rifle.global_transform.basis.z * randf_range(-0.5, 0.5))
	
	var tween = create_tween()
	var target_pos = casing.global_position + velocity * 0.3 + Vector3.DOWN * 0.6
	tween.tween_property(casing, "global_position", target_pos, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.parallel().tween_property(casing, "rotation", Vector3(randf_range(-TAU, TAU), randf_range(-TAU, TAU), randf_range(-TAU, TAU)), 0.3)
	tween.finished.connect(func():
		if is_instance_valid(casing):
			# Play brass hitting ground sound effect
			SoundManager.play("shell_casing_ping")
			casing.queue_free()
	)

func take_damage(amount: float) -> void:
	if health <= 0.0:
		return
		
	# Play damage sound
	SoundManager.play("damage")
	
	# Apply camera shake on taking damage
	apply_screen_shake(0.75, 0.22)
	
	# Reduce health
	health = max(0.0, health - amount)
	health_changed.emit(health, max_health)
	print("🚨 Player damaged! Current integrity: ", health, "%")
	
	if health <= 0.0:
		is_active = false
		print("💀 Player integrity depleted. Comm-line shut down.")

var bob_time: float = 0.0
func _apply_head_bob(delta: float, horiz_vel: Vector3, is_sprinting: bool) -> void:
	if not is_on_floor() or horiz_vel.length() < 0.2:
		# Return smoothly to default local positions
		camera_pivot.position.y = lerp(camera_pivot.position.y, 0.4 if is_crouching else (0.2 if is_prone else 0.8), 8.0 * delta)
		camera_pivot.position.x = lerp(camera_pivot.position.x, 0.0, 8.0 * delta)
		if carbine_rifle:
			carbine_rifle.rotation = carbine_rifle.rotation.lerp(Vector3.ZERO, 8.0 * delta)
		return

	var bob_speed: float = 14.0 if is_sprinting else 10.0
	var bob_amount_y: float = 0.08 if is_sprinting else 0.04
	var bob_amount_x: float = 0.04 if is_sprinting else 0.02

	bob_time += delta * bob_speed
	
	# Head vertical and horizontal oscillation
	var target_y = (0.4 if is_crouching else (0.2 if is_prone else 0.8)) + sin(bob_time) * bob_amount_y
	var target_x = cos(bob_time * 0.5) * bob_amount_x
	
	camera_pivot.position.y = lerp(camera_pivot.position.y, target_y, 10.0 * delta)
	camera_pivot.position.x = lerp(camera_pivot.position.x, target_x, 10.0 * delta)

	# Dynamic Weapon Sway/Bobbing rotation
	if carbine_rifle:
		var target_rot_z = -sin(bob_time * 0.5) * (0.04 if is_sprinting else 0.015)
		var target_rot_x = -abs(sin(bob_time)) * (0.03 if is_sprinting else 0.01)
		carbine_rifle.rotation.z = lerp(carbine_rifle.rotation.z, target_rot_z, 10.0 * delta)
		carbine_rifle.rotation.x = lerp(carbine_rifle.rotation.x, target_rot_x, 10.0 * delta)

func show_hit_marker() -> void:
	# UI Audio Feedback
	SoundManager.play("hit_marker")
	
	# Instantiate Dynamic UI overlay hitmarker
	var canvas_layer = get_node_or_null("HitMarkerUI")
	if not canvas_layer:
		canvas_layer = CanvasLayer.new()
		canvas_layer.name = "HitMarkerUI"
		add_child(canvas_layer)
		
	var hitmarker_rect = canvas_layer.get_node_or_null("Indicator")
	if not hitmarker_rect:
		hitmarker_rect = TextureRect.new()
		hitmarker_rect.name = "Indicator"
		# Set size & layout
		hitmarker_rect.custom_minimum_size = Vector2(48, 48)
		hitmarker_rect.size = Vector2(48, 48)
		hitmarker_rect.anchors_preset = Control.PRESET_CENTER
		hitmarker_rect.anchor_left = 0.5
		hitmarker_rect.anchor_right = 0.5
		hitmarker_rect.anchor_top = 0.5
		hitmarker_rect.anchor_bottom = 0.5
		hitmarker_rect.grow_horizontal = Control.GROW_DIRECTION_BOTH
		hitmarker_rect.grow_vertical = Control.GROW_DIRECTION_BOTH
		
		# Generate cross hair texture procedurally using a 64x64 ImageTexture
		var img = Image.create(64, 64, false, Image.FORMAT_RGBA8)
		# Clear image transparent
		img.fill(Color(0, 0, 0, 0))
		
		# Draw hitmarker diagonal indicators (X shape)
		var red = Color(1.0, 0.0, 0.0, 0.85)
		for i in range(8, 22):
			img.set_pixel(i, i, red)
			img.set_pixel(i, i+1, red)
			img.set_pixel(i+1, i, red)
			
			img.set_pixel(64 - 1 - i, i, red)
			img.set_pixel(64 - 1 - i, i+1, red)
			img.set_pixel(64 - 2 - i, i, red)
			
			img.set_pixel(i, 64 - 1 - i, red)
			img.set_pixel(i, 64 - 2 - i, red)
			img.set_pixel(i+1, 64 - 1 - i, red)
			
			img.set_pixel(64 - 1 - i, 64 - 1 - i, red)
			img.set_pixel(64 - 1 - i, 64 - 2 - i, red)
			img.set_pixel(64 - 2 - i, 64 - 1 - i, red)
			
		var tex = ImageTexture.create_from_image(img)
		hitmarker_rect.texture = tex
		canvas_layer.add_child(hitmarker_rect)
		
	# Reset state & run pop tween
	hitmarker_rect.visible = true
	hitmarker_rect.scale = Vector2(1.5, 1.5)
	hitmarker_rect.modulate = Color(1.0, 1.0, 1.0, 1.0)
	
	var tween = create_tween()
	tween.tween_property(hitmarker_rect, "scale", Vector2(1.0, 1.0), 0.12).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.parallel().tween_property(hitmarker_rect, "modulate:a", 0.0, 0.25).set_delay(0.08)
	tween.finished.connect(func(): hitmarker_rect.visible = false)

func apply_screen_shake(amount: float, roll: float = 0.0) -> void:
	shake_intensity = clamp(shake_intensity + amount, 0.0, 1.5)
	shake_rotation.z = clamp(shake_rotation.z + roll, -0.24, 0.24)

func _process_screen_shake(delta: float) -> void:
	if shake_intensity > 0.01:
		shake_intensity = move_toward(shake_intensity, 0.0, shake_decay * delta)
		shake_offset = Vector3(
			randf_range(-1.0, 1.0) * shake_intensity * 0.25,
			randf_range(-1.0, 1.0) * shake_intensity * 0.25,
			randf_range(-1.0, 1.0) * shake_intensity * 0.10
		)
		shake_rotation = Vector3(
			randf_range(-1.0, 1.0) * shake_intensity * 0.04,
			randf_range(-1.0, 1.0) * shake_intensity * 0.04,
		clamp(shake_rotation.z * (1.0 - delta * 2.5), -0.24, 0.24)
		)
	else:
		shake_intensity = 0.0
		shake_offset = Vector3.ZERO
		shake_rotation = Vector3.ZERO

func _toggle_suppressor() -> void:
	is_suppressed = !is_suppressed
	suppressor_toggled.emit(is_suppressed)
	SoundManager.play("clue") # Play attachment toggle click
	print("🔧 SUPPRESSOR STATE CHANGED: Suppressed = ", is_suppressed)
	
	# Animate the physical suppressor attachment visual dynamically!
	var silencer = carbine_rifle.get_node_or_null("SilencerMesh")
	if not silencer:
		# Create procedural silencer mesh
		var c_mesh = CylinderMesh.new()
		c_mesh.top_radius = 0.015
		c_mesh.bottom_radius = 0.015
		c_mesh.height = 0.18
		var mat = StandardMaterial3D.new()
		mat.albedo_color = Color(0.05, 0.05, 0.06, 1) # tactical matte black
		mat.roughness = 0.8
		c_mesh.material = mat
		
		silencer = MeshInstance3D.new()
		silencer.name = "SilencerMesh"
		silencer.mesh = c_mesh
		# Position at the muzzle tip of CarbineRifle
		silencer.transform = Transform3D().rotated(Vector3.RIGHT, PI / 2.0)
		silencer.position = Vector3(0.0, 0.0, -0.68)
		carbine_rifle.add_child(silencer)
		
	# Animate attachment
	var tween = create_tween()
	if is_suppressed:
		silencer.visible = true
		silencer.scale = Vector3.ZERO
		tween.tween_property(silencer, "scale", Vector3(1.0, 1.0, 1.0), 0.35).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		# Relocate muzzle tip forward
		muzzle.position = Vector3(0.0, 0.0, -0.77)
	else:
		tween.tween_property(silencer, "scale", Vector3.ZERO, 0.25).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
		tween.finished.connect(func(): if is_instance_valid(silencer): silencer.visible = false)
		# Reset muzzle tip position
		muzzle.position = Vector3(0.0, 0.0, -0.60)

func reload_weapon() -> void:
	if is_reloading or current_clip == max_clip:
		return
	is_reloading = true
	print("🔄 RELOADING WEAPON...")
	SoundManager.play("clue")
	get_tree().create_timer(1.5).timeout.connect(func():
		if is_instance_valid(self):
			current_clip = max_clip
			is_reloading = false
			SoundManager.play("rescue")
			print("✅ WEAPON RELOADED.")
	)


