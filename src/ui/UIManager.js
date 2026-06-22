import { COLORS } from "../config/colors.js";
import { SHOP_REROLL_COST } from "../config/balance.js";
import { GAME_HEIGHT, GAME_WIDTH, REEL_COUNT, SATAN_ROUND, SLOTS_PER_REEL } from "../config/gameConfig.js";
import {
  buyPassiveOffer,
  buyTokenOffer,
  continueShop,
  getTooltipTokenIndex,
  placeTokenInSelectedSlot,
  rerollShop,
  setPlacementCursor
} from "../systems/ShopSystem.js";
import { TOKENS } from "../data/tokens.js";
import {
  getReelBlockBounds,
  getReelPanelHeight,
  getReelPanelY,
  getReelSlotBounds,
  getReelTitleY,
  hitTestReelSlot,
  REEL_LAYOUT
} from "./reelLayout.js";
import {
  getChipsBarBounds,
  getContinueButtonBounds,
  getPassiveCardBounds,
  getRerollButtonBounds,
  getShopTitleY,
  getTokenTileBounds,
  getTooltipPosition,
  hitTestContinueButton,
  hitTestPassiveCard,
  hitTestRerollButton,
  hitTestTokenTile,
  PASSIVE_OFFER_COUNT,
  SHOP_LAYOUT,
  TOKEN_OFFER_COUNT
} from "./shopLayout.js";
import { drawDashRing, drawOrnateBar, drawOrnatePanel } from "./uiFrames.js";
import { getShotTypeLabel } from "./shotType.js";
import { getTokenIconKey } from "./IconRegistry.js";
import { FONTS, textStyle, UI_COLORS, UI_DEPTH } from "./uiTheme.js";

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

