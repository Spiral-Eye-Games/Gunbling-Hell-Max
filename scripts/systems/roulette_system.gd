class_name RouletteSystem
extends RefCounted

static func on_successful_hit(state: RunState, game: Node) -> void:
	var reel_index := state.next_reel_index
	var rolled_slot := randi_range(0, GameConstants.SLOTS_PER_REEL - 1)
	var token_key = state.reels[reel_index][rolled_slot]
	if state.reel_result_keys.size() < GameConstants.REEL_COUNT:
		state.reel_result_keys.resize(GameConstants.REEL_COUNT)
		state.reel_result_keys.fill(null)
	state.reel_result_keys[reel_index] = token_key
	if token_key != null:
		state.reel_results[reel_index] = GameData.TOKENS[token_key].label
	else:
		state.reel_results[reel_index] = "□"
	state.next_reel_index += 1
	state.combo_timer = 3.0
	if state.next_reel_index >= GameConstants.REEL_COUNT:
		_evaluate_results(state, game)


static func _evaluate_results(state: RunState, game: Node) -> void:
	state.current_magazine = MagazineSystem.build_magazine_from_results(
		state.reel_result_keys,
		MagazineSystem.get_magazine_bonuses(state)
	)
	var non_empty: Array = state.reel_result_keys.filter(func(k): return k != null)
	var unique := {}
	for k in non_empty:
		unique[k] = true
	var is_triple := non_empty.size() == 3 and unique.size() == 1
	var is_pair := non_empty.size() >= 2 and unique.size() < non_empty.size()
	var summary := MagazineSystem.get_magazine_summary(state.current_magazine)
	if is_triple:
		state.combo += 2.0
		state.combo_timer = 4.2
		game.show_floating_message("JACKPOT", summary)
	elif is_pair:
		state.combo += 1.0
		state.combo_timer = 3.8
		game.show_floating_message("COMBINACIÓN", summary)
	else:
		state.combo += 0.35
		state.combo_timer = 3.2
		game.show_floating_message("CARGADOR", summary)
	state.reel_results = ["?", "?", "?"]
	state.reel_result_keys.clear()
	state.next_reel_index = 0
