import Phaser from "phaser"

import type { CourseResult, CourseState } from "../../course/types"
import { createCourseState } from "../../course/progression"
import { RESULTS_COPY } from "../scene-contracts"
import { PixelPanel } from "../ui/PixelPanel"
import { AUDIO_ASSETS } from "../audio/GameAudio"
import { staticBackgroundTextureFor } from "../backgrounds/PanoramaModel"
import { SCREEN_LAYOUTS } from "../ui/ScreenLayout"

export interface ResultsSceneData {
  readonly result: CourseResult
  readonly state: CourseState
}

export class ResultsScene extends Phaser.Scene {
  private sceneData!: ResultsSceneData
  private panel?: PixelPanel
  private retried = false

  constructor() {
    super("results")
  }

  init(data: ResultsSceneData): void {
    this.sceneData = data
    this.retried = false
  }

  preload(): void {
    if (!this.cache.audio.exists("audio-course-end")) {
      this.load.audio("audio-course-end", AUDIO_ASSETS["audio-course-end"])
    }
  }

  create(): void {
    this.add
      .tileSprite(0, 0, 640, 360, staticBackgroundTextureFor("results"))
      .setOrigin(0, 0)
    const layout = SCREEN_LAYOUTS.results
    this.panel = new PixelPanel(this, layout.panel)
    this.panel.addText(RESULTS_COPY.title, 320, 77, 39)
    this.panel.addDivider({ x: 202, y: 103, width: 236, height: 4 })
    this.panel.addText("HAS COMPLETADO LOS TRES TRIMESTRES", 320, 121, 17)
    const totalSeconds = Math.floor(
      this.sceneData.state.courseElapsedMs / 1000,
    )
    const maxRatio = Math.max(
      this.sceneData.result.maxRatio,
      ...this.sceneData.state.completedTerms.map((result) => result.maxRatio),
    )
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    this.panel.addStatBox("TIEMPO", `${minutes}:${seconds}`, {
      x: 184,
      y: 139,
      width: 128,
      height: 58,
    })
    this.panel.addStatBox("RATIO MÁXIMA", String(maxRatio), {
      x: 328,
      y: 139,
      width: 128,
      height: 58,
    })
    this.panel.addButton(
      RESULTS_COPY.actions[0],
      this.retryCourse,
      layout.actions.retry,
    )
    this.panel.addButton(
      RESULTS_COPY.actions[1],
      () => this.game.events.emit("ui:why"),
      layout.actions.why,
      "secondary",
    )
    this.panel.addButton(
      RESULTS_COPY.actions[2],
      () => this.game.events.emit("ui:share", this.sceneData.state),
      layout.actions.share,
      "text",
    )
    this.game.events.on("ui:retry", this.retryCourse)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.game.events.emit("scene:results", this.sceneData.state)
  }

  private readonly retryCourse = (): void => {
    if (this.retried) return
    this.retried = true
    this.scene.start("title", {
      state: createCourseState(this.sceneData.state.profile),
    })
  }

  private shutdown(): void {
    this.game.events.off("ui:retry", this.retryCourse)
    this.panel?.destroy()
  }
}
