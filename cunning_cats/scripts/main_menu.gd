# ==============================================================================
# CunningCats: Character & Vehicle Selection Main Menu (Godot 4.6 GDScript)
# Manages faction assignments, equipment loads, and track dispatch signals.
# ==============================================================================
class_name MainMenuController
extends Control

# Character dictionaries mapping elite cat racers
const FEMALE_RACERS = [
	{
		"name": "Nyx Viper",
		"faction": "Viper Squadron",
		"equipment": ["Desert goggles", "Tactical jacket", "Utility belt"],
		"bio": "Expert infiltrator and pilot. Excels in tight sandstorms."
	},
	{
		"name": "Sahara Fang",
		"faction": "Dune Raiders",
		"equipment": ["Tactical jacket", "Racing armor", "Camouflage accents"],
		"bio": "Desert survival specialist. Knows the Oman circuit traps."
	},
	{
		"name": "Raven Claw",
		"faction": "Blackout Syndicate",
		"equipment": ["Desert goggles", "Racing armor", "Utility belt"],
		"bio": "Tech specialist and hacker. Famous for EMP modifications."
	},
	{
		"name": "Blaze Mirage",
		"faction": "Solar Flare Faction",
		"equipment": ["Desert goggles", "Tactical jacket", "Camouflage accents"],
		"bio": "Speed runner. Specializes in nitro fuel optimization."
	}
]

const MALE_RACERS = [
	{
		"name": "Titan Paw",
		"faction": "Iron Bastion",
		"equipment": ["Armored jacket", "Racing harness", "Desert goggles"],
		"bio": "Heavyweight champion of demolition derby fights."
	},
	{
		"name": "Dust Reaper",
		"faction": "Sand Scythes",
		"equipment": ["Tactical cargo pants", "Racing harness", "Camouflage accents"],
		"bio": "Fringe racer known for aggressive flanking tactics."
	},
	{
		"name": "Iron Fang",
		"faction": "Metal Claw Vanguard",
		"equipment": ["Armored jacket", "Tactical cargo pants", "Desert goggles"],
		"bio": "Veteran defense specialist. High structural hull expert."
	},
	{
		"name": "Ghost Claw",
		"faction": "Phantom Brigade",
		"equipment": ["Tactical cargo pants", "Racing harness", "Utility belt"],
		"bio": "Ghost agent. Excels in stealth camouflage deployment."
	}
]

# Vehicle Class definitions
const VEHICLE_CLASSES = {
	"LIGHT": {
		"examples": ["Sand Fox", "Dust Runner"],
		"desc": "Fast acceleration, high steering speed, low armor.",
		"enum_val": 0
	},
	"MEDIUM": {
		"examples": ["Thunder Fang", "Coyote"],
		"desc": "Balanced velocity, traction, and structural integrity.",
		"enum_val": 1
	},
	"HEAVY": {
		"examples": ["Iron Rhino", "Bone Crusher"],
		"desc": "High top speed, maximum armor capacity, slow acceleration.",
		"enum_val": 2
	}
}

# UI Node Bindings
@onready var racer_name_label: Label = $Panel/SelectionVBox/RacerDetails/NameLabel
@onready var racer_bio_label: Label = $Panel/SelectionVBox/RacerDetails/BioLabel
@onready var equipment_label: Label = $Panel/SelectionVBox/RacerDetails/EquipmentLabel
@onready var class_button_group: ButtonGroup = $Panel/SelectionVBox/ClassSelector/HBoxContainer/LightBtn.button_group

# Current selections
var selected_racer: Dictionary = {}
var selected_class_key: String = "MEDIUM"
var selected_track: String = "dubai_circuit" # "dubai_circuit" or "oman_derby"

func _ready() -> void:
	# Set default racer Nyx Viper
	_select_racer(FEMALE_RACERS[0])
	
	# Connect UI buttons (assumed in hierarchy)
	_connect_menu_events()

func _select_racer(racer: Dictionary) -> void:
	selected_racer = racer
	if racer_name_label:
		racer_name_label.text = racer["name"] + " // " + racer["faction"].to_upper()
	if racer_bio_label:
		racer_bio_label.text = racer["bio"]
	if equipment_label:
		var equip_str = "Tactical Loadout: "
		for item in racer["equipment"]:
			equip_str += "[" + item + "] "
		equipment_label.text = equip_str

func select_class(class_key: String) -> void:
	if VEHICLE_CLASSES.has(class_key):
		selected_class_key = class_key
		print("Selected class: ", class_key, " (", VEHICLE_CLASSES[class_key]["desc"], ")")

func set_track(track_name: String) -> void:
	selected_track = track_name
	print("Target Dispatch Arena: ", track_name)

func dispatch_to_game() -> void:
	print("🛰️ DRIVER MATCHMAKING INITIATED...")
	print("Drifter Racer: ", selected_racer["name"])
	print("Vehicle Class Config: ", selected_class_key)
	print("Target Arena: ", selected_track)
	
	# In actual implementation, we load the gameplay track scene:
	# var target_scene_path = "res://scenes/" + selected_track + ".tscn"
	# get_tree().change_scene_to_file(target_scene_path)
	# And carry over settings via a Global config Autoload script.

func _connect_menu_events() -> void:
	# UI wire-ups
	var start_button = get_node_or_null("Panel/StartButton") as Button
	if start_button:
		start_button.pressed.connect(dispatch_to_game)
		
	# Setup list selections for female/male buttons
	for i in range(FEMALE_RACERS.size()):
		var f_btn = get_node_or_null("Panel/RacerVBox/Female_" + str(i)) as Button
		if f_btn:
			f_btn.pressed.connect(func(): _select_racer(FEMALE_RACERS[i]))
			
	for i in range(MALE_RACERS.size()):
		var m_btn = get_node_or_null("Panel/RacerVBox/Male_" + str(i)) as Button
		if m_btn:
			m_btn.pressed.connect(func(): _select_racer(MALE_RACERS[i]))
