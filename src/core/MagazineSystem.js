import {
  BASE_MAGAZINE_SIZE,
  BASE_BULLET_DAMAGE,
  BASE_BULLET_SPEED,
  BASE_FIRE_COOLDOWN_MS,
  EMPTY_SLOT_AMMO_BONUS,
  MIN_MAGAZINE_SIZE
} from "../config/balance.js";
import { COLORS } from "../config/colors.js";
import { REEL_COUNT, SLOTS_PER_REEL } from "../config/gameConfig.js";

export function createEmptyReels() {
  return Array.from({ length: REEL_COUNT }, () =>
    Array.from({ length: SLOTS_PER_REEL }, () => null)
  );
}

export function createBaseMagazine(bonuses) {
  const totalAmmo = BASE_MAGAZINE_SIZE + bonuses.baseMagazineBonus;

  return {
    maxAmmo: totalAmmo,
    ammo: totalAmmo,

    emptyTokens: 0,
    shotgunTokens: 0,
    machineTokens: 0,
    missileTokens: 0,
    laserTokens: 0,

    projectileCount: 1,
    spreadRadians: 0,
    fireCooldownMs: BASE_FIRE_COOLDOWN_MS,

    bulletSpeed: BASE_BULLET_SPEED,
    bulletDamage: BASE_BULLET_DAMAGE + bonuses.baseDamageBonus,

    explosive: false,
    explosionRadius: 0,

    piercing: false,
    laserWidth: 0
  };
}

export function buildMagazineFromResults(resultKeys, bonuses) {
  const counts = {
    empty: 0,
    shotgun: 0,
    machine: 0,
    missile: 0,
    laser: 0
  };

  for (const key of resultKeys) {
    if (key === null) counts.empty += 1;
    else counts[key] += 1;
  }

  let ammo = BASE_MAGAZINE_SIZE + bonuses.baseMagazineBonus;

  ammo += counts.empty * EMPTY_SLOT_AMMO_BONUS;
  ammo -= counts.shotgun * 1;
  ammo += counts.machine * 5;
  ammo -= counts.missile * 2;
  ammo -= counts.laser * 1;

  ammo = Math.max(MIN_MAGAZINE_SIZE, ammo);

  const projectileCount = 1 + counts.shotgun * 2;

  const fireCooldownMs = Math.max(
    45,
    BASE_FIRE_COOLDOWN_MS * Math.pow(0.72, counts.machine)
  );

  const explosive = counts.missile > 0;
  const explosionRadius = explosive ? 42 + counts.missile * 28 : 0;

  const piercing = counts.laser > 0;
  const laserWidth = piercing ? 6 + counts.laser * 5 : 0;

  const bulletDamage =
    BASE_BULLET_DAMAGE +
    bonuses.baseDamageBonus +
    counts.missile * 0.4 +
    counts.laser * 0.35;

  const bulletSpeed =
    BASE_BULLET_SPEED +
    counts.machine * 55 +
    counts.laser * 90 -
    counts.missile * 80;

  return {
    maxAmmo: ammo,
    ammo,

    emptyTokens: counts.empty,
    shotgunTokens: counts.shotgun,
    machineTokens: counts.machine,
    missileTokens: counts.missile,
    laserTokens: counts.laser,

    projectileCount,
    spreadRadians: counts.shotgun > 0 ? 0.13 + counts.shotgun * 0.05 : 0,
    fireCooldownMs,

    bulletSpeed,
    bulletDamage,

    explosive,
    explosionRadius,

    piercing,
    laserWidth
  };
}

export function getMagazineSummary(magazine) {
  const parts = [];

  if (magazine.emptyTokens > 0) parts.push("VACÍO x" + magazine.emptyTokens + " (+balas)");
  if (magazine.shotgunTokens > 0) parts.push("ESCOPETA x" + magazine.shotgunTokens);
  if (magazine.machineTokens > 0) parts.push("METRALLETA x" + magazine.machineTokens);
  if (magazine.missileTokens > 0) parts.push("MISIL x" + magazine.missileTokens);
  if (magazine.laserTokens > 0) parts.push("7/LÁSER x" + magazine.laserTokens);

  if (parts.length === 0) return "CARGADOR BASE";

  return parts.join(" · ");
}

export function getBulletColor(magazine) {
  if (magazine.laserTokens > 0) return COLORS.laser;
  if (magazine.missileTokens > 0) return COLORS.missile;
  if (magazine.machineTokens > 0) return COLORS.machine;
  if (magazine.shotgunTokens > 0) return COLORS.shotgun;

  return COLORS.bullet;
}

export function getMagazineBonuses(scene) {
  return {
    baseMagazineBonus: scene.baseMagazineBonus,
    baseDamageBonus: scene.baseDamageBonus
  };
}

export function refreshBaseMagazine(scene) {
  scene.currentMagazine = createBaseMagazine(getMagazineBonuses(scene));
}
