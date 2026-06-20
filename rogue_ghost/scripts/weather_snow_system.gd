# ==============================================================================
# RogueGhost: Multi-Environment Weather & Fog Engine (Godot 4.6 GDScript)
# Dynamically simulates blizzards, sandstorms, and night vision goggles visibility.
# ==============================================================================
class_name WeatherSnowSystem
extends Node3D

enum EnvType { ARCTIC, DESERT, NIGHT }

@export var environment_type: EnvType = EnvType.ARCTIC
@export var base_fog_density: float = 0.035
@export var wind_velocity: Vector3 = Vector3(-6.0, -4.0, 1.0)
@export var storm_intensity: float = 1.0 # 0.5 to 1.5

var elapsed_time: float = 0.0
var active_environment: WorldEnvironment = null
var player: PlayerGhost = null

func _ready() -> void:
	add_to_group("weather")
	
	# Locate WorldEnvironment
	var envs = get_tree().get_nodes_in_group("world_environments")
	if envs.size() > 0:
		active_environment = envs[0] as WorldEnvironment
		
	# Find player to monitor thermal vision goggles state
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		player = players[0] as PlayerGhost
		
	_update_volumetric_fog()

func _physics_process(delta: float) -> void:
	elapsed_time += delta
	
	# Simulates wind/storm cycles
	var cycle_speed = 0.05
	if environment_type == EnvType.DESERT:
		cycle_speed = 0.08 # faster sandstorm shifts
	var wind_mod = sin(elapsed_time * cycle_speed) * 0.35 + 1.0
	storm_intensity = clamp(1.0 * wind_mod, 0.5, 1.6)
	
	# Periodically play dynamic weather sound (simulated wind/storm volume)
	# SoundManager can just handle play, but we focus on rendering updates here
	
	_update_volumetric_fog()

func _update_volumetric_fog() -> void:
	if not active_environment or not active_environment.environment:
		return
		
	var env = active_environment.environment
	
	# Check if thermal vision is currently active
	var thermal_active = player and player.is_active and player.is_thermal_mode
	
	match environment_type:
		EnvType.ARCTIC:
			if thermal_active:
				if env.fog_enabled:
					env.fog_light_color = Color(0.0, 0.8, 0.3)
					env.fog_density = base_fog_density * 0.4
				if env.volumetric_fog_enabled:
					env.volumetric_fog_density = base_fog_density * 0.4
					env.volumetric_fog_emission = Color(0.0, 0.4, 0.15)
					env.volumetric_fog_albedo = Color(0.0, 0.8, 0.3)
			else:
				if env.fog_enabled:
					env.fog_light_color = Color(0.12, 0.14, 0.18)
					env.fog_density = base_fog_density * storm_intensity
				if env.volumetric_fog_enabled:
					env.volumetric_fog_density = base_fog_density * storm_intensity
					env.volumetric_fog_emission = Color(0.15, 0.2, 0.25)
					env.volumetric_fog_albedo = Color(0.12, 0.14, 0.18)
				
		EnvType.DESERT:
			if env.fog_enabled:
				env.fog_light_color = Color(0.65, 0.52, 0.38) # Dusty orange-brown
				env.fog_density = (base_fog_density * 1.5) * storm_intensity # denser sandstorm
			if env.volumetric_fog_enabled:
				env.volumetric_fog_density = (base_fog_density * 1.5) * storm_intensity
				env.volumetric_fog_emission = Color(0.5, 0.38, 0.22) # Warm sand glow
				env.volumetric_fog_albedo = Color(0.65, 0.52, 0.38)
				
		EnvType.NIGHT:
			# Night ops visibility dynamics
			if thermal_active:
				# Thermal Goggles clear the fog slightly and turn it bright cyber-green
				if env.fog_enabled:
					env.fog_light_color = Color(0.0, 0.8, 0.3)
					env.fog_density = base_fog_density * 0.4 # clearer vision in thermal!
				if env.volumetric_fog_enabled:
					env.volumetric_fog_density = base_fog_density * 0.4
					env.volumetric_fog_emission = Color(0.0, 0.4, 0.15)
					env.volumetric_fog_albedo = Color(0.0, 0.8, 0.3)
			else:
				# Dark forest night shadows
				if env.fog_enabled:
					env.fog_light_color = Color(0.02, 0.04, 0.08) # Midnight blue-black
					env.fog_density = base_fog_density * 1.2
				if env.volumetric_fog_enabled:
					env.volumetric_fog_density = base_fog_density * 1.2
					env.volumetric_fog_emission = Color(0.01, 0.02, 0.05)
					env.volumetric_fog_albedo = Color(0.02, 0.04, 0.08)
