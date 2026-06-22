export const BASE_MAGAZINE_SIZE = 5;
export const EMPTY_SLOT_AMMO_BONUS = 3;
export const MIN_MAGAZINE_SIZE = 1;

export const BASE_FIRE_COOLDOWN_MS = 230;
export const BASE_BULLET_SPEED = 760;
export const BASE_BULLET_DAMAGE = 1;

export const PLAYER_BASE_HP = 125;
export const PLAYER_BASE_SPEED = 265;

export const SHOP_REROLL_COST = 50;
export const INITIAL_FREE_TOKENS = 2;

export function getRequiredKills(round) {
  return Math.min(42, 10 + Math.floor(round * 0.6));
}

export function getWaveSize(round) {
  return Math.min(12, 4 + Math.floor(round * 0.25));
}

export function getReinforcementWaveSize(round) {
  return Math.min(5, 2 + Math.floor(round / 12));
}

export function getTokenCost(key, round) {
  const baseCosts = {
    shotgun: 90,
    machine: 100,
    missile: 125,
    laser: 135
  };

  return Math.floor(baseCosts[key] + round * 2);
}
