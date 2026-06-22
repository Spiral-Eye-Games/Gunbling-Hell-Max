import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";
import {
  INITIAL_FREE_TOKENS,
  PLAYER_BASE_HP,
  PLAYER_BASE_SPEED
} from "../config/balance.js";
import { createEmptyReels, createBaseMagazine, getMagazineBonuses } from "./MagazineSystem.js";

export function initRunState(scene) {
  scene.player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 145,
    radius: 16,
    speed: PLAYER_BASE_SPEED,
    angle: 0
  };

  scene.bullets = [];
  scene.enemies = [];
  scene.hazards = [];
  scene.hitEffects = [];

  scene.phase = "initialShop";

  scene.round = 1;
  scene.killsThisRound = 0;
  scene.requiredKills = 10;

  scene.hp = PLAYER_BASE_HP;
  scene.maxHp = PLAYER_BASE_HP;

  scene.score = 0;
  scene.chips = 0;

  scene.combo = 1;
  scene.comboTimer = 0;

  scene.lastShotAt = 0;

  scene.reels = createEmptyReels();
  scene.reelResults = ["?", "?", "?"];
  scene.reelResultKeys = [];
  scene.nextReelIndex = 0;

  scene.currentMagazine = createBaseMagazine(getMagazineBonuses(scene));

  scene.dashCooldown = 0;
  scene.invulnerabilityTimer = 0;

  scene.boss = null;

  scene.shopHoverToken = -1;
  scene.shopHoverPassive = -1;
  scene.shopHoverReroll = false;
  scene.shopHoverContinue = false;
  scene.reelHoverSlot = null;
  scene.tokenOffers = [];
  scene.passiveOffers = [];
  scene.placingToken = null;
  scene.placeReelIndex = 0;
  scene.placeSlotIndex = 0;
  scene.freeTokensRemaining = INITIAL_FREE_TOKENS;
  scene.hasStartedRun = false;

  scene.baseMagazineBonus = 0;
  scene.baseDamageBonus = 0;
  scene.comboDecayMultiplier = 1;
  scene.pityBonus = 0;
  scene.speedBonus = 0;
}

export function resetRunState(scene) {
  initRunState(scene);

  scene.objectiveText.setText("TIENDA INICIAL · ELEGÍ 2 TOKENS GRATIS");
  scene.shopText.setText("");
}
