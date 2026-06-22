export function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function distanceBetween(x1, y1, x2, y2) {
  return Phaser.Math.Distance.Between(x1, y1, x2, y2);
}

export function circlesOverlap(x1, y1, r1, x2, y2, r2, extraRadius = 0) {
  return distanceBetween(x1, y1, x2, y2) < r1 + r2 + extraRadius;
}
