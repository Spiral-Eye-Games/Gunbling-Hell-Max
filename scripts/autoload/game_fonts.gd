extends Node

var ui_font: Font


func _ready() -> void:
	var body := load("res://assets/fonts/NotoSans-Regular.ttf") as FontFile
	var symbols := load("res://assets/fonts/NotoSansSymbols2-Regular.ttf") as FontFile
	body.set_antialiasing(TextServer.FONT_ANTIALIASING_GRAY)
	symbols.set_antialiasing(TextServer.FONT_ANTIALIASING_GRAY)
	body.fallbacks = [symbols]
	ui_font = body
