import { COLORS } from "../config/colors.js";

export const TOKENS = {
  shotgun: {
    key: "shotgun",
    label: "☰",
    name: "ESCOPETA",
    color: COLORS.shotgun,
    short: "+2 proyectiles / -1 bala",
    shopDescription: "+2 proyectiles por disparo. -1 bala al cargador."
  },
  machine: {
    key: "machine",
    label: "●",
    name: "METRALLETA",
    color: COLORS.machine,
    short: "+cadencia / +5 balas",
    shopDescription: "Aumenta la cadencia. +5 balas al cargador."
  },
  missile: {
    key: "missile",
    label: "✹",
    name: "MISIL",
    color: COLORS.missile,
    short: "explota / -2 balas",
    shopDescription: "Las balas explotan. Más tokens aumentan el área. -2 balas."
  },
  laser: {
    key: "laser",
    label: "7",
    name: "LÁSER",
    color: COLORS.laser,
    short: "atraviesa / -1 bala",
    shopDescription: "Las balas atraviesan. Más tokens aumentan el ancho. -1 bala."
  }
};

export const TOKEN_KEYS = Object.keys(TOKENS);
