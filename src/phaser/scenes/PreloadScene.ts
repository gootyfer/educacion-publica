import Phaser from "phaser"

import { GAME_ASSETS } from "../assets"
import { createCourseStateAtTerm } from "../../course/progression"
import type { Term } from "../../course/types"

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
    const term = this.developmentTermFromLocation()
    this.scene.start("game", {
      term,
      state: createCourseStateAtTerm(term),
    })
  }

  private developmentTermFromLocation(): Term {
    if (!import.meta.env.DEV || typeof window === "undefined") return 1
    const requested = Number(
      new URLSearchParams(window.location.search).get("term"),
    )
    return requested === 2 || requested === 3 ? requested : 1
  }
}
