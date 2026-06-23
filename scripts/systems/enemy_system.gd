class_name EnemySystem
extends RefCounted

static func spawn_wave(state: RunState, amount: int) -> void:
	for _i in amount:
		spawn_enemy(state)


static func spawn_enemy(state: RunState, forced_kind: String = "") -> void:
	var side := randi_range(0, 3)
	var x: float
	var y: float
	match side:
		0:
			x = 70.0
			y = randf_range(90.0, GameConstants.GAME_HEIGHT - 95.0)
		1:
			x = GameConstants.GAME_WIDTH - 70.0
			y = randf_range(90.0, GameConstants.GAME_HEIGHT - 95.0)
		2:
			x = randf_range(80.0, GameConstants.GAME_WIDTH - 80.0)
			y = 80.0
		_:
			x = randf_range(80.0, GameConstants.GAME_WIDTH - 80.0)
			y = GameConstants.GAME_HEIGHT - 85.0

	var should_spitter := randf() < 0.18 + minf(0.15, state.round_num * 0.005)
	var kind := forced_kind if forced_kind != "" else ("spitter" if should_spitter else "grunt")
	var round_scaling := int(floor(state.round_num / 8.0))
	var max_hp := (4 + round_scaling) if kind == "spitter" else (2 + int(floor(round_scaling / 2.0)))
	state.enemies.append({
		"id": CollisionUtils.create_id(),
		"kind": kind,
		"x": x, "y": y,
		"radius": 20.0 if kind == "spitter" else 16.0,
		"hp": float(max_hp),
		"max_hp": float(max_hp),
		"speed": 75.0 if kind == "spitter" else 95.0 + minf(45.0, state.round_num * 0.8),
		"attack_cooldown": randf_range(1.2, 2.8),
		"color": GameColors.POISON if kind == "spitter" else GameColors.ENEMY
	})


static func update_enemies(state: RunState, dt: float, game: Node) -> void:
	var p := Vector2(state.player.x, state.player.y)
	for enemy in state.enemies:
		var epos := Vector2(enemy.x, enemy.y)
		var angle := (p - epos).angle()
		enemy.x += cos(angle) * enemy.speed * dt
		enemy.y += sin(angle) * enemy.speed * dt
		enemy.attack_cooldown -= dt
		if enemy.kind == "spitter" and enemy.attack_cooldown <= 0:
			HazardSystem.spawn_poison_near_player(state)
			enemy.attack_cooldown = randf_range(2.1, 3.4)
		if CollisionUtils.circles_overlap(enemy.x, enemy.y, enemy.radius, state.player.x, state.player.y, state.player.radius):
			PlayerSystem.damage_player(state, 10.0, game)
			var push := (p - epos).angle()
			state.player.x += cos(push) * 45.0
			state.player.y += sin(push) * 45.0


static func kill_enemy(state: RunState, index: int, game: Node) -> void:
	if index < 0 or index >= state.enemies.size():
		return
	var enemy: Dictionary = state.enemies[index]
	_kill_enemy_entry(state, enemy, game)
	state.enemies.remove_at(index)


static func kill_enemy_by_id(state: RunState, enemy_id, game: Node) -> void:
	for i in state.enemies.size():
		if state.enemies[i].id == enemy_id:
			kill_enemy(state, i, game)
			return


static func _kill_enemy_entry(state: RunState, enemy: Dictionary, game: Node) -> void:
	state.kills_this_round += 1
	state.combo += 0.25
	state.combo = minf(state.combo, 30.0)
	state.combo_timer = 3.2
	var score_gain := int(floor((300.0 + state.round_num * 15.0) * state.combo))
	var chip_gain := int(floor(12.0 + state.combo * 2.0 + state.round_num * 0.15))
	state.score += score_gain
	state.chips += chip_gain
	if game.has_method("show_score_gain"):
		game.show_score_gain(score_gain)
	game.add_hit_effect(enemy.x, enemy.y, Color("#ff4420"), 28.0)
	if state.phase == "combat" and state.enemies.size() <= 4 and state.kills_this_round < state.required_kills:
		spawn_wave(state, Balance.get_reinforcement_wave_size(state.round_num))
