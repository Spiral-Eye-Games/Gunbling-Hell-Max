export const UI_DEPTH = {
  frames: 100,
  overlay: 105,
  text: 110,
  shop: 130,
  popup: 150
};

export const FONTS = {
  display: "Cinzel, Georgia, serif",
  impact: '"Bebas Neue", Impact, sans-serif',
  body: "Georgia, serif"
};

export const UI_COLORS = {
  textGold: "#f7d47a",
  textPale: "#ffe0a0",
  textRed: "#ff5a5a",
  textWhite: "#fff8e8",
  strokeDark: "#160000",
  panelFill: 0x070202,
  panelFillShop: 0x020000
};

export function parseFontSize(size) {
  if (typeof size === "number") return size;
  return parseInt(String(size), 10) || 16;
}

export function textStyle(size, color = UI_COLORS.textGold, font = FONTS.body) {
  const px = parseFontSize(size);

  return {
    fontFamily: font,
    fontSize: typeof size === "number" ? size + "px" : size,
    color,
    stroke: UI_COLORS.strokeDark,
    strokeThickness: Math.max(2, Math.floor(px / 8))
  };
}
