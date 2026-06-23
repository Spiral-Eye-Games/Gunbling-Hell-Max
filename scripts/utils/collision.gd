class_name CollisionUtils
extends RefCounted

static func create_id() -> String:
	return str(randi()) + "_" + str(Time.get_ticks_usec())


static func distance_between(x1: float, y1: float, x2: float, y2: float) -> float:
	return Vector2(x1, y1).distance_to(Vector2(x2, y2))


static func circles_overlap(x1: float, y1: float, r1: float, x2: float, y2: float, r2: float, extra_radius: float = 0.0) -> bool:
	return distance_between(x1, y1, x2, y2) < r1 + r2 + extra_radius
