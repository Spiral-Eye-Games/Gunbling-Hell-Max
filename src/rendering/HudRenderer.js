import { COLORS } from "../config/colors.js";
import { GAME_HEIGHT, GAME_WIDTH, REEL_COUNT, SATAN_ROUND, SLOTS_PER_REEL } from "../config/gameConfig.js";
import { getMagazineSummary } from "../core/MagazineSystem.js";
import { TOKENS } from "../data/tokens.js";
import { drawTemporaryText } from "../effects/EffectsSystem.js";
import { getCurrentOffers } from "../systems/ShopSystem.js";

export function drawHUD(scene) {
  const g = scene.uiGraphics;

  drawBottomLeftPanel(scene, g);
  drawSlotPanel(g);
  drawRightPanel(g);
  drawReelConfigPanel(scene, g);
  drawBossHealthBar(scene, g);
  drawShopPanel(scene, g);

  scene.floorText.setText(
    scene.phase === "boss" && scene.boss
      ? "RONDA 66 · BOSS FINAL · SATANÁS"
      : "RONDA " + scene.round + " / " + SATAN_ROUND
  );

  scene.hpText.setText("HP");
  scene.comboText.setText("COMBO x" + Math.floor(scene.combo));
  scene.reelResultText.setText(scene.reelResults.join("   "));

  scene.magazineText.setText(
    "BALAS: " + scene.currentMagazine.ammo + " / " + scene.currentMagazine.maxAmmo
  );

  scene.modsText.setText(getMagazineSummary(scene.currentMagazine));

  scene.rightPanelText.setText(
    scene.score.toLocaleString("es-AR") +
    "\nPUNTUACIÓN\n\n" +
    "x" + Math.floor(scene.combo) +
    "\nCOMBO\n\n" +
    scene.chips.toLocaleString("es-AR") +
    "\nFICHAS"
  );
}

function drawBottomLeftPanel(scene, g) {
  g.fillStyle(COLORS.panel, 0.82);
  g.fillRoundedRect(18, GAME_HEIGHT - 92, 380, 66, 10);

  g.lineStyle(2, COLORS.gold, 0.95);
  g.strokeRoundedRect(18, GAME_HEIGHT - 92, 380, 66, 10);

  g.fillStyle(COLORS.darkRed, 1);
  g.fillRect(78, GAME_HEIGHT - 67, 260, 20);

  g.fillStyle(COLORS.red, 1);
  g.fillRect(78, GAME_HEIGHT - 67, 260 * (scene.hp / scene.maxHp), 20);

  g.lineStyle(2, COLORS.paleGold, 1);
  g.strokeRect(78, GAME_HEIGHT - 67, 260, 20);

  const dashReady = scene.dashCooldown <= 0;
  g.fillStyle(dashReady ? 0xff3d2d : 0x3a1a1a, 1);
  g.fillCircle(360, GAME_HEIGHT - 58, 17);
  g.lineStyle(2, COLORS.paleGold, dashReady ? 1 : 0.4);
  g.strokeCircle(360, GAME_HEIGHT - 58, 17);
}

function drawSlotPanel(g) {
  g.fillStyle(COLORS.panel, 0.9);
  g.fillRoundedRect(GAME_WIDTH / 2 - 255, GAME_HEIGHT - 154, 510, 132, 10);

  g.lineStyle(2, COLORS.gold, 0.95);
  g.strokeRoundedRect(GAME_WIDTH / 2 - 255, GAME_HEIGHT - 154, 510, 132, 10);

  for (let i = 0; i < 3; i++) {
    g.fillStyle(0x1e0e05, 1);
    g.fillRoundedRect(GAME_WIDTH / 2 - 145 + i * 95, GAME_HEIGHT - 143, 82, 60, 6);

    g.lineStyle(2, 0xdaad3d, 1);
    g.strokeRoundedRect(GAME_WIDTH / 2 - 145 + i * 95, GAME_HEIGHT - 143, 82, 60, 6);
  }
}

function drawRightPanel(g) {
  g.fillStyle(COLORS.panel, 0.75);
  g.fillRoundedRect(GAME_WIDTH - 275, GAME_HEIGHT - 185, 250, 150, 10);

  g.lineStyle(2, COLORS.gold, 0.95);
  g.strokeRoundedRect(GAME_WIDTH - 275, GAME_HEIGHT - 185, 250, 150, 10);
}

function drawReelConfigPanel(scene, g) {
  const x0 = 24;
  const y0 = 98;
  const cell = 27;

  g.fillStyle(COLORS.panel, 0.78);
  g.fillRoundedRect(x0 - 10, y0 - 34, 570, 132, 10);
  g.lineStyle(2, COLORS.gold, 0.85);
  g.strokeRoundedRect(x0 - 10, y0 - 34, 570, 132, 10);

  drawTemporaryText(scene, x0 + 270, y0 - 27, "TUS RULETAS · VACÍO = +3 BALAS", {
    fontFamily: "Georgia",
    fontSize: "17px",
    color: "#ffe0a0",
    align: "center",
    stroke: "#1a0000",
    strokeThickness: 3
  });

  for (let r = 0; r < REEL_COUNT; r++) {
    drawTemporaryText(scene, x0, y0 + r * 35 + 3, "R" + (r + 1), {
      fontFamily: "Georgia",
      fontSize: "17px",
      color: "#ffe0a0",
      stroke: "#1a0000",
      strokeThickness: 3
    });

    for (let s = 0; s < SLOTS_PER_REEL; s++) {
      const x = x0 + 45 + s * 80;
      const y = y0 + r * 35;
      const tokenKey = scene.reels[r][s];
      const selected =
        scene.placingToken &&
        r === scene.placeReelIndex &&
        s === scene.placeSlotIndex;

      g.fillStyle(tokenKey ? TOKENS[tokenKey].color : 0x1a1a1a, tokenKey ? 0.95 : 0.75);
      g.fillRoundedRect(x, y, 56, cell, 5);

      g.lineStyle(2, selected ? 0xffffff : COLORS.gold, selected ? 1 : 0.65);
      g.strokeRoundedRect(x, y, 56, cell, 5);

      drawTemporaryText(scene, x + 28, y + 2, tokenKey ? TOKENS[tokenKey].label : "□", {
        fontFamily: "Georgia",
        fontSize: "18px",
        color: tokenKey ? "#170000" : "#b8b8b8",
        align: "center",
        stroke: tokenKey ? "#ffdca0" : "#000000",
        strokeThickness: tokenKey ? 1 : 2
      });
    }
  }
}

