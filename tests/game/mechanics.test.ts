import { describe, expect, it } from "vitest"

import {
  advanceGame,
  createGameState,
  currentTermResult,
  energyDrainPerSecond,
  jumpImpulseForEnergy,
  startNextTerm,
} from "../../src/game/mechanics"

const NO_INPUT = { jumpPressed: false }

function advanceFor(totalMs: number) {
  let state = { ...createGameState(), nextObstacleGap: Number.POSITIVE_INFINITY }

  for (let elapsed = 0; elapsed < totalMs; elapsed += 50) {
    state = advanceGame(state, NO_INPUT, 50)
  }

  return state
}

describe("game mechanics", () => {
  it("starts a fresh course in the first term with the agreed baseline", () => {
    const state = createGameState()

    expect(state).toMatchObject({
      phase: "ready",
      term: 1,
      energy: 100,
      ratio: 20,
      maxRatio: 20,
      playerY: 0,
      playerVelocityY: 0,
      grounded: true,
      elapsedMs: 0,
      courseElapsedMs: 0,
      completedTerms: [],
      hitsByKind: {
        paperwork: 0,
        heat: 0,
        infrastructure: 0,
      },
    })
  })

  it("adds four pupils every fifteen seconds", () => {
    expect(advanceFor(15_000).ratio).toBe(24)
    expect(advanceFor(30_000).ratio).toBe(28)
  })

  it("drains energy faster as the ratio grows", () => {
    expect(energyDrainPerSecond(20)).toBe(0.5)
    expect(energyDrainPerSecond(28)).toBe(0.7)
  })

  it("reduces jump impulse linearly with energy", () => {
    expect(jumpImpulseForEnergy(100)).toBe(-700)
    expect(jumpImpulseForEnergy(50)).toBe(-610)
    expect(jumpImpulseForEnergy(0)).toBe(-520)
  })

  it("does not allow another jump while the teacher is airborne", () => {
    const airborne = advanceGame(
      createGameState(),
      { jumpPressed: true },
      50,
    )

    const withRepeatedTap = advanceGame(
      airborne,
      { jumpPressed: true },
      50,
    )
    const withoutRepeatedTap = advanceGame(airborne, NO_INPUT, 50)

    expect(withRepeatedTap.playerVelocityY).toBe(
      withoutRepeatedTap.playerVelocityY,
    )
    expect(withRepeatedTap.playerY).toBe(withoutRepeatedTap.playerY)
  })

  it("caps a long frame to fifty milliseconds", () => {
    const state = advanceGame(createGameState(), NO_INPUT, 5_000)

    expect(state.elapsedMs).toBe(50)
    expect(state.energy).toBeCloseTo(99.975)
  })

  it("clamps energy and closes the first term when it reaches zero", () => {
    const nearlyFinished = { ...createGameState(), energy: 0.001 }
    const finished = advanceGame(nearlyFinished, NO_INPUT, 50)

    expect(finished.energy).toBe(0)
    expect(finished.phase).toBe("between-terms")
    expect(finished.completedTerms).toHaveLength(1)
  })

  it("leaves a finished jornada unchanged", () => {
    const finished = { ...createGameState(), phase: "finished" as const }

    expect(advanceGame(finished, { jumpPressed: true }, 50)).toBe(finished)
  })

  it("closes each term exactly once and finishes the course after the third", () => {
    let state = finishCurrentTerm(createGameState())

    expect(state.phase).toBe("between-terms")
    expect(state.completedTerms).toHaveLength(1)
    expect(state.completedTerms[0]).toEqual(currentTermResult(state))

    state = finishCurrentTerm(startNextTerm(state))
    expect(state.phase).toBe("between-terms")
    expect(state.completedTerms.map(({ term }) => term)).toEqual([1, 2])

    state = finishCurrentTerm(startNextTerm(state))
    expect(state.phase).toBe("finished")
    expect(state.completedTerms.map(({ term }) => term)).toEqual([1, 2, 3])

    expect(advanceGame(state, NO_INPUT, 50)).toBe(state)
  })

  it("starts the next term once with restored energy and preserved totals", () => {
    const ended = finishCurrentTerm({
      ...createGameState(),
      elapsedMs: 20_000,
      courseElapsedMs: 20_000,
      ratio: 24,
      maxRatio: 24,
      distanceTravelled: 800,
      hitsByKind: {
        paperwork: 1,
        heat: 0,
        infrastructure: 1,
      },
      obstacles: [
        {
          id: 1,
          kind: "paperwork",
          x: 180,
          width: 34,
          height: 38,
        },
      ],
    })

    const next = startNextTerm(ended)

    expect(next).toMatchObject({
      phase: "running",
      term: 2,
      energy: 100,
      ratio: 24,
      elapsedMs: 0,
      courseElapsedMs: ended.courseElapsedMs,
      obstacles: [],
      invulnerabilityMs: 0,
    })
    expect(next.completedTerms).toEqual(ended.completedTerms)
    expect(startNextTerm(next)).toBe(next)
  })

  it("caps a long frame without skipping across more than one term", () => {
    const nearlyEnded = {
      ...createGameState(),
      phase: "running" as const,
      energy: 0.001,
    }

    const ended = advanceGame(nearlyEnded, NO_INPUT, 5_000)

    expect(ended.phase).toBe("between-terms")
    expect(ended.elapsedMs).toBe(50)
    expect(ended.courseElapsedMs).toBe(50)
    expect(ended.completedTerms).toHaveLength(1)
  })
})

function finishCurrentTerm(state: ReturnType<typeof createGameState>) {
  return advanceGame(
    {
      ...state,
      phase: "running",
      energy: 0.001,
    },
    NO_INPUT,
    50,
  )
}
