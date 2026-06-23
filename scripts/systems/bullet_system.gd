class_name BulletSystem
extends RefCounted

static func update_bullets(state: RunState, dt: float, game: Node) -> void:
	var i := state.bullets.size() - 1
	while i >= 0:
		var bullet: Dictionary = state.bullets[i]
		bullet.x += bullet.vx * dt
		bullet.y += bullet.vy * dt
		bullet.life -= dt
		var oob: bool = bullet.life <= 0 or bullet.x < 35 or bullet.x > GameConstants.GAME_WIDTH - 35 or bullet.y < 50 or bullet.y > GameConstants.GAME_HEIGHT - 50
		if oob:
			state.bullets.remove_at(i)
			i -= 1
			continue
		if _try_hit_enemies(state, bullet, i, game):
			i -= 1
			continue
		_try_hit_boss(state, bullet, i, game)
		i -= 1


static func _try_hit_enemies(state: RunState, bullet: Dictionary, bullet_index: int, game: Node) -> bool:
	var ei := state.enemies.size() - 1
	while ei >= 0:
		var enemy: Dictionary = state.enemies[ei]
		if bullet.already_hit.has(enemy.id):
			ei -= 1
			continue
		if CollisionUtils.circles_overlap(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.radius):
			bullet.already_hit[enemy.id] = true
			RouletteSystem.on_successful_hit(state, game)
			enemy.hp -= bullet.damage
			game.add_hit_effect(enemy.x, enemy.y, bullet.color, 16.0)
			var enemy_id = enemy.id
			if bullet.explosive:
				var missile_tokens: int = int(state.current_magazine.get("missile_tokens", 0))
				explode_at(state, bullet.x, bullet.y, bullet.explosion_radius, 1.6 + missile_tokens, game)
			if enemy.hp <= 0:
				EnemySystem.kill_enemy_by_id(state, enemy_id, game)
			state.bullets.remove_at(bullet_index)
			return true
		ei -= 1
	return false


static func _try_hit_boss(state: RunState, bullet: Dictionary, bullet_index: int, game: Node) -> void:
	if state.boss == null:
		return
	if bullet.already_hit.has("boss"):
		return
	var boss: Dictionary = state.boss
	if not CollisionUtils.circles_overlap(bullet.x, bullet.y, bullet.radius, boss.x, boss.y, boss.radius):
		return
	bullet.already_hit["boss"] = true
	RouletteSystem.on_successful_hit(state, game)
	boss.hp -= bullet.damage
	state.score += int(floor(100.0 * state.combo))
	game.add_hit_effect(boss.x, boss.y, bullet.color, 22.0)
	if bullet.explosive:
		var missile_tokens: int = int(state.current_magazine.get("missile_tokens", 0))
		explode_at(state, bullet.x, bullet.y, bullet.explosion_radius, 2.5 + missile_tokens, game)
	state.bullets.remove_at(bullet_index)
	if boss.hp <= 0:
		state.boss = null
		state.phase = "win"
		state.objective_text = "SATANÁS CAE · GANASTE LA RUN · F PARA REINICIAR"


static func explode_at(state: RunState, x: float, y: float, radius: float, damage: float, game: Node) -> void:
	game.add_hit_effect(x, y, GameColors.MISSILE, radius)
	var ei := state.enemies.size() - 1
	while ei >= 0:
		var enemy: Dictionary = state.enemies[ei]
		if CollisionUtils.circles_overlap(x, y, radius, enemy.x, enemy.y, enemy.radius):
			enemy.hp -= damage
			if enemy.hp <= 0:
				EnemySystem.kill_enemy(state, ei, game)
		ei -= 1
	if state.boss != null:
		var boss: Dictionary = state.boss
		if CollisionUtils.circles_overlap(x, y, radius, boss.x, boss.y, boss.radius):
			boss.hp -= damage
