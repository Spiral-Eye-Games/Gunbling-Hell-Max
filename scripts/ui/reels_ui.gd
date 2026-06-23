extends Control

var game: Node
var _font: Font
var collapsed := true


func setup(main: Node) -> void:
	game = main
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_font = GameUiFont.get_font()


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


func _in_shop_phase() -> bool:
	var st: RunState = game.state
	return st.phase in ["shop", "initialShop"]


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
			var placing: bool = st.placing_token != null and st.place_reel_index == r and st.place_slot_index == s
			var selected: bool = st.reel_selected_slot != null and int(st.reel_selected_slot["reel"]) == r and int(st.reel_selected_slot["slot"]) == s
			var moving: bool = st.moving_token_from != null and int(st.moving_token_from["reel"]) == r and int(st.moving_token_from["slot"]) == s
			draw_rect(sr, fill)
			if moving:
				draw_rect(sr, Color("#66ccff"), false, 2.0)
			elif selected or placing:
				draw_rect(sr, Color.WHITE, false, 2.0)
			elif hover:
				draw_rect(sr, GameColors.PALE_GOLD, false, 2.0)
			else:
				draw_rect(sr, GameColors.GOLD, false, 2.0)
			var label: String = "□"
			if token_key != null:
				label = str(GameData.TOKENS[token_key].label)
			UiDraw.draw_in_rect(self, _font, sr, label, 14, GameColors.TEXT_PALE)

	if st.reel_hover_slot != null:
		var reel: int = int(st.reel_hover_slot["reel"])
		var slot: int = int(st.reel_hover_slot["slot"])
		var token_key = st.reels[reel][slot]
		if token_key != null:
			_draw_reel_token_tooltip(token_key, reel, slot, ReelLayout.slot_rect(reel, slot))

	if _in_shop_phase() and st.placing_token == null and st.reel_selected_slot != null:
		var sel_reel: int = int(st.reel_selected_slot["reel"])
		var sel_slot: int = int(st.reel_selected_slot["slot"])
		var anchor := ReelLayout.slot_rect(sel_reel, sel_slot)
		var sell_price: int = ShopSystem.get_token_sell_price(st, sel_reel, sel_slot)
		_draw_action_button(ReelLayout.action_move_rect(anchor), "MOVER")
		_draw_action_button(ReelLayout.action_sell_rect(anchor), "VENDER · %d" % sell_price)


func _draw_action_button(rect: Rect2, label: String) -> void:
	draw_rect(rect, Color("#1a0a08"))
	draw_rect(rect, GameColors.PALE_GOLD, false, 2.0)
	UiDraw.draw_in_rect(self, _font, rect, label, 12, GameColors.TEXT_PALE)


func _draw_reel_token_tooltip(token_key: String, reel: int, slot: int, anchor: Rect2) -> void:
	var token: Dictionary = GameData.TOKENS[token_key]
	var tw: float = ShopLayout.TOOLTIP_W
	var desc_width: float = tw - 24.0
	var desc_h: float = UiDraw.wrapped_text_height(_font, token.shop_description, 11, desc_width)
	var th: float = maxf(float(ShopLayout.TOOLTIP_MIN_H), ShopLayout.TOOLTIP_PAD_TOP + desc_h + ShopLayout.TOOLTIP_PAD_BOTTOM)
	var x: float = anchor.position.x - tw - 10.0
	if x < 10.0:
		x = anchor.position.x + anchor.size.x + 10.0
	var y: float = clampf(anchor.position.y + anchor.size.y / 2.0 - th / 2.0, 10.0, size.y - th - 10.0)
	var tr := Rect2(x, y, tw, th)
	_draw_panel(tr, Color("#1a0a08"))
	draw_rect(tr, GameColors.PALE_GOLD, false, 2.0)
	var icon_rect := Rect2(x + 12, y + 10, 28, 28)
	var name_rect := Rect2(x + 44, y + 10, tw - 56, 24)
	var desc_rect := Rect2(x + 12, y + 38, desc_width, desc_h)
	var footer_rect := Rect2(x + 12, y + th - 26, desc_width, 20)
	var sell_price: int = ShopSystem.get_token_sell_price(game.state, reel, slot)
	UiDraw.draw_in_rect(self, _font, icon_rect, token.label, 18, GameColors.TEXT_GOLD)
	UiDraw.draw_in_rect(self, _font, name_rect, token.name, 14, GameColors.TEXT_PALE, HORIZONTAL_ALIGNMENT_LEFT)
	UiDraw.draw_wrapped_in_rect(self, _font, desc_rect, token.shop_description, 11, Color("#c8b890"), HORIZONTAL_ALIGNMENT_LEFT)
	UiDraw.draw_in_rect(self, _font, footer_rect, "Venta: %d fichas" % sell_price, 12, GameColors.TEXT_GOLD, HORIZONTAL_ALIGNMENT_RIGHT)


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


func _slot_matches(a: Dictionary, b: Dictionary) -> bool:
	return int(a["reel"]) == int(b["reel"]) and int(a["slot"]) == int(b["slot"])


func handle_hover(pos: Vector2) -> void:
	if game == null:
		return
	var st: RunState = game.state
	if st.moving_token_from != null or st.reel_selected_slot != null:
		st.reel_hover_slot = null
		return
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
	if not should_show() or (st.phase in ["combat", "boss"] and collapsed):
		return false

	if _in_shop_phase() and st.placing_token == null and st.reel_selected_slot != null:
		var sel_reel: int = int(st.reel_selected_slot["reel"])
		var sel_slot: int = int(st.reel_selected_slot["slot"])
		var anchor := ReelLayout.slot_rect(sel_reel, sel_slot)
		if ReelLayout.action_move_rect(anchor).has_point(pos):
			ShopSystem.start_move_reel_token(st, sel_reel, sel_slot)
			return true
		if ReelLayout.action_sell_rect(anchor).has_point(pos):
			ShopSystem.sell_reel_token(st, sel_reel, sel_slot, game)
			return true

	if st.moving_token_from != null:
		var hit: Dictionary = slot_at(pos)
		if not hit.is_empty():
			ShopSystem.complete_move_reel_token(st, int(hit["reel"]), int(hit["slot"]))
			return true
		st.moving_token_from = null
		st.objective_text = ""
		return true

	if st.placing_token != null:
		var place_hit: Dictionary = slot_at(pos)
		if place_hit.is_empty():
			return false
		st.place_reel_index = int(place_hit["reel"])
		st.place_slot_index = int(place_hit["slot"])
		ShopSystem.place_token_in_slot(st)
		return true

	if _in_shop_phase():
		var select_hit: Dictionary = slot_at(pos)
		if not select_hit.is_empty() and st.reels[int(select_hit["reel"])][int(select_hit["slot"])] != null:
			if st.reel_selected_slot != null and _slot_matches(st.reel_selected_slot, select_hit):
				st.reel_selected_slot = null
			else:
				st.reel_selected_slot = select_hit
			return true
		st.reel_selected_slot = null

	return false
