# ==============================================================================
# RogueGhost: Tactical HUD UI Overlay Script (Godot 4.6 GDScript)
# Manages health bars, stealth indicators, thermal overlays, and debrief cards.
# ==============================================================================
extends CanvasLayer

# Node references
@onready var health_bar: ProgressBar = $Control/HUDContainer/HealthBox/HealthBar
@onready var health_label: Label = $Control/HUDContainer/HealthBox/HealthLabel
@onready var stealth_bar: ProgressBar = $Control/HUDContainer/StealthBox/StealthBar
@onready var stealth_label: Label = $Control/HUDContainer/StealthBox/StealthLabel
@onready var objective_label: Label = $Control/HUDContainer/ObjectiveBox/ObjectiveLabel
@onready var thermal_overlay: ColorRect = $Control/ThermalOverlay

# Debrief Card references
@onready var debrief_panel: Panel = $Control/DebriefPanel
@onready var debrief_title: Label = $Control/DebriefPanel/ContentBox/TitleLabel
@onready var debrief_stats: Label = $Control/DebriefPanel/ContentBox/StatsLabel
@onready var debrief_score: Label = $Control/DebriefPanel/ContentBox/ScoreLabel
@onready var retry_button: Button = $Control/DebriefPanel/ContentBox/ButtonContainer/RetryBtn
@onready var exit_button: Button = $Control/DebriefPanel/ContentBox/ButtonContainer/ExitBtn

# References to connected objects
var player: PlayerGhost = null
var mission_manager: MissionManager = null

# Custom HUD nodes
var compass_node: Control = null
var radar_node: Control = null
var scope_node: Control = null
var nvg_node: Control = null

func _ready() -> void:
	# Hide debrief card on start
	debrief_panel.visible = false
	thermal_overlay.visible = false
	
	# Connect buttons
	if retry_button:
		retry_button.pressed.connect(_on_retry_pressed)
	if exit_button:
		exit_button.pressed.connect(_on_exit_pressed)

	# Locate systems and bind signals
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		player = players[0] as PlayerGhost
		player.health_changed.connect(_on_health_changed)
		player.stealth_changed.connect(_on_stealth_changed)
		player.hostages_changed.connect(_on_hostages_changed)
		player.suppressor_toggled.connect(_on_suppressor_toggled)
		
		# Initial state
		_on_health_changed(player.health, player.max_health)
		_on_stealth_changed(player.stealth_level, player.max_stealth)
		
	var managers = get_tree().get_nodes_in_group("managers")
	if managers.size() > 0:
		mission_manager = managers[0] as MissionManager
		mission_manager.mission_completed.connect(_on_mission_completed)
		mission_manager.mission_failed.connect(_on_mission_failed)
		
		# Update objective label
		_on_hostages_changed(mission_manager.rescued_hostages, mission_manager.total_hostages)

	# Initialize custom HUD overlays dynamically
	_initialize_custom_hud()

var vignette_node: Control = null
var suppressor_label: Label = null

func _initialize_custom_hud() -> void:
	# 0. Cinematic Vignette Screen Overlay
	vignette_node = Control.new()
	vignette_node.name = "CinematicVignette"
	vignette_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	$Control.add_child(vignette_node)
	$Control.move_child(vignette_node, 0)
	vignette_node.set_anchors_preset(Control.PRESET_FULLRECT)
	vignette_node.draw.connect(_on_vignette_draw)
	
	# Suppressor weapon attachment indicator text label
	suppressor_label = Label.new()
	suppressor_label.name = "SuppressorLabel"
	suppressor_label.text = "SUPPRESSOR: ATTACHED"
	suppressor_label.add_theme_font_size_override("font_size", 10)
	suppressor_label.add_theme_color_override("font_color", Color(0.0, 0.9, 1.0, 0.85))
	$Control/HUDContainer.add_child(suppressor_label)

	# 1. Compass tape
	compass_node = Control.new()
	compass_node.name = "RollingCompass"
	compass_node.custom_minimum_size = Vector2(300, 26)
	$Control/HUDContainer.add_child(compass_node)
	compass_node.draw.connect(_on_compass_draw)
	compass_node.set_anchors_preset(Control.PRESET_CENTER_TOP)
	
	# 2. Minimap radar
	radar_node = Control.new()
	radar_node.name = "TacticalRadar"
	radar_node.custom_minimum_size = Vector2(150, 150)
	$Control/HUDContainer.add_child(radar_node)
	radar_node.draw.connect(_on_radar_draw)
	
	# 3. Sniper scope overlay (load behind HUD labels)
	scope_node = Control.new()
	scope_node.name = "SniperScope"
	scope_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	$Control.add_child(scope_node)
	$Control.move_child(scope_node, 0)
	scope_node.draw.connect(_on_scope_draw)
	scope_node.set_anchors_preset(Control.PRESET_FULLRECT)
	
	# 4. Night vision overlay (load behind scope and other HUD elements)
	nvg_node = Control.new()
	nvg_node.name = "NVGOverlay"
	nvg_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	$Control.add_child(nvg_node)
	$Control.move_child(nvg_node, 0)
	nvg_node.draw.connect(_on_nvg_draw)
	nvg_node.set_anchors_preset(Control.PRESET_FULLRECT)

