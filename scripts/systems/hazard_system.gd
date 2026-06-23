class_name HazardSystem
extends RefCounted

static func spawn_poison_near_player(state: RunState) -> void:
	state.hazards.append({
		"x": state.player.x + randf_range(-55.0, 55.0),
		"y": state.player.y + randf_range(-55.0, 55.0),
		"radius": 8.0,
		"max_radius": 45.0,
		"life": 3.0,
		"grow_speed": 40.0,
		"color": GameColors.POISON,
		"damage": 12.0
	})


static func spawn_boss_hazard_ring(state: RunState) -> void:
	if state.boss == null:
		return
	var boss: Dictionary = state.boss
	for i in 10:
		var angle: float = float(i) * TAU / 10.0 + float(boss.phase_timer)
		state.hazards.append({
			"x": boss.x + cos(angle) * randf_range(80.0, 270.0),
			"y": boss.y + sin(angle) * randf_range(80.0, 240.0),
			"radius": 8.0,
			"max_radius": 34.0,
			"life": 2.5,
			"grow_speed": 55.0,
			"color": GameColors.RED,
			"damage": 18.0
		})


static func update_hazards(state: RunState, dt: float, game: Node) -> void:
	var i := state.hazards.size() - 1
	while i >= 0:
		var hazard: Dictionary = state.hazards[i]
		hazard.life -= dt
		hazard.radius = minf(hazard.max_radius, hazard.radius + hazard.grow_speed * dt)
		if CollisionUtils.circles_overlap(hazard.x, hazard.y, hazard.radius, state.player.x, state.player.y, state.player.radius):
			PlayerSystem.damage_player(state, hazard.damage, game)
		if hazard.life <= 0:
			state.hazards.remove_at(i)
		i -= 1
