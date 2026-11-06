export type GamePhase = "ready" | "running" | "finished"

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

export interface GameState {
  phase: GamePhase
  elapsedMs: number
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
