import type { Term } from "./types"

export interface CalibrationProfile {
  readonly initialEnergy: number
  readonly maxDeltaMs: number
  readonly impactDamage: number
  readonly invulnerabilityMs: number
  readonly ratioIntervalMs: Readonly<Record<Term, number>>
  readonly ratioStep: number
  readonly maxRatio: number
  readonly companionBaselineRatio: number
  readonly companionRatioStep: number
  readonly energyDrainPerSecond: Readonly<Record<Term, number>>
  readonly initialRatios: Readonly<Record<Term, number>>
  readonly targetTermDurationMs: Readonly<Record<Term, number>>
}

export const DEFAULT_CALIBRATION: CalibrationProfile = {
  initialEnergy: 100,
  maxDeltaMs: 50,
  impactDamage: 14,
  invulnerabilityMs: 900,
  ratioIntervalMs: { 1: 6_500, 2: 6_000, 3: 5_600 },
  ratioStep: 4,
  maxRatio: 52,
  companionBaselineRatio: 20,
  companionRatioStep: 4,
  energyDrainPerSecond: { 1: 1.05, 2: 1.2, 3: 1.35 },
  initialRatios: { 1: 20, 2: 20, 3: 20 },
  targetTermDurationMs: { 1: 70_000, 2: 65_000, 3: 60_000 },
}
