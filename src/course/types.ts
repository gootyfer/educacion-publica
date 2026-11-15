import type { CalibrationProfile } from "./calibration"

export type Term = 1 | 2 | 3
export type CoursePhase = "running" | "term-break" | "course-ended"

export type ObstacleKind =
  | "paper-stack"
  | "filing-cart"
  | "cold-climate"
  | "heat-climate"
  | "leak"
  | "wall"

export interface CourseInput {
  readonly impact?: ObstacleKind
  readonly startNextTerm?: boolean
}

export interface CourseResult {
  readonly term: Term
  readonly durationMs: number
  readonly maxRatio: number
  readonly impacts: Readonly<Record<ObstacleKind, number>>
}

export interface CourseState {
  readonly phase: CoursePhase
  readonly term: Term
  readonly elapsedMs: number
  readonly courseElapsedMs: number
  readonly energy: number
  readonly ratio: number
  readonly maxRatio: number
  readonly companionCount: number
  readonly invulnerabilityMs: number
  readonly impacts: Readonly<Record<ObstacleKind, number>>
  readonly completedTerms: readonly CourseResult[]
  readonly profile: CalibrationProfile
}

export type CourseEvent =
  | { readonly type: "impact"; readonly kind: ObstacleKind }
  | { readonly type: "companions-added"; readonly count: number }
  | { readonly type: "term-ended"; readonly term: 1 | 2 }
  | { readonly type: "term-started"; readonly term: 2 | 3 }
  | { readonly type: "course-ended" }

export interface CourseStep {
  readonly state: CourseState
  readonly events: readonly CourseEvent[]
}
