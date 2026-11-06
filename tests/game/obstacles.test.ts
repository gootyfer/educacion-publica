import { describe, expect, it } from "vitest"

import { GAME_CONFIG } from "../../src/game/config"
import { advanceGame, createGameState } from "../../src/game/mechanics"
import {
  MAX_OBSTACLE_HEIGHT,
  SeededRandom,
  intersectsPlayer,
  spawnObstacle,
} from "../../src/game/obstacles"
import type { GameState, Obstacle } from "../../src/game/types"

const NO_INPUT = { jumpPressed: false }

describe("obstacles", () => {
  it("does not spawn an obstacle during the opening grace period", () => {
    const state = {
      ...createGameState(),
      elapsedMs: 1_499,
      distanceSinceLastSpawn: 500,
      nextObstacleGap: 260,
    }

    expect(spawnObstacle(state, new SeededRandom(42))).toBeNull()
  })

  it("rotates systemic obstacle kinds and chooses fair gaps", () => {
    const random = new SeededRandom(42)
    const kinds = []

    for (let spawnCount = 0; spawnCount < 6; spawnCount += 1) {
      const state = {
        ...createGameState(),
        elapsedMs: 2_000,
        distanceSinceLastSpawn: 500,
        nextObstacleGap: 260,
        spawnCount,
      }
      const result = spawnObstacle(state, random)

      expect(result).not.toBeNull()
      expect(result?.nextGap).toBeGreaterThanOrEqual(260)
      expect(result?.nextGap).toBeLessThanOrEqual(420)
      kinds.push(result?.obstacle.kind)
    }

    expect(kinds).toEqual([
      "paperwork",
      "heat",
      "infrastructure",
      "paperwork",
      "heat",
      "infrastructure",
    ])
  })

  it("charges one hit and ignores the same overlap while invulnerable", () => {
    const obstacle: Obstacle = {
      id: 1,
      kind: "paperwork",
      x: GAME_CONFIG.playerX,
      width: 32,
      height: 38,
    }
    const initial = {
      ...createGameState(),
      phase: "running" as const,
      obstacles: [obstacle],
    }

    expect(intersectsPlayer(obstacle, initial)).toBe(true)

    const firstHit = advanceGame(initial, NO_INPUT, 0)
    const repeatedFrame = advanceGame(firstHit, NO_INPUT, 50)

    expect(firstHit.energy).toBe(100 - GAME_CONFIG.collisionDamage)
    expect(firstHit.hitsByKind.paperwork).toBe(1)
    expect(firstHit.invulnerabilityMs).toBe(GAME_CONFIG.invulnerabilityMs)
    expect(repeatedFrame.hitsByKind.paperwork).toBe(1)
    expect(repeatedFrame.energy).toBeCloseTo(
      firstHit.energy - GAME_CONFIG.baseDrainPerSecond * 0.05,
    )
  })

  it("keeps the tallest obstacle jumpable at ten percent energy", () => {
    let state: GameState = {
      ...createGameState(),
      phase: "running" as const,
      energy: 10,
    }
    let highestPoint = 0

    state = advanceGame(state, { jumpPressed: true }, 10)
    while (!state.grounded) {
      highestPoint = Math.max(highestPoint, -state.playerY)
      state = advanceGame(state, NO_INPUT, 10)
    }

    expect(MAX_OBSTACLE_HEIGHT).toBe(48)
    expect(highestPoint).toBeGreaterThan(MAX_OBSTACLE_HEIGHT)
  })

  it.each(["paperwork", "heat", "infrastructure"] as const)(
    "allows a complete low-energy crossing of %s",
    (kind) => {
      const canCross = Array.from({ length: 46 }, (_, index) => 110 + index * 4)
        .some((startingX) => {
          let state: GameState = {
            ...createGameState(),
            phase: "running",
            energy: 10,
            nextObstacleGap: Number.POSITIVE_INFINITY,
            obstacles: [
              {
                id: 1,
                kind,
                x: startingX,
                width: kind === "infrastructure" ? 42 : kind === "paperwork" ? 34 : 30,
                height: kind === "heat" ? 48 : kind === "infrastructure" ? 44 : 38,
              },
            ],
          }

          state = advanceGame(state, { jumpPressed: true }, 16)
          for (let frame = 0; frame < 100; frame += 1) {
            state = advanceGame(state, NO_INPUT, 16)
            if (state.hitsByKind[kind] > 0) return false
            const obstacle = state.obstacles[0]
            if (!obstacle || obstacle.x + obstacle.width < GAME_CONFIG.playerX) {
              return true
            }
          }
          return false
        })

      expect(canCross).toBe(true)
    },
  )
})
