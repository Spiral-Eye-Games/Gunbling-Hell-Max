class_name CollisionUtils
extends RefCounted

static func create_id() -> String:
	return str(randi()) + "_" + str(Time.get_ticks_usec())


static func distance_between(x1: float, y1: float, x2: float, y2: float) -> float:
	return Vector2(x1, y1).distance_to(Vector2(x2, y2))


static func circles_overlap(x1: float, y1: float, r1: float, x2: float, y2: float, r2: float, extra_radius: float = 0.0) -> bool:
	return distance_between(x1, y1, x2, y2) < r1 + r2 + extra_radius


static func segment_circle_overlap(
	ax: float, ay: float, bx: float, by: float,
	half_thickness: float,
	cx: float, cy: float, cr: float
) -> bool:
	var ab := Vector2(bx - ax, by - ay)
	var ac := Vector2(cx - ax, cy - ay)
	var ab_len_sq := ab.length_squared()
	if ab_len_sq < 0.0001:
		return ac.length() < cr + half_thickness
	var t := clampf(ac.dot(ab) / ab_len_sq, 0.0, 1.0)
	var closest := Vector2(ax, ay) + ab * t
	return closest.distance_to(Vector2(cx, cy)) < cr + half_thickness
