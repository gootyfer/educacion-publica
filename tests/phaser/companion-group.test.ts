import { describe, expect, it } from "vitest"

import {
  COMPANION_APPEARANCE_ORDER,
  companionFormation,
} from "../../src/phaser/entities/CompanionGroup"

describe("companion formation", () => {
  it("spreads ten companions across three grounded perspective rows", () => {
    const slots = companionFormation(10)
    const rows = [...new Set(slots.map(({ y }) => y))].sort((a, b) => a - b)

    expect(slots).toHaveLength(10)
    expect(rows).toEqual([-20, -10, 0])
    expect(rows[1]! - rows[0]!).toBeGreaterThanOrEqual(8)
    expect(rows[2]! - rows[1]!).toBeLessThanOrEqual(14)
    for (const row of rows) {
      const xs = slots
        .filter((slot) => slot.y === row)
        .map(({ x }) => x)
        .sort((a, b) => a - b)
      expect(xs[1]! - xs[0]!).toBeGreaterThan(23)
    }
  })

  it("puts the baby in the first row and wheelchair student before the end", () => {
    expect(COMPANION_APPEARANCE_ORDER).toHaveLength(10)
    expect(COMPANION_APPEARANCE_ORDER.indexOf(9)).toBeLessThan(3)
    expect(COMPANION_APPEARANCE_ORDER.indexOf(10)).toBe(5)
    expect(COMPANION_APPEARANCE_ORDER.at(-1)).not.toBe(10)
  })

  it("reduces scale and depth for rows farther from the foreground", () => {
    const slots = companionFormation(10)
    const scaleAt = (y: number) => slots.find((slot) => slot.y === y)!.scale
    const depthAt = (y: number) => slots.find((slot) => slot.y === y)!.depth

    expect(scaleAt(0)).toBeGreaterThan(scaleAt(-10))
    expect(scaleAt(-10)).toBeGreaterThan(scaleAt(-20))
    expect(depthAt(0)).toBeGreaterThan(depthAt(-10))
    expect(depthAt(-10)).toBeGreaterThan(depthAt(-20))
    expect(companionFormation(5)).toEqual(companionFormation(5))
  })
})
