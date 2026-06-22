import { COLORS } from "../config/colors.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";

export function drawArena(scene) {
  const g = scene.graphics;

  g.fillStyle(COLORS.background, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  g.lineStyle(1, 0x281b1b, 0.65);

  for (let x = 0; x < GAME_WIDTH; x += 64) {
    g.lineBetween(x, 0, x + Phaser.Math.Between(-30, 30), GAME_HEIGHT);
  }

  for (let y = 0; y < GAME_HEIGHT; y += 54) {
    g.lineBetween(0, y, GAME_WIDTH, y + Phaser.Math.Between(-20, 20));
  }

  g.fillStyle(COLORS.carpet, 1);
  g.fillRect(GAME_WIDTH / 2 - 110, 0, 220, GAME_HEIGHT);
  g.lineStyle(2, COLORS.carpetLine, 0.65);
  g.strokeRect(GAME_WIDTH / 2 - 110, 0, 220, GAME_HEIGHT);

  drawCasinoTable(scene, 130, 135);
  drawCasinoTable(scene, 1110, 145);
  drawCasinoTable(scene, 180, 570);
  drawCasinoTable(scene, 1060, 560);

  g.fillStyle(COLORS.wall, 1);
  g.fillRect(0, 0, GAME_WIDTH, 48);
  g.fillRect(0, GAME_HEIGHT - 48, GAME_WIDTH, 48);
  g.fillRect(0, 0, 44, GAME_HEIGHT);
  g.fillRect(GAME_WIDTH - 44, 0, 44, GAME_HEIGHT);

  g.lineStyle(3, 0x8b1d12, 0.8);
  g.strokeRect(44, 48, GAME_WIDTH - 88, GAME_HEIGHT - 96);
}

function drawCasinoTable(scene, x, y) {
  const g = scene.graphics;

  g.fillStyle(0x5c4b14, 1);
  g.fillRoundedRect(x - 80, y - 25, 160, 50, 16);

  g.lineStyle(3, 0xb58a22, 0.75);
  g.strokeRoundedRect(x - 80, y - 25, 160, 50, 16);

  g.fillStyle(0x1b1206, 1);
  g.fillCircle(x - 35, y, 8);
  g.fillCircle(x + 30, y + 5, 8);
}

export function drawCrosshair(scene) {
  if (scene.phase === "shop" || scene.phase === "initialShop") return;

  const g = scene.graphics;
  const pointer = scene.input.activePointer;
  const x = pointer.worldX;
  const y = pointer.worldY;

  g.lineStyle(2, COLORS.paleGold, 0.9);
  g.strokeCircle(x, y, 10);

  g.lineBetween(x - 16, y, x - 6, y);
  g.lineBetween(x + 6, y, x + 16, y);
  g.lineBetween(x, y - 16, x, y - 6);
  g.lineBetween(x, y + 6, x, y + 16);
}
