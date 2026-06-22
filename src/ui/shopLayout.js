import { GAME_HEIGHT, GAME_WIDTH } from "../config/gameConfig.js";

export const TOKEN_OFFER_COUNT = 6;
export const PASSIVE_OFFER_COUNT = 3;
export const TOKEN_GRID_COLS = 3;
export const TOKEN_GRID_ROWS = 2;

export const SHOP_LAYOUT = {
  panelX: 36,
  panelY: 158,
  panelW: 800,
  panelH: 430,

  chipsBarH: 52,
  chipsBarW: 200,
  chipsBarGap: 10,

  tokensLabelY: 168,
  tokenGridY: 192,
  tokenCellW: 108,
  tokenCellH: 72,
  tokenGap: 10,

  passivesLabelY: 368,
  passiveCardY: 392,
  passiveCardW: 240,
  passiveCardH: 168,
  passiveCardGap: 16,
  passiveCardPadding: 14,
  passiveIconSize: 32,

  tooltipW: 216,
  tooltipH: 124,
  tooltipMargin: 10,

  actionBtnW: 148,
  actionBtnH: 36,
  actionBtnY: 600,
  rerollBtnX: 36,
  continueBtnX: 688
};

export function getChipsBarBounds() {
  const y = SHOP_LAYOUT.panelY - SHOP_LAYOUT.chipsBarGap - SHOP_LAYOUT.chipsBarH;

  return {
    x: SHOP_LAYOUT.panelX,
    y,
    w: SHOP_LAYOUT.chipsBarW,
    h: SHOP_LAYOUT.chipsBarH,
    left: SHOP_LAYOUT.panelX,
    top: y,
    right: SHOP_LAYOUT.panelX + SHOP_LAYOUT.chipsBarW,
    bottom: y + SHOP_LAYOUT.chipsBarH,
    centerX: SHOP_LAYOUT.panelX + SHOP_LAYOUT.chipsBarW / 2,
    centerY: y + SHOP_LAYOUT.chipsBarH / 2
  };
}

export function getShopTitleY() {
  return getChipsBarBounds().centerY;
}

export function getRerollButtonBounds() {
  return {
    x: SHOP_LAYOUT.rerollBtnX,
    y: SHOP_LAYOUT.actionBtnY,
    w: SHOP_LAYOUT.actionBtnW,
    h: SHOP_LAYOUT.actionBtnH,
    left: SHOP_LAYOUT.rerollBtnX,
    top: SHOP_LAYOUT.actionBtnY,
    right: SHOP_LAYOUT.rerollBtnX + SHOP_LAYOUT.actionBtnW,
    bottom: SHOP_LAYOUT.actionBtnY + SHOP_LAYOUT.actionBtnH,
    centerX: SHOP_LAYOUT.rerollBtnX + SHOP_LAYOUT.actionBtnW / 2,
    centerY: SHOP_LAYOUT.actionBtnY + SHOP_LAYOUT.actionBtnH / 2
  };
}

export function getContinueButtonBounds() {
  return {
    x: SHOP_LAYOUT.continueBtnX,
    y: SHOP_LAYOUT.actionBtnY,
    w: SHOP_LAYOUT.actionBtnW,
    h: SHOP_LAYOUT.actionBtnH,
    left: SHOP_LAYOUT.continueBtnX,
    top: SHOP_LAYOUT.actionBtnY,
    right: SHOP_LAYOUT.continueBtnX + SHOP_LAYOUT.actionBtnW,
    bottom: SHOP_LAYOUT.actionBtnY + SHOP_LAYOUT.actionBtnH,
    centerX: SHOP_LAYOUT.continueBtnX + SHOP_LAYOUT.actionBtnW / 2,
    centerY: SHOP_LAYOUT.actionBtnY + SHOP_LAYOUT.actionBtnH / 2
  };
}

function hitTestButton(bounds, px, py) {
  return px >= bounds.left && px <= bounds.right && py >= bounds.top && py <= bounds.bottom;
}

export function hitTestRerollButton(px, py) {
  return hitTestButton(getRerollButtonBounds(), px, py);
}

