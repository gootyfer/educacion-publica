import { describe, expect, it } from "vitest"

import { DEFAULT_CALIBRATION } from "../../src/course/calibration"
import {
  advanceCourse,
  companionCountForRatio,
  createCourseState,
} from "../../src/course/progression"

describe("course progression", () => {
  it("starts the first term with full energy and one symbolic companion", () => {
    const state = createCourseState()

    expect(state.phase).toBe("running")
    expect(state.term).toBe(1)
    expect(state.energy).toBe(100)
    expect(state.ratio).toBe(DEFAULT_CALIBRATION.initialRatios[1])
    expect(state.companionCount).toBe(1)
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

  it("maps ratio growth monotonically to at most nine companions", () => {
    const counts = [0, 20, 24, 28, 36, 44, 52, 60, 80, 200].map(
      companionCountForRatio,
    )

    expect(counts[0]).toBe(1)
    expect(counts.at(-1)).toBe(9)
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

  it("never shrinks the companion group across term breaks", () => {
    const termOneEnded = {
      ...createCourseState(),
      phase: "term-break" as const,
      energy: 0,
      ratio: 52,
      maxRatio: 52,
      companionCount: 9,
    }
    const winter = advanceCourse(
      termOneEnded,
      { startNextTerm: true },
      0,
    ).state
    const nextFrame = advanceCourse(winter, {}, 16).state

    expect(winter.ratio).toBe(52)
    expect(winter.companionCount).toBe(9)
    expect(nextFrame.ratio).toBeGreaterThanOrEqual(winter.ratio)
    expect(nextFrame.companionCount).toBe(9)
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
