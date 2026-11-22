import type Phaser from "phaser"

import { SeededRandom } from "../../course/cadence"
import { COMPANION_FRAME_INDEXES } from "../animations"

export interface CompanionSlot {
  readonly x: number
  readonly y: number
  readonly scale: number
  readonly depth: number
}

const FORMATION: readonly CompanionSlot[] = [
  { x: -176, y: 0, scale: 0.64, depth: 20 },
  { x: -161, y: 0, scale: 0.64, depth: 20 },
  { x: -146, y: 0, scale: 0.64, depth: 20 },
  { x: -131, y: 0, scale: 0.64, depth: 20 },
  { x: -116, y: 0, scale: 0.64, depth: 20 },
  { x: -101, y: 0, scale: 0.64, depth: 20 },
  { x: -86, y: 0, scale: 0.64, depth: 20 },
  { x: -71, y: 0, scale: 0.64, depth: 20 },
  { x: -56, y: 0, scale: 0.64, depth: 20 },
  { x: -41, y: 0, scale: 0.64, depth: 20 },
]

const BABY_SLOT = 1
const WHEELCHAIR_SLOT = 7

export function companionAppearanceOrder(seed: number): readonly number[] {
  const random = new SeededRandom(seed)
  const identities = [1, 2, 3, 4, 5, 6, 7, 8]
  for (let index = identities.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random.next() * (index + 1))
    ;[identities[index], identities[swapIndex]] = [
      identities[swapIndex]!,
      identities[index]!,
    ]
  }

  const order = Array<number>(FORMATION.length)
  order[BABY_SLOT] = 9
  order[WHEELCHAIR_SLOT] = 10
  const regularSlots = Array.from(
    { length: order.length },
    (_, index) => index,
  ).filter((index) => order[index] === undefined)
  regularSlots.forEach((slot, index) => {
    order[slot] = identities[index]!
  })
  return order
}

export function companionFormation(count: number): readonly CompanionSlot[] {
  return FORMATION.slice(0, Math.min(10, Math.max(0, Math.floor(count))))
}

export class CompanionGroup {
  private readonly identities: readonly number[]
  private readonly sprites: Phaser.GameObjects.Sprite[]
  private count = 0

  constructor(
    scene: Phaser.Scene,
    private readonly teacherX: number,
    private readonly groundY: number,
    seed = 2_026,
  ) {
    this.identities = companionAppearanceOrder(seed)
    this.sprites = this.identities.map((identity) => {
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

  visibleIdentities(): readonly number[] {
    return this.identities.slice(0, this.count)
  }

  destroy(): void {
    this.sprites.forEach((sprite) => sprite.destroy())
  }
}
