class_name UiDraw
extends RefCounted

static func text_baseline_y(font: Font, rect: Rect2, font_size: int) -> float:
	return rect.position.y + (rect.size.y + font.get_ascent(font_size) - font.get_descent(font_size)) * 0.5


static func draw_in_rect(
	canvas: CanvasItem,
	font: Font,
	rect: Rect2,
	text: String,
	font_size: int,
	color: Color,
	alignment: HorizontalAlignment = HORIZONTAL_ALIGNMENT_CENTER
) -> void:
	canvas.draw_string(
		font,
		Vector2(rect.position.x, text_baseline_y(font, rect, font_size)),
		text,
		alignment,
		rect.size.x,
		font_size,
		color
	)


static func draw_centered_on_screen(
	canvas: CanvasItem,
	font: Font,
	screen_width: float,
	y: float,
	text: String,
	width: float,
	font_size: int,
	color: Color
) -> void:
	var rect := Rect2((screen_width - width) * 0.5, y - font_size * 0.5, width, font_size * 1.4)
	draw_in_rect(canvas, font, rect, text, font_size, color, HORIZONTAL_ALIGNMENT_CENTER)
