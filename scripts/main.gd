extends Node2D

var state := RunState.new()

@onready var game_world: Node2D = $GameWorld
@onready var shop_ui: Control = $UI/ShopUI
@onready var reels_ui: Control = $UI/ReelsUI
@onready var combat_hud: Control = $UI/CombatHud
@onready var float_label: Label = $UI/FloatLabel
@onready var camera_2d: Camera2D = $Camera2D

var _float_timer := 0.0
var _dash_pressed := false
var _reload_pending := false
var _reload_timer := 0.0


func _ready() -> void:
	state.init_run()
	ShopSystem.generate_shop_offers(state)
	game_world.setup(self)
	shop_ui.setup(self)
	reels_ui.setup(self)
	combat_hud.setup(self)
	float_label.visible = false


func _process(delta: float) -> void:
	_update_hit_effects(delta)
	if _float_timer > 0:
		_float_timer -= delta
		if _float_timer <= 0:
			float_label.visible = false

	if _reload_pending:
		_reload_timer -= delta
		if _reload_timer <= 0:
			_reload_pending = false
			if state.current_magazine.get("ammo", 0) <= 0:
				MagazineSystem.refresh_base_magazine(state)

	match state.phase:
		"combat":
			_update_combat(delta)
		"boss":
			_update_boss(delta)
		"dead", "win":
			if Input.is_key_pressed(KEY_F):
				_restart_run()

	if state.placing_token != null:
		combat_hud.visible = false
	else:
		combat_hud.visible = state.phase in ["combat", "boss", "dead", "win"]


func _update_combat(delta: float) -> void:
	var aim := get_global_mouse_position()
	PlayerSystem.handle_movement(state, delta, aim, _dash_pressed)
	_dash_pressed = false
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		_try_shoot(aim)
	BulletSystem.update_bullets(state, delta, self)
	BeamSystem.update_beams(state, delta)
	EnemySystem.update_enemies(state, delta, self)
	HazardSystem.update_hazards(state, delta, self)
	ComboSystem.update_combo(state, delta)
	if state.kills_this_round >= state.required_kills:
		ShopSystem.enter_shop(state)


func _update_boss(delta: float) -> void:
	var aim := get_global_mouse_position()
	PlayerSystem.handle_movement(state, delta, aim, _dash_pressed)
	_dash_pressed = false
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		_try_shoot(aim)
	BulletSystem.update_bullets(state, delta, self)
	BeamSystem.update_beams(state, delta)
	BossSystem.update_boss(state, delta, self)
	HazardSystem.update_hazards(state, delta, self)
	ComboSystem.update_combo(state, delta)


func _try_shoot(aim: Vector2) -> void:
	var before: int = int(state.current_magazine.get("ammo", 0))
	ShootingSystem.try_shoot(state, aim, Time.get_ticks_msec(), self)
	if before > 0 and int(state.current_magazine.get("ammo", 0)) <= 0:
		_reload_pending = true
		_reload_timer = 0.22


func _update_hit_effects(delta: float) -> void:
	var i := state.hit_effects.size() - 1
	while i >= 0:
		var fx: Dictionary = state.hit_effects[i]
		fx.life -= delta
		if fx.life <= 0:
			state.hit_effects.remove_at(i)
		i -= 1


func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_SHIFT or event.keycode == KEY_SPACE:
			_dash_pressed = true
		if event.keycode == KEY_Q and state.phase in ["combat", "boss"]:
			reels_ui.collapsed = not reels_ui.collapsed

	if event is InputEventMouseMotion:
		var pos: Vector2 = event.position
		reels_ui.handle_hover(pos)
		shop_ui.handle_hover(pos)

	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var pos: Vector2 = event.position
		if state.phase in ["combat", "boss"]:
			_try_shoot(pos)
			return
		if reels_ui.handle_click(pos):
			return
		if shop_ui.handle_click(pos):
			return


func add_hit_effect(x: float, y: float, color: Color, radius: float) -> void:
	state.hit_effects.append({
		"x": x, "y": y, "color": color, "radius": radius,
		"life": 0.45, "max_life": 0.45
	})


func show_floating_message(title: String, subtitle: String) -> void:
	float_label.text = title + "\n" + subtitle
	float_label.visible = true
	float_label.position = Vector2(GameConstants.GAME_WIDTH / 2 - 160, GameConstants.GAME_HEIGHT / 2 - 40)
	_float_timer = 1.6


func show_score_gain(amount: int) -> void:
	show_floating_message("+%s" % str(amount), "COMBO x%d" % int(floor(state.combo)))


func shake_camera() -> void:
	var tween := create_tween()
	tween.tween_property(camera_2d, "offset", Vector2(randf_range(-4, 4), randf_range(-4, 4)), 0.05)
	tween.tween_property(camera_2d, "offset", Vector2.ZERO, 0.08)


func _restart_run() -> void:
	state.init_run()
	ShopSystem.generate_shop_offers(state)
	reels_ui.collapsed = true
