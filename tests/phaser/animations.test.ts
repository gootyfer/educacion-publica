import { describe, expect, it } from "vitest"

import {
  COMPANION_FRAME_INDEXES,
  TEACHER_FRAME_INDEXES,
} from "../../src/phaser/animations"
import {
  ENERGY_HUD_LAYOUT,
  energyBlocksFor,
  termLabelFor,
} from "../../src/phaser/ui/EnergyHud"

describe("Phaser animation and HUD contracts", () => {
  it("maps the approved teacher sheet to named animation rows", () => {
    expect(TEACHER_FRAME_INDEXES.run).toEqual([0, 1, 2, 3, 4, 5])
    expect(TEACHER_FRAME_INDEXES.jump).toEqual([6, 7, 8, 9, 10, 11])
    expect(TEACHER_FRAME_INDEXES.hit).toEqual([12, 13, 14, 15])
    expect(TEACHER_FRAME_INDEXES.tired).toEqual([18, 19, 20, 21, 22, 23])
  })

  it("maps ten companions to two grounded run frames each", () => {
    expect(COMPANION_FRAME_INDEXES).toHaveLength(10)
    expect(COMPANION_FRAME_INDEXES[0]).toEqual([0, 1])
    expect(COMPANION_FRAME_INDEXES[8]).toEqual([16, 17])
    expect(COMPANION_FRAME_INDEXES[9]).toEqual([18, 19])
  })

  it.each([
    [100, { green: 10, coral: 0, empty: 0 }],
    [70, { green: 7, coral: 0, empty: 3 }],
    [30, { green: 0, coral: 3, empty: 7 }],
    [0, { green: 0, coral: 0, empty: 10 }],
  ])("maps %s energy to ten contiguous HUD blocks", (energy, expected) => {
    const blocks = energyBlocksFor(energy)

    expect(blocks).toHaveLength(10)
    expect(blocks.filter((block) => block === "green")).toHaveLength(
      expected.green,
    )
    expect(blocks.filter((block) => block === "coral")).toHaveLength(
      expected.coral,
    )
    expect(blocks.filter((block) => block === "empty")).toHaveLength(
      expected.empty,
    )
    expect(blocks.slice(0, expected.green + expected.coral)).not.toContain(
      "empty",
    )
  })

  it("places the ten blocks inside a wider outer energy frame", () => {
    const blocksWidth =
      ENERGY_HUD_LAYOUT.blockWidth * 10 + ENERGY_HUD_LAYOUT.blockGap * 9

    expect(ENERGY_HUD_LAYOUT.frameWidth).toBeGreaterThan(blocksWidth)
    expect(ENERGY_HUD_LAYOUT.frameHeight).toBeGreaterThan(
      ENERGY_HUD_LAYOUT.blockHeight,
    )
  })

  it.each([
    [1, "TRIMESTRE 1"],
    [2, "TRIMESTRE 2"],
    [3, "TRIMESTRE 3"],
  ] as const)("labels term %s beside the energy marker", (term, label) => {
    expect(termLabelFor(term)).toBe(label)
  })
})
