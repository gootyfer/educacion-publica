import type Phaser from "phaser"

import { COMPANION_FRAME_INDEXES } from "../animations"

export interface CompanionSlot {
  readonly x: number
  readonly y: number
  readonly scale: number
  readonly depth: number
}

const FORMATION: readonly CompanionSlot[] = [
  { x: -44, y: 0, scale: 0.88, depth: 30 },
  { x: -76, y: 0, scale: 0.88, depth: 30 },
  { x: -108, y: 0, scale: 0.88, depth: 30 },
  { x: -58, y: -10, scale: 0.82, depth: 20 },
  { x: -90, y: -10, scale: 0.82, depth: 20 },
  { x: -122, y: -10, scale: 0.82, depth: 20 },
  { x: -72, y: -20, scale: 0.76, depth: 10 },
  { x: -104, y: -20, scale: 0.76, depth: 10 },
  { x: -136, y: -20, scale: 0.76, depth: 10 },
  { x: -168, y: -20, scale: 0.76, depth: 10 },
]

export const COMPANION_APPEARANCE_ORDER = [
  1, 2, 9, 3, 4, 10, 5, 6, 7, 8,
] as const

export function companionFormation(count: number): readonly CompanionSlot[] {
  return FORMATION.slice(0, Math.min(10, Math.max(0, Math.floor(count))))
}

export class CompanionGroup {
  private readonly sprites: Phaser.GameObjects.Sprite[]
  private count = 0

  constructor(
    scene: Phaser.Scene,
    private readonly teacherX: number,
    private readonly groundY: number,
  ) {
    this.sprites = COMPANION_APPEARANCE_ORDER.map((identity) => {
      const frames = COMPANION_FRAME_INDEXES[identity - 1]!
      return scene.add
        .sprite(0, groundY, "companions", frames[0])
        .setOrigin(0.5, 1)
        .setScale(0.88)
        .setDepth(10)
        .setVisible(false)
        .play(`companion-${identity}-run`)
    })
  }

  setCount(count: number): void {
    this.count = Math.min(10, Math.max(0, Math.floor(count)))
    const slots = companionFormation(this.count)
    this.sprites.forEach((sprite, index) => {
      const visible = index < this.count
      const slot = slots[index]
      sprite
        .setVisible(visible)
        .setActive(visible)
      if (slot) {
        sprite
          .setPosition(this.teacherX + slot.x, this.groundY + slot.y)
          .setScale(slot.scale)
          .setDepth(slot.depth)
      }
    })
  }

  visibleGroundPositions(): number[] {
    return this.sprites.slice(0, this.count).map((sprite) => sprite.y)
  }

  visibleCount(): number {
    return this.count
  }

  destroy(): void {
    this.sprites.forEach((sprite) => sprite.destroy())
  }
}
