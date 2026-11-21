import Phaser from "phaser"

import { createCourseState } from "../../course/progression"
import { TITLE_COPY } from "../scene-contracts"
import { PixelPanel } from "../ui/PixelPanel"
import type { CourseState } from "../../course/types"
import { staticBackgroundTextureFor } from "../backgrounds/PanoramaModel"
import { SCREEN_LAYOUTS } from "../ui/ScreenLayout"

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
      .image(0, 0, staticBackgroundTextureFor("title"))
      .setOrigin(0, 0)
    const layout = SCREEN_LAYOUTS.title
    this.panel = new PixelPanel(this, layout.panel)
    this.panel.addText(TITLE_COPY.eyebrow, 320, 78, 18)
    this.panel.addDivider({ x: 204, y: 105, width: 232, height: 4 })
    this.panel.addText("UNA JORNADA\nDECENTE", 320, 145, 36, {
      lineSpacing: -8,
    })
    this.panel.addButton(TITLE_COPY.start, this.startCourse, layout.actions.start)
    this.panel.addButton(
      TITLE_COPY.how,
      () => this.game.events.emit("ui:how"),
      layout.actions.how,
      "secondary",
    )
    this.panel.addText(TITLE_COPY.help, 320, 300, 16)

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
