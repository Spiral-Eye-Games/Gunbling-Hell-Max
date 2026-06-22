import { describe, expect, it } from "vitest";
import { COLORS } from "../src/config/colors.js";
import { REEL_COUNT, SLOTS_PER_REEL } from "../src/config/gameConfig.js";
import {
  buildMagazineFromResults,
  createBaseMagazine,
  createEmptyReels,
  getBulletColor,
  getMagazineSummary
} from "../src/core/MagazineSystem.js";

const NO_BONUS = { baseMagazineBonus: 0, baseDamageBonus: 0 };

describe("createEmptyReels", () => {
  it("crea 3 ruletas con 6 slots vacíos cada una", () => {
    const reels = createEmptyReels();

    expect(reels).toHaveLength(REEL_COUNT);
    expect(reels.every((reel) => reel.length === SLOTS_PER_REEL)).toBe(true);
    expect(reels.every((reel) => reel.every((slot) => slot === null))).toBe(true);
  });
});

describe("createBaseMagazine", () => {
  it("devuelve un cargador base sin modificadores", () => {
    const mag = createBaseMagazine(NO_BONUS);

    expect(mag.maxAmmo).toBe(5);
    expect(mag.ammo).toBe(5);
    expect(mag.projectileCount).toBe(1);
    expect(mag.bulletDamage).toBe(1);
    expect(mag.explosive).toBe(false);
    expect(mag.piercing).toBe(false);
  });

  it("aplica bonificaciones de pasivas", () => {
    const mag = createBaseMagazine({ baseMagazineBonus: 2, baseDamageBonus: 3 });

    expect(mag.maxAmmo).toBe(7);
    expect(mag.bulletDamage).toBe(4);
  });
});

describe("buildMagazineFromResults", () => {
  it("slots vacíos dan +3 balas cada uno", () => {
    const mag = buildMagazineFromResults([null, null, null], NO_BONUS);

    expect(mag.maxAmmo).toBe(14);
    expect(mag.emptyTokens).toBe(3);
  });

  it("escopeta suma proyectiles y resta munición", () => {
    const mag = buildMagazineFromResults(["shotgun", "shotgun", null], NO_BONUS);

    expect(mag.projectileCount).toBe(5);
    expect(mag.maxAmmo).toBe(6);
    expect(mag.spreadRadians).toBeGreaterThan(0);
  });

  it("metralleta acelera cadencia y suma balas", () => {
    const mag = buildMagazineFromResults(["machine", "machine", "machine"], NO_BONUS);

    expect(mag.maxAmmo).toBe(20);
    expect(mag.fireCooldownMs).toBeLessThan(230);
    expect(mag.bulletSpeed).toBeGreaterThan(760);
  });

  it("misil activa explosión y reduce balas", () => {
    const mag = buildMagazineFromResults(["missile", null, null], NO_BONUS);

    expect(mag.explosive).toBe(true);
    expect(mag.explosionRadius).toBe(70);
    expect(mag.maxAmmo).toBe(9);
  });

  it("láser activa piercing y reduce balas", () => {
    const mag = buildMagazineFromResults(["laser", "laser", null], NO_BONUS);

    expect(mag.piercing).toBe(true);
    expect(mag.laserWidth).toBe(16);
    expect(mag.maxAmmo).toBe(6);
  });

  it("respeta el mínimo de 1 bala", () => {
    const mag = buildMagazineFromResults(
      ["shotgun", "missile", "missile", "laser"],
      NO_BONUS
    );

    expect(mag.maxAmmo).toBe(1);
  });
});

describe("getMagazineSummary", () => {
  it("describe cargador base sin tokens", () => {
    expect(getMagazineSummary(createBaseMagazine(NO_BONUS))).toBe("CARGADOR BASE");
  });

  it("lista los modificadores activos", () => {
    const mag = buildMagazineFromResults(["shotgun", "machine", null], NO_BONUS);
    const summary = getMagazineSummary(mag);

    expect(summary).toContain("ESCOPETA x1");
    expect(summary).toContain("METRALLETA x1");
    expect(summary).toContain("VACÍO x1");
  });
});

describe("getBulletColor", () => {
  it("prioriza láser > misil > metralleta > escopeta", () => {
    expect(getBulletColor({ laserTokens: 1, missileTokens: 1 })).toBe(COLORS.laser);
    expect(getBulletColor({ missileTokens: 1, machineTokens: 1 })).toBe(COLORS.missile);
    expect(getBulletColor({ machineTokens: 1, shotgunTokens: 1 })).toBe(COLORS.machine);
    expect(getBulletColor({ shotgunTokens: 1 })).toBe(COLORS.shotgun);
    expect(getBulletColor(createBaseMagazine(NO_BONUS))).toBe(COLORS.bullet);
  });
});
