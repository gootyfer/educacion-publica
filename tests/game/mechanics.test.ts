import { describe, expect, it } from "vitest"

import {
  advanceGame,
  createGameState,
  energyDrainPerSecond,
  jumpImpulseForEnergy,
} from "../../src/game/mechanics"

const NO_INPUT = { jumpPressed: false }

function advanceFor(totalMs: number) {
  let state = createGameState()

  for (let elapsed = 0; elapsed < totalMs; elapsed += 50) {
    state = advanceGame(state, NO_INPUT, 50)
  }

  return state
}

describe("game mechanics", () => {
  it("starts a fresh jornada with the agreed baseline", () => {
    const state = createGameState()

    expect(state).toMatchObject({
      phase: "ready",
      energy: 100,
      ratio: 20,
      maxRatio: 20,
      playerY: 0,
      playerVelocityY: 0,
      grounded: true,
      elapsedMs: 0,
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
    expect(jumpImpulseForEnergy(50)).toBe(-565)
    expect(jumpImpulseForEnergy(0)).toBe(-430)
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

  it("clamps energy and finishes when it reaches zero", () => {
    const nearlyFinished = { ...createGameState(), energy: 0.001 }
    const finished = advanceGame(nearlyFinished, NO_INPUT, 50)

    expect(finished.energy).toBe(0)
    expect(finished.phase).toBe("finished")
  })

  it("leaves a finished jornada unchanged", () => {
    const finished = { ...createGameState(), phase: "finished" as const }

    expect(advanceGame(finished, { jumpPressed: true }, 50)).toBe(finished)
  })
})
