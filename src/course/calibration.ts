import type { Term } from "./types"

export interface CalibrationProfile {
  readonly initialEnergy: number
  readonly maxDeltaMs: number
  readonly impactDamage: number
  readonly invulnerabilityMs: number
  readonly ratioIntervalMs: number
  readonly ratioStep: number
  readonly maxRatio: number
  readonly companionBaselineRatio: number
  readonly companionRatioStep: number
  readonly energyDrainPerSecond: Readonly<Record<Term, number>>
  readonly initialRatios: Readonly<Record<Term, number>>
  readonly targetTermDurationMs: Readonly<Record<Term, number>>
}

// Provisional values. Task 5 recalibrates them against production geometry.
export const DEFAULT_CALIBRATION: CalibrationProfile = {
  initialEnergy: 100,
  maxDeltaMs: 50,
  impactDamage: 18,
  invulnerabilityMs: 750,
  ratioIntervalMs: 15_000,
  ratioStep: 4,
  maxRatio: 52,
  companionBaselineRatio: 20,
  companionRatioStep: 4,
  energyDrainPerSecond: { 1: 0.55, 2: 0.65, 3: 0.75 },
  initialRatios: { 1: 20, 2: 24, 3: 28 },
  targetTermDurationMs: { 1: 75_000, 2: 70_000, 3: 65_000 },
}
