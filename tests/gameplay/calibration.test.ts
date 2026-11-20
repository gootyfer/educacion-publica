import { describe, expect, it } from "vitest"

import { DEFAULT_CALIBRATION } from "../../src/course/calibration"
import {
  COURSE_GEOMETRY,
  SeededRandom,
  difficultyPressure,
  eligibleObstacles,
  nextObstacle,
  worldSpeedFor,
} from "../../src/course/cadence"
import { advanceCourse, createCourseState } from "../../src/course/progression"
import type { ObstacleKind, Term } from "../../src/course/types"
import { panoramaTextureFor } from "../../src/phaser/backgrounds/PanoramaModel"

describe("production course calibration", () => {
  it("maps the three terms to their approved seasonal Madrid backgrounds", () => {
    expect([1, 2, 3].map((term) => panoramaTextureFor(term as Term))).toEqual([
      "panoramaTerm1",
      "panoramaTerm2",
      "panoramaTerm3",
    ])
  })

  it("uses cold and leak obstacles in winter and heat in June", () => {
    expect(eligibleObstacles(2)).toEqual(
      expect.arrayContaining(["cold-climate", "leak"]),
    )
    expect(eligibleObstacles(3)).toContain("heat-climate")
  })

  it("shares one pressure curve between world speed and cadence", () => {
    expect(difficultyPressure(1, 0, 60_000)).toBe(0)
    expect(difficultyPressure(3, 60_000, 60_000)).toBe(1)
    expect(worldSpeedFor(3, 60_000, 60_000)).toBeGreaterThan(
      worldSpeedFor(1, 0, 60_000),
    )
  })

  it("can produce all six obstacle variants across deterministic seeds", () => {
    const seen = new Set<ObstacleKind>()
    for (const term of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 40; seed += 1) {
        seen.add(
          nextObstacle(
            {
              term,
              energy: 60,
              worldSpeed: 220,
              jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
              obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
            },
            new SeededRandom(seed),
          ).kind,
        )
      }
    }
    expect([...seen].sort()).toEqual(
      [
        "cold-climate",
        "filing-cart",
        "heat-climate",
        "leak",
        "paper-stack",
        "wall",
      ].sort(),
    )
  })

  it("grows the symbolic ratio to nine grounded companions", () => {
    let state = createCourseState()
    const counts = [state.companionCount]

    for (let frame = 0; frame < 4_000 && state.companionCount < 9; frame += 1) {
      state = advanceCourse(state, {}, DEFAULT_CALIBRATION.maxDeltaMs).state
      counts.push(state.companionCount)
    }

    expect(counts[0]).toBe(2)
    expect(Math.max(...counts)).toBe(9)
    expect(counts.every((count) => count >= 2 && count <= 9)).toBe(true)
  })

  it("keeps every generated gap traversable at minimum energy", () => {
    for (const term of [1, 2, 3] as readonly Term[]) {
      const random = new SeededRandom(term * 909)
      for (let index = 0; index < 250; index += 1) {
        const decision = nextObstacle(
          {
            term,
            energy: 1,
            worldSpeed: 270,
            jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
            obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
          },
          random,
        )
        expect(decision.gap).toBeGreaterThanOrEqual(
          270 * (COURSE_GEOMETRY.jumpAirtimeMs / 1000) +
            COURSE_GEOMETRY.obstacleWidth +
            COURSE_GEOMETRY.readabilityPadding,
        )
      }
    }
  })
})
