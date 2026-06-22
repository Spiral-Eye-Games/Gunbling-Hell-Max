import { COLORS } from "../config/colors.js";
import { UI_COLORS } from "./uiTheme.js";

export function drawOrnatePanel(g, x, y, w, h, options = {}) {
  const {
    fill = UI_COLORS.panelFill,
    fillAlpha = 0.88,
    radius = 10,
    border = COLORS.gold,
    inner = 0x8b1d12
  } = options;

  g.fillStyle(fill, fillAlpha);
  g.fillRoundedRect(x, y, w, h, radius);

  g.lineStyle(3, border, 1);
  g.strokeRoundedRect(x, y, w, h, radius);

  g.lineStyle(1, inner, 0.65);
  g.strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, Math.max(4, radius - 4));

  drawCornerSpikes(g, x, y, w, h, border);
}

export function drawOrnateBar(g, x, y, w, h, fillRatio, options = {}) {
  const {
    bg = COLORS.darkRed,
    fill = COLORS.red,
    border = COLORS.gold,
    radius = 6
  } = options;

  g.fillStyle(bg, 1);
  g.fillRoundedRect(x, y, w, h, radius);

  const fillW = Math.max(0, Math.min(w - 4, (w - 4) * fillRatio));
  if (fillW > 0) {
    g.fillStyle(fill, 1);
    g.fillRoundedRect(x + 2, y + 2, fillW, h - 4, radius - 2);
  }

  g.lineStyle(2, border, 1);
  g.strokeRoundedRect(x, y, w, h, radius);
}

function drawCornerSpikes(g, x, y, w, h, color) {
  const s = 6;
  g.fillStyle(color, 0.85);
  g.fillTriangle(x + 2, y + 2, x + 2 + s, y + 2, x + 2, y + 2 + s);
  g.fillTriangle(x + w - 2, y + 2, x + w - 2 - s, y + 2, x + w - 2, y + 2 + s);
  g.fillTriangle(x + 2, y + h - 2, x + 2 + s, y + h - 2, x + 2, y + h - 2 - s);
  g.fillTriangle(x + w - 2, y + h - 2, x + w - 2 - s, y + h - 2, x + w - 2, y + h - 2 - s);
}

export function drawDashRing(g, cx, cy, radius, cooldownRatio, ready) {
  g.fillStyle(ready ? 0x3a0808 : 0x1a0a0a, 1);
  g.fillCircle(cx, cy, radius);

  g.lineStyle(3, ready ? COLORS.paleGold : 0x5a3030, ready ? 1 : 0.5);
  g.strokeCircle(cx, cy, radius);

  if (!ready && cooldownRatio > 0) {
    g.lineStyle(3, COLORS.red, 0.9);
    g.beginPath();
    g.arc(cx, cy, radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownRatio);
    g.strokePath();
  }
}
