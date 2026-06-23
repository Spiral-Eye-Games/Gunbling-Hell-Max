extends Node

const BASE_MAGAZINE_SIZE := 5
const EMPTY_SLOT_AMMO_BONUS := 3
const MIN_MAGAZINE_SIZE := 1
const BASE_FIRE_COOLDOWN_MS := 230.0
const BASE_BULLET_SPEED := 760.0
const BASE_BULLET_DAMAGE := 1.0
const PLAYER_BASE_HP := 125.0
const PLAYER_BASE_SPEED := 265.0
const SHOP_REROLL_COST := 50
const INITIAL_FREE_TOKENS := 2


func get_required_kills(round_num: int) -> int:
	return mini(42, 10 + int(floor(round_num * 0.6)))


func get_wave_size(round_num: int) -> int:
	return mini(12, 4 + int(floor(round_num * 0.25)))


func get_reinforcement_wave_size(round_num: int) -> int:
	return mini(5, 2 + int(floor(round_num / 12.0)))


func get_token_cost(key: String, round_num: int) -> int:
	var base_costs := {
		"shotgun": 90,
		"machine": 100,
		"missile": 125,
		"laser": 135
	}
	return int(floor(float(base_costs.get(key, 100)) + round_num * 2.0))
