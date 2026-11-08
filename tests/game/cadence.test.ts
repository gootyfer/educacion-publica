import { describe, expect, it } from "vitest"

import {
  chooseObstacleGap,
  gapScaleFor,
  SeededRandom,
} from "../../src/game/obstacles"
import type { GapBand } from "../../src/game/types"

class FixedRolls {
  constructor(private readonly rolls: number[]) {}

  next(): number {
    const value = this.rolls.shift()
    if (value === undefined) throw new Error("No quedan tiradas")
    return value
  }
}

function choose(
  bandRoll: number,
  distanceRoll: number,
  lastGapBand: GapBand | null = null,
) {
  return chooseObstacleGap(
    { term: 1, elapsedMs: 0, lastGapBand },
    new FixedRolls([bandRoll, distanceRoll]),
  )
}

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

  it("maps the two random rolls into contrasted gap bands", () => {
    expect(choose(0, 0)).toEqual({ band: "short", gap: 220 })
    expect(choose(0.2999, 1)).toEqual({ band: "short", gap: 280 })
    expect(choose(0.3, 0.5)).toEqual({ band: "medium", gap: 340 })
    expect(choose(0.7499, 0)).toEqual({ band: "medium", gap: 300 })
    expect(choose(0.75, 1)).toEqual({ band: "long", gap: 500 })
  })

  it("promotes a repeated short band to medium without another roll", () => {
    expect(choose(0, 0.5, "short")).toEqual({
      band: "medium",
      gap: 340,
    })
  })

  it("consumes exactly two seeded rolls per choice", () => {
    const actual = new SeededRandom(42)
    const expected = new SeededRandom(42)
    expected.next()
    expected.next()

    chooseObstacleGap(
      { term: 1, elapsedMs: 0, lastGapBand: null },
      actual,
    )

    expect(actual.seed).toBe(expected.seed)
  })

  it("never returns two consecutive short bands", () => {
    const random = new SeededRandom(42)
    const bands: GapBand[] = []
    let lastGapBand: GapBand | null = null

    for (let index = 0; index < 100; index += 1) {
      const result = chooseObstacleGap(
        { term: 3, elapsedMs: 60_000, lastGapBand },
        random,
      )
      bands.push(result.band)
      lastGapBand = result.band
    }

    expect(
      bands.some((band, index) => band === "short" && bands[index - 1] === "short"),
    ).toBe(false)
  })

  it("uses the calibrated milestones and effective final frequency", () => {
    expect(gapScaleFor(1, 0)).toBe(1)
    expect(gapScaleFor(1, 60_000)).toBeCloseTo(0.985)
    expect(gapScaleFor(2, 0)).toBeCloseTo(0.985)
    expect(gapScaleFor(2, 60_000)).toBeCloseTo(0.97)
    expect(gapScaleFor(3, 0)).toBeCloseTo(0.97)
    expect(gapScaleFor(3, 60_000)).toBe(0.95)
    expect(1 / gapScaleFor(3, 60_000)).toBeCloseTo(1.0526, 4)
  })
})
