class_name BeamSystem
extends RefCounted

const BEAM_START_OFFSET := 24.0
const BEAM_VISUAL_LIFE := 0.14


static func update_beams(state: RunState, dt: float) -> void:
	var i: int = state.beams.size() - 1
	while i >= 0:
		var beam: Dictionary = state.beams[i]
		beam.life -= dt
		if beam.life <= 0:
			state.beams.remove_at(i)
		i -= 1


static func fire_from_magazine(state: RunState, base_angle: float, game: Node) -> void:
	var mag: Dictionary = state.current_magazine
	var count: int = int(mag.get("projectile_count", 1))
	if count <= 1:
		_fire_beam(state, base_angle, mag, game)
		return
	var spread: float = float(mag.get("spread_radians", 0.0))
	var total_spread: float = spread * float(count - 1)
	var start_angle: float = base_angle - total_spread / 2.0
	for i in count:
		_fire_beam(state, start_angle + spread * float(i), mag, game)


static func _fire_beam(state: RunState, angle: float, mag: Dictionary, game: Node) -> void:
	var ox: float = float(state.player.x) + cos(angle) * BEAM_START_OFFSET
	var oy: float = float(state.player.y) + sin(angle) * BEAM_START_OFFSET
	var length: float = _beam_length_to_bounds(ox, oy, angle)
	var end_x: float = ox + cos(angle) * length
	var end_y: float = oy + sin(angle) * length
	var half_width: float = maxf(3.0, float(mag.get("laser_width", 6.0)) * 0.5)
	var damage: float = float(mag.get("bullet_damage", 1.0))
	var explosive: bool = bool(mag.get("explosive", false))
	var explosion_radius: float = float(mag.get("explosion_radius", 0.0))
	var missile_tokens: int = int(mag.get("missile_tokens", 0))

	_damage_along_beam(state, ox, oy, end_x, end_y, half_width, damage, explosive, explosion_radius, missile_tokens, game)

	state.beams.append({
		"x1": ox, "y1": oy,
		"x2": end_x, "y2": end_y,
		"width": half_width * 2.0,
		"color": GameColors.LASER,
		"life": BEAM_VISUAL_LIFE,
		"max_life": BEAM_VISUAL_LIFE
	})


static func _damage_along_beam(
	state: RunState,
	ox: float, oy: float, end_x: float, end_y: float,
	half_width: float,
	damage: float,
	explosive: bool,
	explosion_radius: float,
	missile_tokens: int,
	game: Node
) -> void:
	var ei: int = state.enemies.size() - 1
	while ei >= 0:
		var enemy: Dictionary = state.enemies[ei]
		if CollisionUtils.segment_circle_overlap(ox, oy, end_x, end_y, half_width, enemy.x, enemy.y, enemy.radius):
			RouletteSystem.on_successful_hit(state, game)
			enemy.hp -= damage
			game.add_hit_effect(enemy.x, enemy.y, GameColors.LASER, 20.0)
			if explosive:
				BulletSystem.explode_at(state, enemy.x, enemy.y, explosion_radius, 1.6 + missile_tokens, game)
			if enemy.hp <= 0:
				EnemySystem.kill_enemy(state, ei, game)
		ei -= 1

	if state.boss != null:
		var boss: Dictionary = state.boss
		if CollisionUtils.segment_circle_overlap(ox, oy, end_x, end_y, half_width, boss.x, boss.y, boss.radius):
			RouletteSystem.on_successful_hit(state, game)
			boss.hp -= damage
			state.score += int(floor(100.0 * state.combo))
			game.add_hit_effect(boss.x, boss.y, GameColors.LASER, 26.0)
			if explosive:
				BulletSystem.explode_at(state, boss.x, boss.y, explosion_radius, 2.5 + missile_tokens, game)
			if boss.hp <= 0:
				state.boss = null
				state.phase = "win"
				state.objective_text = "SATANÁS CAE · GANASTE LA RUN · F PARA REINICIAR"


static func _beam_length_to_bounds(ox: float, oy: float, angle: float) -> float:
	var cos_a: float = cos(angle)
	var sin_a: float = sin(angle)
	var best: float = 1600.0
	var left: float = 35.0
	var right: float = GameConstants.GAME_WIDTH - 35.0
	var top: float = 50.0
	var bottom: float = GameConstants.GAME_HEIGHT - 50.0

	if absf(cos_a) > 0.0001:
		var t_left: float = (left - ox) / cos_a
		if t_left > 0:
			best = minf(best, t_left)
		var t_right: float = (right - ox) / cos_a
		if t_right > 0:
			best = minf(best, t_right)
	if absf(sin_a) > 0.0001:
		var t_top: float = (top - oy) / sin_a
		if t_top > 0:
			best = minf(best, t_top)
		var t_bottom: float = (bottom - oy) / sin_a
		if t_bottom > 0:
			best = minf(best, t_bottom)
	return best
