import { GAME_CONFIG } from "./config"
import type {
  DamageKind,
  GapBand,
  GameState,
  Obstacle,
  ObstacleVariant,
  Term,
} from "./types"

export const OBSTACLE_DIMENSIONS: Record<
  ObstacleVariant,
  { width: number; height: number }
> = {
  "paper-stack": { width: 34, height: 38 },
  "filing-cart": { width: 44, height: 42 },
  "cold-climate": { width: 30, height: 48 },
  "heat-climate": { width: 34, height: 46 },
  leak: { width: 38, height: 34 },
  wall: { width: 42, height: 44 },
}

export const MAX_OBSTACLE_HEIGHT = Math.max(
  ...Object.values(OBSTACLE_DIMENSIONS).map(({ height }) => height),
)

export function gapScaleFor(
  term: Term,
  elapsedMs: number,
  finalSafeScale: number = GAME_CONFIG.finalSafeGapScale,
): number {
  const termProgress = GAME_CONFIG.gapProgressByTerm[term]
  const withinTerm = Math.min(
    1,
    Math.max(0, elapsedMs) / GAME_CONFIG.speedRampDurationMs,
  )
  const courseProgress =
    termProgress.start +
    (termProgress.end - termProgress.start) * withinTerm
  return 1 - courseProgress * (1 - finalSafeScale)
}

export class SeededRandom {
  #seed: number

  constructor(seed: number) {
    this.#seed = seed >>> 0
  }

  get seed(): number {
    return this.#seed
  }

  next(): number {
    this.#seed = (Math.imul(this.#seed, 1_664_525) + 1_013_904_223) >>> 0
    return this.#seed / 4_294_967_296
  }
}

export interface SpawnResult {
  obstacle: Obstacle
  nextGap: number
  nextGapBand: GapBand
}

interface RandomSource {
  next(): number
}

export function chooseObstacleGap(
  state: Pick<GameState, "term" | "elapsedMs" | "lastGapBand">,
  random: RandomSource,
): { gap: number; band: GapBand } {
  const bandRoll = random.next()
  const distanceRoll = random.next()
  let band: GapBand =
    bandRoll < 0.3 ? "short" : bandRoll < 0.75 ? "medium" : "long"
  if (band === "short" && state.lastGapBand === "short") band = "medium"

  const profile = GAME_CONFIG.gapProfiles[band]
  const withinProfile = Math.min(1, Math.max(0, distanceRoll))
  const unscaledGap =
    profile.min + (profile.max - profile.min) * withinProfile
  return {
    band,
    gap: unscaledGap * gapScaleFor(state.term, state.elapsedMs),
  }
}

export function damageKindForObstacle(
  variant: ObstacleVariant,
): DamageKind {
  if (variant === "paper-stack" || variant === "filing-cart") {
    return "paperwork"
  }
  if (variant === "cold-climate" || variant === "heat-climate") {
    return "heat"
  }
  return "infrastructure"
}

export function availableObstaclesFor(
  state: Pick<GameState, "term" | "elapsedMs">,
): readonly ObstacleVariant[] {
  if (state.term === 1) {
    const opening: ObstacleVariant[] = [
      "paper-stack",
      "filing-cart",
      "cold-climate",
    ]
    return state.elapsedMs >= 30_000 ? [...opening, "wall"] : opening
  }

  if (state.term === 2) {
    return [
      "paper-stack",
      "filing-cart",
      "cold-climate",
      "wall",
      "leak",
    ]
  }

  return [
    "paper-stack",
    "filing-cart",
    "heat-climate",
    "wall",
    "leak",
  ]
}

export function spawnObstacle(
  state: GameState,
  random: SeededRandom,
): SpawnResult | null {
  if (
    state.elapsedMs < GAME_CONFIG.spawnGraceMs ||
    state.distanceSinceLastSpawn < state.nextObstacleGap
  ) {
    return null
  }

  const available = availableObstaclesFor(state)
  const variant = available[state.spawnCount % available.length]
  if (!variant) {
    return null
  }

  const dimensions = OBSTACLE_DIMENSIONS[variant]
  const nextGap = chooseObstacleGap(state, random)

  return {
    obstacle: {
      id: state.spawnCount + 1,
      kind: damageKindForObstacle(variant),
      variant,
      x: GAME_CONFIG.worldWidth + 12,
      width: dimensions.width,
      height: dimensions.height,
    },
    nextGap: nextGap.gap,
    nextGapBand: nextGap.band,
  }
}

export function intersectsPlayer(
  obstacle: Obstacle,
  state: GameState,
): boolean {
  const playerLeft = GAME_CONFIG.playerX
  const playerRight = playerLeft + GAME_CONFIG.playerWidth
  const playerBottom = state.playerY
  const playerTop = playerBottom - GAME_CONFIG.playerHeight
  const obstacleLeft = obstacle.x
  const obstacleRight = obstacle.x + obstacle.width
  const obstacleTop = -obstacle.height

  return (
    playerRight > obstacleLeft &&
    playerLeft < obstacleRight &&
    playerBottom > obstacleTop &&
    playerTop < 0
  )
}
