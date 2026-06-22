extends Node3D
class_name GraphicsAgent

@export var enable_high_definition: bool = true
@export var reflection_probe_extents: Vector3 = Vector3(80.0, 24.0, 80.0)
@export var reflection_probe_intensity: float = 1.2
@export var dof_distance: float = 22.0
@export var dof_transition: float = 10.0
@export var dof_amount: float = 0.38

func _ready() -> void:
    if not enable_high_definition:
        return

    _apply_environment_preset()
    _spawn_reflection_probe()
    _upgrade_scene_lighting()
    _upgrade_character_materials()
    _upgrade_weapon_visuals()

func _apply_environment_preset() -> void:
    var env_nodes = get_tree().get_nodes_in_group("world_environments")
    if env_nodes.size() == 0:
        return

    var env_node = env_nodes[0] as WorldEnvironment
    if not env_node or not env_node.environment:
        return

    var env = env_node.environment
    env.background_mode = Environment.BG_MODE_COLOR
    env.background_color = Color(0.04, 0.05, 0.07, 1)
    env.tonemap_mode = Environment.TONEMAP_FILMIC
    env.tonemap_exposure = 1.05
    env.tonemap_white = 1.0
    env.ambient_light_energy = 0.45
    env.ambient_light_color = Color(0.35, 0.38, 0.43)

    env.glow_enabled = true
    env.glow_intensity = 1.3
    env.glow_strength = 1.8
    env.glow_bloom = 0.26
    env.glow_blend_mode = Environment.GLOW_BLEND_MODE_SOFTLIGHT

    if env.has_property("motion_blur_enabled"):
        env.motion_blur_enabled = true
        env.motion_blur_amount = 0.18
        env.motion_blur_quality = 3

    if env.has_property("vignette_enabled"):
        env.vignette_enabled = true
        env.vignette_energy = 0.42

    if env.has_property("grain_enabled"):
        env.grain_enabled = true
        env.grain_amount = 0.08
        env.grain_scale = 1.8

    if env.has_property("contrast"):
        env.contrast = max(env.contrast, 1.12)

    env.ssao_enabled = true
    env.ssao_radius = 1.1
    env.ssao_intensity = 2.7
    env.ssao_power = 1.6

    env.fog_enabled = true
    env.fog_density = max(env.fog_density, 0.03)
    env.fog_light_color = Color(0.06, 0.08, 0.1, 1)
    env.volumetric_fog_enabled = true
    env.volumetric_fog_density = max(env.volumetric_fog_density, 0.03)
    env.volumetric_fog_albedo = Color(0.10, 0.12, 0.16, 1)
    env.volumetric_fog_emission = Color(0.01, 0.02, 0.04, 1)
    env.volumetric_fog_gi_inject = max(env.volumetric_fog_gi_inject, 1.5)

    if env.has_property("ssr_enabled"):
        env.ssr_enabled = true
        env.ssr_max_roughness = 0.78
        env.ssr_quality = 2

    if env.has_property("dof_blur_far_enabled"):
        env.dof_blur_far_enabled = true
        env.dof_blur_far_distance = dof_distance
        env.dof_blur_far_transition = dof_transition
        env.dof_blur_far_amount = dof_amount

func _spawn_reflection_probe() -> void:
    if has_node("GraphicsReflectionProbe"):
        return

    var probe = ReflectionProbe3D.new()
    probe.name = "GraphicsReflectionProbe"
    probe.extents = reflection_probe_extents
    probe.intensity = reflection_probe_intensity
    probe.dynamic_range = 6.0
    probe.cull_mask = 1
    probe.update_mode = ReflectionProbe3D.UPDATE_ALWAYS
    probe.interior_ambient = 0.7
    add_child(probe)

func _upgrade_scene_lighting() -> void:
    var root = get_tree().get_root()
    _apply_lighting_improvements(root)

func _apply_lighting_improvements(node: Node) -> void:
    if node is DirectionalLight3D:
        node.light_energy = max(node.light_energy, 1.0)
        node.shadow_enabled = true
        node.shadow_bias = 0.02
        node.shadow_normal_bias = 0.3
        node.shadow_max_distance = 90.0
        node.light_affects_transparent = true
    elif node is SpotLight3D:
        node.light_energy = max(node.light_energy, 4.0)
        node.shadow_enabled = true
        node.shadow_bias = 0.03
        node.shadow_normal_bias = 0.4
        node.spot_angle = min(node.spot_angle, 60.0)
    elif node is OmniLight3D:
        node.light_energy = max(node.light_energy, 2.0)
        node.shadow_enabled = true
        node.shadow_bias = 0.03
        node.shadow_normal_bias = 0.4

    for child in node.get_children():
        if child is Node:
            _apply_lighting_improvements(child)

func _upgrade_character_materials() -> void:
    for group_name in ["player", "guards", "bosses", "rangers"]:
        var group_nodes = get_tree().get_nodes_in_group(group_name)
        for node in group_nodes:
            if node is Node3D:
                _apply_material_improvements(node)

func _upgrade_weapon_visuals() -> void:
    for weapon_name in ["CarbineRifle", "M16", "AK_Receiver", "AK_Stock", "Reaper_RifleReceiver"]:
        var weapon_node = get_node_or_null("//" + weapon_name)
        if weapon_node and weapon_node is MeshInstance3D:
            _apply_mesh_fidelity(weapon_node)

func _apply_material_improvements(node: Node) -> void:
    if node is MeshInstance3D:
        var material = node.get_active_material(0)
        if material and material is StandardMaterial3D:
            material.roughness = clamp(material.roughness * 0.65, 0.1, 0.9)
            material.metallic = clamp(material.metallic + 0.18, 0.0, 1.0)
            material.clearcoat = max(material.clearcoat, 0.08)
            material.anisotropy = clamp(material.anisotropy + 0.15, 0.0, 1.0)
            if material.albedo_color.a < 1.0:
                material.unshaded = false
            node.material_override = material

    for child in node.get_children():
        _apply_material_improvements(child)

func _apply_mesh_fidelity(mesh_instance: MeshInstance3D) -> void:
    var mesh = mesh_instance.mesh
    if mesh is ArrayMesh:
        return
    if mesh is CylinderMesh:
        mesh.radial_segments = max(mesh.radial_segments, 24)
        mesh.rings = max(mesh.rings, 4)
    elif mesh is SphereMesh:
        mesh.radial_segments = max(mesh.radial_segments, 32)
        mesh.rings = max(mesh.rings, 16)
    elif mesh is CapsuleMesh:
        mesh.radial_segments = max(mesh.radial_segments, 24)
        mesh.rings = max(mesh.rings, 12)

    mesh_instance.mesh = mesh