func _process(_delta: float) -> void:
	if not player or not is_instance_valid(player):
		return
		
	# Update thermal HUD overlay visibility
	thermal_overlay.visible = player.is_thermal_mode
	
	# Reposition and redraw dynamic overlays
	var viewport_w = get_viewport().get_visible_rect().size.x
	var viewport_h = get_viewport().get_visible_rect().size.y
	
	if vignette_node:
		vignette_node.queue_redraw()
		
	if suppressor_label:
		# Position suppressor indicator next to weapon or ammo info
		suppressor_label.position = Vector2(viewport_w - 220, viewport_h - 130)
		
	if compass_node:
		compass_node.position = Vector2((viewport_w - 300) / 2.0, 15)
		compass_node.queue_redraw()
		
	if radar_node and $Control/HUDContainer/HealthBox:
		radar_node.position = Vector2(40, $Control/HUDContainer/HealthBox.position.y - 170)
		radar_node.queue_redraw()
		
	if scope_node:
		scope_node.queue_redraw()
		
	if nvg_node:
		nvg_node.queue_redraw()

func _on_compass_draw() -> void:
	if not player or not is_instance_valid(player):
		return
		
	var size = compass_node.size
	var center_x = size.x / 2.0
	
	# Draw background border
	compass_node.draw_rect(Rect2(Vector2.ZERO, size), Color(0.04, 0.05, 0.07, 0.6))
	compass_node.draw_line(Vector2(0, size.y), Vector2(size.x, size.y), Color(0.0, 0.8, 1.0, 0.35), 1.0)
	
	# Heading angle calculation
	var heading_rad = -player.rotation.y
	var heading_deg = fposmod(rad_to_deg(heading_rad), 360.0)
	
	var pixels_per_degree = 2.0
	var range_deg = 45.0
	var start_deg = heading_deg - range_deg
	var end_deg = heading_deg + range_deg
	
	var default_font = ThemeDB.fallback_font
	var font_sz = 10
	
	# Operative centering heading mark
	compass_node.draw_line(Vector2(center_x, 0), Vector2(center_x, 8), Color(1.0, 0.6, 0.0, 0.9), 2.0)
	
	for d in range(floor(start_deg), ceil(end_deg)):
		var wrapped_d = fposmod(d, 360.0)
		if int(wrapped_d) % 5 == 0:
			var diff = d - heading_deg
			var x = center_x + (diff * pixels_per_degree)
			
			if x >= 0 and x <= size.x:
				var is_major = int(wrapped_d) % 15 == 0
				var tick_h = 10 if is_major else 5
				compass_node.draw_line(Vector2(x, size.y - tick_h), Vector2(x, size.y), Color(0.0, 0.8, 1.0, 0.5), 1.0)
				
				if is_major:
					var label = ""
					match int(wrapped_d):
						0, 360: label = "N"
						45: label = "NE"
						90: label = "E"
						135: label = "SE"
						180: label = "S"
						225: label = "SW"
						270: label = "W"
						315: label = "NW"
						_: label = "%03d" % int(wrapped_d)
						
					var color = Color(0.0, 0.9, 1.0, 0.9)
					if label in ["N", "E", "S", "W"]:
						color = Color(1.0, 0.6, 0.0, 0.9)
						
					var text_sz = default_font.get_string_size(label, HORIZONTAL_ALIGNMENT_CENTER, -1, font_sz)
					compass_node.draw_string(default_font, Vector2(x - text_sz.x / 2.0, size.y - 12), label, HORIZONTAL_ALIGNMENT_CENTER, -1, font_sz, color)

