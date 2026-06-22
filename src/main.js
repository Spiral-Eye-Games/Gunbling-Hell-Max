import Phaser from "phaser";

globalThis.Phaser = Phaser;

import { createPhaserConfig } from "./config/gameConfig.js";
import { MainScene } from "./scenes/MainScene.js";

new Phaser.Game(createPhaserConfig(MainScene));
