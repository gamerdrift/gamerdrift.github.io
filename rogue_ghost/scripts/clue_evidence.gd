# ==============================================================================
# RogueGhost: Interactive Clue & Evidence Node (Godot 4.6 GDScript)
# ==============================================================================
class_name ClueEvidence
extends Area3D

@export var clue_id: String = "shell_casing"
@export var clue_description: String = "Spent 7.62x54mm rifle casing"
@export var radar_marker_reveal: Vector3

var is_collected: bool = false

func _ready() -> void:
	add_to_group("clues")
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if is_collected:
		return
		
	if body is PlayerGhost or body.is_in_group("player"):
		_collect_clue()

func _collect_clue() -> void:
	is_collected = true
	print("🔍 [EVIDENCE SECURED] Discovered: ", clue_description)
	
	# Trigger dialogues / logs
	match clue_id:
		"shell_casing":
			print("🎙️ Rogue Ghost: 'Spent casing. Warm. Muzzle signature matches caliber used in Ranger convoy ambush.'")
		"broken_branches":
			print("🎙️ Rogue Ghost: 'Freshly broken pine branches. Heavy sniper equipment dragged through here.'")
		"boot_prints":
			print("🎙️ Rogue Ghost: 'Vibram winter boot sole mark. Moving towards the higher rocky ridge north.'")
			
	# Update Mission Manager objectives
	var managers = get_tree().get_nodes_in_group("managers")
	if managers.size() > 0:
		var m = managers[0] as MissionManager
		if m.has_method("record_clue_discovery"):
			m.record_clue_discovery(self)
			
	# Remove clue from world
	queue_free()
