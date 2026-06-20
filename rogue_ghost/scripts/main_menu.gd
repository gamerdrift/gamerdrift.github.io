# ==============================================================================
# RogueGhost: Main Menu UI Control (Godot 4.6 GDScript)
# Requires: Control as the root node of the Main Menu scene
# Supports 3 missions: Snowblow, Desert Storm, Night Ops
# ==============================================================================
class_name RogueGhostMainMenu
extends Control

# Exported properties
@export var default_level: String = "res://scenes/level_snowblow.tscn"

# Mission registry
const MISSIONS: Dictionary = {
	"snowblow": {
		"path": "res://scenes/level_snowblow.tscn",
		"label": "MISSION 01: SNOWBLOW // ARCTIC EXTRACTION",
		"subtitle": "Breach arctic outpost. Neutralise The White Reaper. Extract Rangers."
	},
	"desert": {
		"path": "res://scenes/level_desertstorm.tscn",
		"label": "MISSION 02: DESERT STORM // SAND SECTOR BREACH",
		"subtitle": "Infiltrate desert ruins. Secure hostages. Outmanoeuvre sandstorm patrols."
	},
	"night": {
		"path": "res://scenes/level_nightops.tscn",
		"label": "MISSION 03: NIGHT OPS // MIDNIGHT INFILTRATION",
		"subtitle": "Navigate total darkness. Use Thermal Goggles [T]. Silence the outpost."
	}
}

# UI variables
var selected_weapon: String = "Silenced Carbine"
var selected_level_path: String = "res://scenes/level_snowblow.tscn"
var selected_mission_key: String = "snowblow"
var pulse_time: float = 0.0

# Node references
@onready var start_button: Button = $Panel/HUDPanel/StartButton
@onready var title_label: Label = $Panel/HUDPanel/TitleLabel

# 3D Preview Node references
@onready var preview_soldier: Node3D = $Panel/ViewportContainer/SubViewport/PreviewSoldier
@onready var preview_rifle: MeshInstance3D = $Panel/ViewportContainer/SubViewport/PreviewSoldier/PreviewRifle
@onready var preview_blade: MeshInstance3D = $Panel/ViewportContainer/SubViewport/PreviewSoldier/PreviewBlade

func _ready() -> void:
	# Check command line arguments to bypass menu and launch directly
	var args = OS.get_cmdline_args()
	print("OS Args: ", args)
	var auto_launch = false
	for arg in args:
		var mission_name = ""
		if arg.begins_with("--mission="):
			mission_name = arg.split("=")[1]
		elif arg == "--mission" and args.find(arg) + 1 < args.size():
			mission_name = args[args.find(arg) + 1]

		if mission_name != "" and MISSIONS.has(mission_name):
			if mission_name == "snowblow":
				selected_mission_key = mission_name
				selected_level_path = MISSIONS[mission_name]["path"]
				auto_launch = true
				break
			else:
				print("⚠️ Blocked auto-launching locked mission: ", mission_name, ". Falling back to menu.")

	if auto_launch:
		print("🚀 Auto-launching mission directly: ", selected_level_path)
		var err = get_tree().change_scene_to_file(selected_level_path)
		if err == OK:
			return # Avoid setting up menu if redirecting

	# Wire start button
	if start_button:
		start_button.pressed.connect(_on_start_pressed)

	_connect_selection_buttons()

	# Apply initial mission label
	_apply_mission_highlight(selected_mission_key)

	# Initial weapon select state
	select_weapon("Silenced Carbine")
	print("🖥️ Main Menu initialized. Ready for tactical dispatch.")

func _process(delta: float) -> void:
	# Rotate the 3D preview model
	if preview_soldier:
		preview_soldier.rotate_y(delta * 0.5)

	# Pulsing radar beacons on tactical map overlay
	pulse_time += delta * 6.0
	var pulse_alpha = (sin(pulse_time) + 1.0) * 0.45 + 0.1

	var op_spawn = get_node_or_null("Panel/HUDPanel/TacticalMap/OperativeSpawn") as ColorRect
	if op_spawn:
		op_spawn.color.a = pulse_alpha

	var hostage_1 = get_node_or_null("Panel/HUDPanel/TacticalMap/Hostage1") as ColorRect
	if hostage_1:
		hostage_1.color.a = pulse_alpha

	var hostage_2 = get_node_or_null("Panel/HUDPanel/TacticalMap/Hostage2") as ColorRect
	if hostage_2:
		hostage_2.color.a = pulse_alpha

