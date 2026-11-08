import { describe, expect, it } from "vitest"

import { GAME_CONFIG } from "../../src/game/config"
import {
  advanceGame,
  createGameState,
  worldSpeedFor,
} from "../../src/game/mechanics"
import type { Term } from "../../src/game/types"
import {
  calibrateFinalGapScale,
  visibleJumpPolicy,
} from "./helpers/cadenceSafety"

describe("obstacle cadence safety calibration", () => {
  it("uses the lowest cadence scale that passes every safety scenario", () => {
    expect(calibrateFinalGapScale()).toBe(GAME_CONFIG.finalSafeGapScale)
  })

  it("keeps the opening familiar and reaches the calibrated final frequency", () => {
    const openingV4 = productionSpawnCount(1, 0, 10_000)
    const openingV3 = referenceSpawnCount(1, 0, 10_000)
    expect(Math.abs(openingV4 - openingV3)).toBeLessThanOrEqual(1)

    const finalV4 = productionSpawnCount(3, 60_000, 60_000)
    const finalV3 = referenceSpawnCount(3, 60_000, 60_000)
    expect(finalV4 / finalV3).toBeCloseTo(
      1 / GAME_CONFIG.finalSafeGapScale,
      1,
    )
  })
})

function productionSpawnCount(
  term: Term,
  startingElapsedMs: number,
  durationMs: number,
) {
  let state = {
    ...createGameState(),
    phase: "running" as const,
    term,
    elapsedMs: startingElapsedMs,
    energy: 100,
  }
  for (let elapsed = 0; elapsed < durationMs; elapsed += 16) {
    const next = advanceGame(state, visibleJumpPolicy(state), 16)
    state = { ...next, phase: "running" as const, energy: 100 }
  }
  return state.spawnCount
}

function referenceSpawnCount(
  term: Term,
  startingElapsedMs: number,
  durationMs: number,
) {
  let elapsedMs = startingElapsedMs
  let distanceSinceLastSpawn = 0
  let nextGap = 300
  let count = 0

  for (let elapsed = 0; elapsed < durationMs; elapsed += 16) {
    distanceSinceLastSpawn += worldSpeedFor({ term, elapsedMs }) * 0.016
    elapsedMs += 16
    if (distanceSinceLastSpawn < nextGap) continue
    count += 1
    distanceSinceLastSpawn = 0
    nextGap = 340
  }
  return count
}
