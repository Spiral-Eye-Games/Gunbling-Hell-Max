import { COLORS } from "../config/colors.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { circlesOverlap } from "../utils/collision.js";
import { killEnemy } from "./EnemySystem.js";
import { onSuccessfulHit } from "./RouletteSystem.js";

export function updateBullets(scene, dt) {
  for (let i = scene.bullets.length - 1; i >= 0; i--) {
    const bullet = scene.bullets[i];

    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;

    const isOutOfBounds =
      bullet.life <= 0 ||
      bullet.x < 35 ||
      bullet.x > GAME_WIDTH - 35 ||
      bullet.y < 50 ||
      bullet.y > GAME_HEIGHT - 50;

    if (isOutOfBounds) {
      scene.bullets.splice(i, 1);
      continue;
    }

    if (tryBulletHitEnemies(scene, bullet, i)) continue;

    tryBulletHitBoss(scene, bullet, i);
  }
}

function tryBulletHitEnemies(scene, bullet, bulletIndex) {
  for (let i = scene.enemies.length - 1; i >= 0; i--) {
    const enemy = scene.enemies[i];

    if (bullet.alreadyHit.has(enemy.id)) continue;

    if (
      circlesOverlap(
        bullet.x,
        bullet.y,
        bullet.radius,
        enemy.x,
        enemy.y,
        enemy.radius,
        bullet.laserWidth
      )
    ) {
      bullet.alreadyHit.add(enemy.id);

      onSuccessfulHit(scene);

      enemy.hp -= bullet.damage;
      scene.addHitEffect(enemy.x, enemy.y, bullet.color, bullet.piercing ? 22 : 16);

      if (bullet.explosive) {
        explode(scene, bullet.x, bullet.y, bullet.explosionRadius, 1.6 + scene.currentMagazine.missileTokens);
      }

      if (enemy.hp <= 0) {
        killEnemy(scene, i);
      }

      if (!bullet.piercing && !bullet.explosive) {
        scene.bullets.splice(bulletIndex, 1);
        return true;
      }

      if (bullet.explosive && !bullet.piercing) {
        scene.bullets.splice(bulletIndex, 1);
        return true;
      }
    }
  }

  return false;
}

function tryBulletHitBoss(scene, bullet, bulletIndex) {
  if (!scene.boss) return;
  if (bullet.alreadyHit.has("boss")) return;

  if (
    circlesOverlap(
      bullet.x,
      bullet.y,
      bullet.radius,
      scene.boss.x,
      scene.boss.y,
      scene.boss.radius,
      bullet.laserWidth
    )
  ) {
    bullet.alreadyHit.add("boss");

    onSuccessfulHit(scene);

    scene.boss.hp -= bullet.damage;
    scene.score += Math.floor(100 * scene.combo);

    scene.addHitEffect(scene.boss.x, scene.boss.y, bullet.color, bullet.piercing ? 28 : 22);

    if (bullet.explosive) {
      explode(scene, bullet.x, bullet.y, bullet.explosionRadius, 2.5 + scene.currentMagazine.missileTokens);
    }

    if (!bullet.piercing || bullet.explosive) {
      scene.bullets.splice(bulletIndex, 1);
    }

    if (scene.boss && scene.boss.hp <= 0) {
      scene.boss = null;
      scene.phase = "win";
      scene.objectiveText.setText("SATANÁS CAE · GANASTE LA RUN · F PARA REINICIAR");
    }
  }
}

function explode(scene, x, y, radius, damage) {
  scene.addHitEffect(x, y, COLORS.missile, radius);

  for (let i = scene.enemies.length - 1; i >= 0; i--) {
    const enemy = scene.enemies[i];

    if (circlesOverlap(x, y, radius, enemy.x, enemy.y, enemy.radius)) {
      enemy.hp -= damage;

      if (enemy.hp <= 0) {
        killEnemy(scene, i);
      }
    }
  }

  if (scene.boss) {
    if (circlesOverlap(x, y, radius, scene.boss.x, scene.boss.y, scene.boss.radius)) {
      scene.boss.hp -= damage;
    }
  }
}
