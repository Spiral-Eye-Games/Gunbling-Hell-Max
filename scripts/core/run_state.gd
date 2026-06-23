class_name RunState
extends RefCounted

var player := {}
var bullets: Array = []
var enemies: Array = []
var hazards: Array = []
var hit_effects: Array = []

var phase := "initialShop"
var round_num := 1
var kills_this_round := 0
var required_kills := 10

var hp := Balance.PLAYER_BASE_HP
var max_hp := Balance.PLAYER_BASE_HP
var score := 0
var chips := 0
var combo := 1.0
var combo_timer := 0.0
var last_shot_at := 0.0

var reels: Array = []
var reel_results: Array = ["?", "?", "?"]
var reel_result_keys: Array = []
var next_reel_index := 0
var current_magazine := {}

var dash_cooldown := 0.0
var invulnerability_timer := 0.0
var boss = null

var token_offers: Array = []
var passive_offers: Array = []
var placing_token = null
var place_reel_index := 0
var place_slot_index := 0
var free_tokens_remaining := Balance.INITIAL_FREE_TOKENS
var has_started_run := false

var base_magazine_bonus := 0
var base_damage_bonus := 0
var combo_decay_multiplier := 1.0
var pity_bonus := 0
var speed_bonus := 0.0

var shop_hover_token := -1
var shop_hover_passive := -1
var reel_hover_slot = null

var objective_text := "TIENDA INICIAL · ELEGÍ 2 TOKENS GRATIS"


func init_run() -> void:
	player = {
		"x": GameConstants.GAME_WIDTH / 2.0,
		"y": GameConstants.GAME_HEIGHT - 145.0,
		"radius": 16.0,
		"speed": Balance.PLAYER_BASE_SPEED,
		"angle": 0.0
	}
	bullets.clear()
	enemies.clear()
	hazards.clear()
	hit_effects.clear()
	phase = "initialShop"
	round_num = 1
	kills_this_round = 0
	required_kills = 10
	hp = Balance.PLAYER_BASE_HP
	max_hp = Balance.PLAYER_BASE_HP
	score = 0
	chips = 0
	combo = 1.0
	combo_timer = 0.0
	last_shot_at = 0.0
	reels = MagazineSystem.create_empty_reels()
	reel_results = ["?", "?", "?"]
	reel_result_keys.clear()
	next_reel_index = 0
	current_magazine = MagazineSystem.create_base_magazine(MagazineSystem.get_magazine_bonuses(self))
	dash_cooldown = 0.0
	invulnerability_timer = 0.0
	boss = null
	token_offers.clear()
	passive_offers.clear()
	placing_token = null
	place_reel_index = 0
	place_slot_index = 0
	free_tokens_remaining = Balance.INITIAL_FREE_TOKENS
	has_started_run = false
	base_magazine_bonus = 0
	base_damage_bonus = 0
	combo_decay_multiplier = 1.0
	pity_bonus = 0
	speed_bonus = 0.0
	shop_hover_token = -1
	shop_hover_passive = -1
	reel_hover_slot = null
	objective_text = "TIENDA INICIAL · ELEGÍ 2 TOKENS GRATIS"
