class_name MagazineSystem
extends RefCounted

static func create_empty_reels() -> Array:
	var reels: Array = []
	for _r in GameConstants.REEL_COUNT:
		var row: Array = []
		row.resize(GameConstants.SLOTS_PER_REEL)
		row.fill(null)
		reels.append(row)
	return reels


static func create_base_magazine(bonuses: Dictionary) -> Dictionary:
	var total_ammo: int = Balance.BASE_MAGAZINE_SIZE + int(bonuses.get("base_magazine_bonus", 0))
	return {
		"max_ammo": total_ammo,
		"ammo": total_ammo,
		"empty_tokens": 0,
		"shotgun_tokens": 0,
		"machine_tokens": 0,
		"missile_tokens": 0,
		"laser_tokens": 0,
		"projectile_count": 1,
		"spread_radians": 0.0,
		"fire_cooldown_ms": Balance.BASE_FIRE_COOLDOWN_MS,
		"bullet_speed": Balance.BASE_BULLET_SPEED,
		"bullet_damage": Balance.BASE_BULLET_DAMAGE + float(bonuses.get("base_damage_bonus", 0)),
		"explosive": false,
		"explosion_radius": 0.0,
		"laser_width": 0.0
	}


static func build_magazine_from_results(result_keys: Array, bonuses: Dictionary) -> Dictionary:
	var empty_count := 0
	var shotgun_count := 0
	var machine_count := 0
	var missile_count := 0
	var laser_count := 0
	for key in result_keys:
		if key == null:
			empty_count += 1
		elif key == "shotgun":
			shotgun_count += 1
		elif key == "machine":
			machine_count += 1
		elif key == "missile":
			missile_count += 1
		elif key == "laser":
			laser_count += 1

	var ammo: int = Balance.BASE_MAGAZINE_SIZE + int(bonuses.get("base_magazine_bonus", 0))
	ammo += empty_count * Balance.EMPTY_SLOT_AMMO_BONUS
	ammo -= shotgun_count
	ammo += machine_count * 5
	ammo -= missile_count * 2
	ammo -= laser_count
	ammo = maxi(Balance.MIN_MAGAZINE_SIZE, ammo)

	var projectile_count: int = 1 + shotgun_count * 2
	var fire_cooldown_ms: float = maxf(45.0, Balance.BASE_FIRE_COOLDOWN_MS * pow(0.72, machine_count))
	var explosive: bool = missile_count > 0
	var explosion_radius: float = 42.0 + missile_count * 28.0 if explosive else 0.0
	var laser_width: float = 6.0 + laser_count * 5.0 if laser_count > 0 else 0.0
	var bullet_damage: float = Balance.BASE_BULLET_DAMAGE + float(bonuses.get("base_damage_bonus", 0)) + missile_count * 0.4 + laser_count * 0.35
	var bullet_speed: float = Balance.BASE_BULLET_SPEED + machine_count * 55.0 + laser_count * 90.0 - missile_count * 80.0

	return {
		"max_ammo": ammo,
		"ammo": ammo,
		"empty_tokens": empty_count,
		"shotgun_tokens": shotgun_count,
		"machine_tokens": machine_count,
		"missile_tokens": missile_count,
		"laser_tokens": laser_count,
		"projectile_count": projectile_count,
		"spread_radians": 0.13 + shotgun_count * 0.05 if shotgun_count > 0 else 0.0,
		"fire_cooldown_ms": fire_cooldown_ms,
		"bullet_speed": bullet_speed,
		"bullet_damage": bullet_damage,
		"explosive": explosive,
		"explosion_radius": explosion_radius,
		"laser_width": laser_width
	}


static func get_magazine_summary(magazine: Dictionary) -> String:
	var parts: PackedStringArray = []
	var empty_tokens: int = int(magazine.get("empty_tokens", 0))
	var shotgun_tokens: int = int(magazine.get("shotgun_tokens", 0))
	var machine_tokens: int = int(magazine.get("machine_tokens", 0))
	var missile_tokens: int = int(magazine.get("missile_tokens", 0))
	var laser_tokens: int = int(magazine.get("laser_tokens", 0))
	if empty_tokens > 0:
		parts.append("VACÍO x%d (+balas)" % empty_tokens)
	if shotgun_tokens > 0:
		parts.append("ESCOPETA x%d" % shotgun_tokens)
	if machine_tokens > 0:
		parts.append("METRALLETA x%d" % machine_tokens)
	if missile_tokens > 0:
		parts.append("MISIL x%d" % missile_tokens)
	if laser_tokens > 0:
		parts.append("LÁSER x%d" % laser_tokens)
	if parts.is_empty():
		return "CARGADOR BASE"
	return " · ".join(parts)


static func get_bullet_color(magazine: Dictionary) -> Color:
	if int(magazine.get("laser_tokens", 0)) > 0:
		return GameColors.LASER
	if int(magazine.get("missile_tokens", 0)) > 0:
		return GameColors.MISSILE
	if int(magazine.get("machine_tokens", 0)) > 0:
		return GameColors.MACHINE
	if int(magazine.get("shotgun_tokens", 0)) > 0:
		return GameColors.SHOTGUN
	return GameColors.BULLET


static func create_empty_reel_costs() -> Array:
	var costs: Array = []
	for _r in GameConstants.REEL_COUNT:
		var row: Array = []
		row.resize(GameConstants.SLOTS_PER_REEL)
		row.fill(0)
		costs.append(row)
	return costs


static func get_magazine_bonuses(state: RunState) -> Dictionary:
	return {
		"base_magazine_bonus": state.base_magazine_bonus,
		"base_damage_bonus": state.base_damage_bonus
	}


static func refresh_base_magazine(state: RunState) -> void:
	state.current_magazine = create_base_magazine(get_magazine_bonuses(state))