func _on_radar_draw() -> void:
	if not player or not is_instance_valid(player):
		return
		
	var center = Vector2(75, 75)
	var radius = 70.0
	
	# Background circle
	radar_node.draw_circle(center, radius, Color(0.02, 0.07, 0.03, 0.6))
	
	# Circular borders
	radar_node.draw_arc(center, radius, 0, TAU, 64, Color(0.0, 0.9, 0.1, 0.75), 1.5)
	radar_node.draw_arc(center, radius * 0.5, 0, TAU, 32, Color(0.0, 0.9, 0.1, 0.35), 1.0)
	
	# Coordinates crosshairs
	radar_node.draw_line(Vector2(center.x - radius, center.y), Vector2(center.x + radius, center.y), Color(0.0, 0.9, 0.1, 0.2), 1.0)
	radar_node.draw_line(Vector2(center.x, center.y - radius), Vector2(center.x, center.y + radius), Color(0.0, 0.9, 0.1, 0.2), 1.0)
	
	# Sweep radar line
	var sweep_angle = (Time.get_ticks_msec() * 0.003)
	var sweep_vector = Vector2.UP.rotated(sweep_angle) * radius
	radar_node.draw_line(center, center + sweep_vector, Color(0.0, 0.9, 0.1, 0.55), 1.5)
	
	# Player position dot (center) and view direction polygon
	radar_node.draw_circle(center, 3.5, Color(1, 1, 1, 0.95))
	var cone_pts = [
		center,
		center + Vector2(-6, -13),
		center + Vector2(6, -13)
	]
	radar_node.draw_colored_polygon(cone_pts, Color(1, 1, 1, 0.2))
	
	# Draw detected units on radar map
	var player_pos = player.global_position
	var player_rot_y = player.rotation.y
	
	var guards = get_tree().get_nodes_in_group("guards")
	var rangers = get_tree().get_nodes_in_group("rangers")
	
	var range_scale = radius / 45.0 # Max range = 45 meters
	
	for g in guards:
		if not is_instance_valid(g):
			continue
		var relative_pos = g.global_position - player_pos
		# Rotate points in inverse direction of player camera heading
		var rx = relative_pos.x * cos(player_rot_y) - relative_pos.z * sin(player_rot_y)
		var ry = relative_pos.x * sin(player_rot_y) + relative_pos.z * cos(player_rot_y)
		
		# Map X, Z coordinates to 2D UI offsets (-Z is forward/up, X is right)
		var screen_offset = Vector2(rx, ry) * range_scale
		
		if screen_offset.length() < radius:
			var color = Color(1.0, 0.0, 0.0, 0.9) # Default red for guard
			if g.get("alert_level") != null and g.alert_level < 40.0:
				color = Color(1.0, 0.7, 0.0, 0.9) # Yellow for passive patrol
				
			radar_node.draw_circle(center + screen_offset, 3.5, color)
			
	for r in rangers:
		if not is_instance_valid(r):
			continue
		var relative_pos = r.global_position - player_pos
		var rx = relative_pos.x * cos(player_rot_y) - relative_pos.z * sin(player_rot_y)
		var ry = relative_pos.x * sin(player_rot_y) + relative_pos.z * cos(player_rot_y)
		
		var screen_offset = Vector2(rx, ry) * range_scale
		if screen_offset.length() < radius:
			radar_node.draw_circle(center + screen_offset, 3.5, Color(0.0, 0.8, 1.0, 0.9)) # Cyan for support squad

