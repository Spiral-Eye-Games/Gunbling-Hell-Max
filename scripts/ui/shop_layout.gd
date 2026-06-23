class_name ShopLayout
extends RefCounted

const PANEL_X := 36
const PANEL_Y := 158
const PANEL_W := 800
const PANEL_H := 430
const CHIPS_BAR_H := 52
const CHIPS_BAR_W := 200
const CHIPS_BAR_GAP := 10
const TOKEN_CELL_W := 108
const TOKEN_CELL_H := 72
const TOKEN_GAP := 10
const TOKEN_GRID_Y := 192
const PASSIVE_CARD_Y := 392
const PASSIVE_CARD_W := 240
const PASSIVE_CARD_H := 168
const PASSIVE_CARD_GAP := 16
const ACTION_BTN_W := 148
const ACTION_BTN_H := 36
const ACTION_BTN_Y := 600
const REROLL_BTN_X := 36
const CONTINUE_BTN_X := 688
const TOOLTIP_W := 216
const TOOLTIP_H := 124


static func chips_bar_rect() -> Rect2:
	var y := PANEL_Y - CHIPS_BAR_GAP - CHIPS_BAR_H
	return Rect2(PANEL_X, y, CHIPS_BAR_W, CHIPS_BAR_H)


static func token_tile_rect(index: int) -> Rect2:
	var col := index % 3
	var row := int(floor(index / 3.0))
	var grid_w := 3 * TOKEN_CELL_W + 2 * TOKEN_GAP
	var start_x := PANEL_X + (PANEL_W - grid_w) / 2.0
	var x := start_x + col * (TOKEN_CELL_W + TOKEN_GAP)
	var y := TOKEN_GRID_Y + row * (TOKEN_CELL_H + TOKEN_GAP)
	return Rect2(x, y, TOKEN_CELL_W, TOKEN_CELL_H)


static func passive_card_rect(index: int) -> Rect2:
	var row_w := 3 * PASSIVE_CARD_W + 2 * PASSIVE_CARD_GAP
	var start_x := PANEL_X + (PANEL_W - row_w) / 2.0
	var x := start_x + index * (PASSIVE_CARD_W + PASSIVE_CARD_GAP)
	return Rect2(x, PASSIVE_CARD_Y, PASSIVE_CARD_W, PASSIVE_CARD_H)


static func reroll_btn_rect() -> Rect2:
	return Rect2(REROLL_BTN_X, ACTION_BTN_Y, ACTION_BTN_W, ACTION_BTN_H)


static func continue_btn_rect() -> Rect2:
	return Rect2(CONTINUE_BTN_X, ACTION_BTN_Y, ACTION_BTN_W, ACTION_BTN_H)
