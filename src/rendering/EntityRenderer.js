import { COLORS } from "../config/colors.js";

export function drawPlayer(scene) {
  const g = scene.graphics;
  const p = scene.player;

  g.save();
  g.translateCanvas(p.x, p.y);
  g.rotateCanvas(p.angle);

  g.fillStyle(scene.invulnerabilityTimer > 0 ? COLORS.paleGold : 0xf2d0a1, 1);
  g.fillCircle(0, 0, p.radius);

  g.fillStyle(0x222222, 1);
  g.fillRect(8, -4, 28, 8);

  g.lineStyle(3, COLORS.gold, 1);
  g.strokeCircle(0, 0, p.radius + 3);

  g.restore();
}

export function drawEnemies(scene) {
  const g = scene.graphics;

  for (const enemy of scene.enemies) {
    g.fillStyle(0x280606, 1);
    g.fillCircle(enemy.x, enemy.y, enemy.radius + 4);

    g.fillStyle(enemy.color, 1);
    g.fillCircle(enemy.x, enemy.y, enemy.radius);

    g.fillStyle(0xffb22a, 1);
    g.fillCircle(enemy.x - 5, enemy.y - 3, 2);
    g.fillCircle(enemy.x + 5, enemy.y - 3, 2);

    g.lineStyle(3, 0x000000, 0.9);
    g.strokeCircle(enemy.x, enemy.y, enemy.radius);

    g.fillStyle(0x1a0000, 1);
    g.fillRect(enemy.x - 18, enemy.y - enemy.radius - 12, 36, 5);

    g.fillStyle(COLORS.red, 1);
    g.fillRect(
      enemy.x - 18,
      enemy.y - enemy.radius - 12,
      36 * (enemy.hp / enemy.maxHp),
      5
    );
  }
}

export function drawBoss(scene) {
  if (!scene.boss) return;

  const g = scene.graphics;
  const b = scene.boss;

  g.fillStyle(0x3a0505, 0.9);
  g.fillTriangle(b.x - 25, b.y, b.x - 125, b.y - 65, b.x - 80, b.y + 80);
  g.fillTriangle(b.x + 25, b.y, b.x + 125, b.y - 65, b.x + 80, b.y + 80);

  g.fillStyle(0x180000, 1);
  g.fillCircle(b.x, b.y, b.radius + 12);

  g.fillStyle(0xb31612, 1);
  g.fillCircle(b.x, b.y, b.radius);

  g.fillStyle(0xff6b15, 1);
  g.fillCircle(b.x - 13, b.y - 10, 5);
  g.fillCircle(b.x + 13, b.y - 10, 5);

  g.lineStyle(5, 0xff3b18, 1);
  g.strokeCircle(b.x, b.y, b.radius + 6);
}

export function drawBullets(scene) {
  const g = scene.graphics;

  for (const bullet of scene.bullets) {
    g.fillStyle(bullet.color, 1);

    if (bullet.piercing) {
      g.fillCircle(bullet.x, bullet.y, bullet.radius + bullet.laserWidth * 0.35);
      g.lineStyle(2, COLORS.laser, 0.6);
      g.strokeCircle(bullet.x, bullet.y, bullet.radius + bullet.laserWidth);
    } else if (bullet.explosive) {
      g.fillCircle(bullet.x, bullet.y, bullet.radius + 2);
      g.lineStyle(2, COLORS.paleGold, 0.8);
      g.strokeCircle(bullet.x, bullet.y, bullet.radius + 5);
    } else {
      g.fillCircle(bullet.x, bullet.y, bullet.radius);
    }
  }
}

export function drawHazards(scene) {
  const g = scene.graphics;

  for (const hazard of scene.hazards) {
    g.fillStyle(hazard.color, 0.18);
    g.fillCircle(hazard.x, hazard.y, hazard.radius);

    g.lineStyle(2, hazard.color, 0.8);
    g.strokeCircle(hazard.x, hazard.y, hazard.radius);
  }
}

export function drawWorldEntities(scene) {
  drawHazards(scene);
  drawBullets(scene);
  drawEnemies(scene);
  drawBoss(scene);
  drawPlayer(scene);
}
