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

# Node references
@onready var start_button: Button = $Panel/StartButton
@onready var title_label: Label = $Panel/TitleLabel

func _ready() -> void:
	# captures button press
	if start_button:
		start_button.pressed.connect(_on_start_pressed)
		
	_connect_selection_buttons()
	print("🖥️ Main Menu initialized. Ready for tactical dispatch.")

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

func select_level(lvl_path: String) -> void:
	selected_level_path = lvl_path
	print("Target Level Set: ", lvl_path)

func _connect_selection_buttons() -> void:
	# Dynamically hook buttons if they are present in hierarchy
	var pistol_btn = get_node_or_null("Panel/WeaponContainer/PistolBtn") as Button
	if pistol_btn:
		pistol_btn.pressed.connect(func(): select_weapon("Silenced Carbine"))
		
	var blade_btn = get_node_or_null("Panel/WeaponContainer/BladeBtn") as Button
	if blade_btn:
		blade_btn.pressed.connect(func(): select_weapon("Combat Blade"))
		
	var snow_btn = get_node_or_null("Panel/MissionContainer/SnowblowBtn") as Button
	if snow_btn:
		snow_btn.pressed.connect(func(): select_level("res://scenes/level_snowblow.tscn"))
