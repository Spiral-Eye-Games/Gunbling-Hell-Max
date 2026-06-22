import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import { initRunState, resetRunState } from "../core/RunState.js";
import {
  addHitEffect,
  drawHitEffects,
  showFloatingMessage,
  updateHitEffects
} from "../effects/EffectsSystem.js";
import { drawArena, drawCrosshair } from "../rendering/ArenaRenderer.js";
import { drawWorldEntities } from "../rendering/EntityRenderer.js";
import { drawHUD } from "../rendering/HudRenderer.js";
import { updateBoss } from "../systems/BossSystem.js";
import { updateBullets } from "../systems/BulletSystem.js";
import { updateCombo } from "../systems/ComboSystem.js";
import { updateEnemies } from "../systems/EnemySystem.js";
import { updateHazards } from "../systems/HazardSystem.js";
import { handlePlayerMovement } from "../systems/PlayerSystem.js";
import { tryShoot, tryShootIfHeld } from "../systems/ShootingSystem.js";
import { enterShop, generateShopOffers, updateShop } from "../systems/ShopSystem.js";

export class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    this.graphics = this.add.graphics();
    this.uiGraphics = this.add.graphics().setDepth(100);

    initRunState(this);
    this.createKeyboard();
    this.createTexts();

    generateShopOffers(this);

    this.objectiveText.setText("TIENDA INICIAL · ELEGÍ 2 TOKENS GRATIS");
    this.shopText.setText("");

    this.input.on("pointerdown", () => {
      if (this.phase === "combat" || this.phase === "boss") {
        tryShoot(this);
      }
    });
  }

  update(time, deltaMs) {
    const dt = deltaMs / 1000;

    this.graphics.clear();
    this.uiGraphics.clear();

    drawArena(this);

    if (this.phase === "combat") {
      this.updateCombat(dt);
    } else if (this.phase === "shop" || this.phase === "initialShop") {
      updateShop(this);
    } else if (this.phase === "boss") {
      this.updateBossFight(dt);
    } else if (this.phase === "dead" || this.phase === "win") {
      this.updateEndState();
    }

    updateHitEffects(this, dt);

    drawWorldEntities(this);
    drawCrosshair(this);
    drawHitEffects(this);
    drawHUD(this);
  }

  updateCombat(dt) {
    handlePlayerMovement(this, dt);
    tryShootIfHeld(this);
    updateBullets(this, dt);
    updateEnemies(this, dt);
    updateHazards(this, dt);
    updateCombo(this, dt);

    if (this.killsThisRound >= this.requiredKills) {
      enterShop(this);
    }
  }

  updateBossFight(dt) {
    handlePlayerMovement(this, dt);
    tryShootIfHeld(this);
    updateBullets(this, dt);
    updateBoss(this, dt);
    updateHazards(this, dt);
    updateCombo(this, dt);
  }

  updateEndState() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      resetRunState(this);
      generateShopOffers(this);
    }
  }

  createKeyboard() {
    this.keys = this.input.keyboard.addKeys({
      W: "W",
      A: "A",
      S: "S",
      D: "D",
      SHIFT: "SHIFT",
      SPACE: "SPACE",
      E: "E",
      R: "R",
      F: "F",
      TAB: "TAB",
      LEFT: "LEFT",
      RIGHT: "RIGHT",
      UP: "UP",
      DOWN: "DOWN"
    });
  }

  createTexts() {
    const baseTextStyle = {
      fontFamily: "Georgia",
      color: "#f7d47a",
      stroke: "#160000",
      strokeThickness: 4
    };

    this.floorText = this.add.text(28, 22, "", {
      ...baseTextStyle,
      fontSize: "24px"
    }).setDepth(110);

    this.objectiveText = this.add.text(GAME_WIDTH / 2, 24, "", {
      ...baseTextStyle,
      fontSize: "24px",
      color: "#ff5a5a",
      align: "center"
    }).setOrigin(0.5, 0).setDepth(110);

    this.hpText = this.add.text(28, GAME_HEIGHT - 78, "HP", {
      ...baseTextStyle,
      fontSize: "28px"
    }).setDepth(110);

    this.comboText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 190, "COMBO x1", {
      ...baseTextStyle,
      fontSize: "40px",
      color: "#ffb53a"
    }).setOrigin(0.5).setDepth(110);

    this.gainText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 226, "", {
      ...baseTextStyle,
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5).setDepth(110);

    this.reelResultText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 122, "?   ?   ?", {
      ...baseTextStyle,
      fontSize: "42px",
      color: "#ffd86a"
    }).setOrigin(0.5).setDepth(110);

    this.magazineText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, "", {
      ...baseTextStyle,
      fontSize: "22px",
      color: "#ffd64a",
      align: "center"
    }).setOrigin(0.5).setDepth(110);

    this.modsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 43, "", {
      ...baseTextStyle,
      fontSize: "18px",
      color: "#fff1b8",
      align: "center"
    }).setOrigin(0.5).setDepth(110);

    this.rightPanelText = this.add.text(GAME_WIDTH - 245, GAME_HEIGHT - 170, "", {
      ...baseTextStyle,
      fontSize: "24px",
      align: "right"
    }).setDepth(110);

    this.shopText = this.add.text(GAME_WIDTH / 2, 82, "", {
      ...baseTextStyle,
      fontSize: "20px",
      color: "#fff1b8",
      align: "center"
    }).setOrigin(0.5, 0).setDepth(110);
  }

  addHitEffect(x, y, color, radius) {
    addHitEffect(this, x, y, color, radius);
  }

  showFloatingMessage(title, subtitle) {
    showFloatingMessage(this, title, subtitle);
  }
}
