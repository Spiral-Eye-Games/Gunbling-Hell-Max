import Phaser from "phaser";

globalThis.Phaser = Phaser;

import { createPhaserConfig } from "./config/gameConfig.js";
import { BootScene } from "./scenes/BootScene.js";
import { MainScene } from "./scenes/MainScene.js";

new Phaser.Game(createPhaserConfig(BootScene, MainScene));
