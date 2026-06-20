# ==============================================================================
# RogueGhost: Watchtower Dynamic Searchlight Controller (Godot 4.6 GDScript)
# ==============================================================================
class_name WatchtowerSearchlight
extends SpotLight3D

@export var rotation_speed: float = 0.5
@export var sweep_angle: float = 40.0 # Degrees left/right

var base_rotation_y: float = 0.0
var elapsed: float = 0.0
var raycast: RayCast3D = null

func _ready() -> void:
	base_rotation_y = rotation.y
	
	# Instantiate RayCast3D dynamically for stealth check
	raycast = RayCast3D.new()
	add_child(raycast)
	raycast.enabled = true
	raycast.exclude_parent = true
	raycast.collide_with_bodies = true
	raycast.collide_with_areas = false

func _physics_process(delta: float) -> void:
	elapsed += delta
	
	# Sweep spotlight back and forth on a smooth sine wave
	var target_angle = sin(elapsed * rotation_speed) * deg_to_rad(sweep_angle)
	rotation.y = base_rotation_y + target_angle
	
	var spotted = false
	
	# Detect player using raycast
	if raycast:
		var players = get_tree().get_nodes_in_group("player")
		if players.size() > 0:
			var player = players[0] as PlayerGhost
			if player and player.is_active:
				# Target player's upper chest/head area
				var player_target_pos = player.global_position + Vector3.UP * 0.8
				raycast.target_position = raycast.to_local(player_target_pos)
				raycast.force_raycast_update()
				
				if raycast.is_colliding() and raycast.get_collider() == player:
					# Check if player is within spotlight cone angle
					var dir_to_player = (player_target_pos - global_position).normalized()
					var light_forward = -global_transform.basis.z
					var angle = rad_to_deg(dir_to_player.angle_to(light_forward))
					
					# spot_angle is a standard property of SpotLight3D (representing half the cone)
					if angle < spot_angle:
						spotted = true
						# Drain player stealth covertness dynamically
						player.stealth_level = max(0.0, player.stealth_level - 50.0 * delta)
						player.stealth_changed.emit(player.stealth_level, player.max_stealth)
						
						# Trigger guard alarm awareness
						var guards = get_tree().get_nodes_in_group("guards")
						for guard in guards:
							if guard.has_method("investigate_position"):
								guard.call("investigate_position", player.global_position)
	
	# Visual feed-back
	if spotted:
		light_color = Color(1.0, 0.0, 0.0) # Alarm Red
		light_energy = 8.0
	else:
		light_color = Color(1.0, 1.0, 0.9) # Pale searchlight yellow
		light_energy = 5.0
