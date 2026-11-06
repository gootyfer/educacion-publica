// Valores de equilibrio del juego. No representan estadísticas educativas.
export const GAME_CONFIG = {
  initialEnergy: 100,
  initialRatio: 20,
  ratioStep: 4,
  ratioIntervalMs: 15_000,
  baseDrainPerSecond: 0.5,
  extraDrainPerPupil: 0.025,
  gravity: 1600,
  maxJumpImpulse: -700,
  minJumpImpulse: -430,
  groundY: 0,
  maxStepMs: 50,
  collisionDamage: 14,
  invulnerabilityMs: 750,
} as const
