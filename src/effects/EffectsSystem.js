import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";

export function addHitEffect(scene, x, y, color, radius) {
  scene.hitEffects.push({
    x,
    y,
    color,
    radius,
    life: 0.28,
    maxLife: 0.28
  });
}

export function updateHitEffects(scene, dt) {
  for (let i = scene.hitEffects.length - 1; i >= 0; i--) {
    scene.hitEffects[i].life -= dt;

    if (scene.hitEffects[i].life <= 0) {
      scene.hitEffects.splice(i, 1);
    }
  }
}

export function drawHitEffects(scene) {
  const g = scene.graphics;

  for (const effect of scene.hitEffects) {
    const alpha = effect.life / effect.maxLife;

    g.lineStyle(3, effect.color, alpha);
    g.strokeCircle(effect.x, effect.y, effect.radius * (1.4 - alpha));
  }
}

export function showFloatingMessage(scene, title, subtitle) {
  const message = scene.add.text(
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2 - 80,
    title + "\n" + subtitle,
    {
      fontFamily: "Georgia",
      fontSize: "42px",
      color: "#ffbe38",
      align: "center",
      stroke: "#2b0000",
      strokeThickness: 7,
      wordWrap: { width: 800 }
    }
  ).setOrigin(0.5).setDepth(150);

  scene.tweens.add({
    targets: message,
    y: message.y - 40,
    alpha: 0,
    duration: 1000,
    ease: "Cubic.easeOut",
    onComplete: () => message.destroy()
  });
}

export function drawTemporaryText(scene, x, y, text, style) {
  const tempText = scene.add.text(x, y, text, style).setOrigin(0.5, 0).setDepth(111);

  scene.time.delayedCall(20, () => {
    tempText.destroy();
  });
}
