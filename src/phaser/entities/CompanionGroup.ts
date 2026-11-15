import type Phaser from "phaser"

import { COMPANION_FRAME_INDEXES } from "../animations"

export class CompanionGroup {
  private readonly sprites: Phaser.GameObjects.Sprite[]
  private count = 0

  constructor(
    scene: Phaser.Scene,
    private readonly teacherX: number,
    private readonly groundY: number,
  ) {
    this.sprites = COMPANION_FRAME_INDEXES.map((frames, index) =>
      scene.add
        .sprite(0, groundY, "companions", frames[0])
        .setOrigin(0.5, 1)
        .setScale(index === 8 ? 0.78 : 0.88)
        .setDepth(10 + index)
        .setVisible(false)
        .play(`companion-${index + 1}-run`),
    )
  }

  setCount(count: number): void {
    this.count = Math.min(9, Math.max(0, Math.floor(count)))
    this.sprites.forEach((sprite, index) => {
      const visible = index < this.count
      const row = index % 2
      const column = Math.floor(index / 2)
      sprite
        .setVisible(visible)
        .setActive(visible)
        .setPosition(
          this.teacherX - 42 - column * 23 - row * 10,
          this.groundY,
        )
    })
  }

  visibleGroundPositions(): number[] {
    return this.sprites.slice(0, this.count).map((sprite) => sprite.y)
  }

  destroy(): void {
    this.sprites.forEach((sprite) => sprite.destroy())
  }
}
