import {
  getRequiredKills,
  getTokenCost,
  getWaveSize,
  SHOP_REROLL_COST
} from "../config/balance.js";
import { PASSIVE_OFFER_COUNT, TOKEN_OFFER_COUNT } from "../ui/shopLayout.js";
import { SATAN_ROUND } from "../config/gameConfig.js";
import { refreshBaseMagazine } from "../core/MagazineSystem.js";
import { PASSIVE_CATALOG } from "../data/shopPassives.js";
import { TOKEN_KEYS, TOKENS } from "../data/tokens.js";
import { startBossFight } from "./BossSystem.js";
import { spawnWave } from "./EnemySystem.js";

export function generateShopOffers(scene) {
  scene.tokenOffers = Array.from({ length: TOKEN_OFFER_COUNT }, () => {
    const key = Phaser.Utils.Array.GetRandom(TOKEN_KEYS);
    return {
      type: "token",
      key,
      name: TOKENS[key].name,
      description: TOKENS[key].shopDescription,
      cost: scene.phase === "initialShop" ? 0 : getTokenCost(key, scene.round)
    };
  });

  const passives = PASSIVE_CATALOG.map((item) => ({ ...item }));
  Phaser.Utils.Array.Shuffle(passives);
  scene.passiveOffers = passives.slice(0, PASSIVE_OFFER_COUNT);

  scene.shopHoverToken = -1;
  scene.shopHoverPassive = -1;
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

export function buyTokenOffer(scene, index) {
  const offer = scene.tokenOffers[index];
  if (!offer) return;

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
}

export function buyPassiveOffer(scene, index) {
  const offer = scene.passiveOffers[index];
  if (!offer) return;

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
  scene.passiveOffers.splice(index, 1);
}

export function placeTokenInSelectedSlot(scene) {
  if (!scene.placingToken) return;

  scene.reels[scene.placeReelIndex][scene.placeSlotIndex] = scene.placingToken;

  const tokenName = TOKENS[scene.placingToken].name;

  if (scene.phase === "initialShop") {
    scene.freeTokensRemaining -= 1;

    if (scene.freeTokensRemaining <= 0) {
      scene.placingToken = null;
      scene.objectiveText.setText("LISTO · CONTINUAR PARA EMPEZAR LA RUN");
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
  scene.objectiveText.setText("TOKEN COLOCADO: " + tokenName + " · CONTINUAR PARA DESCENDER");
  generateShopOffers(scene);
}

export function setPlacementCursor(scene, reelIndex, slotIndex) {
  scene.placeReelIndex = reelIndex;
  scene.placeSlotIndex = slotIndex;
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

export function continueShop(scene) {
  if (scene.placingToken) return;

  if (scene.phase === "initialShop") {
    if (scene.freeTokensRemaining <= 0) {
      startRun(scene);
    } else {
      scene.showFloatingMessage(
        "ELEGÍ TOKENS",
        "te quedan " + scene.freeTokensRemaining + " gratis"
      );
    }
    return;
  }

  descendToNextRound(scene);
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
    "RONDA LIMPIA · COMPRÁ O CONTINUÁ PARA DESCENDER"
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

export function getTooltipTokenIndex(scene) {
  if (scene.placingToken) {
    return -1;
  }

  return scene.shopHoverToken;
}