func _on_scope_draw() -> void:
	if not player or not is_instance_valid(player) or player.current_zoom_state == 0:
		return
		
	var size = scope_node.size
	var center = size / 2.0
	
	# Calculate radius of sniper scope circle
	var scope_radius = min(size.x, size.y) * 0.42
	
	# Solid black outer borders
	scope_node.draw_rect(Rect2(0, 0, center.x - scope_radius, size.y), Color(0, 0, 0, 1))
	scope_node.draw_rect(Rect2(center.x + scope_radius, 0, size.x - (center.x + scope_radius), size.y), Color(0, 0, 0, 1))
	scope_node.draw_rect(Rect2(center.x - scope_radius, 0, scope_radius * 2.0, center.y - scope_radius), Color(0, 0, 0, 1))
	scope_node.draw_rect(Rect2(center.x - scope_radius, center.y + scope_radius, scope_radius * 2.0, size.y - (center.y + scope_radius)), Color(0, 0, 0, 1))
	
	# Scope ring border
	scope_node.draw_arc(center, scope_radius, 0, TAU, 128, Color(0, 0, 0, 1), 8.0)
	scope_node.draw_arc(center, scope_radius, 0, TAU, 128, Color(0.0, 0.9, 0.15, 0.4), 1.5)
	
	# Reticle crosshair cross-lines
	scope_node.draw_line(Vector2(center.x - scope_radius, center.y), Vector2(center.x + scope_radius, center.y), Color(0.0, 0.9, 0.15, 0.85), 1.0)
	scope_node.draw_line(Vector2(center.x, center.y - scope_radius), Vector2(center.x, center.y + scope_radius), Color(0.0, 0.9, 0.15, 0.85), 1.0)
	
	# Draw mil dots
	var dot_spacing = scope_radius / 8.0
	for i in range(1, 8):
		var offset = i * dot_spacing
		scope_node.draw_circle(Vector2(center.x + offset, center.y), 1.5, Color(0.0, 0.9, 0.15, 0.85))
		scope_node.draw_circle(Vector2(center.x - offset, center.y), 1.5, Color(0.0, 0.9, 0.15, 0.85))
		scope_node.draw_circle(Vector2(center.x, center.y + offset), 1.5, Color(0.0, 0.9, 0.15, 0.85))
		scope_node.draw_circle(Vector2(center.x, center.y - offset), 1.5, Color(0.0, 0.9, 0.15, 0.85))
		
	# Rangefinder values
	var aim_dist = player.current_aim_distance
	var default_font = ThemeDB.fallback_font
	var font_sz = 11
	
	var range_text = "RNG: %.1fm" % aim_dist
	var zoom_text = "ZOOM: %.1fx" % (4.0 if player.current_zoom_state == 1 else 10.0)
	var state_text = "SYS: TACTICAL_DMR"
	
	var box_w = 90
	var box_h = 20
	var box_pos = center + Vector2(-box_w / 2.0, scope_radius - 40)
	
	scope_node.draw_rect(Rect2(box_pos, Vector2(box_w, box_h)), Color(0.02, 0.06, 0.03, 0.85))
	scope_node.draw_rect(Rect2(box_pos, Vector2(box_w, box_h)), Color(0.0, 0.9, 0.15, 0.5), false, 1.0)
	scope_node.draw_string(default_font, box_pos + Vector2(6, 14), range_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_sz, Color(0.0, 0.9, 0.15, 0.95))
	
	var side_box = center + Vector2(-scope_radius + 20, -scope_radius + 25)
	scope_node.draw_string(default_font, side_box, zoom_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_sz, Color(0.0, 0.9, 0.15, 0.75))
	scope_node.draw_string(default_font, side_box + Vector2(0, 16), state_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_sz, Color(0.0, 0.9, 0.15, 0.75))

func _on_nvg_draw() -> void:
	if not player or not is_instance_valid(player) or not player.is_nvg_mode:
		return
		
	var size = nvg_node.size
	
	# Ambient green phosphor screen tint
	nvg_node.draw_rect(Rect2(Vector2.ZERO, size), Color(0.05, 0.92, 0.16, 0.16))
	
	# Scroll lines
	var line_spacing = 4.0
	var line_offset = fmod(Time.get_ticks_msec() * 0.05, line_spacing)
	var y = line_offset
	while y < size.y:
		nvg_node.draw_line(Vector2(0, y), Vector2(size.x, y), Color(0.0, 0.85, 0.1, 0.04), 1.0)
		y += line_spacing
		
	# Subtle flickering signal grain
	var generator = RandomNumberGenerator.new()
	for i in range(20):
		var rx = generator.randf_range(0, size.x)
		var ry = generator.randf_range(0, size.y)
		var rsize = generator.randf_range(1.0, 1.8)
		nvg_node.draw_circle(Vector2(rx, ry), rsize, Color(0.0, 0.9, 0.1, generator.randf_range(0.12, 0.35)))

func _on_health_changed(current: float, max_val: float) -> void:
	if health_bar:
		health_bar.value = (current / max_val) * 100.0
	if health_label:
		health_label.text = "OPERATIVE INTEGRITY: %d%%" % int(current)

