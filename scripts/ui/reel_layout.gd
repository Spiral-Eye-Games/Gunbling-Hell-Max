class_name ReelLayout
extends RefCounted

const PANEL_X := 948
const PANEL_W := 312
const PANEL_Y_COLLAPSED := 52
const BLOCK_START_OFFSET := 36
const BLOCK_GAP := 10
const BLOCK_BOTTOM_PAD := 12
const LABEL_H := 22
const CELL_W := 88
const CELL_H := 42
const CELL_GAP_X := 8
const CELL_GAP_Y := 6


static func block_height() -> float:
	return LABEL_H + 2 * CELL_H + CELL_GAP_Y + 8


static func panel_height() -> float:
	return BLOCK_START_OFFSET + 3 * block_height() + 2 * BLOCK_GAP + BLOCK_BOTTOM_PAD


static func panel_y() -> float:
	var shop_center := ShopLayout.PANEL_Y + ShopLayout.PANEL_H / 2.0
	return shop_center - panel_height() / 2.0


static func block_start_y(reel_index: int) -> float:
	return panel_y() + BLOCK_START_OFFSET + reel_index * (block_height() + BLOCK_GAP)


static func grid_start_x() -> float:
	var grid_w := 3 * CELL_W + 2 * CELL_GAP_X
	return PANEL_X + (PANEL_W - grid_w) / 2.0


static func slot_rect(reel_index: int, slot_index: int) -> Rect2:
	var col := slot_index % 3
	var row := int(floor(slot_index / 3.0))
	var x := grid_start_x() + col * (CELL_W + CELL_GAP_X)
	var y := block_start_y(reel_index) + LABEL_H + row * (CELL_H + CELL_GAP_Y)
	return Rect2(x, y, CELL_W, CELL_H)
