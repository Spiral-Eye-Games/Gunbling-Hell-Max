extends Control

var game: Node
var _font: Font


func setup(main: Node) -> void:
	game = main
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_font = GameFonts.ui_font


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	if game == null or game.state == null:
		return
	var st: RunState = game.state
	var in_combat := st.phase in ["combat", "boss"]

	draw_string(_font, Vector2(24, 18), "RONDA %d / %d" % [st.round_num, GameConstants.SATAN_ROUND], HORIZONTAL_ALIGNMENT_LEFT, 300, 18, GameColors.TEXT_GOLD)

	if st.objective_text != "":
		UiDraw.draw_centered_on_screen(self, _font, size.x, 18, st.objective_text, 900, 15, GameColors.RED)

	if in_combat and st.phase == "combat":
		UiDraw.draw_centered_on_screen(self, _font, size.x, 44, "%d / %d eliminados" % [st.kills_this_round, st.required_kills], 400, 14, GameColors.TEXT_PALE)

	if not in_combat and st.phase not in ["dead", "win"]:
		return

	if in_combat:
		_draw_combat_hud(st)


func _draw_combat_hud(st: RunState) -> void:
	var panel_x := GameConstants.GAME_WIDTH - 268
	draw_rect(Rect2(panel_x - 20, GameConstants.GAME_HEIGHT - 158, 252, 148), GameColors.PANEL)
	draw_string(_font, Vector2(panel_x, GameConstants.GAME_HEIGHT - 138), str(st.score), HORIZONTAL_ALIGNMENT_LEFT, 200, 22, GameColors.TEXT_GOLD)
	draw_string(_font, Vector2(panel_x, GameConstants.GAME_HEIGHT - 112), "PUNTUACIÓN", HORIZONTAL_ALIGNMENT_LEFT, 200, 11, Color("#888888"))
	draw_string(_font, Vector2(panel_x, GameConstants.GAME_HEIGHT - 82), "x%d" % int(floor(st.combo)), HORIZONTAL_ALIGNMENT_LEFT, 200, 22, Color("#ff7b2f"))
	draw_string(_font, Vector2(panel_x, GameConstants.GAME_HEIGHT - 56), "COMBO", HORIZONTAL_ALIGNMENT_LEFT, 200, 11, Color("#888888"))
	draw_string(_font, Vector2(panel_x, GameConstants.GAME_HEIGHT - 26), str(st.chips), HORIZONTAL_ALIGNMENT_LEFT, 200, 22, Color("#d81414"))
	draw_string(_font, Vector2(panel_x, GameConstants.GAME_HEIGHT - 48), "FICHAS", HORIZONTAL_ALIGNMENT_LEFT, 200, 11, Color("#888888"))

	draw_rect(Rect2(18, GameConstants.GAME_HEIGHT - 100, 270, 88), GameColors.PANEL)
	var hp_ratio: float = st.hp / st.max_hp
	draw_rect(Rect2(36, GameConstants.GAME_HEIGHT - 72, 220 * hp_ratio, 22), GameColors.GOLD)
	draw_string(_font, Vector2(56, GameConstants.GAME_HEIGHT - 88), "HP %d / %d" % [int(ceil(st.hp)), int(st.max_hp)], HORIZONTAL_ALIGNMENT_LEFT, 220, 14, GameColors.TEXT_PALE)

	# reel combat slots
	var slot_y := GameConstants.GAME_HEIGHT - 148
	var slot_w := 88.0
	var start_x := GameConstants.GAME_WIDTH / 2 - (slot_w * 3 + 16) / 2
	for i in 3:
		var x := start_x + i * (slot_w + 8)
		draw_rect(Rect2(x, slot_y, slot_w, 72), Color("#0a0404"))
		draw_rect(Rect2(x, slot_y, slot_w, 72), GameColors.GOLD, false, 2.0)
		var label: String = str(st.reel_results[i])
		var slot_rect := Rect2(x, slot_y, slot_w, 72)
		UiDraw.draw_in_rect(self, _font, slot_rect, label, 24, GameColors.TEXT_GOLD)

	UiDraw.draw_centered_on_screen(self, _font, size.x, size.y - 14, "WASD · Mouse · Click · Shift dash · Q ruletas", size.x, 11, GameColors.TEXT_GOLD)

	if st.phase in ["dead", "win"]:
		draw_rect(Rect2(0, 0, size.x, size.y), Color(0, 0, 0, 0.65))
		var end_title := "VICTORIA" if st.phase == "win" else "DERROTA"
		UiDraw.draw_centered_on_screen(self, _font, size.x, 310, end_title, 520, 36, GameColors.TEXT_PALE)
		UiDraw.draw_centered_on_screen(self, _font, size.x, 380, "F para reiniciar", 520, 18, GameColors.TEXT_GOLD)
