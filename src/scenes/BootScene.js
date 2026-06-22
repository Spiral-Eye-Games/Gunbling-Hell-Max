import { ensureIconTextures, registerLucideIcons } from "../ui/IconRegistry.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  async create() {
    try {
      await registerLucideIcons(this);
    } catch (error) {
      console.warn("[icons] Lucide no cargó, usando placeholders:", error);
      ensureIconTextures(this);
    }

    this.scene.start("MainScene");
  }
}
