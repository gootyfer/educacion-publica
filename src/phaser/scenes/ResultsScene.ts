import Phaser from "phaser"

import type { CourseResult, CourseState } from "../../course/types"
import { createCourseState } from "../../course/progression"
import { RESULTS_COPY } from "../scene-contracts"
import { PixelPanel } from "../ui/PixelPanel"
import { AUDIO_ASSETS } from "../audio/GameAudio"

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
    this.add.image(320, 180, "term3")
    this.panel = new PixelPanel(this, 470, 310)
    this.panel.addLabel(RESULTS_COPY.title, 27, { color: "#f3d765", gap: 44 })
    const totalSeconds = Math.floor(
      this.sceneData.state.courseElapsedMs / 1000,
    )
    const maxRatio = Math.max(
      this.sceneData.result.maxRatio,
      ...this.sceneData.state.completedTerms.map((result) => result.maxRatio),
    )
    this.panel.addLabel(`TIEMPO ${totalSeconds} S · RATIO MÁXIMA ${maxRatio}`, 13, {
      gap: 34,
    })
    this.panel.addButton(RESULTS_COPY.actions[0], this.retryCourse, 230)
    this.panel.addButton(RESULTS_COPY.actions[1], () =>
      this.game.events.emit("ui:why"),
    )
    this.panel.addButton(RESULTS_COPY.actions[2], () =>
      this.game.events.emit("ui:share", this.sceneData.state),
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
