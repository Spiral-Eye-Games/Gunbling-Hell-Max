import { COLORS } from "../config/colors.js";
import { GAME_WIDTH } from "../config/gameConfig.js";
import { refreshBaseMagazine } from "../core/MagazineSystem.js";
import { circlesOverlap } from "../utils/collision.js";
import { spawnBossHazardRing } from "./HazardSystem.js";
import { damagePlayer } from "./PlayerSystem.js";

export function startBossFight(scene) {
  scene.phase = "boss";
  scene.killsThisRound = 0;
  scene.enemies = [];
  scene.hazards = [];
  scene.bullets = [];
  scene.shopText.setText("");

  refreshBaseMagazine(scene);
  scene.objectiveText.setText("RONDA 66 · BOSS FINAL · SATANÁS");

  scene.boss = {
    x: GAME_WIDTH / 2,
    y: 150,
    radius: 50,
    hp: 900,
    maxHp: 900,
    attackCooldown: 1.5,
    phaseTimer: 0
  };
}

export function updateBoss(scene, dt) {
  if (!scene.boss) return;

  const boss = scene.boss;

  boss.phaseTimer += dt;
  boss.attackCooldown -= dt;

  const angle = Phaser.Math.Angle.Between(boss.x, boss.y, scene.player.x, scene.player.y);

  boss.x += Math.cos(angle) * 38 * dt;
  boss.y += Math.sin(angle) * 38 * dt;

  if (boss.attackCooldown <= 0) {
    spawnBossHazardRing(scene);
    boss.attackCooldown = 1.8;
  }

  if (
    circlesOverlap(
      boss.x,
      boss.y,
      boss.radius,
      scene.player.x,
      scene.player.y,
      scene.player.radius
    )
  ) {
    damagePlayer(scene, 18);
  }
}
