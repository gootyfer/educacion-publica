import Phaser from "phaser"

import { GAME_ASSETS } from "../assets"

export const PRELOAD_PROGRESS_EVENT = "preload:progress"
export const PRELOAD_COMPLETE_EVENT = "preload:complete"
export const PRELOAD_ERROR_EVENT = "preload:error"

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload")
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      this.game.events.emit(PRELOAD_PROGRESS_EVENT, progress)
    })
    this.load.on(
      Phaser.Loader.Events.FILE_LOAD_ERROR,
      (file: Phaser.Loader.File) => {
      this.game.events.emit(PRELOAD_ERROR_EVENT, {
        key: file.key,
        url: file.src,
      })
      },
    )

    for (const [key, asset] of Object.entries(GAME_ASSETS)) {
      if (asset.kind === "image") {
        this.load.image(key, asset.url)
      } else {
        this.load.spritesheet(key, asset.url, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        })
      }
    }
  }

  create(): void {
    this.game.events.emit(PRELOAD_COMPLETE_EVENT)
  }
}
