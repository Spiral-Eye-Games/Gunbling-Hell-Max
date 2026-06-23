extends Control

var game: Node
var _font: Font


func setup(main: Node) -> void:
	game = main
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_font = ThemeDB.fallback_font


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	if game == null or game.state == null:
		return
	var st: RunState = game.state
	var in_shop := st.phase in ["shop", "initialShop"] or st.placing_token != null
	if not in_shop:
		return

	if st.placing_token != null:
		draw_rect(Rect2(0, 0, size.x, size.y), Color(0, 0, 0, 0.5))
		return

	_draw_panel(Rect2(ShopLayout.PANEL_X, ShopLayout.PANEL_Y, ShopLayout.PANEL_W, ShopLayout.PANEL_H), GameColors.PANEL_SHOP)
	_draw_panel(ShopLayout.chips_bar_rect(), GameColors.PANEL_SHOP)

	for i in GameConstants.TOKEN_OFFER_COUNT:
		var r := ShopLayout.token_tile_rect(i)
		var hover := st.shop_hover_token == i
		_draw_panel(r, Color("#1a0a08") if not hover else Color("#441000"), hover)

	for i in GameConstants.PASSIVE_OFFER_COUNT:
		var r := ShopLayout.passive_card_rect(i)
		var blocked := st.phase == "initialShop"
		var hover := st.shop_hover_passive == i
		var fill := Color("#0e0606") if blocked else (Color("#441000") if hover else Color("#1a0a08"))
		_draw_panel(r, fill, hover and not blocked)

	_draw_panel(ShopLayout.reroll_btn_rect(), Color("#1a0a08"))
	_draw_panel(ShopLayout.continue_btn_rect(), Color("#5a1505"))

	# chips text
	var cb := ShopLayout.chips_bar_rect()
	var chips_value_rect := Rect2(cb.position.x + 34, cb.position.y, cb.size.x - 34, cb.size.y * 0.62)
	var chips_label_rect := Rect2(cb.position.x + 34, cb.position.y + cb.size.y * 0.48, cb.size.x - 34, cb.size.y * 0.52)
	UiDraw.draw_in_rect(self, _font, chips_value_rect, str(st.chips), 22, Color("#d81414"))
	UiDraw.draw_in_rect(self, _font, chips_label_rect, "FICHAS", 11, Color("#888888"))

	# title (área a la derecha de la barra de fichas)
	var title := "TIENDA INICIAL · TOKENS GRATIS: %d" % st.free_tokens_remaining if st.phase == "initialShop" else "TIENDA DEL INFRAMUNDO"
	var title_rect := Rect2(cb.position.x + cb.size.x, cb.position.y, ShopLayout.PANEL_X + ShopLayout.PANEL_W - cb.position.x - cb.size.x, cb.size.y)
	UiDraw.draw_in_rect(self, _font, title_rect, title, 16, GameColors.TEXT_PALE)

	# token tiles
	for i in st.token_offers.size():
		var offer: Dictionary = st.token_offers[i]
		var r := ShopLayout.token_tile_rect(i)
		var icon_rect := Rect2(r.position.x, r.position.y + 4, r.size.x, r.size.y * 0.52)
		var price_rect := Rect2(r.position.x, r.position.y + r.size.y * 0.52, r.size.x, r.size.y * 0.44)
		TokenIcons.draw(self, offer.key, icon_rect, GameColors.TEXT_GOLD)
		var price := "GRATIS" if st.phase == "initialShop" else str(offer.cost)
		UiDraw.draw_in_rect(self, _font, price_rect, price, 13, GameColors.TEXT_GOLD)

	# passives
	for i in GameConstants.PASSIVE_OFFER_COUNT:
		var r := ShopLayout.passive_card_rect(i)
		if st.phase == "initialShop" or i >= st.passive_offers.size():
			UiDraw.draw_in_rect(self, _font, r, "BLOQUEADO", 16, Color("#666666"))
		else:
			var offer: Dictionary = st.passive_offers[i]
			var name_rect := Rect2(r.position.x + 12, r.position.y + 8, r.size.x - 24, 28)
			var desc_rect := Rect2(r.position.x + 12, r.position.y + 34, r.size.x - 24, 72)
			var cost_rect := Rect2(r.position.x + 12, r.position.y + r.size.y - 28, r.size.x - 24, 22)
			UiDraw.draw_in_rect(self, _font, name_rect, offer.name, 14, GameColors.TEXT_PALE, HORIZONTAL_ALIGNMENT_LEFT)
			UiDraw.draw_in_rect(self, _font, desc_rect, offer.description, 11, Color("#c8b890"), HORIZONTAL_ALIGNMENT_LEFT)
			UiDraw.draw_in_rect(self, _font, cost_rect, str(offer.cost), 14, GameColors.TEXT_GOLD, HORIZONTAL_ALIGNMENT_RIGHT)

	var reroll_label := "REROLL GRATIS" if st.phase == "initialShop" else "REROLL · %d" % Balance.SHOP_REROLL_COST
	var cont_label := "EMPEZAR RUN" if st.phase == "initialShop" else "CONTINUAR"
	_draw_btn_label(ShopLayout.reroll_btn_rect(), reroll_label)
	_draw_btn_label(ShopLayout.continue_btn_rect(), cont_label)

	UiDraw.draw_centered_on_screen(self, _font, size.x, size.y - 14, "Mouse · click comprar · reroll · continuar", size.x, 11, GameColors.TEXT_GOLD)

	if st.shop_hover_token >= 0 and st.shop_hover_token < st.token_offers.size():
		_draw_token_tooltip(st.token_offers[st.shop_hover_token], ShopLayout.token_tile_rect(st.shop_hover_token))


