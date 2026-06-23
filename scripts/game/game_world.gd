extends Node2D

var game: Node


func setup(main: Node) -> void:
	game = main


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	if game == null or game.state == null:
		return
	_draw_arena()
	var st: RunState = game.state
	if st.phase in ["combat", "boss"]:
		_draw_entities(st)
		_draw_crosshair()


func _draw_arena() -> void:
	var w := GameConstants.GAME_WIDTH
	var h := GameConstants.GAME_HEIGHT
	draw_rect(Rect2(0, 0, w, h), GameColors.BACKGROUND)
	draw_rect(Rect2(40, 60, w - 80, h - 120), GameColors.CARPET)
	draw_rect(Rect2(40, 60, w - 80, h - 120), GameColors.CARPET_LINE, false, 3.0)
	for i in range(1, 8):
		var y := 60.0 + i * (h - 120) / 8.0
		draw_line(Vector2(40, y), Vector2(w - 40, y), GameColors.CARPET_LINE, 1.0)


func _draw_entities(st: RunState) -> void:
	for hazard in st.hazards:
		draw_circle(Vector2(hazard.x, hazard.y), hazard.radius, Color(hazard.color, 0.35))
		draw_arc(Vector2(hazard.x, hazard.y), hazard.radius, 0, TAU, 32, hazard.color, 2.0)

	for bullet in st.bullets:
		draw_circle(Vector2(bullet.x, bullet.y), bullet.radius, bullet.color)

	for beam in st.beams:
		var alpha: float = clampf(float(beam.life) / float(beam.max_life), 0.0, 1.0)
		var from := Vector2(beam.x1, beam.y1)
		var to := Vector2(beam.x2, beam.y2)
		var beam_color: Color = Color(beam.color, 0.25 * alpha)
		draw_line(from, to, beam_color, float(beam.width) + 6.0)
		draw_line(from, to, Color(beam.color, 0.85 * alpha), float(beam.width))

	for enemy in st.enemies:
		draw_circle(Vector2(enemy.x, enemy.y), enemy.radius, enemy.color)
		var hp_ratio: float = float(enemy.hp) / float(enemy.max_hp)
		draw_rect(Rect2(enemy.x - 18, enemy.y - enemy.radius - 10, 36 * hp_ratio, 4), GameColors.PALE_GOLD)

	if st.boss != null:
		var boss: Dictionary = st.boss
		draw_circle(Vector2(boss.x, boss.y), boss.radius, GameColors.RED)
		var br: float = float(boss.hp) / float(boss.max_hp)
		draw_rect(Rect2(boss.x - 60, boss.y - boss.radius - 14, 120 * br, 6), GameColors.PALE_GOLD)

	for fx in st.hit_effects:
		var alpha := clampf(fx.life / fx.max_life, 0.0, 1.0)
		draw_arc(Vector2(fx.x, fx.y), fx.radius * (1.0 - alpha * 0.5), 0, TAU, 24, Color(fx.color, alpha), 2.0)

	var p := Vector2(st.player.x, st.player.y)
	draw_circle(p, st.player.radius, GameColors.PALE_GOLD)
	draw_circle(p, st.player.radius - 4, GameColors.GOLD, false, 2.0)
	var tip := p + Vector2(cos(st.player.angle), sin(st.player.angle)) * 22.0
	draw_line(p, tip, GameColors.PALE_GOLD, 3.0)


func _draw_crosshair() -> void:
	var mp := get_global_mouse_position()
	draw_line(mp + Vector2(-8, 0), mp + Vector2(8, 0), GameColors.PALE_GOLD, 1.0)
	draw_line(mp + Vector2(0, -8), mp + Vector2(0, 8), GameColors.PALE_GOLD, 1.0)
