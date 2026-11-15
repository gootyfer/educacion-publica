import { describe, expect, it } from "vitest"

import {
  COURSE_GEOMETRY,
  SeededRandom,
  TALL_OBSTACLES,
  nextObstacle,
} from "../../src/course/cadence"
import type { ObstacleKind, Term } from "../../src/course/types"

describe("engine-independent obstacle cadence", () => {
  it("keeps five hundred deterministic decisions traversable in every term and energy band", () => {
    for (const term of [1, 2, 3] as const) {
      for (const energy of [100, 50, 10]) {
        const random = new SeededRandom(term * 10_000 + energy)
        let previousKind: ObstacleKind | undefined

        for (let index = 0; index < 500; index += 1) {
          const worldSpeed = 190 + term * 35
          const jumpAirtimeMs = 520 + energy * 2.2
          const obstacleWidth = 64
          const decision = nextObstacle(
            {
              term,
              energy,
              worldSpeed,
              jumpAirtimeMs,
              obstacleWidth,
              previousKind,
            },
            random,
          )
          const minimumGap =
            worldSpeed * (jumpAirtimeMs / 1000) +
            obstacleWidth +
            COURSE_GEOMETRY.readabilityPadding

          expect(decision.gap).toBeGreaterThanOrEqual(minimumGap)
          expect(["slow", "medium", "fast"]).toContain(decision.speedBand)
          previousKind = decision.kind
        }
      }
    }
  })

  it("does not repeat the same tall obstacle in unsafe succession", () => {
    for (const term of [1, 2, 3] as const) {
      for (const previousKind of TALL_OBSTACLES) {
        const decision = nextObstacle(
          {
            term: term as Term,
            energy: 30,
            worldSpeed: 280,
            jumpAirtimeMs: 600,
            obstacleWidth: 72,
            previousKind,
          },
          new SeededRandom(42),
        )

        expect(decision.kind).not.toBe(previousKind)
      }
    }
  })

  it("repeats the same decision stream from the same seed", () => {
    const request = {
      term: 2 as const,
      energy: 60,
      worldSpeed: 250,
      jumpAirtimeMs: 680,
      obstacleWidth: 64,
    }
    const first = new SeededRandom(2026)
    const second = new SeededRandom(2026)

    const firstStream = Array.from({ length: 12 }, () =>
      nextObstacle(request, first),
    )
    const secondStream = Array.from({ length: 12 }, () =>
      nextObstacle(request, second),
    )

    expect(firstStream).toEqual(secondStream)
  })
})