func _draw_panel(rect: Rect2, fill: Color, highlight: bool = false) -> void:
	draw_rect(rect, fill)
	var border := GameColors.PALE_GOLD if highlight else GameColors.GOLD
	draw_rect(rect, border, false, 2.0)


func _draw_btn_label(rect: Rect2, text: String) -> void:
	UiDraw.draw_in_rect(self, _font, rect, text, 13, GameColors.TEXT_PALE)


func _draw_token_tooltip(offer: Dictionary, anchor: Rect2) -> void:
	var token: Dictionary = GameData.TOKENS[offer.key]
	var tw := ShopLayout.TOOLTIP_W
	var th := ShopLayout.TOOLTIP_H
	var x := anchor.position.x + anchor.size.x + 10
	if x + tw > size.x - 10:
		x = anchor.position.x - tw - 10
	var y := clampf(anchor.position.y + anchor.size.y / 2 - th / 2, 10, size.y - th - 10)
	var tr := Rect2(x, y, tw, th)
	_draw_panel(tr, Color("#1a0a08"), true)
	var icon_rect := Rect2(x + 12, y + 10, 28, 28)
	var name_rect := Rect2(x + 44, y + 10, tw - 56, 24)
	var desc_rect := Rect2(x + 12, y + 38, tw - 24, 56)
	var footer_rect := Rect2(x + 12, y + th - 26, tw - 24, 20)
	TokenIcons.draw(self, offer.key, icon_rect, GameColors.TEXT_GOLD)
	UiDraw.draw_in_rect(self, _font, name_rect, offer.name, 14, GameColors.TEXT_PALE, HORIZONTAL_ALIGNMENT_LEFT)
	UiDraw.draw_in_rect(self, _font, desc_rect, offer.description, 11, Color("#c8b890"), HORIZONTAL_ALIGNMENT_LEFT)
	var footer := "GRATIS" if game.state.phase == "initialShop" else "%d fichas" % offer.cost
	UiDraw.draw_in_rect(self, _font, footer_rect, footer, 12, GameColors.TEXT_GOLD, HORIZONTAL_ALIGNMENT_RIGHT)


func handle_click(pos: Vector2) -> bool:
	if game == null:
		return false
	var st: RunState = game.state
	if st.placing_token != null:
		return false
	if st.phase not in ["shop", "initialShop"]:
		return false
	if ShopLayout.reroll_btn_rect().has_point(pos):
		ShopSystem.reroll_shop(st, game)
		return true
	if ShopLayout.continue_btn_rect().has_point(pos):
		ShopSystem.continue_shop(st, game)
		return true
	for i in GameConstants.TOKEN_OFFER_COUNT:
		if ShopLayout.token_tile_rect(i).has_point(pos):
			ShopSystem.buy_token_offer(st, i, game)
			return true
	for i in GameConstants.PASSIVE_OFFER_COUNT:
		if ShopLayout.passive_card_rect(i).has_point(pos):
			ShopSystem.buy_passive_offer(st, i, game)
			return true
	return false


func handle_hover(pos: Vector2) -> void:
	if game == null:
		return
	var st: RunState = game.state
	if st.phase not in ["shop", "initialShop"] or st.placing_token != null:
		st.shop_hover_token = -1
		st.shop_hover_passive = -1
		return
	st.shop_hover_token = -1
	st.shop_hover_passive = -1
	for i in GameConstants.TOKEN_OFFER_COUNT:
		if ShopLayout.token_tile_rect(i).has_point(pos):
			st.shop_hover_token = i
	for i in GameConstants.PASSIVE_OFFER_COUNT:
		if ShopLayout.passive_card_rect(i).has_point(pos):
			st.shop_hover_passive = i
