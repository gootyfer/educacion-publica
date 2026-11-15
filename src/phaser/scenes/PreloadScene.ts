import Phaser from "phaser"

export const PRELOAD_PROGRESS_EVENT = "preload:progress"
export const PRELOAD_COMPLETE_EVENT = "preload:complete"

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload")
  }

  preload(): void {
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      this.game.events.emit(PRELOAD_PROGRESS_EVENT, progress)
    })
  }

  create(): void {
    this.game.events.emit(PRELOAD_COMPLETE_EVENT)
  }
}
