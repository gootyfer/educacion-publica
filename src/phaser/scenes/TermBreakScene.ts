import Phaser from "phaser"

import { advanceCourse } from "../../course/progression"
import type { CourseState } from "../../course/types"
import { TERM_BREAK_COPY, refillSchedule } from "../scene-contracts"
import { EnergyHud } from "../ui/EnergyHud"
import { PixelPanel } from "../ui/PixelPanel"
import { AUDIO_ASSETS } from "../audio/GameAudio"

export interface TermBreakSceneData {
  readonly completedTerm: 1 | 2
  readonly nextTerm: 2 | 3
  readonly state: CourseState
  readonly reducedMotion?: boolean
}

export class TermBreakScene extends Phaser.Scene {
  private sceneData!: TermBreakSceneData
  private hud?: EnergyHud
  private panel?: PixelPanel
  private continueButton?: Phaser.GameObjects.Container
  private ready = false
  private continued = false

  constructor() {
    super("term-break")
  }

  init(data: TermBreakSceneData): void {
    this.sceneData = data
    this.ready = false
    this.continued = false
  }

  preload(): void {
    const key =
      this.sceneData.completedTerm === 1 ? "audio-christmas" : "audio-spring"
    if (!this.cache.audio.exists(key)) this.load.audio(key, AUDIO_ASSETS[key])
  }

  create(): void {
    const copy = TERM_BREAK_COPY[this.sceneData.completedTerm]
    this.add.image(320, 180, `term${this.sceneData.completedTerm}`)
    this.panel = new PixelPanel(this, 460, 280)
    this.panel.addLabel(copy.eyebrow, 13, { color: "#f3d765" })
    this.panel.addLabel(copy.title, 23, { gap: 50 })
    this.panel.addLabel(copy.energy, 14, { gap: 36 })
    this.panel.addGap(35)
    this.continueButton = this.panel
      .addButton(copy.continue, this.continueCourse, 240)
      .setAlpha(0.5)
      .disableInteractive()

    this.hud = new EnergyHud(this, 233, 185)
    this.hud.setEnergy(0)
    this.startRefill()
    this.game.events.on("ui:continue", this.continueCourse)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.game.events.emit("scene:term-break", this.sceneData.completedTerm)
  }

  private startRefill(): void {
    const reducedMotion =
      this.sceneData.reducedMotion ??
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    const schedule = refillSchedule(reducedMotion)
    schedule.forEach((delay, index) => {
      this.time.delayedCall(delay, () => {
        this.hud?.setEnergy((index + 1) * 10)
        if (index !== 9) return
        this.ready = true
        this.continueButton?.setAlpha(1).setInteractive({ useHandCursor: true })
        this.game.events.emit("term-break:refilled")
      })
    })
  }

  private readonly continueCourse = (): void => {
    if (!this.ready || this.continued) return
    this.continued = true
    const step = advanceCourse(
      this.sceneData.state,
      { startNextTerm: true },
      0,
    )
    this.scene.start("game", {
      term: this.sceneData.nextTerm,
      state: step.state,
    })
  }

  private shutdown(): void {
    this.game.events.off("ui:continue", this.continueCourse)
    this.hud?.destroy()
    this.panel?.destroy()
  }
}