function drawBossHealthBar(scene, g) {
  if (!scene.boss) return;

  g.fillStyle(0x100000, 0.95);
  g.fillRoundedRect(305, 58, 670, 34, 9);

  g.lineStyle(3, COLORS.gold, 1);
  g.strokeRoundedRect(305, 58, 670, 34, 9);

  g.fillStyle(COLORS.red, 1);
  g.fillRoundedRect(315, 66, 650 * (scene.boss.hp / scene.boss.maxHp), 18, 6);

  drawTemporaryText(scene, GAME_WIDTH / 2, 58, "SATANÁS", {
    fontFamily: "Georgia",
    fontSize: "24px",
    color: "#ffe0a0",
    align: "center",
    stroke: "#1a0000",
    strokeThickness: 4
  });
}

function drawShopPanel(scene, g) {
  if (scene.phase !== "shop" && scene.phase !== "initialShop") return;

  g.fillStyle(0x020000, 0.94);
  g.fillRoundedRect(165, 185, 950, 360, 14);

  g.lineStyle(3, COLORS.gold, 1);
  g.strokeRoundedRect(165, 185, 950, 360, 14);

  let title;

  if (scene.phase === "initialShop") {
    title = "TIENDA INICIAL · TOKENS GRATIS RESTANTES: " + scene.freeTokensRemaining;
  } else {
    title = "TIENDA DEL INFRAMUNDO · TAB cambia sección · R reroll";
  }

  if (scene.placingToken) {
    title = "COLOCANDO TOKEN: " + TOKENS[scene.placingToken].name + " · Flechas mover · E colocar";
  }

  scene.shopText.setText(title);

  if (scene.placingToken) {
    drawTemporaryText(scene, GAME_WIDTH / 2, 260,
      "Elegí un slot en cualquiera de tus 3 ruletas.\nPodés reemplazar slots vacíos o tokens anteriores.",
      {
        fontFamily: "Georgia",
        fontSize: "28px",
        color: "#ffe0a0",
        align: "center",
        stroke: "#1a0000",
        strokeThickness: 4
      }
    );
    return;
  }

  drawShopTabs(scene, g);

  const offers = getCurrentOffers(scene);

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i];
    const x = 230 + i * 295;
    const y = 285;
    const selected = i === scene.shopSelection;

    g.fillStyle(selected ? 0x441000 : 0x120806, 1);
    g.fillRoundedRect(x, y, 260, 205, 12);

    g.lineStyle(3, selected ? 0xffcf54 : 0x8d5b18, 1);
    g.strokeRoundedRect(x, y, 260, 205, 12);

    const priceText =
      scene.phase === "initialShop" && offer.type === "token"
        ? "GRATIS"
        : "COSTO: " + offer.cost;

    drawTemporaryText(
      scene,
      x + 130,
      y + 22,
      offer.name + "\n\n" + offer.description + "\n\n" + priceText,
      {
        fontFamily: "Georgia",
        fontSize: "21px",
        color: "#ffe0a0",
        align: "center",
        stroke: "#1a0000",
        strokeThickness: 4,
        wordWrap: { width: 220 }
      }
    );
  }
}

function drawShopTabs(scene, g) {
  const tokenSelected = scene.shopSection === "tokens";
  const passiveSelected = scene.shopSection === "passives";

  const y = 225;

  g.fillStyle(tokenSelected ? 0x5a1505 : 0x120806, 1);
  g.fillRoundedRect(320, y, 260, 40, 8);
  g.lineStyle(2, tokenSelected ? 0xffcf54 : 0x8d5b18, 1);
  g.strokeRoundedRect(320, y, 260, 40, 8);

  g.fillStyle(passiveSelected ? 0x5a1505 : 0x120806, 1);
  g.fillRoundedRect(700, y, 260, 40, 8);
  g.lineStyle(2, passiveSelected ? 0xffcf54 : 0x8d5b18, 1);
  g.strokeRoundedRect(700, y, 260, 40, 8);

  drawTemporaryText(scene, 450, y + 7, "TOKENS DE RULETA", {
    fontFamily: "Georgia",
    fontSize: "19px",
    color: "#ffe0a0",
    align: "center",
    stroke: "#1a0000",
    strokeThickness: 3
  });

  drawTemporaryText(scene, 830, y + 7, "PASIVAS", {
    fontFamily: "Georgia",
    fontSize: "19px",
    color: "#ffe0a0",
    align: "center",
    stroke: "#1a0000",
    strokeThickness: 3
  });
}
