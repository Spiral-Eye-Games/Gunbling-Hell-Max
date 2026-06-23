extends Control

var game: Node
var _font: Font
var collapsed := true


func setup(main: Node) -> void:
	game = main
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_font = GameFonts.ui_font


func _process(_delta: float) -> void:
	queue_redraw()


func should_show() -> bool:
	if game == null or game.state == null:
		return false
	var st: RunState = game.state
	if st.phase in ["shop", "initialShop"] or st.placing_token != null:
		return true
	if st.phase in ["combat", "boss"] and not collapsed:
		return true
	return false


func _draw() -> void:
	if not should_show():
		return
	var st: RunState = game.state
	var py := ReelLayout.panel_y()
	var ph := ReelLayout.panel_height()
	_draw_panel(Rect2(ReelLayout.PANEL_X, py, ReelLayout.PANEL_W, ph), GameColors.PANEL)

	var title := "TUS RULETAS · VACÍO = +3 BALAS"
	if st.phase in ["combat", "boss"] and collapsed:
		title = "RULETAS (Q expandir)"
	var title_rect := Rect2(ReelLayout.PANEL_X, py + 4, ReelLayout.PANEL_W, 22)
	UiDraw.draw_in_rect(self, _font, title_rect, title, 13, GameColors.TEXT_PALE)

	if st.phase in ["combat", "boss"] and collapsed:
		return

	for r in GameConstants.REEL_COUNT:
		var by := ReelLayout.block_start_y(r)
		draw_string(_font, Vector2(ReelLayout.PANEL_X + 18, by + 4), "RULETA %d" % (r + 1), HORIZONTAL_ALIGNMENT_LEFT, 200, 12, GameColors.TEXT_PALE)
		for s in GameConstants.SLOTS_PER_REEL:
			var sr := ReelLayout.slot_rect(r, s)
			var token_key = st.reels[r][s]
			var fill := GameColors.token_color(token_key) if token_key != null else Color("#141414")
			var hover: bool = st.reel_hover_slot != null and int(st.reel_hover_slot["reel"]) == r and int(st.reel_hover_slot["slot"]) == s
			var selected: bool = st.placing_token != null and st.place_reel_index == r and st.place_slot_index == s
			draw_rect(sr, fill)
			draw_rect(sr, Color.WHITE if (hover or selected) else GameColors.GOLD, false, 2.0)
			var label: String = "□"
			if token_key != null:
				label = str(GameData.TOKENS[token_key].label)
			UiDraw.draw_in_rect(self, _font, sr, label, 14, GameColors.TEXT_PALE)

	if st.reel_hover_slot != null:
		var reel: int = int(st.reel_hover_slot["reel"])
		var slot: int = int(st.reel_hover_slot["slot"])
		var token_key = st.reels[reel][slot]
		if token_key != null:
			_draw_token_tooltip(token_key, ReelLayout.slot_rect(reel, slot))


func _draw_token_tooltip(token_key: String, anchor: Rect2) -> void:
	var token: Dictionary = GameData.TOKENS[token_key]
	var tw := ShopLayout.TOOLTIP_W
	var th := ShopLayout.TOOLTIP_H
	var x := anchor.position.x - tw - 10
	if x < 10:
		x = anchor.position.x + anchor.size.x + 10
	var y := clampf(anchor.position.y + anchor.size.y / 2 - th / 2, 10, size.y - th - 10)
	var tr := Rect2(x, y, tw, th)
	_draw_panel(tr, Color("#1a0a08"))
	draw_rect(tr, GameColors.PALE_GOLD, false, 2.0)
	var icon_rect := Rect2(x + 12, y + 10, 28, 28)
	var name_rect := Rect2(x + 44, y + 10, tw - 56, 24)
	var desc_rect := Rect2(x + 12, y + 38, tw - 24, 56)
	var footer_rect := Rect2(x + 12, y + th - 26, tw - 24, 20)
	UiDraw.draw_in_rect(self, _font, icon_rect, token.label, 18, GameColors.TEXT_GOLD)
	UiDraw.draw_in_rect(self, _font, name_rect, token.name, 14, GameColors.TEXT_PALE, HORIZONTAL_ALIGNMENT_LEFT)
	UiDraw.draw_in_rect(self, _font, desc_rect, token.shop_description, 11, Color("#c8b890"), HORIZONTAL_ALIGNMENT_LEFT)
	UiDraw.draw_in_rect(self, _font, footer_rect, token.short, 12, GameColors.TEXT_GOLD, HORIZONTAL_ALIGNMENT_RIGHT)


func _draw_panel(rect: Rect2, fill: Color) -> void:
	draw_rect(rect, Color(fill, 0.9))
	draw_rect(rect, GameColors.GOLD, false, 2.0)


func slot_at(pos: Vector2) -> Dictionary:
	if not should_show() or (game.state.phase in ["combat", "boss"] and collapsed):
		return {}
	for r in GameConstants.REEL_COUNT:
		for s in GameConstants.SLOTS_PER_REEL:
			if ReelLayout.slot_rect(r, s).has_point(pos):
				return {"reel": r, "slot": s}
	return {}


func handle_hover(pos: Vector2) -> void:
	if game == null:
		return
	var st: RunState = game.state
	var hit: Dictionary = slot_at(pos)
	if not hit.is_empty():
		var reel: int = int(hit["reel"])
		var slot: int = int(hit["slot"])
		if st.reels[reel][slot] != null:
			st.reel_hover_slot = hit
			return
	st.reel_hover_slot = null


func handle_click(pos: Vector2) -> bool:
	if game == null:
		return false
	var st: RunState = game.state
	if st.placing_token == null:
		return false
	var hit: Dictionary = slot_at(pos)
	if hit.is_empty():
		return false
	st.place_reel_index = int(hit["reel"])
	st.place_slot_index = int(hit["slot"])
	ShopSystem.place_token_in_slot(st)
	return true
