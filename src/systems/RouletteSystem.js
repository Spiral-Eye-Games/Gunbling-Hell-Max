import { REEL_COUNT, SLOTS_PER_REEL } from "../config/gameConfig.js";
import {
  buildMagazineFromResults,
  getMagazineBonuses,
  getMagazineSummary
} from "../core/MagazineSystem.js";
import { TOKENS } from "../data/tokens.js";

export function onSuccessfulHit(scene) {
  const reelIndex = scene.nextReelIndex;
  const rolledSlot = Phaser.Math.Between(0, SLOTS_PER_REEL - 1);
  const tokenKey = scene.reels[reelIndex][rolledSlot];

  scene.reelResultKeys[reelIndex] = tokenKey;
  scene.reelResults[reelIndex] = tokenKey ? TOKENS[tokenKey].label : "□";

  scene.nextReelIndex += 1;
  scene.comboTimer = 3.0;

  if (scene.nextReelIndex >= REEL_COUNT) {
    evaluateReelResults(scene);
  }
}

function evaluateReelResults(scene) {
  scene.currentMagazine = buildMagazineFromResults(
    scene.reelResultKeys,
    getMagazineBonuses(scene)
  );

  const nonEmpty = scene.reelResultKeys.filter((key) => key !== null);
  const uniqueNonEmpty = new Set(nonEmpty);

  const isTriple = nonEmpty.length === 3 && uniqueNonEmpty.size === 1;
  const isPair = nonEmpty.length >= 2 && uniqueNonEmpty.size < nonEmpty.length;

  const summary = getMagazineSummary(scene.currentMagazine);

  if (isTriple) {
    scene.combo += 2;
    scene.comboTimer = 4.2;
    scene.showFloatingMessage("JACKPOT", summary);
  } else if (isPair) {
    scene.combo += 1;
    scene.comboTimer = 3.8;
    scene.showFloatingMessage("COMBINACIÓN", summary);
  } else {
    scene.combo += 0.35;
    scene.comboTimer = 3.2;
    scene.showFloatingMessage("CARGADOR", summary);
  }

  scene.reelResults = ["?", "?", "?"];
  scene.reelResultKeys = [];
  scene.nextReelIndex = 0;
}