func _on_start_pressed() -> void:
	print("🛰️ INITIATING DISPATCH SEQUENCE...")
	print("Selected Loadout: ", selected_weapon)
	print("Deploying Sector: ", selected_level_path)

	# Load target level
	var err = get_tree().change_scene_to_file(selected_level_path)
	if err != OK:
		push_error("MainMenu: Failed to load target scene. Error code: " + str(err))

func select_weapon(wpn_name: String) -> void:
	selected_weapon = wpn_name
	print("Weapon Selected: ", wpn_name)

	# Update 3D preview visibility
	if preview_rifle and preview_blade:
		if wpn_name == "Silenced Carbine":
			preview_rifle.visible = true
			preview_blade.visible = false
		else:
			preview_rifle.visible = false
			preview_blade.visible = true

func select_level(mission_key: String) -> void:
	if not MISSIONS.has(mission_key):
		return
	selected_mission_key = mission_key
	selected_level_path = MISSIONS[mission_key]["path"]
	_apply_mission_highlight(mission_key)
	print("Target Level Set: ", selected_level_path)

func _apply_mission_highlight(mission_key: String) -> void:
	# Update the Subtitle label with mission brief text
	var subtitle_lbl = get_node_or_null("Panel/HUDPanel/Subtitle") as Label
	if subtitle_lbl and MISSIONS.has(mission_key):
		if mission_key == "snowblow":
			subtitle_lbl.text = MISSIONS[mission_key]["subtitle"]
		else:
			subtitle_lbl.text = "🚨 CLASSIFIED OUTPOST // COMING SOON - MISSION SECTOR ACCESS RESTRICTED"

	# Update the TitleLabel with mission name
	if title_label and MISSIONS.has(mission_key):
		if mission_key == "snowblow":
			title_label.text = MISSIONS[mission_key]["label"]
		else:
			title_label.text = MISSIONS[mission_key]["label"] + " [COMING SOON]"

	# Enable/Disable start button based on playability
	if start_button:
		if mission_key == "snowblow":
			start_button.disabled = false
			start_button.text = "DEPLOY OPERATIVE"
		else:
			start_button.disabled = true
			start_button.text = "LOCKED"

	# Highlight the selected mission button, dim others
	var mission_buttons = {
		"snowblow": get_node_or_null("Panel/HUDPanel/MissionContainer/SnowblowBtn") as Button,
		"desert": get_node_or_null("Panel/HUDPanel/MissionContainer/DesertBtn") as Button,
		"night": get_node_or_null("Panel/HUDPanel/MissionContainer/NightBtn") as Button
	}
	for key in mission_buttons:
		var btn = mission_buttons[key]
		if btn:
			var mod = Color(1.0, 0.8, 0.0, 1.0) if key == mission_key else Color(0.6, 0.6, 0.65, 1.0)
			btn.modulate = mod

func _connect_selection_buttons() -> void:
	# Weapon buttons
	var pistol_btn = get_node_or_null("Panel/HUDPanel/WeaponContainer/PistolBtn") as Button
	if pistol_btn:
		pistol_btn.pressed.connect(func(): select_weapon("Silenced Carbine"))

	var blade_btn = get_node_or_null("Panel/HUDPanel/WeaponContainer/BladeBtn") as Button
	if blade_btn:
		blade_btn.pressed.connect(func(): select_weapon("Combat Blade"))

	# Mission buttons — all three sectors
	var snow_btn = get_node_or_null("Panel/HUDPanel/MissionContainer/SnowblowBtn") as Button
	if snow_btn:
		snow_btn.pressed.connect(func(): select_level("snowblow"))

	var desert_btn = get_node_or_null("Panel/HUDPanel/MissionContainer/DesertBtn") as Button
	if desert_btn:
		desert_btn.pressed.connect(func(): select_level("desert"))

	var night_btn = get_node_or_null("Panel/HUDPanel/MissionContainer/NightBtn") as Button
	if night_btn:
		night_btn.pressed.connect(func(): select_level("night"))
