import { DEFAULT_CALIBRATION, type CalibrationProfile } from "./calibration"
import type {
  CourseEvent,
  CourseInput,
  CourseResult,
  CourseState,
  CourseStep,
  ObstacleKind,
  Term,
} from "./types"

const OBSTACLE_KINDS: readonly ObstacleKind[] = [
  "paper-stack",
  "filing-cart",
  "cold-climate",
  "heat-climate",
  "leak",
  "wall",
]

export function createCourseState(
  profile: CalibrationProfile = DEFAULT_CALIBRATION,
): CourseState {
  const energy = clamp(profile.initialEnergy, 0, 100)
  const ratio = profile.initialRatios[1]
  return {
    phase: "running",
    term: 1,
    elapsedMs: 0,
    courseElapsedMs: 0,
    energy,
    ratio,
    maxRatio: ratio,
    companionCount: companionCountForProfile(ratio, profile),
    invulnerabilityMs: 0,
    impacts: emptyImpacts(),
    completedTerms: [],
    profile,
  }
}

export function createCourseStateAtTerm(
  term: Term,
  profile: CalibrationProfile = DEFAULT_CALIBRATION,
): CourseState {
  if (term === 1) return createCourseState(profile)
  const ratio = profile.initialRatios[term]
  return {
    ...createCourseState(profile),
    term,
    ratio,
    maxRatio: ratio,
    companionCount: companionCountForProfile(ratio, profile),
  }
}

export function companionCountForRatio(ratio: number): number {
  return companionCountForProfile(ratio, DEFAULT_CALIBRATION)
}

function companionCountForProfile(
  ratio: number,
  profile: CalibrationProfile,
): number {
  const growth = Math.floor(
    (ratio - profile.companionBaselineRatio) / profile.companionRatioStep,
  )
  return clamp(1 + growth, 1, 9)
}

export function advanceCourse(
  state: CourseState,
  input: CourseInput,
  deltaMs: number,
): CourseStep {
  if (state.phase === "course-ended") return { state, events: [] }

  if (state.phase === "term-break") {
    return input.startNextTerm ? startNextTerm(state) : { state, events: [] }
  }

  const safeDeltaMs = clamp(deltaMs, 0, state.profile.maxDeltaMs)
  const elapsedMs = state.elapsedMs + safeDeltaMs
  const courseElapsedMs = state.courseElapsedMs + safeDeltaMs
  const scheduledRatio =
    state.profile.initialRatios[state.term] +
    Math.floor(elapsedMs / state.profile.ratioIntervalMs) *
      state.profile.ratioStep
  const ratio = Math.min(state.profile.maxRatio, scheduledRatio)
  const companionCount = companionCountForProfile(ratio, state.profile)
  const events: CourseEvent[] = []

  if (companionCount > state.companionCount) {
    events.push({
      type: "companions-added",
      count: companionCount - state.companionCount,
    })
  }

  let energy = clamp(
    state.energy -
      state.profile.energyDrainPerSecond[state.term] * (safeDeltaMs / 1000),
    0,
    100,
  )
  let invulnerabilityMs = Math.max(
    0,
    state.invulnerabilityMs - safeDeltaMs,
  )
  let impacts = state.impacts

  if (input.impact && invulnerabilityMs === 0 && energy > 0) {
    energy = clamp(energy - state.profile.impactDamage, 0, 100)
    invulnerabilityMs = state.profile.invulnerabilityMs
    impacts = {
      ...impacts,
      [input.impact]: impacts[input.impact] + 1,
    }
    events.push({ type: "impact", kind: input.impact })
  }

  const runningState: CourseState = {
    ...state,
    elapsedMs,
    courseElapsedMs,
    energy,
    ratio,
    maxRatio: Math.max(state.maxRatio, ratio),
    companionCount,
    invulnerabilityMs,
    impacts,
  }

  if (energy > 0) return { state: runningState, events }

  const result = resultFor(runningState)
  if (state.term === 3) {
    return {
      state: {
        ...runningState,
        phase: "course-ended",
        completedTerms: [...state.completedTerms, result],
      },
      events: [...events, { type: "course-ended" }],
    }
  }

  return {
    state: {
      ...runningState,
      phase: "term-break",
      completedTerms: [...state.completedTerms, result],
    },
    events: [...events, { type: "term-ended", term: state.term }],
  }
}

function startNextTerm(state: CourseState): CourseStep {
  const term = Math.min(3, state.term + 1) as Term
  const ratio = state.profile.initialRatios[term]
  return {
    state: {
      ...state,
      phase: "running",
      term,
      elapsedMs: 0,
      energy: clamp(state.profile.initialEnergy, 0, 100),
      ratio,
      maxRatio: ratio,
      companionCount: companionCountForProfile(ratio, state.profile),
      invulnerabilityMs: 0,
      impacts: emptyImpacts(),
    },
    events: [{ type: "term-started", term: term as 2 | 3 }],
  }
}

function resultFor(state: CourseState): CourseResult {
  return {
    term: state.term,
    durationMs: state.elapsedMs,
    maxRatio: state.maxRatio,
    impacts: { ...state.impacts },
  }
}

function emptyImpacts(): Record<ObstacleKind, number> {
  return Object.fromEntries(OBSTACLE_KINDS.map((kind) => [kind, 0])) as Record<
    ObstacleKind,
    number
  >
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