const COMBAT_PHASES = new Set(["combat", "boss"]);
const SHOP_PHASES = new Set(["shop", "initialShop"]);

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
    this.reelPanelTitle = scene.add.text(0, 0, "TUS RULETAS · VACÍO = +3 BALAS", {
      ...textStyle("15px", UI_COLORS.textPale, FONTS.display),
      align: "center"
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.shop);

    this.reelBlockLabels = [];
    this.reelSlotIcons = [];
    this.reelSlotTexts = [];

    for (let r = 0; r < REEL_COUNT; r++) {
      this.reelBlockLabels.push(
        scene.add.text(0, 0, "RULETA " + (r + 1), textStyle("14px", UI_COLORS.textPale, FONTS.display))
          .setDepth(UI_DEPTH.shop)
      );

      const rowIcons = [];
      const rowTexts = [];

      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        rowIcons.push(addIcon(scene, 0, 0, "icon_empty", 24));
        rowTexts.push(
          scene.add.text(0, 0, "□", {
            ...textStyle("16px", "#b8b8b8"),
            align: "center"
          }).setOrigin(0.5).setDepth(UI_DEPTH.shop)
        );
      }

      this.reelSlotIcons.push(rowIcons);
      this.reelSlotTexts.push(rowTexts);
    }

    this.reelCollapseHint = scene.add.text(0, 0, "[Q] expandir ruletas", {
      ...textStyle("13px", "#666666"),
      align: "center"
    }).setOrigin(0.5, 0).setDepth(UI_DEPTH.text).setVisible(false);
  }

  syncReelPanelLayout(collapsed) {
    const titleY = getReelTitleY(collapsed);
    const titleX = REEL_LAYOUT.panelX + REEL_LAYOUT.panelW / 2;

    this.reelPanelTitle.setPosition(titleX, titleY);
    this.reelCollapseHint.setPosition(titleX, titleY);

    for (let r = 0; r < REEL_COUNT; r++) {
      const block = getReelBlockBounds(r, collapsed);
      this.reelBlockLabels[r].setPosition(block.x + 10, block.y + 4);

      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        const bounds = getReelSlotBounds(r, s, collapsed);
        const icon = this.reelSlotIcons[r][s];
        const text = this.reelSlotTexts[r][s];

        if (icon) {
          icon.setPosition(bounds.centerX, bounds.centerY);
        }
        text.setPosition(bounds.centerX, bounds.centerY);
      }
    }
  }

  isReelPanelCollapsed() {
    const scene = this.scene;
    const inCombat = COMBAT_PHASES.has(scene.phase);
    const inShop = SHOP_PHASES.has(scene.phase);
    const showShop = inShop || scene.placingToken;

    return inCombat && !showShop && this.reelsCollapsed;
  }

  createShopPanel(scene) {
    this.shopTitle = scene.add.text(0, 0, "", {
      ...textStyle("20px", UI_COLORS.textPale, FONTS.display),
      align: "center",
      wordWrap: { width: 560 }
    }).setOrigin(0.5).setDepth(UI_DEPTH.shop);

    this.shopPlacementHint = scene.add.text(0, 0, "", {
      ...textStyle("20px", UI_COLORS.textPale),
      align: "center",
      wordWrap: { width: 560 }
    }).setOrigin(0.5).setDepth(UI_DEPTH.shop).setVisible(false);

    this.shopTokensLabel = scene.add.text(
      SHOP_LAYOUT.panelX + 16,
      SHOP_LAYOUT.tokensLabelY,
      "TOKENS DE RULETA",
      textStyle("15px", UI_COLORS.textPale, FONTS.display)
    ).setDepth(UI_DEPTH.shop);

    this.shopPassivesLabel = scene.add.text(
      SHOP_LAYOUT.panelX + 16,
      SHOP_LAYOUT.passivesLabelY,
      "PASIVAS",
      textStyle("15px", UI_COLORS.textPale, FONTS.display)
    ).setDepth(UI_DEPTH.shop);

    this.tokenTiles = [];

    for (let i = 0; i < TOKEN_OFFER_COUNT; i++) {
      const bounds = getTokenTileBounds(i);
      this.tokenTiles.push({
        bounds,
        icon: addIcon(scene, bounds.centerX, bounds.centerY - 10, "icon_passive", 32),
        symbolText: scene.add.text(bounds.centerX, bounds.centerY - 10, "?", {
          ...textStyle("24px", UI_COLORS.textGold, FONTS.impact),
          align: "center"
        }).setOrigin(0.5).setDepth(UI_DEPTH.shop).setVisible(false),
        priceIcon: addIcon(scene, bounds.centerX + 14, bounds.centerY + 22, "icon_coins", 14),
        price: scene.add.text(bounds.centerX, bounds.centerY + 22, "", {
          ...textStyle("15px", UI_COLORS.textGold, FONTS.display),
          align: "center"
        }).setOrigin(0.5).setDepth(UI_DEPTH.shop)
      });
    }

    this.passiveCards = [];

    for (let i = 0; i < PASSIVE_OFFER_COUNT; i++) {
      const cardBounds = getPassiveCardBounds(i);
      const pad = SHOP_LAYOUT.passiveCardPadding;
      const innerW = cardBounds.w - pad * 2;
      const iconSize = SHOP_LAYOUT.passiveIconSize;
      const headerY = cardBounds.y + pad;
      const iconX = cardBounds.x + pad + iconSize / 2;
      const iconY = headerY + iconSize / 2;
      const titleX = cardBounds.x + pad + iconSize + 8;
      const titleW = innerW - iconSize - 8;
      const descY = headerY + iconSize + 10;
      const priceY = cardBounds.y + cardBounds.h - pad;

      this.passiveCards.push({
        bounds: cardBounds,
        blocked: scene.add.text(cardBounds.centerX, cardBounds.centerY, "BLOQUEADO", {
          ...textStyle("20px", "#666666", FONTS.display),
          align: "center"
        }).setOrigin(0.5).setDepth(UI_DEPTH.shop).setVisible(false),
        symbol: addIcon(scene, iconX, iconY, "icon_passive", iconSize),
        title: scene.add.text(titleX, headerY, "", {
          ...textStyle("16px", UI_COLORS.textPale, FONTS.display),
          align: "left",
          fixedWidth: titleW,
          wordWrap: { width: titleW, useAdvancedWrap: true }
        }).setOrigin(0, 0).setDepth(UI_DEPTH.shop),
        desc: scene.add.text(cardBounds.x + pad, descY, "", {
          ...textStyle("13px", "#c8b890"),
          align: "left",
          fixedWidth: innerW,
          wordWrap: { width: innerW, useAdvancedWrap: true }
        }).setOrigin(0, 0).setDepth(UI_DEPTH.shop),
        priceIcon: addIcon(scene, cardBounds.x + cardBounds.w - pad, priceY, "icon_coins", 14)
          .setOrigin(1, 1),
        price: scene.add.text(cardBounds.x + cardBounds.w - pad, priceY, "", {
          ...textStyle("16px", UI_COLORS.textGold, FONTS.display),
          align: "right"
        }).setOrigin(1, 1).setDepth(UI_DEPTH.shop)
      });
    }

    this.shopTooltipG = scene.add.graphics().setDepth(UI_DEPTH.popup).setVisible(false);
    const tooltipDepth = UI_DEPTH.popup + 1;
    this.shopTooltipTitle = scene.add.text(0, 0, "", textStyle("15px", UI_COLORS.textPale, FONTS.display))
      .setDepth(tooltipDepth).setVisible(false);
    this.shopTooltipDesc = scene.add.text(0, 0, "", {
      ...textStyle("12px", "#c8b890"),
      wordWrap: { width: SHOP_LAYOUT.tooltipW - 24, useAdvancedWrap: true }
    }).setDepth(tooltipDepth).setVisible(false);
    this.shopTooltipPrice = scene.add.text(0, 0, "", textStyle("14px", UI_COLORS.textGold, FONTS.display))
      .setDepth(tooltipDepth).setVisible(false);
    this.shopTooltipIcon = addIcon(scene, 0, 0, "icon_passive", 26);
    if (this.shopTooltipIcon) {
      this.shopTooltipIcon.setDepth(tooltipDepth);
    }

    const rerollBounds = getRerollButtonBounds();
    const continueBounds = getContinueButtonBounds();

    this.rerollBtnText = scene.add.text(
      rerollBounds.centerX,
      rerollBounds.centerY,
      "REROLL",
      textStyle("15px", UI_COLORS.textPale, FONTS.display)
    ).setOrigin(0.5).setDepth(UI_DEPTH.shop);

    this.continueBtnText = scene.add.text(
      continueBounds.centerX,
      continueBounds.centerY,
      "CONTINUAR",
      textStyle("15px", UI_COLORS.textPale, FONTS.display)
    ).setOrigin(0.5).setDepth(UI_DEPTH.shop);

    const chipsBar = getChipsBarBounds();
    this.shopChipsIcon = addIcon(scene, 0, 0, "icon_coins", 22);
    this.shopChipsValue = scene.add.text(0, 0, "", {
      ...textStyle("28px", "#d81414", FONTS.impact),
      align: "left"
    }).setOrigin(0, 0.5).setDepth(UI_DEPTH.shop);
    this.shopChipsLabel = scene.add.text(0, 0, "FICHAS", {
      ...textStyle("13px", "#888888"),
      align: "left"
    }).setOrigin(0, 0.5).setDepth(UI_DEPTH.shop);

    this.layoutShopHeader();
  }

  layoutShopHeader() {
    const chipsBar = getChipsBarBounds();
    const titleX = SHOP_LAYOUT.panelX + SHOP_LAYOUT.panelW / 2;
    const titleY = getShopTitleY();
    const pad = 14;
    const cy = chipsBar.centerY;

    if (this.shopChipsIcon) {
      this.shopChipsIcon.setPosition(chipsBar.x + pad + 11, cy);
    }

    this.shopChipsValue.setPosition(chipsBar.x + pad + 30, cy);
    this.shopChipsLabel.setPosition(chipsBar.x + pad + 30, cy + 16);

    this.shopTitle.setPosition(titleX, titleY);
    this.shopPlacementHint.setPosition(titleX, titleY);
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
    const showShopPanel = showShop && !this.scene.placingToken;
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

    setVisible(this.scoreIcon, !isEnd && !showShop);
    this.scoreValue.setVisible(!isEnd && !showShop);
    this.scoreLabel.setVisible(!isEnd && !showShop);
    setVisible(this.comboIcon, !isEnd && !showShop);
    this.comboStatValue.setVisible(!isEnd && !showShop);
    this.comboStatLabel.setVisible(!isEnd && !showShop);
    setVisible(this.chipsIcon, !isEnd && !showShop);
    this.chipsValue.setVisible(!isEnd && !showShop);
    this.chipsLabel.setVisible(!isEnd && !showShop);

    setVisible(this.shopChipsIcon, showShopPanel);
    this.shopChipsValue.setVisible(showShopPanel);
    this.shopChipsLabel.setVisible(showShopPanel);

    this.shopTitle.setVisible(showShopPanel);
    this.shopPlacementHint.setVisible(showShop && !!this.scene.placingToken);
    this.shopTokensLabel.setVisible(showShopPanel);
    this.shopPassivesLabel.setVisible(showShopPanel);

    for (const tile of this.tokenTiles) {
      const visible = showShopPanel;
      setVisible(tile.icon, visible);
      if (tile.symbolText) tile.symbolText.setVisible(visible && !tile.icon);
      tile.price.setVisible(visible);
      setVisible(tile.priceIcon, visible);
    }

    this.rerollBtnText.setVisible(showShopPanel);
    this.continueBtnText.setVisible(showShopPanel);

    for (const card of this.passiveCards) {
      const visible = showShopPanel;
      card.blocked.setVisible(visible);
      setVisible(card.symbol, visible);
      card.title.setVisible(visible);
      card.desc.setVisible(visible);
      card.price.setVisible(visible);
      setVisible(card.priceIcon, visible);
    }

    const showTooltip = this.shouldShowTokenTooltip(showShop);
    this.shopTooltipG.setVisible(showTooltip);
    this.shopTooltipTitle.setVisible(showTooltip);
    this.shopTooltipDesc.setVisible(showTooltip);
    this.shopTooltipPrice.setVisible(showTooltip);
    setVisible(this.shopTooltipIcon, showTooltip);

    this.reelPanelTitle.setVisible(showReelsExpanded);
    this.reelCollapseHint.setVisible(inCombat && this.reelsCollapsed);

    for (const label of this.reelBlockLabels) {
      label.setVisible(showReelsExpanded);
    }

    for (let r = 0; r < REEL_COUNT; r++) {
      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        setVisible(this.reelSlotIcons[r][s], showReelsExpanded);
        this.reelSlotTexts[r][s].setVisible(showReelsExpanded);
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
    const collapsed = !expanded && this.reelsCollapsed;
    const panelY = getReelPanelY(collapsed);
    const panelH = getReelPanelHeight(collapsed);

    drawOrnatePanel(g, REEL_LAYOUT.panelX, panelY, REEL_LAYOUT.panelW, panelH, {
      fillAlpha: expanded ? 0.88 : 0.65
    });

    if (collapsed) return;

    this.syncReelPanelLayout(collapsed);

    const hover = scene.reelHoverSlot;

    for (let r = 0; r < REEL_COUNT; r++) {
      const block = getReelBlockBounds(r, collapsed);
      const activeReel = scene.placingToken && r === scene.placeReelIndex;

      drawOrnatePanel(g, block.x, block.y, block.w, block.h, {
        fill: activeReel ? 0x2a1008 : 0x120806,
        fillAlpha: 0.95,
        border: activeReel ? COLORS.paleGold : COLORS.gold
      });

      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        const bounds = getReelSlotBounds(r, s, collapsed);
        const tokenKey = scene.reels[r][s];
        const selected =
          scene.placingToken &&
          r === scene.placeReelIndex &&
          s === scene.placeSlotIndex;
        const hovered =
          hover &&
          hover.reelIndex === r &&
          hover.slotIndex === s &&
          tokenKey;

        g.fillStyle(tokenKey ? TOKENS[tokenKey].color : 0x141414, tokenKey ? 0.9 : 0.75);
        g.fillRoundedRect(bounds.x, bounds.y, bounds.w, bounds.h, 4);
        g.lineStyle(2, selected || hovered ? 0xffffff : COLORS.gold, selected || hovered ? 1 : 0.55);
        g.strokeRoundedRect(bounds.x, bounds.y, bounds.w, bounds.h, 4);
      }
    }
  }

  drawShopOverlay(scene, g, inShop) {
    if (!inShop && !scene.placingToken) return;

    const dimAlpha = scene.phase === "initialShop" ? 0.45 : 0.65;
    g.fillStyle(0x000000, scene.placingToken ? 0.5 : dimAlpha);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (scene.placingToken) return;

    const chipsBar = getChipsBarBounds();
    drawOrnatePanel(g, chipsBar.x, chipsBar.y, chipsBar.w, chipsBar.h, {
      fill: UI_COLORS.panelFillShop,
      fillAlpha: 0.96
    });

    drawOrnatePanel(g, SHOP_LAYOUT.panelX, SHOP_LAYOUT.panelY, SHOP_LAYOUT.panelW, SHOP_LAYOUT.panelH, {
      fill: UI_COLORS.panelFillShop,
      fillAlpha: 0.96
    });

    for (let i = 0; i < TOKEN_OFFER_COUNT; i++) {
      const bounds = getTokenTileBounds(i);
      const hovered = scene.shopHoverToken === i;

      drawOrnatePanel(g, bounds.x, bounds.y, bounds.w, bounds.h, {
        fill: hovered ? 0x441000 : 0x1a0a08,
        fillAlpha: 1,
        border: hovered ? COLORS.paleGold : COLORS.gold
      });
    }

    for (let i = 0; i < PASSIVE_OFFER_COUNT; i++) {
      const bounds = getPassiveCardBounds(i);
      const hovered = scene.shopHoverPassive === i;
      const blocked = scene.phase === "initialShop";

      drawOrnatePanel(g, bounds.x, bounds.y, bounds.w, bounds.h, {
        fill: blocked ? 0x0e0606 : hovered ? 0x441000 : 0x1a0a08,
        fillAlpha: 1,
        border: blocked ? 0x443322 : hovered ? COLORS.paleGold : COLORS.gold
      });
    }

    const rerollBounds = getRerollButtonBounds();
    const continueBounds = getContinueButtonBounds();

    drawOrnatePanel(g, rerollBounds.x, rerollBounds.y, rerollBounds.w, rerollBounds.h, {
      fill: scene.shopHoverReroll ? 0x441000 : 0x1a0a08,
      fillAlpha: 1,
      border: scene.shopHoverReroll ? COLORS.paleGold : COLORS.gold
    });

    drawOrnatePanel(g, continueBounds.x, continueBounds.y, continueBounds.w, continueBounds.h, {
      fill: scene.shopHoverContinue ? 0x441000 : 0x5a1505,
      fillAlpha: 1,
      border: scene.shopHoverContinue ? COLORS.paleGold : COLORS.gold
    });
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
    this.shopChipsValue.setText(scene.chips.toLocaleString("es-AR"));

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

    this.reelPanelTitle.setText(
      inCombat && this.reelsCollapsed
        ? "RULETAS (Q expandir)"
        : "TUS RULETAS · VACÍO = +3 BALAS"
    );

    this.syncReelPanelLayout(this.isReelPanelCollapsed());

    for (let r = 0; r < REEL_COUNT; r++) {
      for (let s = 0; s < SLOTS_PER_REEL; s++) {
        const tokenKey = scene.reels[r][s];
        const icon = this.reelSlotIcons[r][s];
        const text = this.reelSlotTexts[r][s];

        if (tokenKey && icon) {
          icon.setTexture(getTokenIconKey(tokenKey)).setVisible(true);
          text.setVisible(false);
        } else if (tokenKey) {
          text.setVisible(true);
          text.setText(TOKENS[tokenKey].label);
          text.setColor("#ffe0a0");
          setVisible(icon, false);
        } else {
          if (icon) {
            icon.setTexture("icon_empty").setVisible(true);
            text.setVisible(false);
          } else {
            text.setVisible(true);
            text.setText("□");
            text.setColor("#888888");
          }
        }
      }
    }

    if (inShop || scene.placingToken) {
      this.updateShopTexts(scene, inShop);
    } else {
      scene.shopHoverToken = -1;
      scene.shopHoverPassive = -1;
      scene.shopHoverReroll = false;
      scene.shopHoverContinue = false;
    }

    this.updateHoverTooltip(scene);

    this.hintText.setText(this.getHintForPhase(scene));
  }

  isReelsExpanded() {
    const scene = this.scene;
    const inShop = SHOP_PHASES.has(scene.phase);
    const inCombat = COMBAT_PHASES.has(scene.phase);
    return inShop || scene.placingToken || (inCombat && !this.reelsCollapsed);
  }

  shouldShowTokenTooltip(showShop) {
    const scene = this.scene;

    if (showShop && !scene.placingToken && getTooltipTokenIndex(scene) >= 0) {
      return true;
    }

    if (!this.isReelsExpanded() || !scene.reelHoverSlot) {
      return false;
    }

    const { reelIndex, slotIndex } = scene.reelHoverSlot;
    return !!scene.reels[reelIndex][slotIndex];
  }

  updateShopTexts(scene, inShop) {
    if (scene.placingToken) {
      this.shopPlacementHint.setText(
        "Click en un slot de tus ruletas para colocar el token.\nPodés reemplazar tokens anteriores."
      );
      this.layoutShopHeader();
      return;
    }

    let title;

    if (scene.phase === "initialShop") {
      title = "TIENDA INICIAL · TOKENS GRATIS: " + scene.freeTokensRemaining;
    } else {
      title = "TIENDA DEL INFRAMUNDO";
    }

    this.shopTitle.setText(title);
    this.layoutShopHeader();

    if (scene.phase === "initialShop") {
      this.rerollBtnText.setText("REROLL GRATIS");
      this.continueBtnText.setText("EMPEZAR RUN");
    } else {
      this.rerollBtnText.setText("REROLL · " + SHOP_REROLL_COST);
      this.continueBtnText.setText("CONTINUAR");
    }

    for (let i = 0; i < TOKEN_OFFER_COUNT; i++) {
      const tile = this.tokenTiles[i];
      const offer = scene.tokenOffers[i];
      const bounds = getTokenTileBounds(i);

      if (!offer) {
        setVisible(tile.icon, false);
        if (tile.symbolText) tile.symbolText.setVisible(false);
        tile.price.setVisible(false);
        setVisible(tile.priceIcon, false);
        continue;
      }

      tile.icon.setPosition(bounds.centerX, bounds.centerY - 10);
      tile.price.setPosition(bounds.centerX, bounds.centerY + 22);

      if (tile.icon) {
        tile.icon.setTexture(getTokenIconKey(offer.key)).setVisible(true);
      } else if (tile.symbolText) {
        tile.symbolText.setVisible(true);
        tile.symbolText.setText(TOKENS[offer.key].label);
      }

      const canAfford =
        scene.phase === "initialShop" || scene.chips >= offer.cost;

      if (scene.phase === "initialShop") {
        tile.price.setText("GRATIS");
        tile.price.setColor(UI_COLORS.textPale);
        setVisible(tile.priceIcon, false);
      } else {
        tile.price.setText(String(offer.cost));
        tile.price.setColor(canAfford ? UI_COLORS.textGold : UI_COLORS.textRed);
        setVisible(tile.priceIcon, true);
        if (tile.priceIcon) {
          tile.priceIcon.setPosition(bounds.centerX + tile.price.width / 2 + 10, bounds.centerY + 22);
        }
      }
    }

    const blocked = scene.phase === "initialShop";

    for (let i = 0; i < PASSIVE_OFFER_COUNT; i++) {
      const card = this.passiveCards[i];
      const offer = scene.passiveOffers[i];

      if (blocked) {
        card.blocked.setVisible(true);
        setVisible(card.symbol, false);
        card.title.setVisible(false);
        card.desc.setVisible(false);
        card.price.setVisible(false);
        setVisible(card.priceIcon, false);
      } else if (!offer) {
        card.blocked.setVisible(false);
        setVisible(card.symbol, false);
        card.title.setVisible(false);
        card.desc.setVisible(false);
        card.price.setVisible(false);
        setVisible(card.priceIcon, false);
      } else {
        card.blocked.setVisible(false);
        setVisible(card.symbol, true);
        card.title.setVisible(true);
        card.desc.setVisible(true);
        card.price.setVisible(true);

        card.title.setText(offer.name);
        card.desc.setText(offer.description);

        const canAfford = scene.chips >= offer.cost;
        card.price.setText(String(offer.cost));
        card.price.setColor(canAfford ? UI_COLORS.textGold : UI_COLORS.textRed);
        setVisible(card.priceIcon, true);
        this.layoutPassiveCardPrice(card);
      }
    }
  }

  hideTokenTooltip() {
    this.shopTooltipG.clear();
  }

  showTokenTooltip(anchorBounds, tokenKey, description, footerText) {
    const token = TOKENS[tokenKey];
    if (!token) {
      this.hideTokenTooltip();
      return;
    }

    const pos = getTooltipPosition(anchorBounds);

    this.shopTooltipG.clear();
    drawOrnatePanel(this.shopTooltipG, pos.x, pos.y, pos.w, pos.h, {
      fill: 0x1a0a08,
      fillAlpha: 0.98,
      border: COLORS.paleGold
    });

    const pad = 12;
    const iconSize = 26;
    const headerY = pos.y + pad + 14;

    if (this.shopTooltipIcon) {
      this.shopTooltipIcon
        .setTexture(getTokenIconKey(tokenKey))
        .setDisplaySize(iconSize, iconSize)
        .setPosition(pos.x + pad + iconSize / 2, headerY)
        .setVisible(true);
    }

    this.shopTooltipTitle.setText(token.name);
    this.shopTooltipTitle.setOrigin(0, 0.5);
    this.shopTooltipTitle.setPosition(pos.x + pad + iconSize + 8, headerY);

    this.shopTooltipDesc.setText(description);
    this.shopTooltipDesc.setOrigin(0, 0);
    this.shopTooltipDesc.setPosition(pos.x + pad, pos.y + 40);

    this.shopTooltipPrice.setText(footerText);
    this.shopTooltipPrice.setOrigin(1, 1);
    this.shopTooltipPrice.setPosition(pos.x + pos.w - pad, pos.y + pos.h - pad);
  }

  updateHoverTooltip(scene) {
    const shopIndex = getTooltipTokenIndex(scene);
    const inShop = SHOP_PHASES.has(scene.phase);

    if (inShop && !scene.placingToken && shopIndex >= 0) {
      const offer = scene.tokenOffers[shopIndex];
      if (offer) {
        const footer =
          scene.phase === "initialShop" ? "GRATIS" : String(offer.cost) + " fichas";
        this.showTokenTooltip(
          getTokenTileBounds(shopIndex),
          offer.key,
          offer.description,
          footer
        );
        return;
      }
    }

    if (scene.reelHoverSlot && this.isReelsExpanded()) {
      const { reelIndex, slotIndex } = scene.reelHoverSlot;
      const tokenKey = scene.reels[reelIndex][slotIndex];
      if (tokenKey) {
        this.showTokenTooltip(
          getReelSlotBounds(reelIndex, slotIndex, this.isReelPanelCollapsed()),
          tokenKey,
          TOKENS[tokenKey].shopDescription,
          TOKENS[tokenKey].short
        );
        return;
      }
    }

    this.hideTokenTooltip();
  }

  layoutPassiveCardPrice(card) {
    const pad = SHOP_LAYOUT.passiveCardPadding;
    const priceY = card.bounds.y + card.bounds.h - pad;

    card.price.setPosition(card.bounds.x + card.bounds.w - pad, priceY);

    if (card.priceIcon) {
      const priceWidth = card.price.width;
      card.priceIcon.setPosition(card.bounds.x + card.bounds.w - pad - priceWidth - 6, priceY - 2);
    }
  }

  handlePointerHover(pointer) {
    const scene = this.scene;
    const inShop = SHOP_PHASES.has(scene.phase);

    this.updateReelHover(pointer);

    if (scene.placingToken) {
      scene.shopHoverToken = -1;
      scene.shopHoverPassive = -1;
      scene.shopHoverReroll = false;
      scene.shopHoverContinue = false;

      const hit = hitTestReelSlot(pointer.x, pointer.y, this.isReelPanelCollapsed());
      if (hit) {
        setPlacementCursor(scene, hit.reelIndex, hit.slotIndex);
      }
      return;
    }

    if (!inShop) {
      scene.shopHoverToken = -1;
      scene.shopHoverPassive = -1;
      scene.shopHoverReroll = false;
      scene.shopHoverContinue = false;
      return;
    }

    scene.shopHoverToken = hitTestTokenTile(pointer.x, pointer.y);
    scene.shopHoverPassive = hitTestPassiveCard(pointer.x, pointer.y);
    scene.shopHoverReroll = hitTestRerollButton(pointer.x, pointer.y);
    scene.shopHoverContinue = hitTestContinueButton(pointer.x, pointer.y);
  }

  updateReelHover(pointer) {
    const scene = this.scene;

    if (!this.isReelsExpanded()) {
      scene.reelHoverSlot = null;
      return;
    }

    const collapsed = this.isReelPanelCollapsed();
    const hit = hitTestReelSlot(pointer.x, pointer.y, collapsed);
    if (hit && scene.reels[hit.reelIndex][hit.slotIndex]) {
      scene.reelHoverSlot = hit;
    } else {
      scene.reelHoverSlot = null;
    }
  }

  handleShopHover(pointer) {
    this.handlePointerHover(pointer);
  }

  handleShopPointer(pointer) {
    const scene = this.scene;
    const inShop = SHOP_PHASES.has(scene.phase);

    if (scene.placingToken) {
      const hit = hitTestReelSlot(pointer.x, pointer.y, false);
      if (hit) {
        setPlacementCursor(scene, hit.reelIndex, hit.slotIndex);
        placeTokenInSelectedSlot(scene);
      }
      return;
    }

    if (!inShop) return;

    if (hitTestRerollButton(pointer.x, pointer.y)) {
      rerollShop(scene);
      return;
    }

    if (hitTestContinueButton(pointer.x, pointer.y)) {
      continueShop(scene);
      return;
    }

    const tokenIndex = hitTestTokenTile(pointer.x, pointer.y);
    if (tokenIndex >= 0) {
      buyTokenOffer(scene, tokenIndex);
      return;
    }

    const passiveIndex = hitTestPassiveCard(pointer.x, pointer.y);
    if (passiveIndex >= 0) {
      buyPassiveOffer(scene, passiveIndex);
    }
  }

  getHintForPhase(scene) {
    if (scene.phase === "dead") return "F reiniciar run";
    if (scene.phase === "win") return "F reiniciar · ganaste la run";
    if (scene.placingToken) {
      return "Click en un slot de ruleta para colocar el token";
    }
    if (scene.phase === "initialShop") {
      return "Mouse · click tokens · reroll · empezar run cuando termines";
    }
    if (scene.phase === "shop") {
      return "Mouse · click para comprar · reroll · continuar";
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
