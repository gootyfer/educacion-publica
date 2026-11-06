import { GAME_CONFIG } from "./config"
import type { GameState, Obstacle, ObstacleKind } from "./types"

const OBSTACLE_KINDS: readonly ObstacleKind[] = [
  "paperwork",
  "heat",
  "infrastructure",
]

const OBSTACLE_DIMENSIONS: Record<
  ObstacleKind,
  { width: number; height: number }
> = {
  paperwork: { width: 34, height: 38 },
  heat: { width: 30, height: 48 },
  infrastructure: { width: 42, height: 44 },
}

export const MAX_OBSTACLE_HEIGHT = Math.max(
  ...Object.values(OBSTACLE_DIMENSIONS).map(({ height }) => height),
)

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

  const kind = OBSTACLE_KINDS[state.spawnCount % OBSTACLE_KINDS.length]
  if (!kind) {
    return null
  }

  const dimensions = OBSTACLE_DIMENSIONS[kind]
  const gapRange = GAME_CONFIG.obstacleGapMax - GAME_CONFIG.obstacleGapMin
  const nextGap = GAME_CONFIG.obstacleGapMin + random.next() * gapRange

  return {
    obstacle: {
      id: state.spawnCount + 1,
      kind,
      x: GAME_CONFIG.worldWidth + 12,
      width: dimensions.width,
      height: dimensions.height,
    },
    nextGap,
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
