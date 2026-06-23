class_name ComboSystem
extends RefCounted

static func update_combo(state: RunState, dt: float) -> void:
	if state.combo_timer > 0:
		state.combo_timer -= dt
	else:
		state.combo = maxf(1.0, state.combo - dt * 1.8 * state.combo_decay_multiplier)