export function hitTestContinueButton(px, py) {
  return hitTestButton(getContinueButtonBounds(), px, py);
}

function tokenGridWidth() {
  return (
    TOKEN_GRID_COLS * SHOP_LAYOUT.tokenCellW +
    (TOKEN_GRID_COLS - 1) * SHOP_LAYOUT.tokenGap
  );
}

function tokenGridStartX() {
  return SHOP_LAYOUT.panelX + (SHOP_LAYOUT.panelW - tokenGridWidth()) / 2;
}

function passiveRowWidth() {
  return (
    PASSIVE_OFFER_COUNT * SHOP_LAYOUT.passiveCardW +
    (PASSIVE_OFFER_COUNT - 1) * SHOP_LAYOUT.passiveCardGap
  );
}

function passiveRowStartX() {
  return SHOP_LAYOUT.panelX + (SHOP_LAYOUT.panelW - passiveRowWidth()) / 2;
}

export function tokenIndexToGrid(index) {
  return {
    row: Math.floor(index / TOKEN_GRID_COLS),
    col: index % TOKEN_GRID_COLS
  };
}

export function tokenGridToIndex(row, col) {
  return row * TOKEN_GRID_COLS + col;
}

export function getTokenTileBounds(index) {
  const { row, col } = tokenIndexToGrid(index);
  const x = tokenGridStartX() + col * (SHOP_LAYOUT.tokenCellW + SHOP_LAYOUT.tokenGap);
  const y = SHOP_LAYOUT.tokenGridY + row * (SHOP_LAYOUT.tokenCellH + SHOP_LAYOUT.tokenGap);

  return {
    x,
    y,
    w: SHOP_LAYOUT.tokenCellW,
    h: SHOP_LAYOUT.tokenCellH,
    left: x,
    top: y,
    right: x + SHOP_LAYOUT.tokenCellW,
    bottom: y + SHOP_LAYOUT.tokenCellH,
    centerX: x + SHOP_LAYOUT.tokenCellW / 2,
    centerY: y + SHOP_LAYOUT.tokenCellH / 2
  };
}

export function getPassiveCardBounds(index) {
  const x =
    passiveRowStartX() +
    index * (SHOP_LAYOUT.passiveCardW + SHOP_LAYOUT.passiveCardGap);
  const y = SHOP_LAYOUT.passiveCardY;

  return {
    x,
    y,
    w: SHOP_LAYOUT.passiveCardW,
    h: SHOP_LAYOUT.passiveCardH,
    left: x,
    top: y,
    right: x + SHOP_LAYOUT.passiveCardW,
    bottom: y + SHOP_LAYOUT.passiveCardH,
    centerX: x + SHOP_LAYOUT.passiveCardW / 2,
    centerY: y + SHOP_LAYOUT.passiveCardH / 2
  };
}

export function hitTestTokenTile(px, py) {
  for (let i = 0; i < TOKEN_OFFER_COUNT; i++) {
    const b = getTokenTileBounds(i);
    if (px >= b.left && px <= b.right && py >= b.top && py <= b.bottom) {
      return i;
    }
  }
  return -1;
}

export function hitTestPassiveCard(px, py) {
  for (let i = 0; i < PASSIVE_OFFER_COUNT; i++) {
    const b = getPassiveCardBounds(i);
    if (px >= b.left && px <= b.right && py >= b.top && py <= b.bottom) {
      return i;
    }
  }
  return -1;
}

export function getTooltipPosition(anchorBounds) {
  const { tooltipW, tooltipH, tooltipMargin } = SHOP_LAYOUT;
  let x = anchorBounds.right + tooltipMargin;
  let y = anchorBounds.centerY - tooltipH / 2;

  if (x + tooltipW > GAME_WIDTH - tooltipMargin) {
    x = anchorBounds.left - tooltipW - tooltipMargin;
  }

  if (x < tooltipMargin) {
    x = tooltipMargin;
  }

  y = Phaser.Math.Clamp(y, tooltipMargin, GAME_HEIGHT - tooltipH - tooltipMargin);

  return { x, y, w: tooltipW, h: tooltipH };
}
