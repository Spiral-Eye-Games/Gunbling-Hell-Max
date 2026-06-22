export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const SATAN_ROUND = 66;
export const REEL_COUNT = 3;
export const SLOTS_PER_REEL = 6;

export function createPhaserConfig(MainScene) {
  return {
    type: Phaser.AUTO,
    parent: "game",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#050202",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: MainScene
  };
}
