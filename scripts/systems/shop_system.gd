class_name ShopSystem
extends RefCounted

static func generate_shop_offers(state: RunState) -> void:
	state.token_offers.clear()
	for _i in GameConstants.TOKEN_OFFER_COUNT:
		var key: String = GameData.TOKEN_KEYS[randi() % GameData.TOKEN_KEYS.size()]
		var token: Dictionary = GameData.TOKENS[key]
		state.token_offers.append({
			"type": "token",
			"key": key,
			"name": token.name,
			"description": token.shop_description,
			"cost": 0 if state.phase == "initialShop" else Balance.get_token_cost(key, state.round_num)
		})

	var passives: Array = GameData.PASSIVE_CATALOG.duplicate(true)
	passives.shuffle()
	state.passive_offers = passives.slice(0, GameConstants.PASSIVE_OFFER_COUNT)
	state.shop_hover_token = -1
	state.shop_hover_passive = -1


static func _apply_passive(state: RunState, effect: String) -> void:
	match effect:
		"magazineBonus":
			state.base_magazine_bonus += 1
			MagazineSystem.refresh_base_magazine(state)
		"damageBonus":
			state.base_damage_bonus += 1
			state.current_magazine["bullet_damage"] = float(state.current_magazine.get("bullet_damage", 0.0)) + 1.0
		"maxHp":
			state.max_hp += 25
			state.hp = state.max_hp
		"speedBonus":
			state.speed_bonus += 20
		"heal":
			state.hp = minf(state.max_hp, state.hp + 60)
		"comboDecay":
			state.combo_decay_multiplier *= 0.85


static func buy_token_offer(state: RunState, index: int, game: Node) -> void:
	if index < 0 or index >= state.token_offers.size():
		return
	var offer: Dictionary = state.token_offers[index]
	if state.phase == "initialShop":
		if state.free_tokens_remaining <= 0:
			return
		state.placing_token = offer.key
		state.objective_text = "COLOCÁ TOKEN GRATIS: " + GameData.TOKENS[offer.key].name
		return
	if state.chips < offer.cost:
		game.show_floating_message("SIN FICHAS", offer.name)
		return
	state.chips -= offer.cost
	state.placing_token = offer.key
	state.objective_text = "COLOCÁ TOKEN: " + GameData.TOKENS[offer.key].name


static func buy_passive_offer(state: RunState, index: int, game: Node) -> void:
	if index < 0 or index >= state.passive_offers.size():
		return
	var offer: Dictionary = state.passive_offers[index]
	if state.phase == "initialShop":
		game.show_floating_message("BLOQUEADO", "primero elegí tus tokens gratis")
		return
	if state.chips < offer.cost:
		game.show_floating_message("SIN FICHAS", offer.name)
		return
	state.chips -= offer.cost
	_apply_passive(state, offer.effect)
	game.show_floating_message("COMPRADO", offer.name)
	state.passive_offers.remove_at(index)


static func place_token_in_slot(state: RunState) -> void:
	if state.placing_token == null:
		return
	state.reels[state.place_reel_index][state.place_slot_index] = state.placing_token
	var token_name: String = GameData.TOKENS[state.placing_token].name
	if state.phase == "initialShop":
		state.free_tokens_remaining -= 1
		if state.free_tokens_remaining <= 0:
			state.placing_token = null
			state.objective_text = "LISTO · CONTINUAR PARA EMPEZAR LA RUN"
			generate_shop_offers(state)
			return
		state.placing_token = null
		state.objective_text = "TIENDA INICIAL · ELEGÍ %d TOKEN GRATIS" % state.free_tokens_remaining
		generate_shop_offers(state)
		return
	state.placing_token = null
	state.objective_text = "TOKEN COLOCADO: %s · CONTINUAR PARA DESCENDER" % token_name
	generate_shop_offers(state)


static func reroll_shop(state: RunState, game: Node) -> void:
	if state.phase == "initialShop":
		generate_shop_offers(state)
		return
	if state.chips < Balance.SHOP_REROLL_COST:
		game.show_floating_message("SIN FICHAS", "REROLL")
		return
	state.chips -= Balance.SHOP_REROLL_COST
	generate_shop_offers(state)


static func continue_shop(state: RunState, game: Node) -> void:
	if state.placing_token != null:
		return
	if state.phase == "initialShop":
		if state.free_tokens_remaining <= 0:
			start_run(state)
		else:
			game.show_floating_message("ELEGÍ TOKENS", "te quedan %d gratis" % state.free_tokens_remaining)
		return
	descend_to_next_round(state)


static func start_run(state: RunState) -> void:
	state.phase = "combat"
	state.has_started_run = true
	state.objective_text = ""
	EnemySystem.spawn_wave(state, 5)


static func enter_shop(state: RunState) -> void:
	state.phase = "shop"
	state.enemies.clear()
	state.bullets.clear()
	state.hazards.clear()
	state.objective_text = "RONDA LIMPIA · COMPRÁ O CONTINUÁ PARA DESCENDER"
	generate_shop_offers(state)


static func descend_to_next_round(state: RunState) -> void:
	state.round_num += 1
	if state.round_num >= GameConstants.SATAN_ROUND:
		BossSystem.start_boss_fight(state)
		return
	state.phase = "combat"
	state.kills_this_round = 0
	state.required_kills = Balance.get_required_kills(state.round_num)
	state.objective_text = ""
	MagazineSystem.refresh_base_magazine(state)
	EnemySystem.spawn_wave(state, Balance.get_wave_size(state.round_num))
