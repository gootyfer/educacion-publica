import { describe, expect, it } from "vitest"

import { gapScaleFor } from "../../src/game/obstacles"

describe("obstacle cadence curve", () => {
  it("starts unchanged and reaches each course milestone over sixty seconds", () => {
    expect(gapScaleFor(1, -1, 0.5)).toBe(1)
    expect(gapScaleFor(1, 60_000, 0.5)).toBeCloseTo(0.85)
    expect(gapScaleFor(2, 0, 0.5)).toBeCloseTo(0.85)
    expect(gapScaleFor(2, 60_000, 0.5)).toBeCloseTo(0.7)
    expect(gapScaleFor(3, 0, 0.5)).toBeCloseTo(0.7)
    expect(gapScaleFor(3, 60_000, 0.5)).toBe(0.5)
    expect(gapScaleFor(3, 120_000, 0.5)).toBe(0.5)
  })

  it.each([0.5, 0.68, 0.8])(
    "stays monotonic across and within terms for final scale %s",
    (finalScale) => {
      const milestones = [
        gapScaleFor(1, 0, finalScale),
        gapScaleFor(1, 30_000, finalScale),
        gapScaleFor(1, 60_000, finalScale),
        gapScaleFor(2, 0, finalScale),
        gapScaleFor(2, 30_000, finalScale),
        gapScaleFor(2, 60_000, finalScale),
        gapScaleFor(3, 0, finalScale),
        gapScaleFor(3, 30_000, finalScale),
        gapScaleFor(3, 60_000, finalScale),
      ]

      for (let index = 1; index < milestones.length; index += 1) {
        expect(milestones[index]).toBeLessThanOrEqual(
          milestones[index - 1] ?? Number.POSITIVE_INFINITY,
        )
      }
      expect(milestones.at(-1)).toBeCloseTo(finalScale)
    },
  )
})
