import { describe, expect, it } from "vitest"

import {
  COMPANION_DEFINITIONS,
  GAME_ASSETS,
  OBSTACLE_FRAMES,
  TEACHER_ANIMATIONS,
} from "../../src/phaser/assets"

describe("production game asset manifest", () => {
  it("declares every required production asset below the game base path", () => {
    expect(Object.keys(GAME_ASSETS)).toEqual([
      "teacher",
      "companions",
      "obstacles",
      "term1",
      "term2",
      "term3",
      "energy",
      "panels",
    ])

    for (const asset of Object.values(GAME_ASSETS)) {
      expect(asset.url).toMatch(/^\/game\//)
    }
  })

  it("keeps the approved six-frame teacher run", () => {
    expect(TEACHER_ANIMATIONS.run).toEqual([
      "teacher-run-0",
      "teacher-run-1",
      "teacher-run-2",
      "teacher-run-3",
      "teacher-run-4",
      "teacher-run-5",
    ])
    expect(TEACHER_ANIMATIONS.jump.length).toBeGreaterThan(0)
    expect(TEACHER_ANIMATIONS.hit.length).toBeGreaterThan(0)
    expect(TEACHER_ANIMATIONS.tired.length).toBeGreaterThan(0)
  })

  it("defines nine grounded companion identities without jump states", () => {
    expect(COMPANION_DEFINITIONS).toHaveLength(9)
    expect(new Set(COMPANION_DEFINITIONS.map(({ id }) => id)).size).toBe(9)
    for (const companion of COMPANION_DEFINITIONS) {
      expect(companion.frames.length).toBeGreaterThan(1)
      expect(companion.frames.every((frame) => frame.includes("-run-"))).toBe(
        true,
      )
    }
  })

  it("names all six approved literal obstacles", () => {
    expect(OBSTACLE_FRAMES).toEqual([
      "paper-stack",
      "filing-cart",
      "cold-climate",
      "heat-climate",
      "leak",
      "wall",
    ])
  })
})
