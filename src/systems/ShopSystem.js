import {
  getRequiredKills,
  getTokenCost,
  getWaveSize,
  SHOP_REROLL_COST
} from "../config/balance.js";
import { REEL_COUNT, SATAN_ROUND, SLOTS_PER_REEL } from "../config/gameConfig.js";
import { refreshBaseMagazine } from "../core/MagazineSystem.js";
import { PASSIVE_CATALOG } from "../data/shopPassives.js";
import { TOKEN_KEYS, TOKENS } from "../data/tokens.js";
import { startBossFight } from "./BossSystem.js";
import { spawnWave } from "./EnemySystem.js";

export function getCurrentOffers(scene) {
  return scene.shopSection === "tokens" ? scene.tokenOffers : scene.passiveOffers;
}

export function generateShopOffers(scene) {
  scene.tokenOffers = Array.from({ length: 3 }, () => {
    const key = Phaser.Utils.Array.GetRandom(TOKEN_KEYS);
    return {
      type: "token",
      key,
      name: "TOKEN " + TOKENS[key].name,
      description: TOKENS[key].shopDescription,
      cost: scene.phase === "initialShop" ? 0 : getTokenCost(key, scene.round)
    };
  });

  const passives = PASSIVE_CATALOG.map((item) => ({ ...item }));
  Phaser.Utils.Array.Shuffle(passives);
  scene.passiveOffers = passives.slice(0, 3);

  scene.shopSelection = 0;
}

function applyPassiveEffect(scene, effect) {
  switch (effect) {
    case "magazineBonus":
      scene.baseMagazineBonus += 1;
      refreshBaseMagazine(scene);
      break;
    case "damageBonus":
      scene.baseDamageBonus += 1;
      scene.currentMagazine.bulletDamage += 1;
      break;
    case "maxHp":
      scene.maxHp += 25;
      scene.hp = scene.maxHp;
      break;
    case "speedBonus":
      scene.speedBonus += 20;
      break;
    case "heal":
      scene.hp = Math.min(scene.maxHp, scene.hp + 60);
      break;
    case "comboDecay":
      scene.comboDecayMultiplier *= 0.85;
      break;
  }
}

export function buyOrChooseSelectedOffer(scene) {
  const offers = getCurrentOffers(scene);
  const offer = offers[scene.shopSelection];

  if (!offer) return;

  if (offer.type === "token") {
    if (scene.phase === "initialShop") {
      if (scene.freeTokensRemaining <= 0) return;

      scene.placingToken = offer.key;
      scene.objectiveText.setText("COLOCÁ TOKEN GRATIS: " + TOKENS[offer.key].name);
      return;
    }

    if (scene.chips < offer.cost) {
      scene.showFloatingMessage("SIN FICHAS", offer.name);
      return;
    }

    scene.chips -= offer.cost;
    scene.placingToken = offer.key;
    scene.objectiveText.setText("COLOCÁ TOKEN: " + TOKENS[offer.key].name);
    return;
  }

  if (offer.type === "passive") {
    if (scene.phase === "initialShop") {
      scene.showFloatingMessage("BLOQUEADO", "primero elegí tus tokens gratis");
      return;
    }

    if (scene.chips < offer.cost) {
      scene.showFloatingMessage("SIN FICHAS", offer.name);
      return;
    }

    scene.chips -= offer.cost;
    applyPassiveEffect(scene, offer.effect);
    scene.showFloatingMessage("COMPRADO", offer.name);
    offers.splice(scene.shopSelection, 1);
    scene.shopSelection = Phaser.Math.Clamp(
      scene.shopSelection,
      0,
      Math.max(0, offers.length - 1)
    );
  }
}

