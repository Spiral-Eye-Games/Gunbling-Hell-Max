import { COLORS } from "../config/colors.js";
import { GAME_HEIGHT, GAME_WIDTH, REEL_COUNT, SATAN_ROUND, SLOTS_PER_REEL } from "../config/gameConfig.js";
import { getCurrentOffers } from "../systems/ShopSystem.js";
import { TOKENS } from "../data/tokens.js";
import { drawDashRing, drawOrnateBar, drawOrnatePanel } from "./uiFrames.js";
import { getShotTypeLabel } from "./shotType.js";
import { getTokenIconKey } from "./IconRegistry.js";
import { FONTS, textStyle, UI_COLORS, UI_DEPTH } from "./uiTheme.js";

const COMBAT_PHASES = new Set(["combat", "boss"]);
const SHOP_PHASES = new Set(["shop", "initialShop"]);

const SHOP_LAYOUT = {
  panelX: 155,
  panelY: 248,
  panelW: 970,
  panelH: 290,
  tabY: 252,
  tabH: 38,
  tabW: 270,
  tabTokensX: 310,
  tabPassivesX: 690,
  cardY: 300,
  cardW: 260,
  cardH: 210,
  cardStartX: 220,
  cardStep: 295,
  cardPadding: 16,
  iconSize: 36,
  iconGap: 10
};

function shopCardLeft(index) {
  return SHOP_LAYOUT.cardStartX + index * SHOP_LAYOUT.cardStep;
}

function shopCardRight(index) {
  return shopCardLeft(index) + SHOP_LAYOUT.cardW;
}

function shopCardInnerWidth() {
  return SHOP_LAYOUT.cardW - SHOP_LAYOUT.cardPadding * 2;
}

function shopTabCenter(tabX) {
  return tabX + SHOP_LAYOUT.tabW / 2;
}

function addIcon(scene, x, y, textureKey, size = 20) {
  if (!scene.textures.exists(textureKey)) {
    return null;
  }

  return scene.add.image(x, y, textureKey)
    .setDisplaySize(size, size)
    .setOrigin(0.5)
    .setDepth(UI_DEPTH.shop);
}

function setVisible(obj, visible) {
  if (obj) obj.setVisible(visible);
}

