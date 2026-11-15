import Phaser from "phaser"

import { BootScene } from "./scenes/BootScene"
import { GameScene } from "./scenes/GameScene"
import { PreloadScene } from "./scenes/PreloadScene"

export const GAME_WIDTH = 640
export const GAME_HEIGHT = 360

export function buildGameConfig(
  parent: HTMLElement,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#f5f0e4",
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene, PreloadScene, GameScene],
  }
}
