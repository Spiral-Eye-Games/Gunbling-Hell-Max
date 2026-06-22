export function updateCombo(scene, dt) {
  if (scene.comboTimer > 0) {
    scene.comboTimer -= dt;
  } else {
    scene.combo = Math.max(1, scene.combo - dt * 1.8 * scene.comboDecayMultiplier);
  }
}
