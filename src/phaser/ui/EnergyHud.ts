import type Phaser from "phaser"

import type { Term } from "../../course/types"
import { PIXEL_FONT_FAMILY } from "./ScreenLayout"

export type EnergyBlockState = "empty" | "green" | "coral"

const BLOCK_COUNT = 10
const CRITICAL_THRESHOLD = 30
const FRAME_FOR_STATE: Readonly<Record<EnergyBlockState, number>> = {
  empty: 0,
  green: 1,
  coral: 2,
}

export const ENERGY_HUD_LAYOUT = {
  blockWidth: 14,
  blockHeight: 18,
  blockGap: 2,
  frameWidth: 174,
  frameHeight: 30,
  insetX: 8,
  insetY: 6,
} as const

export function energyBlocksFor(energy: number): EnergyBlockState[] {
  const clamped = Math.min(100, Math.max(0, energy))
  const filled = Math.ceil(clamped / 10)
  const filledState: EnergyBlockState =
    clamped <= CRITICAL_THRESHOLD ? "coral" : "green"
  return Array.from({ length: BLOCK_COUNT }, (_, index) =>
    index < filled ? filledState : "empty",
  )
}

export function termLabelFor(term: Term): string {
  return `TRIMESTRE ${term}`
}

export class EnergyHud {
  private readonly frame: Phaser.GameObjects.Rectangle
  private readonly blocks: Phaser.GameObjects.Image[]
  private readonly termLabel?: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x = 22, y = 20, term?: Term) {
    this.frame = scene.add
      .rectangle(
        x,
        y,
        ENERGY_HUD_LAYOUT.frameWidth,
        ENERGY_HUD_LAYOUT.frameHeight,
        0x173f35,
      )
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xfff8de)
      .setScrollFactor(0)
      .setDepth(99)

    this.blocks = Array.from({ length: BLOCK_COUNT }, (_, index) =>
      scene.add
        .image(
          x +
            ENERGY_HUD_LAYOUT.insetX +
            index *
              (ENERGY_HUD_LAYOUT.blockWidth + ENERGY_HUD_LAYOUT.blockGap),
          y + ENERGY_HUD_LAYOUT.insetY,
          "energy",
          1,
        )
        .setOrigin(0, 0)
        .setDisplaySize(
          ENERGY_HUD_LAYOUT.blockWidth,
          ENERGY_HUD_LAYOUT.blockHeight,
        )
        .setScrollFactor(0)
        .setDepth(100),
    )

    if (term !== undefined) {
      this.termLabel = scene.add
        .text(
          x + ENERGY_HUD_LAYOUT.frameWidth + 12,
          y + ENERGY_HUD_LAYOUT.frameHeight / 2,
          termLabelFor(term),
          {
            fontFamily: PIXEL_FONT_FAMILY,
            fontSize: "18px",
            color: "#fff4d6",
            stroke: "#071f1a",
            strokeThickness: 3,
          },
        )
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(100)
    }
  }

  setEnergy(energy: number): void {
    energyBlocksFor(energy).forEach((state, index) => {
      this.blocks[index]?.setFrame(FRAME_FOR_STATE[state])
    })
  }

  destroy(): void {
    this.frame.destroy()
    this.blocks.forEach((block) => block.destroy())
    this.termLabel?.destroy()
  }
}
