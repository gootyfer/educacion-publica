import { describe, expect, it } from "vitest"

import {
  companionAppearanceOrder,
  companionFormation,
} from "../../src/phaser/entities/CompanionGroup"

describe("companion formation", () => {
  it("reveals the back row before the middle and front rows", () => {
    const slots = companionFormation(10)

    expect(slots).toHaveLength(10)
    expect(slots.slice(0, 4).map(({ y }) => y)).toEqual([-16, -16, -16, -16])
    expect(slots.slice(4, 7).map(({ y }) => y)).toEqual([-8, -8, -8])
    expect(slots.slice(7).map(({ y }) => y)).toEqual([0, 0, 0])
    expect(companionFormation(5)).toEqual(slots.slice(0, 5))
  })

  it("keeps three low perspective rows with modest horizontal spacing", () => {
    const slots = companionFormation(10)
    const rows = [...new Set(slots.map(({ y }) => y))]

    expect(rows).toEqual([-16, -8, 0])
    for (const row of rows) {
      const xs = slots.filter(({ y }) => y === row).map(({ x }) => x)
      const gaps = xs
        .slice(1)
        .map((x, index) => Math.abs(x - xs[index]!))
      expect(gaps.every((gap) => gap >= 36)).toBe(true)
    }
    expect(slots.slice(0, 4).every(({ scale }) => scale === 0.76)).toBe(true)
    expect(slots.slice(4, 7).every(({ scale }) => scale === 0.82)).toBe(true)
    expect(slots.slice(7).every(({ scale }) => scale === 0.88)).toBe(true)
  })

  it("keeps the baby early and reserves a roomy non-final slot for the wheelchair", () => {
    for (const seed of [1, 2_026, 8_675_309]) {
      const order = companionAppearanceOrder(seed)

      expect(order).toHaveLength(10)
      expect(order[1]).toBe(9)
      expect(order[7]).toBe(10)
      expect([...order].sort((a, b) => a - b)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
    }
  })

  it("keeps a layout stable for one seed and varies regular students between runs", () => {
    expect(companionAppearanceOrder(2_026)).toEqual(
      companionAppearanceOrder(2_026),
    )
    expect(companionAppearanceOrder(2_026)).not.toEqual(
      companionAppearanceOrder(2_027),
    )
  })

  it("keeps perspective depth and a stable formation for partial groups", () => {
    const slots = companionFormation(10)

    expect(slots.slice(0, 4).every(({ depth }) => depth === 10)).toBe(true)
    expect(slots.slice(4, 7).every(({ depth }) => depth === 20)).toBe(true)
    expect(slots.slice(7).every(({ depth }) => depth === 30)).toBe(true)
    expect(companionFormation(5)).toEqual(companionFormation(5))
  })
})
