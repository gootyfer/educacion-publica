import { describe, expect, it } from "vitest"

import {
  COURSE_GEOMETRY,
  SeededRandom,
  TALL_OBSTACLES,
  difficultyPressure,
  nextObstacle,
  worldSpeedFor,
  type GapBand,
} from "../../src/course/cadence"
import type { ObstacleKind, Term } from "../../src/course/types"

describe("engine-independent obstacle cadence", () => {
  it("keeps pressure bounded and speed monotonic through every term", () => {
    for (const term of [1, 2, 3] as const) {
      const pressures = [0, 10_000, 30_000, 60_000, 90_000].map((elapsed) =>
        difficultyPressure(term, elapsed, 60_000),
      )
      const speeds = [0, 10_000, 30_000, 60_000, 90_000].map((elapsed) =>
        worldSpeedFor(term, elapsed, 60_000),
      )
      expect(pressures.every((value) => value >= 0 && value <= 1)).toBe(true)
      expect(speeds.every((value, index) => index === 0 || value >= speeds[index - 1]!)).toBe(true)
    }
  })

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
              elapsedMs: index * 100,
              targetTermDurationMs: 60_000,
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
            elapsedMs: 55_000,
            targetTermDurationMs: 60_000,
            previousKind,
            previousGapBand: "short",
            shortStreak: 1,
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
      elapsedMs: 25_000,
      targetTermDurationMs: 60_000,
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

  it("uses all gap bands without consecutive shorts or unsafe tall pairs", () => {
    const seen = new Set<GapBand>()
    const random = new SeededRandom(20261121)
    let previousKind: ObstacleKind | undefined
    let previousGapBand: GapBand | undefined
    let shortStreak = 0

    for (let index = 0; index < 5_000; index += 1) {
      const decision = nextObstacle(
        {
          term: 3,
          energy: 50,
          worldSpeed: worldSpeedFor(3, 55_000, 60_000),
          jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
          obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
          elapsedMs: 55_000,
          targetTermDurationMs: 60_000,
          previousKind,
          previousGapBand,
          shortStreak,
        },
        random,
      )
      seen.add(decision.gapBand)
      if (previousGapBand === "short") expect(decision.gapBand).not.toBe("short")
      if (
        previousKind &&
        TALL_OBSTACLES.includes(previousKind) &&
        TALL_OBSTACLES.includes(decision.kind)
      ) {
        expect(decision.gapBand).not.toBe("short")
      }
      previousKind = decision.kind
      previousGapBand = decision.gapBand
      shortStreak = decision.gapBand === "short" ? shortStreak + 1 : 0
    }

    expect([...seen].sort()).toEqual(["long", "medium", "short"])
  })

  it("raises final third-term frequency to 1.7–2.0 times the initial rate", () => {
    const averageFrequency = (term: Term, elapsedMs: number) => {
      const random = new SeededRandom(term * 100_000 + elapsedMs)
      const speed = worldSpeedFor(term, elapsedMs, 60_000)
      const gaps = Array.from({ length: 5_000 }, () =>
        nextObstacle(
          {
            term,
            energy: 100,
            worldSpeed: speed,
            jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
            obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
            elapsedMs,
            targetTermDurationMs: 60_000,
          },
          random,
        ).gap,
      )
      return speed / (gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length)
    }

    const ratio = averageFrequency(3, 60_000) / averageFrequency(1, 0)
    expect(ratio).toBeGreaterThanOrEqual(1.7)
    expect(ratio).toBeLessThanOrEqual(2)
  })
})
