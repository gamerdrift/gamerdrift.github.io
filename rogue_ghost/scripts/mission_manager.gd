# ==============================================================================
# RogueGhost: Mission Manager & Game State Coordinator (Godot 4.6 GDScript)
# Requires: Node3D attached as a parent/manager inside the Level scene
# ==============================================================================
class_name MissionManager
extends Node3D

# Signals
signal mission_started()
signal mission_completed(score: int, xp_points: int)
signal mission_failed(reason: String)
signal alert_level_updated(max_alert: float)

# Mission Parameters
@export var round_time_limit: float = 300.0 # 5 minutes
@export var target_exit_zone: Area3D

# Telemetry registers
var total_hostages: int = 0
var rescued_hostages: int = 0
var elapsed_time: float = 0.0
var max_alert_level: float = 0.0
var is_active: bool = false

var player: PlayerGhost = null

func _ready() -> void:
	add_to_group("managers")
	
	# Locate player and hostages in tree
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		player = players[0] as PlayerGhost
		player.health_changed.connect(_on_player_health_changed)
		
	# Find total hostages in scene
	var host_list = get_tree().get_nodes_in_group("hostages")
	total_hostages = host_list.size()
	
	# Wire exit zone if configured
	if target_exit_zone:
		target_exit_zone.body_entered.connect(_on_exit_zone_entered)
		
	# Begin mission execution
	start_mission()

func _process(delta: float) -> void:
	if not is_active:
		return
		
	# Manage mission clocks
	elapsed_time += delta
	if elapsed_time >= round_time_limit:
		_fail_mission("TIME OVER - DRIFTER LINK INTERRUPTED")
		return
		
	# Scan guards to find the highest active alert level
	var guards = get_tree().get_nodes_in_group("guards")
	var peak_alert = 0.0
	for g in guards:
		if is_instance_valid(g) and g is GuardAI:
			if g.alert_level > peak_alert:
				peak_alert = g.alert_level
				
	if peak_alert != max_alert_level:
		max_alert_level = peak_alert
		alert_level_updated.emit(max_alert_level)

func start_mission() -> void:
	elapsed_time = 0.0
	rescued_hostages = 0
	is_active = true
	mission_started.emit()
	print("🟢 Infiltration grid live. Target hostages to secure: ", total_hostages)

func record_hostage_rescue(_hostage: HostageNode) -> void:
	if not is_active:
		return
		
	rescued_hostages += 1
	print("🤝 Secured ", rescued_hostages, " / ", total_hostages, " targets.")
	
	if player:
		player.hostages_changed.emit(rescued_hostages, total_hostages)

func _on_exit_zone_entered(body: Node) -> void:
	if not is_active:
		return
		
	# Verify player entered exit portal
	if body is PlayerGhost or body.is_in_group("player"):
		if rescued_hostages >= total_hostages:
			_complete_mission()
		else:
			print("⚠️ Extraction denied. Hostages remain locked in sector.")

func _on_player_health_changed(current_health: float, _max_val: float) -> void:
	if current_health <= 0.0 and is_active:
		_fail_mission("OPERATIVE INTEGRITY DEPLETED")

func _complete_mission() -> void:
	is_active = false
	
	# Calculate score based on speed and stealth indexes
	var speed_bonus = max(0, int((round_time_limit - elapsed_time) * 10))
	var stealth_bonus = int((100.0 - max_alert_level) * 5)
	var base_score = 1000
	var final_score = base_score + speed_bonus + stealth_bonus
	
	# Reward XP points (10% of final score)
	var xp_rewarded = int(final_score * 0.1)
	
	mission_completed.emit(final_score, xp_rewarded)
	print("🏆 MISSION SUCCESSFUL! Final Score: ", final_score, " | XP: +", xp_rewarded)

func _fail_mission(reason: String) -> void:
	is_active = false
	mission_failed.emit(reason)
	print("🚨 MISSION FAILED! Reason: ", reason)
