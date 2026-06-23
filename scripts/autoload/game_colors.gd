extends Node

const BACKGROUND := Color("#050202")
const CARPET := Color("#5b0708")
const CARPET_LINE := Color("#ad1717")
const GOLD := Color("#d7a340")
const PALE_GOLD := Color("#ffdf8a")
const RED := Color("#d81414")
const ENEMY := Color("#d33020")
const POISON := Color("#48ff30")
const BULLET := Color("#ffd36a")
const SHOTGUN := Color("#ff7b2f")
const MACHINE := Color("#76ff6b")
const MISSILE := Color("#ff9a00")
const LASER := Color("#ff3030")
const EMPTY := Color("#8e8e8e")
const PANEL := Color("#070202")
const PANEL_SHOP := Color("#020000")
const TEXT_PALE := Color("#ffe0a0")
const TEXT_GOLD := Color("#f7d47a")

func token_color(key: String) -> Color:
	match key:
		"shotgun": return SHOTGUN
		"machine": return MACHINE
		"missile": return MISSILE
		"laser": return LASER
		_: return EMPTY
