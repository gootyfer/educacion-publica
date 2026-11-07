import { describe, expect, it } from "vitest"

import { GAME_CONFIG } from "../../src/game/config"
import {
  advanceGame,
  createGameState,
  worldSpeedFor,
} from "../../src/game/mechanics"
import {
  MAX_OBSTACLE_HEIGHT,
  SeededRandom,
  availableObstaclesFor,
  damageKindForObstacle,
  intersectsPlayer,
  spawnObstacle,
} from "../../src/game/obstacles"
import type {
  GameState,
  Obstacle,
  ObstacleVariant,
} from "../../src/game/types"

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

  it("rotates the three opening silhouettes and chooses fair gaps", () => {
    const random = new SeededRandom(42)
    const variants = []

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
      variants.push(result?.obstacle.variant)
    }

    expect(variants).toEqual([
      "paper-stack",
      "filing-cart",
      "cold-climate",
      "paper-stack",
      "filing-cart",
      "cold-climate",
    ])
  })

  it("uses seasonal pools and introduces the wall late in term one", () => {
    const term1Start = createGameState()
    const term1Late = { ...term1Start, elapsedMs: 30_000 }
    const term2 = { ...term1Start, term: 2 as const }
    const term3 = { ...term1Start, term: 3 as const }

    expect(availableObstaclesFor(term1Start)).toEqual([
      "paper-stack",
      "filing-cart",
      "cold-climate",
    ])
    expect(availableObstaclesFor(term1Late)).toContain("wall")
    expect(availableObstaclesFor(term2)).toContain("leak")
    expect(availableObstaclesFor(term3)).toContain("heat-climate")
    expect(availableObstaclesFor(term3)).not.toContain("cold-climate")
  })

  it("maps every silhouette to a systemic damage family", () => {
    expect(damageKindForObstacle("paper-stack")).toBe("paperwork")
    expect(damageKindForObstacle("filing-cart")).toBe("paperwork")
    expect(damageKindForObstacle("cold-climate")).toBe("heat")
    expect(damageKindForObstacle("heat-climate")).toBe("heat")
    expect(damageKindForObstacle("leak")).toBe("infrastructure")
    expect(damageKindForObstacle("wall")).toBe("infrastructure")
  })

  it("records a newly spawned silhouette only once", () => {
    const readyToSpawn = {
      ...createGameState(),
      phase: "running" as const,
      elapsedMs: 2_000,
      distanceSinceLastSpawn: 500,
      nextObstacleGap: 260,
    }

    const firstSpawn = advanceGame(readyToSpawn, NO_INPUT, 0)
    const repeatedVariant = advanceGame(
      {
        ...firstSpawn,
        distanceSinceLastSpawn: 500,
        nextObstacleGap: 260,
        spawnCount: 3,
      },
      NO_INPUT,
      0,
    )

    expect(firstSpawn.introducedObstacleVariants).toEqual(["paper-stack"])
    expect(repeatedVariant.introducedObstacleVariants).toEqual([
      "paper-stack",
    ])
  })

  it("charges one hit and ignores the same overlap while invulnerable", () => {
    const obstacle: Obstacle = {
      id: 1,
      kind: "paperwork",
      variant: "paper-stack",
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

  it.each([
    "paper-stack",
    "filing-cart",
    "cold-climate",
    "heat-climate",
    "leak",
    "wall",
  ] as const)(
    "allows a complete low-energy maximum-speed crossing of %s",
    (variant) => {
      const kind = damageKindForObstacle(variant)
      const canCross = Array.from({ length: 46 }, (_, index) => 110 + index * 4)
        .some((startingX) => {
          let state: GameState = {
            ...createGameState(),
            phase: "running",
            term: 3,
            elapsedMs: 120_000,
            energy: 10,
            nextObstacleGap: Number.POSITIVE_INFINITY,
            obstacles: [
              {
                id: 1,
                kind,
                variant,
                x: startingX,
                ...dimensionsFor(variant),
              },
            ],
          }

          expect(worldSpeedFor(state)).toBeCloseTo(
            GAME_CONFIG.obstacleSpeed * 1.18 * 1.3,
          )

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

function dimensionsFor(variant: ObstacleVariant) {
  if (variant === "paper-stack") return { width: 34, height: 38 }
  if (variant === "filing-cart") return { width: 44, height: 42 }
  if (variant === "cold-climate") return { width: 30, height: 48 }
  if (variant === "heat-climate") return { width: 34, height: 46 }
  if (variant === "leak") return { width: 38, height: 34 }
  return { width: 42, height: 44 }
}
