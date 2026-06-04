# ==============================================================================
# CunningCats: Game Manager (Godot 4.6 GDScript)
# Manages round telemetry, checkpoints, lap counts, and demolition scoring.
# ==============================================================================
class_name GameManager
extends Node

# Signals
signal game_started()
signal lap_completed(driver: VehicleController, lap: int)
signal driver_eliminated(driver: VehicleController)
signal scoreboard_updated(scores: Dictionary)
signal game_over(winner_name: String, total_xp: int)

# Enums
enum GameMode { CIRCUIT, DERBY }

# Exported Configuration
@export var selected_mode: GameMode = GameMode.CIRCUIT
@export var total_laps_required: int = 3
@export var round_time_limit: float = 180.0 # 3 minutes

# Telemetry registers
var active_drivers: Array[VehicleController] = []
var driver_laps: Dictionary = {} # Key: VehicleController, Value: int
var driver_scores: Dictionary = {} # Key: VehicleController, Value: int (Derby points/kills)
var current_time: float = 0.0
var is_game_active: bool = false

func _ready() -> void:
	# Add vehicles currently in the scene to the active tracking array
	var vehicles = get_tree().get_nodes_in_group("vehicles")
	for v in vehicles:
		if v is VehicleController:
			register_driver(v)
			
	start_game()

func _process(delta: float) -> void:
	if not is_game_active:
		return
		
	# Manage round timer
	current_time -= delta
	if current_time <= 0.0:
		_end_game("TIME EXPIRED - SECURE SHUTDOWN")

func start_game() -> void:
	current_time = round_time_limit
	is_game_active = true
	game_started.emit()
	print("🟢 Match Commenced! Mode: ", GameMode.keys()[selected_mode])

func register_driver(driver: VehicleController) -> void:
	if not active_drivers.has(driver):
		active_drivers.append(driver)
		driver_laps[driver] = 0
		driver_scores[driver] = 0
		
		# Connect to vehicle destruction/elimination
		driver.armor_depleted.connect(func():
			_on_driver_eliminated(driver)
		)

func checkpoint_passed(driver: VehicleController, checkpoint_idx: int, total_checkpoints: int) -> void:
	if not is_game_active:
		return
		
	# If driver passes checkpoint 0 after completing others, increment lap
	# Simple lap logic: if checkpoint_idx == 0, check if we passed last checkpoint
	if checkpoint_idx == 0:
		var current_lap = driver_laps.get(driver, 0)
		current_lap += 1
		driver_laps[driver] = current_lap
		lap_completed.emit(driver, current_lap)
		print("🏁 Driver ", driver.name, " completed lap ", current_lap)
		
		if selected_mode == GameMode.CIRCUIT and current_lap >= total_laps_required:
			_end_game(driver.name + " WINS THE GRAND PRIX!")

func record_kill(attacker: VehicleController, victim: VehicleController) -> void:
	if not is_game_active:
		return
		
	if attacker && attacker != victim:
		var current_score = driver_scores.get(attacker, 0)
		current_score += 100 # 100 points per demolition kill
		driver_scores[attacker] = current_score
		scoreboard_updated.emit(driver_scores)
		print("💥 Attacker ", attacker.name, " demolished ", victim.name, "! Score: ", current_score)

func _on_driver_eliminated(driver: VehicleController) -> void:
	print("💀 Driver ", driver.name, " was eliminated!")
	driver_eliminated.emit(driver)
	
	if active_drivers.has(driver):
		active_drivers.erase(driver)

	# Check game over conditions
	if selected_mode == GameMode.DERBY:
		# If only 1 driver survives, they win
		if active_drivers.size() == 1:
			_end_game(active_drivers[0].name + " SURVIVED THE DERBY!")
		elif active_drivers.size() == 0:
			_end_game("ALL DRIVERS DEMOLISHED - TIE")
	else:
		# In circuit mode, if the player is eliminated, game over
		if not driver.is_ai:
			_end_game("PLAYER ELIMINATED - TRANSMISSION FAILED")

func _end_game(outcome_message: String) -> void:
	is_game_active = false
	
	# Calculate XP points to reward to the player
	# Find player controller
	var player: VehicleController = null
	for d in driver_laps.keys():
		if is_instance_valid(d) and not d.is_ai:
			player = d
			break
			
	var rewarded_xp = 0
	if player:
		# Points based on laps completed, derby score, and survival
		var laps = driver_laps.get(player, 0)
		var score = driver_scores.get(player, 0)
		var survival_bonus = 200 if active_drivers.has(player) else 50
		rewarded_xp = (laps * 150) + score + survival_bonus
		
	game_over.emit(outcome_message, rewarded_xp)
	print("🛑 Game Over! Result: ", outcome_message, " | Player XP Accrued: ", rewarded_xp)
