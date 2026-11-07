export type Term = 1 | 2 | 3

export type GamePhase = "ready" | "running" | "between-terms" | "finished"

export type DamageKind = "paperwork" | "heat" | "infrastructure"

export type ObstacleKind = DamageKind

export interface Obstacle {
  id: number
  kind: ObstacleKind
  x: number
  width: number
  height: number
}

export interface GameInput {
  jumpPressed: boolean
}

export interface TermResult {
  term: Term
  durationMs: number
  distanceTravelled: number
  maxRatio: number
  hitsByKind: Record<DamageKind, number>
}

export interface GameState {
  phase: GamePhase
  term: Term
  elapsedMs: number
  courseElapsedMs: number
  completedTerms: TermResult[]
  energy: number
  ratio: number
  maxRatio: number
  playerY: number
  playerVelocityY: number
  grounded: boolean
  invulnerabilityMs: number
  hitsByKind: Record<DamageKind, number>
  obstacles: Obstacle[]
  distanceTravelled: number
  distanceSinceLastSpawn: number
  nextObstacleGap: number
  spawnCount: number
  randomSeed: number
}
