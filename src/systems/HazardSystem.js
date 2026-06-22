import { COLORS } from "../config/colors.js";
import { circlesOverlap } from "../utils/collision.js";
import { damagePlayer } from "./PlayerSystem.js";

export function spawnPoisonHazardNearPlayer(scene) {
  scene.hazards.push({
    x: scene.player.x + Phaser.Math.Between(-55, 55),
    y: scene.player.y + Phaser.Math.Between(-55, 55),
    radius: 8,
    maxRadius: 45,
    life: 3,
    growSpeed: 40,
    color: COLORS.poison,
    damage: 12
  });
}

export function spawnBossHazardRing(scene) {
  if (!scene.boss) return;

  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI * 2 / 10 + scene.boss.phaseTimer;

    scene.hazards.push({
      x: scene.boss.x + Math.cos(angle) * Phaser.Math.Between(80, 270),
      y: scene.boss.y + Math.sin(angle) * Phaser.Math.Between(80, 240),
      radius: 8,
      maxRadius: 34,
      life: 2.5,
      growSpeed: 55,
      color: COLORS.red,
      damage: 18
    });
  }
}

export function updateHazards(scene, dt) {
  for (let i = scene.hazards.length - 1; i >= 0; i--) {
    const hazard = scene.hazards[i];

    hazard.life -= dt;
    hazard.radius = Math.min(hazard.maxRadius, hazard.radius + hazard.growSpeed * dt);

    if (
      circlesOverlap(
        hazard.x,
        hazard.y,
        hazard.radius,
        scene.player.x,
        scene.player.y,
        scene.player.radius
      )
    ) {
      damagePlayer(scene, hazard.damage);
    }

    if (hazard.life <= 0) {
      scene.hazards.splice(i, 1);
    }
  }
}
