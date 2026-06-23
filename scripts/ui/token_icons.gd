class_name TokenIcons
extends RefCounted

static func draw(canvas: CanvasItem, token_key: Variant, rect: Rect2, color: Color) -> void:
	if token_key == null:
		draw_empty(canvas, rect, color)
		return
	match str(token_key):
		"shotgun":
			_draw_shotgun(canvas, rect, color)
		"machine":
			_draw_machine(canvas, rect, color)
		"missile":
			_draw_missile(canvas, rect, color)
		"laser":
			_draw_laser(canvas, rect, color)
		_:
			draw_empty(canvas, rect, color)


static func draw_empty(canvas: CanvasItem, rect: Rect2, color: Color) -> void:
	var c := rect.get_center()
	var half := minf(rect.size.x, rect.size.y) * 0.22
	canvas.draw_rect(Rect2(c.x - half, c.y - half, half * 2, half * 2), color, false, 2.0)


static func _draw_shotgun(canvas: CanvasItem, rect: Rect2, color: Color) -> void:
	var c := rect.get_center()
	var half_w := minf(rect.size.x, rect.size.y) * 0.28
	var gap := minf(rect.size.x, rect.size.y) * 0.14
	for i in [-1, 0, 1]:
		var y := c.y + i * gap
		canvas.draw_line(Vector2(c.x - half_w, y), Vector2(c.x + half_w, y), color, 3.0)


static func _draw_machine(canvas: CanvasItem, rect: Rect2, color: Color) -> void:
	var c := rect.get_center()
	var r := minf(rect.size.x, rect.size.y) * 0.18
	canvas.draw_circle(c, r, color)


static func _draw_missile(canvas: CanvasItem, rect: Rect2, color: Color) -> void:
	var c := rect.get_center()
	var r := minf(rect.size.x, rect.size.y) * 0.28
	for i in 4:
		var angle := float(i) * TAU / 4.0 + PI / 4.0
		var tip := c + Vector2(cos(angle), sin(angle)) * r
		canvas.draw_line(c, tip, color, 3.0)


static func _draw_laser(canvas: CanvasItem, rect: Rect2, color: Color) -> void:
	var c := rect.get_center()
	var w := minf(rect.size.x, rect.size.y) * 0.26
	var top := c.y - w * 0.55
	canvas.draw_line(Vector2(c.x - w, top), Vector2(c.x + w, top), color, 3.0)
	canvas.draw_line(Vector2(c.x + w, top), Vector2(c.x - w * 0.15, c.y + w * 0.65), color, 3.0)