export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.g = null;
    this.lastComboFloor = 1;
    this.gainTimer = 0;
    this.reelsCollapsed = true;
  }

  create() {
    const scene = this.scene;

    this.g = scene.add.graphics().setDepth(UI_DEPTH.frames);
    this.overlayG = scene.add.graphics().setDepth(UI_DEPTH.overlay);

    this.createTopBar(scene);
    this.createCombatHud(scene);
    this.createStatsPanel(scene);
    this.createReelConfigPanel(scene);
    this.createShopPanel(scene);
    this.createHintBar(scene);

    scene.objectiveText = this.objectiveText;
    scene.shopText = this.shopTitle;
    scene.gainText = this.gainPopup;
  }

  createTopBar(scene) {
    this.roundText = scene.add.text(24, 14, "", textStyle("22px", UI_COLORS.textGold, FONTS.display))
      .setDepth(UI_DEPTH.shop);

    this.objectiveText = scene.add.text(GAME_WIDTH / 2, 14, "", {
      ...textStyle("20px", UI_COLORS.textRed, FONTS.display),
      align: "center"
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.shop);

    this.killBarLabel = scene.add.text(GAME_WIDTH / 2, 44, "", {
      ...textStyle("16px", UI_COLORS.textPale),
      align: "center"
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.text);

    this.bossNameText = scene.add.text(GAME_WIDTH / 2, 54, "SATANÁS", {
      ...textStyle("26px", UI_COLORS.textPale, FONTS.display),
      align: "center"
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.text).setVisible(false);

    this.bossSkullIcon = addIcon(scene, GAME_WIDTH / 2 - 92, 62, "icon_skull", 22)
      .setVisible(false);
  }

  createCombatHud(scene) {
    const slotY = GAME_HEIGHT - 148;
    const slotW = 88;
    const slotH = 72;
    const startX = GAME_WIDTH / 2 - (slotW * 3 + 16) / 2;

    this.combatReelSlots = [];

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (slotW + 8);
      this.combatReelSlots.push({
        x,
        y: slotY,
        w: slotW,
        h: slotH,
        symbol: scene.add.text(x + slotW / 2, slotY + slotH / 2, "?", {
          ...textStyle("38px", UI_COLORS.textGold, FONTS.impact),
          align: "center"
        }).setOrigin(0.5).setDepth(UI_DEPTH.text),
        icon: addIcon(scene, x + slotW / 2, slotY + slotH / 2, "icon_empty", 34)
          .setVisible(false)
      });
    }

    this.shotTypeLabel = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 58, "", {
      ...textStyle("15px", "#b8b8b8"),
      align: "center"
    }).setOrigin(0.5).setDepth(UI_DEPTH.text);

    this.shotTypeValue = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, "", {
      ...textStyle("20px", UI_COLORS.textPale, FONTS.display),
      align: "center"
    }).setOrigin(0.5).setDepth(UI_DEPTH.text);

    this.hpIcon = addIcon(scene, 34, GAME_HEIGHT - 76, "icon_heart", 18)
      .setOrigin(0, 0.5);

    this.hpLabel = scene.add.text(56, GAME_HEIGHT - 88, "HP", textStyle("18px", UI_COLORS.textPale, FONTS.display))
      .setDepth(UI_DEPTH.text);

    this.hpValue = scene.add.text(248, GAME_HEIGHT - 88, "", {
      ...textStyle("18px", UI_COLORS.textWhite),
      align: "right"
    }).setOrigin(1, 0).setDepth(UI_DEPTH.text);

    this.dashIcon = addIcon(scene, 248, GAME_HEIGHT - 48, "icon_dash", 22);

    this.dashLabel = scene.add.text(36, GAME_HEIGHT - 38, "DASH", textStyle("14px", UI_COLORS.textPale, FONTS.display))
      .setDepth(UI_DEPTH.text);

    this.dashKey = scene.add.text(36, GAME_HEIGHT - 22, "SHIFT", textStyle("12px", "#888888"))
      .setDepth(UI_DEPTH.text);

    this.gainPopup = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 280, "", {
      ...textStyle("36px", "#ffb53a", FONTS.impact),
      align: "center"
    }).setOrigin(0.5).setDepth(UI_DEPTH.popup).setAlpha(0);

    this.comboPulse = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 318, "", {
      ...textStyle("28px", "#ff8a2a", FONTS.impact),
      align: "center"
    }).setOrigin(0.5).setDepth(UI_DEPTH.popup).setAlpha(0);
  }

  createStatsPanel(scene) {
    const x = GAME_WIDTH - 248;
    const iconX = x - 28;

    this.scoreIcon = addIcon(scene, iconX, GAME_HEIGHT - 128, "icon_score", 20);
    this.scoreValue = scene.add.text(x, GAME_HEIGHT - 138, "", textStyle("26px", UI_COLORS.textGold, FONTS.impact))
      .setDepth(UI_DEPTH.text);

    this.scoreLabel = scene.add.text(x, GAME_HEIGHT - 112, "PUNTUACIÓN", textStyle("13px", "#888888"))
      .setDepth(UI_DEPTH.text);

    this.comboIcon = addIcon(scene, iconX, GAME_HEIGHT - 72, "icon_combo", 20);
    this.comboStatValue = scene.add.text(x, GAME_HEIGHT - 82, "", textStyle("26px", "#ff7b2f", FONTS.impact))
      .setDepth(UI_DEPTH.text);

    this.comboStatLabel = scene.add.text(x, GAME_HEIGHT - 56, "COMBO", textStyle("13px", "#888888"))
      .setDepth(UI_DEPTH.text);

    this.chipsIcon = addIcon(scene, iconX, GAME_HEIGHT - 16, "icon_coins", 20);
    this.chipsValue = scene.add.text(x, GAME_HEIGHT - 26, "", textStyle("26px", "#d81414", FONTS.impact))
      .setDepth(UI_DEPTH.text);

    this.chipsLabel = scene.add.text(x, GAME_HEIGHT - 48, "FICHAS", textStyle("13px", "#888888"))
      .setDepth(UI_DEPTH.text);

    this.endTitle = scene.add.text(GAME_WIDTH / 2, 310, "", {
      ...textStyle("42px", UI_COLORS.textPale, FONTS.display),
      align: "center",
      wordWrap: { width: 520 }
    }).setOrigin(0.5).setDepth(UI_DEPTH.popup).setVisible(false);

    this.endSubtitle = scene.add.text(GAME_WIDTH / 2, 380, "", {
      ...textStyle("22px", UI_COLORS.textGold),
      align: "center"
    }).setOrigin(0.5).setDepth(UI_DEPTH.popup).setVisible(false);
  }

  createReelConfigPanel(scene) {
    this.reelPanelTitle = scene.add.text(24, 68, "TUS RULETAS · VACÍO = +3 BALAS", textStyle("15px", UI_COLORS.textPale, FONTS.display))
      .setDepth(UI_DEPTH.shop);

    this.reelRowLabels = [];
    this.reelSlotTexts = [];

    for (let r = 0; r < REEL_COUNT; r++) {
      this.reelRowLabels.push(
        scene.add.text(24, 98 + r * 34, "R" + (r + 1), textStyle("15px", UI_COLORS.textPale))
          .setDepth(UI_DEPTH.shop)
      );

      const rowSlots = [];

      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        rowSlots.push(
          scene.add.text(68 + s * 78, 98 + r * 34, "□", {
            ...textStyle("17px", "#b8b8b8"),
            align: "center",
            fixedWidth: 56
          }).setOrigin(0.5, 0).setDepth(UI_DEPTH.shop)
        );
      }

      this.reelSlotTexts.push(rowSlots);
    }

    this.reelCollapseHint = scene.add.text(24, 68, "[Q] expandir ruletas", textStyle("13px", "#666666"))
      .setDepth(UI_DEPTH.text).setVisible(false);
  }

  createShopPanel(scene) {
    this.shopTitle = scene.add.text(GAME_WIDTH / 2, 128, "", {
      ...textStyle("20px", UI_COLORS.textPale, FONTS.display),
      align: "center",
      wordWrap: { width: 900 }
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.shop);

    this.shopPlacementHint = scene.add.text(GAME_WIDTH / 2, 220, "", {
      ...textStyle("24px", UI_COLORS.textPale),
      align: "center",
      wordWrap: { width: 700 }
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.shop).setVisible(false);

    this.tabTokens = scene.add.text(
      shopTabCenter(SHOP_LAYOUT.tabTokensX),
      SHOP_LAYOUT.tabY + SHOP_LAYOUT.tabH / 2,
      "TOKENS DE RULETA",
      textStyle("17px", UI_COLORS.textPale, FONTS.display)
    ).setOrigin(0.5).setDepth(UI_DEPTH.shop);

    this.tabPassives = scene.add.text(
      shopTabCenter(SHOP_LAYOUT.tabPassivesX),
      SHOP_LAYOUT.tabY + SHOP_LAYOUT.tabH / 2,
      "PASIVAS",
      textStyle("17px", UI_COLORS.textPale, FONTS.display)
    ).setOrigin(0.5).setDepth(UI_DEPTH.shop);

    this.shopCards = [];

    for (let i = 0; i < 3; i++) {
      const left = shopCardLeft(i);
      const right = shopCardRight(i);
      const pad = SHOP_LAYOUT.cardPadding;
      const innerW = shopCardInnerWidth();
      const iconSize = SHOP_LAYOUT.iconSize;
      const headerY = SHOP_LAYOUT.cardY + pad;
      const iconX = left + pad + iconSize / 2;
      const iconY = headerY + iconSize / 2;
      const titleX = left + pad + iconSize + SHOP_LAYOUT.iconGap;
      const titleW = innerW - iconSize - SHOP_LAYOUT.iconGap;
      const descY = headerY + iconSize + 12;
      const priceY = SHOP_LAYOUT.cardY + SHOP_LAYOUT.cardH - pad;

      this.shopCards.push({
        left,
        right,
        symbol: addIcon(scene, iconX, iconY, "icon_passive", iconSize),
        symbolText: scene.add.text(iconX, iconY, "?", {
          ...textStyle("28px", UI_COLORS.textGold, FONTS.impact),
          align: "center"
        }).setOrigin(0.5).setDepth(UI_DEPTH.shop).setVisible(false),
        title: scene.add.text(titleX, headerY, "", {
          ...textStyle("18px", UI_COLORS.textPale, FONTS.display),
          align: "left",
          fixedWidth: titleW,
          wordWrap: { width: titleW, useAdvancedWrap: true }
        }).setOrigin(0, 0).setDepth(UI_DEPTH.shop),
        desc: scene.add.text(left + pad, descY, "", {
          ...textStyle("14px", "#c8b890"),
          align: "left",
          fixedWidth: innerW,
          wordWrap: { width: innerW, useAdvancedWrap: true }
        }).setOrigin(0, 0).setDepth(UI_DEPTH.shop),
        priceIcon: addIcon(scene, right - pad, priceY, "icon_coins", 16)
          .setOrigin(1, 1),
        price: scene.add.text(right - pad, priceY, "", {
          ...textStyle("18px", UI_COLORS.textGold, FONTS.display),
          align: "right"
        }).setOrigin(1, 1).setDepth(UI_DEPTH.shop)
      });
    }
  }

  createHintBar(scene) {
    this.hintText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 6, "", {
      ...textStyle("13px", UI_COLORS.textGold),
      align: "center"
    }).setOrigin(0.5, 1).setDepth(UI_DEPTH.shop).setAlpha(0.75);
  }

  showScoreGain(amount) {
    const combo = Math.floor(this.scene.combo);

    this.gainPopup.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 280);
    this.comboPulse.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 318);
    this.gainPopup.setText("+" + amount.toLocaleString("es-AR"));
    this.gainPopup.setAlpha(1);
    this.comboPulse.setText("COMBO x" + combo);
    this.comboPulse.setAlpha(1);
    this.gainTimer = 0.55;

    this.scene.tweens.killTweensOf([this.gainPopup, this.comboPulse]);
    this.scene.tweens.add({
      targets: [this.gainPopup, this.comboPulse],
      y: "-=24",
      alpha: 0,
      duration: 550,
      ease: "Cubic.easeOut"
    });
  }

  update(dt) {
    const scene = this.scene;
    const g = this.g;
    const overlayG = this.overlayG;
    g.clear();
    overlayG.clear();

    const inCombat = COMBAT_PHASES.has(scene.phase);
    const inShop = SHOP_PHASES.has(scene.phase);
    const isEnd = scene.phase === "dead" || scene.phase === "win";

    if (Phaser.Input.Keyboard.JustDown(scene.keys?.Q) && inCombat) {
      this.reelsCollapsed = !this.reelsCollapsed;
    }

    this.updateVisibility(inCombat, inShop, isEnd);
    this.drawTopSection(scene, g, inCombat, inShop, isEnd);
    this.updateTexts(scene, inCombat, inShop, isEnd);

    if (inCombat) {
      this.drawCombatHud(scene, g);
    }

    if (inShop || scene.placingToken) {
      this.drawShopOverlay(scene, overlayG, inShop);
    }

    if (!inCombat || !this.reelsCollapsed) {
      this.drawReelConfig(scene, g, inShop || scene.placingToken);
    }

    if (isEnd) {
      this.drawEndOverlay(scene, overlayG);
    }

    if (this.gainTimer > 0) {
      this.gainTimer -= dt;
    }

    const comboFloor = Math.floor(scene.combo);
    if (comboFloor > this.lastComboFloor && inCombat) {
      this.pulseComboStat();
    }
    this.lastComboFloor = comboFloor;
  }

  updateVisibility(inCombat, inShop, isEnd) {
    const showCombat = inCombat && !isEnd;
    const showShop = inShop || this.scene.placingToken;
    const showReelsExpanded = showShop || this.scene.placingToken || (inCombat && !this.reelsCollapsed);

    for (const slot of this.combatReelSlots) {
      if (!showCombat) {
        slot.symbol.setVisible(false);
        setVisible(slot.icon, false);
      }
    }

    this.shotTypeLabel.setVisible(showCombat);
    this.shotTypeValue.setVisible(showCombat);
    setVisible(this.hpIcon, showCombat);
    this.hpLabel.setVisible(showCombat);
    this.hpValue.setVisible(showCombat);
    setVisible(this.dashIcon, showCombat);
    this.dashLabel.setVisible(showCombat);
    this.dashKey.setVisible(showCombat);

    setVisible(this.scoreIcon, !isEnd);
    this.scoreValue.setVisible(!isEnd);
    this.scoreLabel.setVisible(!isEnd);
    setVisible(this.comboIcon, !isEnd);
    this.comboStatValue.setVisible(!isEnd);
    this.comboStatLabel.setVisible(!isEnd);
    setVisible(this.chipsIcon, !isEnd);
    this.chipsValue.setVisible(!isEnd);
    this.chipsLabel.setVisible(!isEnd);

    this.shopTitle.setVisible(showShop && !this.scene.placingToken);
    this.shopPlacementHint.setVisible(showShop && !!this.scene.placingToken);
    this.tabTokens.setVisible(showShop && !this.scene.placingToken);
    this.tabPassives.setVisible(showShop && !this.scene.placingToken);

    for (const card of this.shopCards) {
      const visible = showShop && !this.scene.placingToken;
      setVisible(card.symbol, visible);
      if (card.symbolText) card.symbolText.setVisible(visible && !card.symbol);
      card.title.setVisible(visible);
      card.desc.setVisible(visible);
      card.price.setVisible(visible);
      setVisible(card.priceIcon, visible);
    }

    this.reelPanelTitle.setVisible(showReelsExpanded);
    this.reelCollapseHint.setVisible(inCombat && this.reelsCollapsed);

    for (const label of this.reelRowLabels) {
      label.setVisible(showReelsExpanded);
    }

    for (const row of this.reelSlotTexts) {
      for (const slot of row) {
        slot.setVisible(showReelsExpanded);
      }
    }

    this.bossNameText.setVisible(this.scene.phase === "boss" && !!this.scene.boss);
    setVisible(this.bossSkullIcon, this.scene.phase === "boss" && !!this.scene.boss);
    this.killBarLabel.setVisible(inCombat && this.scene.phase === "combat");

    this.endTitle.setVisible(isEnd);
    this.endSubtitle.setVisible(isEnd);
  }

  drawTopSection(scene, g, inCombat, inShop, isEnd) {
    if (scene.phase === "boss" && scene.boss) {
      drawOrnatePanel(g, 280, 48, 720, 52, { fillAlpha: 0.94 });
      drawOrnateBar(g, 340, 72, 600, 18, scene.boss.hp / scene.boss.maxHp);
      return;
    }

    if (inCombat && scene.phase === "combat") {
      const ratio = scene.requiredKills > 0 ? scene.killsThisRound / scene.requiredKills : 0;
      drawOrnateBar(g, GAME_WIDTH / 2 - 200, 48, 400, 16, ratio, { fill: 0xc41818 });
    }
  }

  drawCombatHud(scene, g) {
    drawOrnatePanel(g, 18, GAME_HEIGHT - 100, 270, 88);

    const hpRatio = scene.maxHp > 0 ? scene.hp / scene.maxHp : 0;
    drawOrnateBar(g, 36, GAME_HEIGHT - 72, 220, 22, hpRatio);

    const dashReady = scene.dashCooldown <= 0;
    const dashRatio = dashReady ? 1 : 1 - scene.dashCooldown;
    drawDashRing(g, 248, GAME_HEIGHT - 48, 22, dashRatio, dashReady);

    drawOrnatePanel(g, GAME_WIDTH / 2 - 160, GAME_HEIGHT - 158, 320, 148);

    for (let i = 0; i < 3; i++) {
      const slot = this.combatReelSlots[i];
      g.fillStyle(0x0a0404, 1);
      g.fillRoundedRect(slot.x, slot.y, slot.w, slot.h, 6);
      g.lineStyle(2, COLORS.gold, 1);
      g.strokeRoundedRect(slot.x, slot.y, slot.w, slot.h, 6);

      const key = scene.reelResultKeys[i];
      if (key && TOKENS[key]) {
        g.fillStyle(TOKENS[key].color, 0.25);
        g.fillRoundedRect(slot.x + 2, slot.y + 2, slot.w - 4, slot.h - 4, 4);
      } else if (scene.reelResults[i] === "□") {
        g.fillStyle(0x2a2a2a, 0.5);
        g.fillRoundedRect(slot.x + 2, slot.y + 2, slot.w - 4, slot.h - 4, 4);
      }
    }

    this.drawAmmoPips(g, scene);

    drawOrnatePanel(g, GAME_WIDTH - 268, GAME_HEIGHT - 158, 252, 148);
  }

  drawAmmoPips(g, scene) {
    const mag = scene.currentMagazine;
    const maxShow = Math.min(mag.maxAmmo, 18);
    const startX = GAME_WIDTH / 2 - (maxShow * 12) / 2;
    const y = GAME_HEIGHT - 18;

    for (let i = 0; i < maxShow; i++) {
      const filled = i < mag.ammo;
      g.fillStyle(filled ? COLORS.paleGold : 0x2a1818, filled ? 1 : 0.8);
      g.fillCircle(startX + i * 12 + 6, y, filled ? 5 : 4);
      g.lineStyle(1, COLORS.gold, filled ? 0.9 : 0.35);
      g.strokeCircle(startX + i * 12 + 6, y, filled ? 5 : 4);
    }

    if (mag.maxAmmo > 18) {
      g.fillStyle(COLORS.paleGold, 0.8);
    }
  }

  drawReelConfig(scene, g, expanded) {
    const x = 14;
    const y = expanded ? 58 : 58;
    const h = expanded ? 148 : 40;

    drawOrnatePanel(g, x, y, 580, h, { fillAlpha: expanded ? 0.82 : 0.65 });

    if (!expanded && this.reelsCollapsed) return;

    for (let r = 0; r < REEL_COUNT; r++) {
      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        const px = 52 + s * 78;
        const py = 94 + r * 34;
        const tokenKey = scene.reels[r][s];
        const selected =
          scene.placingToken &&
          r === scene.placeReelIndex &&
          s === scene.placeSlotIndex;

        g.fillStyle(tokenKey ? TOKENS[tokenKey].color : 0x141414, tokenKey ? 0.9 : 0.75);
        g.fillRoundedRect(px - 28, py, 56, 26, 4);
        g.lineStyle(2, selected ? 0xffffff : COLORS.gold, selected ? 1 : 0.55);
        g.strokeRoundedRect(px - 28, py, 56, 26, 4);
      }
    }
  }

  drawShopOverlay(scene, g, inShop) {
    if (!inShop && !scene.placingToken) return;

    const dimAlpha = scene.phase === "initialShop" ? 0.45 : 0.65;
    g.fillStyle(0x000000, scene.placingToken ? 0.5 : dimAlpha);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (scene.placingToken) return;

    drawOrnatePanel(g, SHOP_LAYOUT.panelX, SHOP_LAYOUT.panelY, SHOP_LAYOUT.panelW, SHOP_LAYOUT.panelH, {
      fill: UI_COLORS.panelFillShop,
      fillAlpha: 0.96
    });

    const tokenSelected = scene.shopSection === "tokens";
    drawOrnatePanel(g, SHOP_LAYOUT.tabTokensX, SHOP_LAYOUT.tabY, SHOP_LAYOUT.tabW, SHOP_LAYOUT.tabH, {
      fill: tokenSelected ? 0x5a1505 : 0x120806,
      fillAlpha: 1
    });
    drawOrnatePanel(g, SHOP_LAYOUT.tabPassivesX, SHOP_LAYOUT.tabY, SHOP_LAYOUT.tabW, SHOP_LAYOUT.tabH, {
      fill: !tokenSelected ? 0x5a1505 : 0x120806,
      fillAlpha: 1
    });

    for (let i = 0; i < 3; i++) {
      const x = SHOP_LAYOUT.cardStartX + i * SHOP_LAYOUT.cardStep;
      const selected = i === scene.shopSelection;
      drawOrnatePanel(g, x, SHOP_LAYOUT.cardY, SHOP_LAYOUT.cardW, SHOP_LAYOUT.cardH, {
        fill: selected ? 0x441000 : 0x1a0a08,
        fillAlpha: 1,
        border: selected ? COLORS.paleGold : COLORS.gold
      });
    }
  }

  drawEndOverlay(scene, g) {
    g.fillStyle(0x000000, 0.65);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawOrnatePanel(g, 340, 240, 600, 200, { fillAlpha: 0.95 });

    g.lineStyle(2, scene.phase === "win" ? COLORS.paleGold : COLORS.red, 0.8);
  }

  updateTexts(scene, inCombat, inShop, isEnd) {
    if (scene.phase === "boss" && scene.boss) {
      this.roundText.setText("RONDA " + SATAN_ROUND + " / " + SATAN_ROUND);
    } else {
      this.roundText.setText("RONDA " + scene.round + " / " + SATAN_ROUND);
    }

    if (inCombat && scene.phase === "combat") {
      this.killBarLabel.setText(scene.killsThisRound + " / " + scene.requiredKills + " eliminados");
    } else {
      this.killBarLabel.setText("");
    }

    this.hpValue.setText(Math.ceil(scene.hp) + " / " + scene.maxHp);

    this.shotTypeLabel.setText("TIPO DE DISPARO");
    this.shotTypeValue.setText(getShotTypeLabel(scene.currentMagazine));

    for (let i = 0; i < 3; i++) {
      const key = scene.reelResultKeys[i];
      const slot = this.combatReelSlots[i];

      if (key && slot.icon) {
        slot.symbol.setVisible(false);
        slot.icon.setTexture(getTokenIconKey(key)).setVisible(true);
      } else if (key) {
        slot.symbol.setVisible(true);
        slot.symbol.setText(TOKENS[key].label);
      } else if (scene.reelResults[i] === "□") {
        if (slot.icon) {
          slot.icon.setTexture("icon_empty").setVisible(true);
          slot.symbol.setVisible(false);
        } else {
          slot.symbol.setVisible(true);
          slot.symbol.setText("□");
        }
      } else {
        setVisible(slot.icon, false);
        slot.symbol.setVisible(true);
        slot.symbol.setText("?");
        slot.symbol.setColor(UI_COLORS.textGold);
      }
    }

    if (!inCombat && !isEnd) {
      for (const slot of this.combatReelSlots) {
        slot.symbol.setVisible(false);
        setVisible(slot.icon, false);
      }
    }

    this.scoreValue.setText(scene.score.toLocaleString("es-AR"));
    this.comboStatValue.setText("x" + Math.floor(scene.combo));
    this.chipsValue.setText(scene.chips.toLocaleString("es-AR"));

    if (isEnd) {
      if (scene.phase === "win") {
        this.endTitle.setText("VICTORIA");
        this.endTitle.setColor(UI_COLORS.textPale);
        this.endSubtitle.setText("Satanás cae · F para reiniciar");
      } else {
        this.endTitle.setText("DERROTA");
        this.endTitle.setColor(UI_COLORS.textRed);
        this.endSubtitle.setText("F para reiniciar la run");
      }
    }

    this.reelPanelTitle.setY(this.reelsCollapsed && inCombat ? 68 : 68);
    this.reelPanelTitle.setText(
      inCombat && this.reelsCollapsed
        ? "RULETAS (Q expandir)"
        : "TUS RULETAS · VACÍO = +3 BALAS"
    );

    for (let r = 0; r < REEL_COUNT; r++) {
      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        const tokenKey = scene.reels[r][s];
        const text = this.reelSlotTexts[r][s];
        text.setText(tokenKey ? TOKENS[tokenKey].label : "□");
        text.setColor(tokenKey ? "#ffe0a0" : "#888888");
      }
    }

    if (inShop || scene.placingToken) {
      this.updateShopTexts(scene, inShop);
    }

    this.hintText.setText(this.getHintForPhase(scene));
  }

  updateShopTexts(scene, inShop) {
    if (scene.placingToken) {
      this.shopPlacementHint.setText(
        "Elegí un slot en cualquiera de tus 3 ruletas.\nFlechas mover · E colocar · Podés reemplazar tokens anteriores."
      );
      return;
    }

    let title;

    if (scene.phase === "initialShop") {
      title = "TIENDA INICIAL · TOKENS GRATIS: " + scene.freeTokensRemaining;
    } else {
      title = "TIENDA DEL INFRAMUNDO";
    }

    this.shopTitle.setText(title);

    this.tabTokens.setColor(scene.shopSection === "tokens" ? UI_COLORS.textPale : "#666666");
    this.tabPassives.setColor(scene.shopSection === "passives" ? UI_COLORS.textPale : "#666666");

    const offers = getCurrentOffers(scene);

    for (let i = 0; i < 3; i++) {
      const card = this.shopCards[i];
      const offer = offers[i];

      if (!offer) {
        setVisible(card.symbol, false);
        if (card.symbolText) card.symbolText.setVisible(false);
        card.title.setVisible(false);
        card.desc.setVisible(false);
        card.price.setVisible(false);
        setVisible(card.priceIcon, false);
        continue;
      }

      setVisible(card.symbol, true);
      if (card.symbolText) card.symbolText.setVisible(false);
      card.title.setVisible(true);
      card.desc.setVisible(true);
      card.price.setVisible(true);

      if (offer.type === "token") {
        if (card.symbol) {
          card.symbol.setTexture(getTokenIconKey(offer.key));
        } else if (card.symbolText) {
          card.symbolText.setVisible(true);
          card.symbolText.setText(TOKENS[offer.key].label);
        }
        card.title.setText(offer.name);
      } else {
        if (card.symbol) {
          card.symbol.setTexture("icon_passive");
        } else if (card.symbolText) {
          card.symbolText.setVisible(true);
          card.symbolText.setText("✦");
        }
        card.title.setText(offer.name);
      }

      card.desc.setText(offer.description);

      const canAfford = scene.phase === "initialShop" && offer.type === "token"
        ? true
        : scene.chips >= offer.cost;

      if (scene.phase === "initialShop" && offer.type === "token") {
        card.price.setText("GRATIS");
        card.price.setColor(UI_COLORS.textPale);
        setVisible(card.priceIcon, false);
      } else {
        card.price.setText(String(offer.cost));
        card.price.setColor(canAfford ? UI_COLORS.textGold : UI_COLORS.textRed);
        setVisible(card.priceIcon, true);
        this.layoutShopCardPrice(card);
      }
    }
  }

  layoutShopCardPrice(card) {
    const pad = SHOP_LAYOUT.cardPadding;
    const priceY = SHOP_LAYOUT.cardY + SHOP_LAYOUT.cardH - pad;

    card.price.setPosition(card.right - pad, priceY);

    if (card.priceIcon) {
      const priceWidth = card.price.width;
      card.priceIcon.setPosition(card.right - pad - priceWidth - 6, priceY - 2);
    }
  }

  getHintForPhase(scene) {
    if (scene.phase === "dead") return "F reiniciar run";
    if (scene.phase === "win") return "F reiniciar · ganaste la run";
    if (scene.placingToken) return "Flechas slot/ruleta · E colocar";
    if (scene.phase === "initialShop") {
      return "A/D elegir · E token gratis · F empezar (tras 2 tokens)";
    }
    if (scene.phase === "shop") {
      return "TAB sección · A/D elegir · E comprar · R reroll · F siguiente ronda";
    }
    if (scene.phase === "boss") {
      return "WASD · Mouse apuntar · Click disparar · Shift dash · Q ruletas";
    }
    return "WASD · Mouse · Click · Shift dash · Q ruletas";
  }

  pulseComboStat() {
    this.scene.tweens.add({
      targets: this.comboStatValue,
      scale: 1.25,
      duration: 100,
      yoyo: true,
      ease: "Quad.easeOut"
    });
  }
}
