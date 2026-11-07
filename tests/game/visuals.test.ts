import { describe, expect, it } from "vitest"

import {
  OBSTACLE_ART,
  obstacleArtFor,
} from "../../src/game/art/obstacles"
import { sceneVisualFor } from "../../src/game/art/scene"
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
  it("uses distinct term labels and a non-decreasing green-ribbon presence", () => {
    const visuals = ([1, 2, 3] as const).map(sceneVisualFor)

    expect(new Set(visuals.map(({ label }) => label)).size).toBe(3)
    expect(visuals.map(({ ribbonCount }) => ribbonCount)).toEqual([1, 2, 3])
    expect(visuals.every(({ textColor }) => textColor === "#17352f")).toBe(
      true,
    )
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
