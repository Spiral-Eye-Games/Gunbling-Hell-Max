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
import { updateBoss } from "../systems/BossSystem.js";
import { updateBullets } from "../systems/BulletSystem.js";
import { updateCombo } from "../systems/ComboSystem.js";
import { updateEnemies } from "../systems/EnemySystem.js";
import { updateHazards } from "../systems/HazardSystem.js";
import { handlePlayerMovement } from "../systems/PlayerSystem.js";
import { tryShoot, tryShootIfHeld } from "../systems/ShootingSystem.js";
import { enterShop, generateShopOffers, updateShop } from "../systems/ShopSystem.js";
import { UIManager } from "../ui/UIManager.js";

export class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  create() {
    this.graphics = this.add.graphics();

    initRunState(this);
    this.createKeyboard();

    this.ui = new UIManager(this);
    this.ui.create();

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
    if (this.ui) {
      this.ui.update(dt);
    }
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
      this.objectiveText.setText("TIENDA INICIAL · ELEGÍ 2 TOKENS GRATIS");
      this.shopText.setText("");
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
      Q: "Q",
      TAB: "TAB",
      LEFT: "LEFT",
      RIGHT: "RIGHT",
      UP: "UP",
      DOWN: "DOWN"
    });
  }

  addHitEffect(x, y, color, radius) {
    addHitEffect(this, x, y, color, radius);
  }

  showFloatingMessage(title, subtitle) {
    showFloatingMessage(this, title, subtitle);
  }
}
