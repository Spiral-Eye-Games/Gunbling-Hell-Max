import { TOKENS } from "../data/tokens.js";

export function getShotTypeLabel(magazine) {
  if (magazine.laserTokens > 0) return "LÁSER INFERNAL";
  if (magazine.missileTokens > 0) return "MISIL EXPLOSIVO";
  if (magazine.machineTokens > 0) return "METRALLETA";
  if (magazine.shotgunTokens > 0) return "ESCOPETA";
  if (magazine.emptyTokens > 0) return "CARGADOR AMPLIADO";
  return "REVÓLVER BASE";
}

export function getDominantTokenKey(magazine) {
  if (magazine.laserTokens > 0) return "laser";
  if (magazine.missileTokens > 0) return "missile";
  if (magazine.machineTokens > 0) return "machine";
  if (magazine.shotgunTokens > 0) return "shotgun";
  return null;
}

export function getReelSymbolDisplay(resultLabel, resultKey) {
  if (resultKey && TOKENS[resultKey]) {
    return { label: TOKENS[resultKey].label, color: TOKENS[resultKey].color };
  }
  if (resultLabel === "□") {
    return { label: "□", color: 0x2a2a2a };
  }
  return { label: "?", color: 0x1e0e05 };
}