export function placeTokenInSelectedSlot(scene) {
  if (!scene.placingToken) return;

  scene.reels[scene.placeReelIndex][scene.placeSlotIndex] = scene.placingToken;

  const tokenName = TOKENS[scene.placingToken].name;

  if (scene.phase === "initialShop") {
    scene.freeTokensRemaining -= 1;

    if (scene.freeTokensRemaining <= 0) {
      scene.placingToken = null;
      scene.objectiveText.setText("LISTO · F PARA EMPEZAR LA RUN");
      generateShopOffers(scene);
      return;
    }

    scene.placingToken = null;
    scene.objectiveText.setText(
      "TIENDA INICIAL · ELEGÍ " + scene.freeTokensRemaining + " TOKEN GRATIS"
    );
    generateShopOffers(scene);
    return;
  }

  scene.placingToken = null;
  scene.objectiveText.setText("TOKEN COLOCADO: " + tokenName + " · F PARA DESCENDER");
  generateShopOffers(scene);
}

export function rerollShop(scene) {
  if (scene.phase === "initialShop") {
    generateShopOffers(scene);
    return;
  }

  if (scene.chips < SHOP_REROLL_COST) {
    scene.showFloatingMessage("SIN FICHAS", "REROLL");
    return;
  }

  scene.chips -= SHOP_REROLL_COST;
  generateShopOffers(scene);
}

export function startRun(scene) {
  scene.phase = "combat";
  scene.hasStartedRun = true;
  scene.objectiveText.setText("");
  scene.shopText.setText("");
  spawnWave(scene, 5);
}

export function enterShop(scene) {
  scene.phase = "shop";
  scene.enemies = [];
  scene.bullets = [];
  scene.hazards = [];

  scene.objectiveText.setText(
    "RONDA LIMPIA · COMPRÁ PASIVAS/TOKENS O PRESIONÁ F PARA DESCENDER"
  );

  generateShopOffers(scene);
}

export function descendToNextRound(scene) {
  scene.round += 1;

  if (scene.round >= SATAN_ROUND) {
    startBossFight(scene);
    return;
  }

  scene.phase = "combat";
  scene.killsThisRound = 0;
  scene.requiredKills = getRequiredKills(scene.round);

  scene.objectiveText.setText("");
  scene.shopText.setText("");

  refreshBaseMagazine(scene);
  spawnWave(scene, getWaveSize(scene.round));
}

export function updateShop(scene) {
  if (scene.placingToken) {
    updateTokenPlacement(scene);
    return;
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.TAB)) {
    scene.shopSection = scene.shopSection === "tokens" ? "passives" : "tokens";
    scene.shopSelection = 0;
  }

  const offers = getCurrentOffers(scene);

  if (Phaser.Input.Keyboard.JustDown(scene.keys.A)) {
    scene.shopSelection = Phaser.Math.Wrap(scene.shopSelection - 1, 0, offers.length);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.D)) {
    scene.shopSelection = Phaser.Math.Wrap(scene.shopSelection + 1, 0, offers.length);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.E)) {
    buyOrChooseSelectedOffer(scene);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.R)) {
    rerollShop(scene);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.F)) {
    if (scene.phase === "initialShop") {
      if (scene.freeTokensRemaining <= 0) {
        startRun(scene);
      } else {
        scene.showFloatingMessage(
          "ELEGÍ TOKENS",
          "te quedan " + scene.freeTokensRemaining + " gratis"
        );
      }
    } else {
      descendToNextRound(scene);
    }
  }
}

function updateTokenPlacement(scene) {
  if (Phaser.Input.Keyboard.JustDown(scene.keys.LEFT)) {
    scene.placeSlotIndex = Phaser.Math.Wrap(scene.placeSlotIndex - 1, 0, SLOTS_PER_REEL);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.RIGHT)) {
    scene.placeSlotIndex = Phaser.Math.Wrap(scene.placeSlotIndex + 1, 0, SLOTS_PER_REEL);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.UP)) {
    scene.placeReelIndex = Phaser.Math.Wrap(scene.placeReelIndex - 1, 0, REEL_COUNT);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.DOWN)) {
    scene.placeReelIndex = Phaser.Math.Wrap(scene.placeReelIndex + 1, 0, REEL_COUNT);
  }

  if (Phaser.Input.Keyboard.JustDown(scene.keys.E)) {
    placeTokenInSelectedSlot(scene);
  }
}
