export type GamePhase = "ready" | "running" | "finished"

export type DamageKind = "paperwork" | "heat" | "infrastructure"

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
}
