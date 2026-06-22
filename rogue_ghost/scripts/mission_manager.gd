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
var total_clues: int = 0
var discovered_clues: int = 0
var ranger_casualties: int = 0
var elapsed_time: float = 0.0
var max_alert_level: float = 0.0
var is_active: bool = false
var player: PlayerGhost = null

func _ready() -> void:
	add_to_group("managers")
	
	# Instantiate HUD dynamically
	var hud_class = load("res://scenes/tactical_hud.tscn")
	if hud_class:
		var hud = hud_class.instantiate()
		add_child(hud)
		print("🖥️ Dynamic Tactical HUD deployed.")
		
	# Locate player
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		player = players[0] as PlayerGhost
		player.health_changed.connect(_on_player_health_changed)
		
	# Find total hostages and clues
	total_hostages = get_tree().get_nodes_in_group("hostages").size()
	total_clues = get_tree().get_nodes_in_group("clues").size()
	
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
	# Play an intro cinematic if present; mission will begin afterwards
	var cine_res = load("res://scenes/intro_cinematic.tscn")
	if cine_res:
		var cine = cine_res.instantiate()
		# Add cinematic to the scene root so its camera can take control
		get_tree().root.add_child(cine)
		print("🎬 Intro cinematic launched.")
		# When cinematic finishes, start the mission proper
		if cine.has_signal("cinematic_finished"):
			cine.cinematic_finished.connect(func(): _begin_mission())
		return

	# Fallback immediate start when no cinematic exists
	_begin_mission()

func _begin_mission() -> void:
	is_active = true
	mission_started.emit()
	print("🟢 Infiltration grid live. Target hostages to secure: ", total_hostages)

func record_hostage_rescue(_hostage: HostageNode) -> void:
	if not is_active:
		return
		
	rescued_hostages += 1
	SoundManager.play("rescue")
	print("🤝 Secured ", rescued_hostages, " / ", total_hostages, " targets.")
	
	if player:
		player.hostages_changed.emit(rescued_hostages, total_hostages)

func record_clue_discovery(_clue: ClueEvidence) -> void:
	if not is_active:
		return
	discovered_clues += 1
	SoundManager.play("clue")
	print("🔍 Discovered clues: ", discovered_clues, " / ", total_clues)

func record_ranger_casualty() -> void:
	if not is_active:
		return
	ranger_casualties += 1
	print("🚨 Ranger Casualty recorded! Casualties count: ", ranger_casualties)

func _on_exit_zone_entered(body: Node) -> void:
	if not is_active:
		return
		
	# Verify player entered exit portal
	if body is PlayerGhost or body.is_in_group("player"):
		# Win check: Sniper must be eliminated
		var sniper_alive = get_tree().get_nodes_in_group("bosses").size() > 0
		if sniper_alive:
			print("⚠️ Extraction denied. The White Reaper is still tracking you in the forest!")
			return
			
		# At least one ranger must survive
		var ranger_alive = get_tree().get_nodes_in_group("rangers").size() > 0
		if not ranger_alive:
			_fail_mission("CRITICAL ERROR: ALL RANGERS KIA")
			return
			
		# Intel/Clues must be fully checked
		if discovered_clues < total_clues:
			print("⚠️ Extraction denied. Ranger distress records and sniper intelligence remain uncollected.")
			return
			
		_complete_mission()

func _on_player_health_changed(current_health: float, _max_val: float) -> void:
	if current_health <= 0.0 and is_active:
		_fail_mission("OPERATIVE INTEGRITY DEPLETED")

func _complete_mission() -> void:
	is_active = false
	SoundManager.play("victory")
	
	# Calculate score based on speed and stealth indexes
	var speed_bonus = max(0, int((round_time_limit - elapsed_time) * 10))
	var stealth_bonus = int(max(0.0, 100.0 - max_alert_level) * 5)
	
	# Optional objective: zero ranger casualties
	var casualty_multiplier = 1.0
	if ranger_casualties == 0:
		casualty_multiplier = 1.25 # 25% score boost for flawless escort
		print("⭐ Optional Objective Complete: Zero additional casualties.")
		
	var base_score = 1500 # higher base for sniper hunts
	var final_score = base_score + speed_bonus + stealth_bonus
	
	# Apply stealth multipliers
	var multiplier = 1.0
	var rating = "Stealth Operative"
	if max_alert_level == 0.0:
		multiplier = 1.50
		rating = "Ghost Infiltrator"
	elif max_alert_level < 40.0:
		multiplier = 1.20
		rating = "Shadow Specialist"
	elif max_alert_level >= 95.0:
		multiplier = 0.80
		rating = "Loud Enforcer"
		
	final_score = int(final_score * multiplier * casualty_multiplier)
	
	# Reward XP points (10% of final score)
	var xp_rewarded = int(final_score * 0.1)
	
	mission_completed.emit(final_score, xp_rewarded)
	
	print("\n==============================================")
	print("🏆 MISSION COMPLETE // DECLASSIFIED TELEMETRY")
	print("==============================================")
	print("Rating:        ", rating, " (Multiplier: ", multiplier, "x)")
	print("Casualty Mod:  ", casualty_multiplier, "x")
	print("Elapsed Time:  ", elapsed_time, "s")
	print("Clues Discovered: ", discovered_clues, " / ", total_clues)
	print("Ranger Casualties: ", ranger_casualties)
	print("Max Alert:     ", max_alert_level, "%")
	print("Base Score:    ", base_score)
	print("Speed Bonus:   ", speed_bonus)
	print("Stealth Bonus: ", stealth_bonus)
	print("----------------------------------------------")
	print("FINAL SCORE:   ", final_score, " | XP REWARD: +", xp_rewarded)
	print("==============================================\n")

func _fail_mission(reason: String) -> void:
	is_active = false
	SoundManager.play("defeat")
	mission_failed.emit(reason)
	print("🚨 MISSION FAILED! Reason: ", reason)
