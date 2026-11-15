import Phaser from "phaser"

import { buildGameConfig } from "./config"

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game(buildGameConfig(parent))
}
