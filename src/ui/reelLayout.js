import { REEL_COUNT, SLOTS_PER_REEL } from "../config/gameConfig.js";
import { SHOP_LAYOUT } from "./shopLayout.js";

export const REEL_GRID_COLS = 3;
export const REEL_GRID_ROWS = 2;
export const REEL_GLOBAL_ROWS = REEL_COUNT * REEL_GRID_ROWS;

export const REEL_LAYOUT = {
  panelX: 948,
  panelYCollapsed: 52,
  panelW: 312,
  titleOffset: 10,
  blockStartOffset: 36,
  blockGap: 10,
  blockBottomPad: 12,
  labelH: 22,
  cellW: 88,
  cellH: 42,
  cellGapX: 8,
  cellGapY: 6,
  blockPadX: 14
};

export function getReelBlockHeight() {
  return (
    REEL_LAYOUT.labelH +
    REEL_GRID_ROWS * REEL_LAYOUT.cellH +
    (REEL_GRID_ROWS - 1) * REEL_LAYOUT.cellGapY +
    8
  );
}

export function getReelPanelHeight(collapsed = false) {
  if (collapsed) return 36;

  const blockH = getReelBlockHeight();

  return (
    REEL_LAYOUT.blockStartOffset +
    REEL_COUNT * blockH +
    (REEL_COUNT - 1) * REEL_LAYOUT.blockGap +
    REEL_LAYOUT.blockBottomPad
  );
}

export function getReelPanelY(collapsed = false) {
  if (collapsed) return REEL_LAYOUT.panelYCollapsed;

  const shopCenter = SHOP_LAYOUT.panelY + SHOP_LAYOUT.panelH / 2;
  return Math.round(shopCenter - getReelPanelHeight(false) / 2);
}

export function getReelTitleY(collapsed = false) {
  return getReelPanelY(collapsed) + REEL_LAYOUT.titleOffset;
}

function blockStartY(reelIndex, collapsed = false) {
  const panelY = getReelPanelY(collapsed);
  const blockH = getReelBlockHeight();

  return panelY + REEL_LAYOUT.blockStartOffset + reelIndex * (blockH + REEL_LAYOUT.blockGap);
}

function gridStartX() {
  const gridW =
    REEL_GRID_COLS * REEL_LAYOUT.cellW +
    (REEL_GRID_COLS - 1) * REEL_LAYOUT.cellGapX;
  return REEL_LAYOUT.panelX + (REEL_LAYOUT.panelW - gridW) / 2;
}

export function slotToGrid(slotIndex) {
  return {
    row: Math.floor(slotIndex / REEL_GRID_COLS),
    col: slotIndex % REEL_GRID_COLS
  };
}

export function gridToSlot(row, col) {
  return row * REEL_GRID_COLS + col;
}

export function getReelSlotBounds(reelIndex, slotIndex, collapsed = false) {
  const { row, col } = slotToGrid(slotIndex);
  const x = gridStartX() + col * (REEL_LAYOUT.cellW + REEL_LAYOUT.cellGapX);
  const y =
    blockStartY(reelIndex, collapsed) +
    REEL_LAYOUT.labelH +
    row * (REEL_LAYOUT.cellH + REEL_LAYOUT.cellGapY);

  return {
    x,
    y,
    w: REEL_LAYOUT.cellW,
    h: REEL_LAYOUT.cellH,
    left: x,
    top: y,
    right: x + REEL_LAYOUT.cellW,
    bottom: y + REEL_LAYOUT.cellH,
    centerX: x + REEL_LAYOUT.cellW / 2,
    centerY: y + REEL_LAYOUT.cellH / 2
  };
}

export function getReelBlockBounds(reelIndex, collapsed = false) {
  const y = blockStartY(reelIndex, collapsed);

  return {
    x: REEL_LAYOUT.panelX + 4,
    y,
    w: REEL_LAYOUT.panelW - 8,
    h: getReelBlockHeight()
  };
}

export function globalRowFromPlacement(reelIndex, slotIndex) {
  const { row } = slotToGrid(slotIndex);
  return reelIndex * REEL_GRID_ROWS + row;
}

export function placementFromGlobalRow(globalRow, col) {
  const wrappedRow = Phaser.Math.Wrap(globalRow, 0, REEL_GLOBAL_ROWS);
  const wrappedCol = Phaser.Math.Wrap(col, 0, REEL_GRID_COLS);
  const reelIndex = Math.floor(wrappedRow / REEL_GRID_ROWS);
  const localRow = wrappedRow % REEL_GRID_ROWS;
  const slotIndex = gridToSlot(localRow, wrappedCol);

  return { reelIndex, slotIndex };
}

export function colFromSlot(slotIndex) {
  return slotIndex % REEL_GRID_COLS;
}

export function hitTestReelSlot(px, py, collapsed = false) {
  for (let r = 0; r < REEL_COUNT; r++) {
    for (let s = 0; s < SLOTS_PER_REEL; s++) {
      const b = getReelSlotBounds(r, s, collapsed);
      if (px >= b.left && px <= b.right && py >= b.top && py <= b.bottom) {
        return { reelIndex: r, slotIndex: s };
      }
    }
  }
  return null;
}

export function getCollapsedReelPanelBounds() {
  const panelY = getReelPanelY(true);

  return {
    x: REEL_LAYOUT.panelX,
    y: panelY,
    w: REEL_LAYOUT.panelW,
    h: 36
  };
}
