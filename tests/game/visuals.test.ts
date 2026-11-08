import { describe, expect, it } from "vitest"

import {
  OBSTACLE_ART,
  obstacleArtFor,
} from "../../src/game/art/obstacles"
import {
  hiddenPupilCount,
  pupilBottomForRow,
  VISIBLE_PUPIL_COUNT,
} from "../../src/game/art/characters"
import {
  fenceLayoutFor,
  ribbonCountFor,
  sceneVisualFor,
} from "../../src/game/art/scene"
import { OBSTACLE_DIMENSIONS } from "../../src/game/obstacles"
import type { ObstacleVariant, Term } from "../../src/game/types"

const VARIANTS: readonly ObstacleVariant[] = [
  "paper-stack",
  "filing-cart",
  "cold-climate",
  "heat-climate",
  "leak",
  "wall",
]

describe("seasonal visual model", () => {
  it("keeps six representative pupils and makes their remainder equal the ratio", () => {
    expect(VISIBLE_PUPIL_COUNT).toBe(6)
    expect(hiddenPupilCount(20)).toBe(14)
    expect(hiddenPupilCount(24)).toBe(18)
    expect(hiddenPupilCount(6)).toBe(0)
  })

  it("moves both pupil rows with the teacher jump", () => {
    expect(pupilBottomForRow(0, -90)).toBe(pupilBottomForRow(0, 0) - 90)
    expect(pupilBottomForRow(1, -90)).toBe(pupilBottomForRow(1, 0) - 90)
  })

  it("uses distinct term labels and the approved text color", () => {
    const visuals = ([1, 2, 3] as const).map(sceneVisualFor)

    expect(new Set(visuals.map(({ label }) => label)).size).toBe(3)
    expect(visuals.every(({ textColor }) => textColor === "#17352f")).toBe(
      true,
    )
  })

  it("adds two ribbons during every term without dropping between terms", () => {
    expect([0, 20_000, 40_000].map((ms) => ribbonCountFor(1, ms))).toEqual([
      1, 2, 3,
    ])
    expect([0, 20_000, 40_000].map((ms) => ribbonCountFor(2, ms))).toEqual([
      3, 4, 5,
    ])
    expect([0, 20_000, 40_000].map((ms) => ribbonCountFor(3, ms))).toEqual([
      5, 6, 7,
    ])
    expect(ribbonCountFor(2, 0)).toBeGreaterThanOrEqual(
      ribbonCountFor(1, 40_000),
    )
    expect(ribbonCountFor(3, 0)).toBeGreaterThanOrEqual(
      ribbonCountFor(2, 40_000),
    )
  })

  it.each([0, 17, 149])(
    "anchors every ribbon to a fence post at distance %s",
    (distance) => {
      const layout = fenceLayoutFor(3, 40_000, distance)

      expect(layout.ribbonXs.length).toBeGreaterThanOrEqual(7)
      expect(layout.ribbonXs.length).toBeLessThanOrEqual(8)
      expect(
        layout.ribbonXs.every((ribbonX) => layout.postXs.includes(ribbonX)),
      ).toBe(true)
    },
  )

  it("keeps a ribbon on the same moving post between adjacent frames", () => {
    const before = fenceLayoutFor(1, 0, 0)
    const after = fenceLayoutFor(1, 0, 2.88)

    expect(before.ribbonXs).toContain(0)
    expect(after.ribbonXs[0]).toBeCloseTo(-0.12096, 5)
  })

  it("keeps ribbon motion continuous across the former parallax wrap", () => {
    const before = fenceLayoutFor(1, 0, 1_249)
    const after = fenceLayoutFor(1, 0, 1_251)

    expect(after.ribbonXs).toHaveLength(before.ribbonXs.length)
    after.ribbonXs.forEach((x, index) => {
      expect(x).toBeCloseTo((before.ribbonXs[index] ?? 0) - 0.084, 5)
    })
  })

  it.each([1, 2, 3] as const)(
    "returns a complete high-contrast palette for term %s",
    (term: Term) => {
      expect(sceneVisualFor(term)).toMatchObject({
        term,
        wallColor: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        windowColor: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        floorColor: expect.stringMatching(/^#[0-9a-f]{6}$/i),
        textColor: "#17352f",
      })
    },
  )
})

describe("obstacle art descriptors", () => {
  it("covers all six silhouettes with collision-matched dimensions", () => {
    expect(Object.keys(OBSTACLE_ART).sort()).toEqual([...VARIANTS].sort())

    for (const variant of VARIANTS) {
      const art = obstacleArtFor(variant)
      expect(art.label.length).toBeGreaterThan(0)
      expect({ width: art.width, height: art.height }).toEqual(
        OBSTACLE_DIMENSIONS[variant],
      )
    }
  })
})
