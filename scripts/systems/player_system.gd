class_name PlayerSystem
extends RefCounted

static func handle_movement(state: RunState, dt: float, aim_pos: Vector2, dash_pressed: bool) -> void:
	var move := Vector2.ZERO
	if Input.is_key_pressed(KEY_W):
		move.y -= 1
	if Input.is_key_pressed(KEY_S):
		move.y += 1
	if Input.is_key_pressed(KEY_A):
		move.x -= 1
	if Input.is_key_pressed(KEY_D):
		move.x += 1
	if move.length() > 0:
		move = move.normalized()

	if state.dash_cooldown > 0:
		state.dash_cooldown -= dt

	if dash_pressed and state.dash_cooldown <= 0:
		state.player.x += move.x * 135.0
		state.player.y += move.y * 135.0
		state.dash_cooldown = 1.0
		state.invulnerability_timer = 0.22

	var speed: float = float(state.player["speed"]) + state.speed_bonus
	state.player.x += move.x * speed * dt
	state.player.y += move.y * speed * dt
	state.player.x = clampf(float(state.player.x), 60.0, GameConstants.GAME_WIDTH - 60.0)
	state.player.y = clampf(float(state.player.y), 70.0, GameConstants.GAME_HEIGHT - 75.0)

	if state.invulnerability_timer > 0:
		state.invulnerability_timer -= dt

	var p := Vector2(float(state.player.x), float(state.player.y))
	state.player.angle = (aim_pos - p).angle()


static func damage_player(state: RunState, amount: float, game: Node) -> void:
	if state.invulnerability_timer > 0:
		return
	state.hp -= amount
	state.invulnerability_timer = 0.55
	state.combo = 1.0
	state.combo_timer = 0.0
	if game.has_method("shake_camera"):
		game.shake_camera()
	if state.hp <= 0:
		state.hp = 0
		state.phase = "dead"
		state.objective_text = "DERROTA · F PARA REINICIAR"
