import { GAME_CONFIG } from "./config"
import type { GameInput, GameState } from "./types"

export function createGameState(): GameState {
  return {
    phase: "ready",
    elapsedMs: 0,
    energy: GAME_CONFIG.initialEnergy,
    ratio: GAME_CONFIG.initialRatio,
    maxRatio: GAME_CONFIG.initialRatio,
    playerY: GAME_CONFIG.groundY,
    playerVelocityY: 0,
    grounded: true,
    invulnerabilityMs: 0,
    hitsByKind: {
      paperwork: 0,
      heat: 0,
      infrastructure: 0,
    },
  }
}

export function energyDrainPerSecond(ratio: number): number {
  const pupilsAboveBaseline = Math.max(0, ratio - GAME_CONFIG.initialRatio)
  return (
    GAME_CONFIG.baseDrainPerSecond +
    pupilsAboveBaseline * GAME_CONFIG.extraDrainPerPupil
  )
}

export function jumpImpulseForEnergy(energy: number): number {
  const normalizedEnergy = Math.min(100, Math.max(0, energy)) / 100
  return (
    GAME_CONFIG.minJumpImpulse +
    (GAME_CONFIG.maxJumpImpulse - GAME_CONFIG.minJumpImpulse) * normalizedEnergy
  )
}

export function advanceGame(
  state: GameState,
  input: GameInput,
  deltaMs: number,
): GameState {
  if (state.phase === "finished") {
    return state
  }

  const safeDeltaMs = Math.max(0, Math.min(deltaMs, GAME_CONFIG.maxStepMs))
  const deltaSeconds = safeDeltaMs / 1000
  const elapsedMs = state.elapsedMs + safeDeltaMs
  const ratio =
    GAME_CONFIG.initialRatio +
    Math.floor(elapsedMs / GAME_CONFIG.ratioIntervalMs) * GAME_CONFIG.ratioStep
  const energy = Math.max(
    0,
    Math.min(
      GAME_CONFIG.initialEnergy,
      state.energy - energyDrainPerSecond(state.ratio) * deltaSeconds,
    ),
  )

  let playerVelocityY = state.playerVelocityY
  let playerY = state.playerY
  let grounded = state.grounded

  if (input.jumpPressed && grounded) {
    playerVelocityY = jumpImpulseForEnergy(state.energy)
    grounded = false
  }

  if (!grounded) {
    playerVelocityY += GAME_CONFIG.gravity * deltaSeconds
    playerY += playerVelocityY * deltaSeconds

    if (playerY >= GAME_CONFIG.groundY) {
      playerY = GAME_CONFIG.groundY
      playerVelocityY = 0
      grounded = true
    }
  }

  return {
    ...state,
    phase: energy === 0 ? "finished" : "running",
    elapsedMs,
    energy,
    ratio,
    maxRatio: Math.max(state.maxRatio, ratio),
    playerY,
    playerVelocityY,
    grounded,
    invulnerabilityMs: Math.max(0, state.invulnerabilityMs - safeDeltaMs),
  }
}
