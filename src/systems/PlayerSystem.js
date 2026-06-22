import { COLORS } from "../config/colors.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";

export function handlePlayerMovement(scene, dt) {
  let moveX = 0;
  let moveY = 0;

  if (scene.keys.W.isDown) moveY -= 1;
  if (scene.keys.S.isDown) moveY += 1;
  if (scene.keys.A.isDown) moveX -= 1;
  if (scene.keys.D.isDown) moveX += 1;

  const length = Math.hypot(moveX, moveY) || 1;
  moveX /= length;
  moveY /= length;

  if (scene.dashCooldown > 0) {
    scene.dashCooldown -= dt;
  }

  const wantsDash =
    Phaser.Input.Keyboard.JustDown(scene.keys.SHIFT) ||
    Phaser.Input.Keyboard.JustDown(scene.keys.SPACE);

  if (wantsDash && scene.dashCooldown <= 0) {
    scene.player.x += moveX * 135;
    scene.player.y += moveY * 135;
    scene.dashCooldown = 1.0;
    scene.invulnerabilityTimer = 0.22;
    scene.addHitEffect(scene.player.x, scene.player.y, COLORS.paleGold, 24);
  }

  scene.player.x += moveX * (scene.player.speed + scene.speedBonus) * dt;
  scene.player.y += moveY * (scene.player.speed + scene.speedBonus) * dt;

  scene.player.x = Phaser.Math.Clamp(scene.player.x, 60, GAME_WIDTH - 60);
  scene.player.y = Phaser.Math.Clamp(scene.player.y, 70, GAME_HEIGHT - 75);

  if (scene.invulnerabilityTimer > 0) {
    scene.invulnerabilityTimer -= dt;
  }

  const pointer = scene.input.activePointer;
  scene.player.angle = Phaser.Math.Angle.Between(
    scene.player.x,
    scene.player.y,
    pointer.worldX,
    pointer.worldY
  );
}

export function damagePlayer(scene, amount) {
  if (scene.invulnerabilityTimer > 0) return;

  scene.hp -= amount;
  scene.invulnerabilityTimer = 0.55;

  scene.combo = 1;
  scene.comboTimer = 0;

  scene.cameras.main.shake(100, 0.008);

  if (scene.hp <= 0) {
    scene.hp = 0;
    scene.phase = "dead";
    scene.objectiveText.setText("DERROTA · F PARA REINICIAR");
  }
}
