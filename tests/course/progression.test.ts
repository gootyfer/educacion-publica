import { describe, expect, it } from "vitest"

import { DEFAULT_CALIBRATION } from "../../src/course/calibration"
import {
  advanceCourse,
  companionCountForRatio,
  createCourseState,
  createCourseStateAtTerm,
} from "../../src/course/progression"

describe("course progression", () => {
  it("starts every term with full energy and two symbolic companions", () => {
    const state = createCourseState()

    expect(state.phase).toBe("running")
    expect(state.term).toBe(1)
    expect(state.energy).toBe(100)
    expect(state.ratio).toBe(DEFAULT_CALIBRATION.initialRatios[1])
    expect(state.companionCount).toBe(2)
    for (const term of [1, 2, 3] as const) {
      const termState = createCourseStateAtTerm(term)
      expect(termState.ratio).toBe(20)
      expect(termState.companionCount).toBe(2)
    }
  })

  it("clamps large frame deltas before advancing time and draining energy", () => {
    const initial = createCourseState()
    const step = advanceCourse(initial, {}, 10_000)

    expect(step.state.elapsedMs).toBe(DEFAULT_CALIBRATION.maxDeltaMs)
    expect(step.state.courseElapsedMs).toBe(DEFAULT_CALIBRATION.maxDeltaMs)
    expect(step.state.energy).toBeLessThan(100)
    expect(step.state.energy).toBeGreaterThanOrEqual(0)
  })

  it("clamps energy between zero and one hundred", () => {
    const overfilled = createCourseState({
      ...DEFAULT_CALIBRATION,
      initialEnergy: 140,
    })
    expect(overfilled.energy).toBe(100)

    const drained = advanceCourse(
      { ...createCourseState(), energy: 0.01 },
      {},
      DEFAULT_CALIBRATION.maxDeltaMs,
    )
    expect(drained.state.energy).toBeGreaterThanOrEqual(0)
    expect(drained.state.energy).toBeLessThanOrEqual(100)
  })

  it("maps ratio growth monotonically to at most ten companions", () => {
    const counts = [0, 20, 24, 28, 36, 44, 52, 60, 80, 200].map(
      companionCountForRatio,
    )

    expect(counts[0]).toBe(2)
    expect(counts.at(-1)).toBe(10)
    expect(counts.every((count, index) => index === 0 || count >= counts[index - 1]!)).toBe(true)
  })

  it("subtracts impact energy without ending a nonempty term", () => {
    const initial = { ...createCourseState(), energy: 80 }
    const step = advanceCourse(initial, { impact: "paper-stack" }, 0)

    expect(step.state.energy).toBe(
      80 - DEFAULT_CALIBRATION.impactDamage,
    )
    expect(step.state.phase).toBe("running")
    expect(step.events).toContainEqual({
      type: "impact",
      kind: "paper-stack",
    })
  })

  it("emits a term break when energy reaches zero before term three", () => {
    const step = advanceCourse(
      { ...createCourseState(), energy: 0 },
      {},
      0,
    )

    expect(step.state.phase).toBe("term-break")
    expect(step.events).toContainEqual({ type: "term-ended", term: 1 })
    expect(step.state.completedTerms).toHaveLength(1)
  })

  it("starts term three once with restored energy after term two", () => {
    const termTwoEnded = {
      ...createCourseState(),
      phase: "term-break" as const,
      term: 2 as const,
      energy: 0,
    }
    const step = advanceCourse(termTwoEnded, { startNextTerm: true }, 0)

    expect(step.state.phase).toBe("running")
    expect(step.state.term).toBe(3)
    expect(step.state.energy).toBe(100)
    expect(step.state.ratio).toBe(DEFAULT_CALIBRATION.initialRatios[3])
    expect(step.events).toContainEqual({ type: "term-started", term: 3 })
  })

  it("resets ratio and companions each term while preserving the annual maximum", () => {
    const termOneEnded = {
      ...createCourseState(),
      phase: "term-break" as const,
      energy: 0,
      ratio: 52,
      maxRatio: 52,
      companionCount: 10,
    }
    const winter = advanceCourse(
      termOneEnded,
      { startNextTerm: true },
      0,
    ).state
    const nextFrame = advanceCourse(winter, {}, 16).state

    expect(winter.ratio).toBe(20)
    expect(winter.maxRatio).toBe(52)
    expect(winter.companionCount).toBe(2)
    expect(nextFrame.ratio).toBeGreaterThanOrEqual(winter.ratio)
    expect(nextFrame.companionCount).toBe(2)
  })

  it("reaches ten companions by three quarters of every normal term", () => {
    for (const term of [1, 2, 3] as const) {
      for (const withImpacts of [false, true]) {
        let state = createCourseStateAtTerm(term)
        const target = state.profile.targetTermDurationMs[term]
        let sentFirstImpact = false
        let sentSecondImpact = false
        while (state.phase === "running" && state.companionCount < 10) {
          const input =
            withImpacts && !sentFirstImpact && state.elapsedMs >= target * 0.2
              ? ((sentFirstImpact = true), { impact: "paper-stack" as const })
              : withImpacts &&
                  !sentSecondImpact &&
                  state.elapsedMs >= target * 0.45
                ? ((sentSecondImpact = true), { impact: "wall" as const })
                : {}
          state = advanceCourse(state, input, state.profile.maxDeltaMs).state
        }
        expect(state.companionCount).toBe(10)
        expect(state.elapsedMs / target).toBeGreaterThanOrEqual(0.64)
        expect(state.elapsedMs / target).toBeLessThanOrEqual(0.75)
      }
    }
  })

  it("allows repeated impacts to end a term before the group reaches ten", () => {
    let state = createCourseStateAtTerm(1)
    while (state.phase === "running") {
      state = advanceCourse(
        state,
        state.invulnerabilityMs === 0 ? { impact: "wall" } : {},
        state.profile.maxDeltaMs,
      ).state
    }
    expect(state.companionCount).toBeLessThan(10)
  })

  it("emits course end when energy reaches zero in term three", () => {
    const step = advanceCourse(
      { ...createCourseState(), term: 3, energy: 0 },
      {},
      0,
    )

    expect(step.state.phase).toBe("course-ended")
    expect(step.events).toContainEqual({ type: "course-ended" })
  })
})
