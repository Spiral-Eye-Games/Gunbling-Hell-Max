class_name BossSystem
extends RefCounted

static func start_boss_fight(state: RunState) -> void:
	state.phase = "boss"
	state.kills_this_round = 0
	state.enemies.clear()
	state.hazards.clear()
	state.bullets.clear()
	MagazineSystem.refresh_base_magazine(state)
	state.objective_text = "RONDA 66 · BOSS FINAL · SATANÁS"
	state.boss = {
		"x": GameConstants.GAME_WIDTH / 2.0,
		"y": 150.0,
		"radius": 50.0,
		"hp": 900.0,
		"max_hp": 900.0,
		"attack_cooldown": 1.5,
		"phase_timer": 0.0
	}


static func update_boss(state: RunState, dt: float, game: Node) -> void:
	if state.boss == null:
		return
	var boss: Dictionary = state.boss
	boss.phase_timer += dt
	boss.attack_cooldown -= dt
	var p := Vector2(state.player.x, state.player.y)
	var bpos := Vector2(boss.x, boss.y)
	var angle := (p - bpos).angle()
	boss.x += cos(angle) * 38.0 * dt
	boss.y += sin(angle) * 38.0 * dt
	if boss.attack_cooldown <= 0:
		HazardSystem.spawn_boss_hazard_ring(state)
		boss.attack_cooldown = 1.8
	if CollisionUtils.circles_overlap(boss.x, boss.y, boss.radius, state.player.x, state.player.y, state.player.radius):
		PlayerSystem.damage_player(state, 18.0, game)
