import { describe, expect, it } from "vitest";
import {
  getReinforcementWaveSize,
  getRequiredKills,
  getTokenCost,
  getWaveSize
} from "../src/config/balance.js";

describe("getRequiredKills", () => {
  it("escala con la ronda hasta el tope de 42", () => {
    expect(getRequiredKills(1)).toBe(10);
    expect(getRequiredKills(10)).toBe(16);
    expect(getRequiredKills(50)).toBe(40);
    expect(getRequiredKills(100)).toBe(42);
  });
});

describe("getWaveSize", () => {
  it("crece con la ronda hasta un máximo de 12", () => {
    expect(getWaveSize(1)).toBe(4);
    expect(getWaveSize(20)).toBe(9);
    expect(getWaveSize(40)).toBe(12);
    expect(getWaveSize(100)).toBe(12);
  });
});

describe("getReinforcementWaveSize", () => {
  it("aumenta cada 12 rondas hasta 5", () => {
    expect(getReinforcementWaveSize(1)).toBe(2);
    expect(getReinforcementWaveSize(12)).toBe(3);
    expect(getReinforcementWaveSize(36)).toBe(5);
    expect(getReinforcementWaveSize(100)).toBe(5);
  });
});

describe("getTokenCost", () => {
  it("suma el costo base del token más round * 2", () => {
    expect(getTokenCost("shotgun", 1)).toBe(92);
    expect(getTokenCost("machine", 10)).toBe(120);
    expect(getTokenCost("missile", 5)).toBe(135);
    expect(getTokenCost("laser", 20)).toBe(175);
  });
});
