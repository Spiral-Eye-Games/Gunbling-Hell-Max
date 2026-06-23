class_name GameUiFont
extends RefCounted

static var _font: Font


static func get_font() -> Font:
	if _font != null:
		return _font
	var body := load("res://assets/fonts/NotoSans-Regular.ttf") as FontFile
	var symbols := load("res://assets/fonts/NotoSansSymbols2-Regular.ttf") as FontFile
	body.set_antialiasing(TextServer.FONT_ANTIALIASING_GRAY)
	symbols.set_antialiasing(TextServer.FONT_ANTIALIASING_GRAY)
	body.fallbacks = [symbols]
	_font = body
	return _font
