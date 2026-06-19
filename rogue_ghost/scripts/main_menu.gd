# ==============================================================================
# RogueGhost: Main Menu UI Control (Godot 4.6 GDScript)
# Requires: Control as the root node of the Main Menu scene
# ==============================================================================
class_name RogueGhostMainMenu
extends Control

# Exported properties
@export var default_level: String = "res://scenes/level_snowblow.tscn"

# UI variables
var selected_weapon: String = "Silenced Carbine"
var selected_level_path: String = "res://scenes/level_snowblow.tscn"
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
		if arg.begins_with("--mission="):
			var mission_name = arg.split("=")[1]
			if mission_name == "snowblow":
				selected_level_path = "res://scenes/level_snowblow.tscn"
				auto_launch = true
		elif arg == "--mission" and args.find(arg) + 1 < args.size():
			var idx = args.find(arg)
			var mission_name = args[idx + 1]
			if mission_name == "snowblow":
				selected_level_path = "res://scenes/level_snowblow.tscn"
				auto_launch = true

	if auto_launch:
		print("🚀 Auto-launching mission directly: ", selected_level_path)
		var err = get_tree().change_scene_to_file(selected_level_path)
		if err == OK:
			return # Avoid setting up menu if redirecting

	# captures button press
	if start_button:
		start_button.pressed.connect(_on_start_pressed)
		
	_connect_selection_buttons()
	
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

func select_level(lvl_path: String) -> void:
	selected_level_path = lvl_path
	print("Target Level Set: ", lvl_path)

func _connect_selection_buttons() -> void:
	# Dynamically hook buttons based on new path bindings
	var pistol_btn = get_node_or_null("Panel/HUDPanel/WeaponContainer/PistolBtn") as Button
	if pistol_btn:
		pistol_btn.pressed.connect(func(): select_weapon("Silenced Carbine"))
		
	var blade_btn = get_node_or_null("Panel/HUDPanel/WeaponContainer/BladeBtn") as Button
	if blade_btn:
		blade_btn.pressed.connect(func(): select_weapon("Combat Blade"))
		
	var snow_btn = get_node_or_null("Panel/HUDPanel/MissionContainer/SnowblowBtn") as Button
	if snow_btn:
		snow_btn.pressed.connect(func(): select_level("res://scenes/level_snowblow.tscn"))
