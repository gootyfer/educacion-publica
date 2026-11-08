export type Term = 1 | 2 | 3

export type GapBand = "short" | "medium" | "long"

export type GamePhase = "ready" | "running" | "between-terms" | "finished"

export type DamageKind = "paperwork" | "heat" | "infrastructure"

export type ObstacleKind = DamageKind

export type ObstacleVariant =
  | "paper-stack"
  | "filing-cart"
  | "cold-climate"
  | "heat-climate"
  | "leak"
  | "wall"

export interface Obstacle {
  id: number
  kind: ObstacleKind
  variant: ObstacleVariant
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
  introducedObstacleVariants: ObstacleVariant[]
  distanceTravelled: number
  distanceSinceLastSpawn: number
  nextObstacleGap: number
  lastGapBand: GapBand | null
  spawnCount: number
  randomSeed: number
}
