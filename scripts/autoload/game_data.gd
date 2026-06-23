extends Node

const TOKEN_KEYS: Array[String] = ["shotgun", "machine", "missile", "laser"]

const TOKENS := {
	"shotgun": {
		"key": "shotgun",
		"label": "☰",
		"name": "ESCOPETA",
		"short": "+2 proyectiles / -1 bala",
		"shop_description": "+2 proyectiles por disparo. -1 bala al cargador."
	},
	"machine": {
		"key": "machine",
		"label": "●",
		"name": "METRALLETA",
		"short": "+cadencia / +5 balas",
		"shop_description": "Aumenta la cadencia. +5 balas al cargador."
	},
	"missile": {
		"key": "missile",
		"label": "✹",
		"name": "MISIL",
		"short": "explota / -2 balas",
		"shop_description": "Las balas explotan. Más tokens aumentan el área. -2 balas."
	},
	"laser": {
		"key": "laser",
		"label": "7",
		"name": "LÁSER",
		"short": "haz láser / -1 bala",
		"shop_description": "Dispara un haz de luz que atraviesa. Más tokens aumentan el ancho. -1 bala."
	}
}

const PASSIVE_CATALOG: Array[Dictionary] = [
	{"type": "passive", "name": "CARGADOR +1", "description": "+1 bala base en cada cargador.", "cost": 120, "effect": "magazineBonus"},
	{"type": "passive", "name": "DAÑO +", "description": "Las balas hacen más daño.", "cost": 130, "effect": "damageBonus"},
	{"type": "passive", "name": "VIDA MÁXIMA", "description": "+25 HP máximo y cura total.", "cost": 160, "effect": "maxHp"},
	{"type": "passive", "name": "BOTAS DEL PECADO", "description": "Aumenta tu velocidad.", "cost": 120, "effect": "speedBonus"},
	{"type": "passive", "name": "CURACIÓN", "description": "Recupera 60 HP.", "cost": 70, "effect": "heal"},
	{"type": "passive", "name": "COMBO PEGADO", "description": "El combo cae más lento.", "cost": 150, "effect": "comboDecay"}
]
