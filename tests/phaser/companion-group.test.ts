import { describe, expect, it } from "vitest"

import {
  companionAppearanceOrder,
  companionFormation,
} from "../../src/phaser/entities/CompanionGroup"

describe("companion formation", () => {
  it("reveals the farthest followers first without moving existing students", () => {
    const slots = companionFormation(10)

    expect(slots).toHaveLength(10)
    expect(slots.every(({ y }) => y === 0)).toBe(true)
    expect(slots.map(({ x }) => x)).toEqual([
      -176, -161, -146, -131, -116, -101, -86, -71, -56, -41,
    ])
    expect(companionFormation(5)).toEqual(slots.slice(0, 5))
  })

  it("keeps every pair of feet on the floor and spaces the group horizontally", () => {
    const slots = companionFormation(10)
    const gaps = slots.slice(1).map((slot, index) => slot.x - slots[index]!.x)

    expect(slots.every(({ y }) => y === 0)).toBe(true)
    expect(gaps.every((gap) => gap >= 15)).toBe(true)
    expect(slots.every(({ scale }) => scale === 0.64)).toBe(true)
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

  it("keeps a stable formation for partial groups", () => {
    const slots = companionFormation(10)

    expect(slots.every(({ depth }) => depth === 20)).toBe(true)
    expect(companionFormation(5)).toEqual(companionFormation(5))
  })
})
