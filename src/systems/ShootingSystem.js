import { getBulletColor, getMagazineBonuses, refreshBaseMagazine } from "../core/MagazineSystem.js";

export function tryShoot(scene) {
  if (scene.currentMagazine.ammo <= 0) {
    refreshBaseMagazine(scene);
    return;
  }

  const now = scene.time.now;

  if (now - scene.lastShotAt < scene.currentMagazine.fireCooldownMs) {
    return;
  }

  scene.lastShotAt = now;

  const pointer = scene.input.activePointer;
  const baseAngle = Phaser.Math.Angle.Between(
    scene.player.x,
    scene.player.y,
    pointer.worldX,
    pointer.worldY
  );

  fireMagazineShot(scene, baseAngle);

  scene.currentMagazine.ammo -= 1;

  if (scene.currentMagazine.ammo <= 0) {
    scene.time.delayedCall(220, () => {
      if (scene.currentMagazine.ammo <= 0) {
        refreshBaseMagazine(scene);
      }
    });
  }
}

function fireMagazineShot(scene, baseAngle) {
  const mag = scene.currentMagazine;
  const count = mag.projectileCount;

  if (count <= 1) {
    spawnBullet(scene, baseAngle);
    return;
  }

  const totalSpread = mag.spreadRadians * (count - 1);
  const startAngle = baseAngle - totalSpread / 2;

  for (let i = 0; i < count; i++) {
    const angle = startAngle + mag.spreadRadians * i;
    spawnBullet(scene, angle);
  }
}

function spawnBullet(scene, angle) {
  const mag = scene.currentMagazine;

  const bullet = {
    x: scene.player.x + Math.cos(angle) * 24,
    y: scene.player.y + Math.sin(angle) * 24,
    vx: Math.cos(angle) * mag.bulletSpeed,
    vy: Math.sin(angle) * mag.bulletSpeed,

    radius: mag.piercing ? 5 + mag.laserWidth * 0.45 : 5,
    damage: mag.bulletDamage,
    life: mag.piercing ? 1.15 : 1.0,

    color: getBulletColor(mag),
    explosive: mag.explosive,
    explosionRadius: mag.explosionRadius,
    piercing: mag.piercing,
    laserWidth: mag.laserWidth,

    alreadyHit: new Set()
  };

  scene.bullets.push(bullet);
}

export function tryShootIfHeld(scene) {
  if (scene.input.activePointer.isDown) {
    tryShoot(scene);
  }
}
