import Phaser from "phaser"

import { advanceCourse } from "../../course/progression"
import type { CourseState } from "../../course/types"
import { TERM_BREAK_COPY, refillSchedule } from "../scene-contracts"
import { EnergyHud } from "../ui/EnergyHud"
import { PixelPanel } from "../ui/PixelPanel"
import { AUDIO_ASSETS } from "../audio/GameAudio"
import { staticBackgroundTextureFor } from "../backgrounds/PanoramaModel"
import { SCREEN_LAYOUTS } from "../ui/ScreenLayout"

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
    const background =
      this.sceneData.completedTerm === 1 ? "christmas" : "spring-break"
    this.add
      .tileSprite(0, 0, 640, 360, staticBackgroundTextureFor(background))
      .setOrigin(0, 0)
    const layout = SCREEN_LAYOUTS["term-break"]
    this.panel = new PixelPanel(this, layout.panel)
    this.panel.addText(copy.eyebrow, 320, 91, 19)
    this.panel.addBand(copy.title, { x: 126, y: 112, width: 388, height: 48 }, 28)
    this.panel.addText(copy.energy, 320, 230, 21)
    this.continueButton = this.panel
      .addButton(copy.continue, this.continueCourse, layout.actions.continue)
      .setAlpha(0.5)
      .disableInteractive()

    this.hud = new EnergyHud(this, 233, 180)
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
