import { GAME_CONFIG } from "../../../src/game/config"
import {
  advanceGame,
  createGameState,
} from "../../../src/game/mechanics"
import {
  availableObstaclesFor,
  chooseObstacleGap,
  damageKindForObstacle,
  OBSTACLE_DIMENSIONS,
  SeededRandom,
} from "../../../src/game/obstacles"
import type {
  GameInput,
  GameState,
  ObstacleVariant,
} from "../../../src/game/types"

export const CALIBRATION_CANDIDATES = [
  0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
] as const

const VARIANTS: readonly ObstacleVariant[] = [
  "paper-stack",
  "filing-cart",
  "cold-climate",
  "heat-climate",
  "leak",
  "wall",
]

const JUMP_THRESHOLD_X: Record<ObstacleVariant, number> = {
  "paper-stack": 165,
  "filing-cart": 175,
  "cold-climate": 180,
  "heat-climate": 178,
  leak: 160,
  wall: 178,
}

export interface SafetyScenario {
  variants: ObstacleVariant[]
  unscaledGaps: number[]
  scale: number
}

export function visibleJumpPolicy(state: GameState): GameInput {
  if (!state.grounded) return { jumpPressed: false }
  const nearest = state.obstacles
    .filter(
      (obstacle) =>
        obstacle.x <= GAME_CONFIG.worldWidth &&
        obstacle.x + obstacle.width > GAME_CONFIG.playerX,
    )
    .sort((left, right) => left.x - right.x)[0]
  if (!nearest) return { jumpPressed: false }
  return {
    jumpPressed: nearest.x <= JUMP_THRESHOLD_X[nearest.variant],
  }
}

export function sequenceIsSafe(scenario: SafetyScenario): boolean {
  const firstX = GAME_CONFIG.worldWidth + 12
  let x = firstX
  const obstacles = scenario.variants.map((variant, index) => {
    if (index > 0) {
      x += (scenario.unscaledGaps[index - 1] ?? 0) * scenario.scale
    }
    return {
      id: index + 1,
      kind: damageKindForObstacle(variant),
      variant,
      x,
      ...OBSTACLE_DIMENSIONS[variant],
    }
  })
  let state: GameState = {
    ...createGameState(),
    phase: "running",
    term: 3,
    elapsedMs: 60_000,
    energy: 10,
    ratio: 44,
    maxRatio: 44,
    obstacles,
    nextObstacleGap: Number.POSITIVE_INFINITY,
  }

  for (let frame = 0; frame < 12_000; frame += 1) {
    const next = advanceGame(state, visibleJumpPolicy(state), 16)
    if (totalHits(next) > 0) return false
    if (next.obstacles.length === 0) return true
    state = {
      ...next,
      phase: "running",
      energy: 10,
    }
  }
  return false
}

export function calibrateFinalGapScale(): number {
  const scenarios = calibrationScenarios()
  return (
    CALIBRATION_CANDIDATES.find((scale) =>
      scenarios.every((scenario) => sequenceIsSafe({ ...scenario, scale })),
    ) ?? 1
  )
}

function calibrationScenarios(): Omit<SafetyScenario, "scale">[] {
  const scenarios: Omit<SafetyScenario, "scale">[] = []
  for (const first of VARIANTS) {
    for (const second of VARIANTS) {
      for (const profile of Object.values(GAME_CONFIG.gapProfiles)) {
        scenarios.push(
          { variants: [first, second], unscaledGaps: [profile.min] },
          { variants: [first, second], unscaledGaps: [profile.max] },
        )
      }
    }
  }

  scenarios.push(
    {
      variants: ["paper-stack", "filing-cart", "heat-climate", "wall"],
      unscaledGaps: [223.5884, 300.293, 221.5242],
    },
    {
      variants: Array.from({ length: 9 }, (_, index) =>
        index % 2 === 0 ? "paper-stack" : "filing-cart",
      ),
      unscaledGaps: Array.from({ length: 8 }, (_, index) =>
        index % 2 === 0 ? 220 : 300,
      ),
    },
  )

  for (const seed of [42, 973, 2_026_1108]) {
    scenarios.push(seedScenario(seed, 60))
  }
  return scenarios
}

function seedScenario(
  seed: number,
  count: number,
): Omit<SafetyScenario, "scale"> {
  const random = new SeededRandom(seed)
  const state = {
    ...createGameState(),
    term: 3 as const,
    elapsedMs: 60_000,
  }
  const available = availableObstaclesFor(state)
  const variants: ObstacleVariant[] = []
  const unscaledGaps: number[] = []
  let lastGapBand = state.lastGapBand

  for (let index = 0; index < count; index += 1) {
    variants.push(available[index % available.length] ?? "paper-stack")
    if (index === count - 1) break
    const choice = chooseObstacleGap(
      { term: 1, elapsedMs: 0, lastGapBand },
      random,
    )
    unscaledGaps.push(choice.gap)
    lastGapBand = choice.band
  }

  return { variants, unscaledGaps }
}

function totalHits(state: GameState): number {
  return Object.values(state.hitsByKind).reduce(
    (total, hits) => total + hits,
    0,
  )
}
