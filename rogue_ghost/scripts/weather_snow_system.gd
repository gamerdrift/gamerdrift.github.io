# ==============================================================================
# RogueGhost: Weather & Arctic Volumetric Fog Engine (Godot 4.6 GDScript)
# ==============================================================================
class_name WeatherSnowSystem
extends Node3D

@export var base_fog_density: float = 0.035
@export var wind_velocity: Vector3 = Vector3(-6.0, -4.0, 1.0)
@export var storm_intensity: float = 1.0 # 0.0 to 1.5

var elapsed_time: float = 0.0
var active_environment: WorldEnvironment = null

func _ready() -> void:
	add_to_group("weather")
	
	# Try to locate WorldEnvironment in root or parent
	var envs = get_tree().get_nodes_in_group("world_environments")
	if envs.size() > 0:
		active_environment = envs[0] as WorldEnvironment
		
	# Setup initial heavy blizzard fog settings
	_update_volumetric_fog()

func _physics_process(delta: float) -> void:
	elapsed_time += delta
	
	# Periodically modulate wind and fog density to simulate blustery storm cycles
	var wind_mod = sin(elapsed_time * 0.05) * 0.3 + 1.0
	storm_intensity = clamp(1.0 * wind_mod, 0.5, 1.5)
	
	_update_volumetric_fog()

func _update_volumetric_fog() -> void:
	if not active_environment or not active_environment.environment:
		return
		
	var env = active_environment.environment
	# Godot 4.x fog parameters adjustments
	if env.fog_enabled:
		env.fog_density = base_fog_density * storm_intensity
		
	# If Volumetric Fog is enabled on the environment
	if env.volumetric_fog_enabled:
		env.volumetric_fog_density = base_fog_density * storm_intensity
		env.volumetric_fog_emission = Color(0.7, 0.8, 0.9) # Cold ambient blue
		env.volumetric_fog_albedo = Color(0.8, 0.85, 0.9)