func _on_stealth_changed(current: float, max_val: float) -> void:
	if stealth_bar:
		stealth_bar.value = (current / max_val) * 100.0
	if stealth_label:
		stealth_label.text = "TACTICAL COVERTNESS: %d%%" % int(current)

func _on_hostages_changed(rescued: int, total: int) -> void:
	if objective_label:
		if total > 0:
			objective_label.text = "HOSTAGES SECURED: %d / %d" % [rescued, total]
		else:
			# If no hostages, mission is to eliminate boss/recon
			objective_label.text = "OBJECTIVE: ELIMINATE RECON SNIPER & EXTRACT"

func _on_mission_completed(score: int, xp_points: int) -> void:
	# Enable mouse for HUD interaction
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	
	if debrief_panel:
		debrief_panel.visible = true
	if debrief_title:
		debrief_title.text = "🏆 MISSION SUCCESS // DECLASSIFIED TELEMETRY"
		debrief_title.add_theme_color_override("font_color", Color(0.0, 1.0, 0.5)) # Cyber green
		
	# Format stats text
	if debrief_stats and mission_manager:
		var alert_rating = "GHOST INFILTRATOR"
		if mission_manager.max_alert_level >= 90.0:
			alert_rating = "LOUD ENFORCER"
		elif mission_manager.max_alert_level >= 40.0:
			alert_rating = "SHADOW SPECIALIST"
			
		debrief_stats.text = (
			"ELAPSED TIME: %.1fs\n" +
			"PEAK ALERT LEVEL: %d%%\n" +
			"INTEL CLUES DISCOVERED: %d / %d\n" +
			"RANGER SUPPORT CASUALTIES: %d\n" +
			"COVERT RATING: %s"
		) % [
			mission_manager.elapsed_time,
			int(mission_manager.max_alert_level),
			mission_manager.discovered_clues,
			mission_manager.total_clues,
			mission_manager.ranger_casualties,
			alert_rating
		]
		
	if debrief_score:
		debrief_score.text = "FINAL SCORE: %d   |   XP GRANTED: +%d" % [score, xp_points]

func _on_mission_failed(reason: String) -> void:
	# Enable mouse for HUD interaction
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	
	if debrief_panel:
		debrief_panel.visible = true
	if debrief_title:
		debrief_title.text = "🚨 MISSION FAILED // GRID SHUTDOWN"
		debrief_title.add_theme_color_override("font_color", Color(1.0, 0.2, 0.2)) # Warning red
		
	if debrief_stats:
		debrief_stats.text = "REASON: %s\n\nAll support uplinks disconnected.\nOperative deployment aborted." % reason.to_upper()
		
	if debrief_score:
		debrief_score.text = "FINAL SCORE: 0   |   XP GRANTED: +0"

func _on_retry_pressed() -> void:
	print("🛰️ RETRYING MISSION...")
	get_tree().reload_current_scene()

func _on_exit_pressed() -> void:
	print("🛰️ RETURNING TO DEPLOYMENT BASE...")
	get_tree().change_scene_to_file("res://scenes/main_menu.tscn")

func _on_vignette_draw() -> void:
	if not vignette_node:
		return
	var size = vignette_node.size
	# Draw smooth radial vignette shadow by stacking transparent hollow polygons/borders
	var steps = 12
	for i in range(steps):
		var pct = float(i) / float(steps)
		# Calculate inset rectangle
		var width_offset = (size.x * 0.4) * pct
		var height_offset = (size.y * 0.4) * pct
		var r = Rect2(width_offset, height_offset, size.x - width_offset * 2.0, size.y - height_offset * 2.0)
		var color = Color(0.01, 0.01, 0.02, 0.07 * (pct + 0.1))
		vignette_node.draw_rect(r, color, false, 12.0)

func _on_suppressor_toggled(suppressed: bool) -> void:
	if suppressor_label:
		if suppressed:
			suppressor_label.text = "SUPPRESSOR: ATTACHED"
			suppressor_label.add_theme_color_override("font_color", Color(0.0, 0.9, 1.0, 0.85))
		else:
			suppressor_label.text = "SUPPRESSOR: DETACHED"
			suppressor_label.add_theme_color_override("font_color", Color(1.0, 0.4, 0.0, 0.9))

