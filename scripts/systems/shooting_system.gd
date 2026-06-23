class_name ShootingSystem
extends RefCounted

static func try_shoot(state: RunState, aim_pos: Vector2, now_ms: float) -> void:
	if int(state.current_magazine.get("ammo", 0)) <= 0:
		MagazineSystem.refresh_base_magazine(state)
		return
	if now_ms - state.last_shot_at < float(state.current_magazine.get("fire_cooldown_ms", 0)):
		return
	state.last_shot_at = now_ms
	var p := Vector2(float(state.player.x), float(state.player.y))
	var base_angle: float = (aim_pos - p).angle()
	_fire_magazine_shot(state, base_angle)
	state.current_magazine["ammo"] = int(state.current_magazine.get("ammo", 0)) - 1


static func _fire_magazine_shot(state: RunState, base_angle: float) -> void:
	var mag: Dictionary = state.current_magazine
	var count: int = int(mag.get("projectile_count", 1))
	if count <= 1:
		_spawn_bullet(state, base_angle)
		return
	var spread: float = float(mag.get("spread_radians", 0.0))
	var total_spread: float = spread * float(count - 1)
	var start_angle: float = base_angle - total_spread / 2.0
	for i in count:
		_spawn_bullet(state, start_angle + spread * float(i))


static func _spawn_bullet(state: RunState, angle: float) -> void:
	var mag: Dictionary = state.current_magazine
	var piercing: bool = bool(mag.get("piercing", false))
	var bullet_speed: float = float(mag.get("bullet_speed", Balance.BASE_BULLET_SPEED))
	var laser_width: float = float(mag.get("laser_width", 0.0))
	var bullet := {
		"x": float(state.player.x) + cos(angle) * 24.0,
		"y": float(state.player.y) + sin(angle) * 24.0,
		"vx": cos(angle) * bullet_speed,
		"vy": sin(angle) * bullet_speed,
		"radius": 5.0 + laser_width * 0.45 if piercing else 5.0,
		"damage": float(mag.get("bullet_damage", 1.0)),
		"life": 1.15 if piercing else 1.0,
		"color": MagazineSystem.get_bullet_color(mag),
		"explosive": bool(mag.get("explosive", false)),
		"explosion_radius": float(mag.get("explosion_radius", 0.0)),
		"piercing": piercing,
		"laser_width": laser_width,
		"already_hit": {}
	}
	state.bullets.append(bullet)
