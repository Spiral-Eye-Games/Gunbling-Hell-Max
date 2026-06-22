import { COLORS } from "../config/colors.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { getReinforcementWaveSize } from "../config/balance.js";
import { createId, circlesOverlap } from "../utils/collision.js";
import { damagePlayer } from "./PlayerSystem.js";
import { spawnPoisonHazardNearPlayer } from "./HazardSystem.js";

export function spawnWave(scene, amount) {
  for (let i = 0; i < amount; i++) {
    spawnEnemy(scene);
  }
}

export function spawnEnemy(scene, forcedKind = null) {
  const side = Phaser.Math.Between(0, 3);

  let x;
  let y;

  if (side === 0) {
    x = 70;
    y = Phaser.Math.Between(90, GAME_HEIGHT - 95);
  } else if (side === 1) {
    x = GAME_WIDTH - 70;
    y = Phaser.Math.Between(90, GAME_HEIGHT - 95);
  } else if (side === 2) {
    x = Phaser.Math.Between(80, GAME_WIDTH - 80);
    y = 80;
  } else {
    x = Phaser.Math.Between(80, GAME_WIDTH - 80);
    y = GAME_HEIGHT - 85;
  }

  const shouldBeSpitter = Math.random() < 0.18 + Math.min(0.15, scene.round * 0.005);
  const kind = forcedKind || (shouldBeSpitter ? "spitter" : "grunt");

  const roundScaling = Math.floor(scene.round / 8);
  const maxHp = kind === "spitter"
    ? 4 + roundScaling
    : 2 + Math.floor(roundScaling / 2);

  const enemy = {
    id: createId(),
    kind,
    x,
    y,
    radius: kind === "spitter" ? 20 : 16,
    hp: maxHp,
    maxHp,
    speed: kind === "spitter" ? 75 : 95 + Math.min(45, scene.round * 0.8),
    attackCooldown: Phaser.Math.FloatBetween(1.2, 2.8),
    color: kind === "spitter" ? COLORS.poison : COLORS.enemy
  };

  scene.enemies.push(enemy);
}

export function updateEnemies(scene, dt) {
  for (const enemy of scene.enemies) {
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, scene.player.x, scene.player.y);

    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;

    enemy.attackCooldown -= dt;

    if (enemy.kind === "spitter" && enemy.attackCooldown <= 0) {
      spawnPoisonHazardNearPlayer(scene);
      enemy.attackCooldown = Phaser.Math.FloatBetween(2.1, 3.4);
    }

    if (
      circlesOverlap(
        enemy.x,
        enemy.y,
        enemy.radius,
        scene.player.x,
        scene.player.y,
        scene.player.radius
      )
    ) {
      damagePlayer(scene, 10);

      const pushAngle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        scene.player.x,
        scene.player.y
      );

      scene.player.x += Math.cos(pushAngle) * 45;
      scene.player.y += Math.sin(pushAngle) * 45;
    }
  }
}

export function killEnemy(scene, enemyIndex) {
  const enemy = scene.enemies[enemyIndex];
  scene.enemies.splice(enemyIndex, 1);

  scene.killsThisRound += 1;

  scene.combo += 0.25;
  scene.combo = Math.min(scene.combo, 30);
  scene.comboTimer = 3.2;

  const scoreGain = Math.floor((300 + scene.round * 15) * scene.combo);
  const chipGain = Math.floor(12 + scene.combo * 2 + scene.round * 0.15);

  scene.score += scoreGain;
  scene.chips += chipGain;

  if (scene.ui?.showScoreGain) {
    scene.ui.showScoreGain(scoreGain);
  }

  scene.addHitEffect(enemy.x, enemy.y, 0xff4420, 28);

  if (
    scene.phase === "combat" &&
    scene.enemies.length < 4 &&
    scene.killsThisRound < scene.requiredKills
  ) {
    spawnWave(scene, getReinforcementWaveSize(scene.round));
  }
}
