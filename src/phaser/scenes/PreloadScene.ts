import Phaser from "phaser"

import { GAME_ASSETS } from "../assets"
import { createCourseStateAtTerm } from "../../course/progression"
import type { Term } from "../../course/types"
import {
  DEFAULT_CALIBRATION,
  type CalibrationProfile,
} from "../../course/calibration"
import {
  PRELOAD_COMPLETE_EVENT,
  PRELOAD_ERROR_EVENT,
  PRELOAD_FATAL_EVENT,
  PRELOAD_PROGRESS_EVENT,
} from "../events"

export {
  PRELOAD_COMPLETE_EVENT,
  PRELOAD_ERROR_EVENT,
  PRELOAD_FATAL_EVENT,
  PRELOAD_PROGRESS_EVENT,
} from "../events"

export class PreloadScene extends Phaser.Scene {
  private readonly failedRequiredAssets = new Set<string>()
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
        if (file.key in GAME_ASSETS) this.failedRequiredAssets.add(file.key)
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
    if (this.failedRequiredAssets.size > 0) {
      this.game.events.emit(PRELOAD_FATAL_EVENT, [
        ...this.failedRequiredAssets,
      ])
      return
    }
    this.game.events.emit(PRELOAD_COMPLETE_EVENT)
    const term = this.developmentTermFromLocation()
    const state = createCourseStateAtTerm(
      term ?? 1,
      this.developmentProfile(),
    )
    if (term === null) {
      this.scene.start("title", { state })
      return
    }
    this.scene.start("game", {
      term,
      state,
    })
  }

  private developmentTermFromLocation(): Term | null {
    if (!import.meta.env.DEV || typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    if (!params.has("slice") && !params.has("term")) return null
    const requested = Number(params.get("term"))
    return requested === 2 || requested === 3 ? requested : 1
  }

  private developmentProfile(): CalibrationProfile {
    if (
      import.meta.env.DEV &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("perf") === "1"
    ) {
      return {
        ...DEFAULT_CALIBRATION,
        ratioIntervalMs: 60_000,
        energyDrainPerSecond: { 1: 0.01, 2: 0.01, 3: 0.01 },
        initialRatios: { 1: 52, 2: 52, 3: 52 },
      }
    }
    if (
      !import.meta.env.DEV ||
      typeof window === "undefined" ||
      new URLSearchParams(window.location.search).get("fast") !== "1"
    ) {
      return DEFAULT_CALIBRATION
    }
    return {
      ...DEFAULT_CALIBRATION,
      impactDamage: 2,
      ratioIntervalMs: 20,
      energyDrainPerSecond: { 1: 200, 2: 200, 3: 200 },
      initialRatios: { 1: 20, 2: 36, 3: 52 },
      targetTermDurationMs: { 1: 500, 2: 500, 3: 500 },
    }
  }
}
