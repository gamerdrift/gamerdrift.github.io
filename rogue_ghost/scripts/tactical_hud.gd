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

func _process(_delta: float) -> void:
	# Update thermal HUD overlay visibility
	if player:
		thermal_overlay.visible = player.is_thermal_mode

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
