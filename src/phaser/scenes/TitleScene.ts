import Phaser from "phaser"

import { createCourseState } from "../../course/progression"
import { TITLE_COPY } from "../scene-contracts"
import { PixelPanel } from "../ui/PixelPanel"
import type { CourseState } from "../../course/types"
import { staticBackgroundTextureFor } from "../backgrounds/PanoramaModel"

interface TitleSceneData {
  readonly state?: CourseState
}

export class TitleScene extends Phaser.Scene {
  private panel?: PixelPanel
  private started = false
  private initialState = createCourseState()

  constructor() {
    super("title")
  }

  init(data: TitleSceneData): void {
    this.initialState = data.state ?? createCourseState()
    this.started = false
  }

  create(): void {
    this.add
      .tileSprite(0, 0, 640, 360, staticBackgroundTextureFor("title"))
      .setOrigin(0, 0)
    this.panel = new PixelPanel(this, 450, 290)
    this.panel.addLabel(TITLE_COPY.eyebrow, 13, { color: "#f3d765" })
    this.panel.addLabel(TITLE_COPY.title, 28, { gap: 48 })
    this.panel.addButton(TITLE_COPY.start, this.startCourse)
    this.panel.addButton(TITLE_COPY.how, () => this.game.events.emit("ui:how"))
    this.panel.addLabel(TITLE_COPY.help, 12)

    this.game.events.on("ui:start", this.startCourse)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.game.events.emit("scene:title")
  }

  private readonly startCourse = (): void => {
    if (this.started) return
    this.started = true
    this.scene.start("game", { term: 1, state: this.initialState })
  }

  private shutdown(): void {
    this.game.events.off("ui:start", this.startCourse)
    this.panel?.destroy()
  }
}
