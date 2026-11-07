import { GAME_CONFIG } from "./config"
import { intersectsPlayer, SeededRandom, spawnObstacle } from "./obstacles"
import type { GameInput, GameState, Obstacle, Term, TermResult } from "./types"

const EMPTY_HITS = {
  paperwork: 0,
  heat: 0,
  infrastructure: 0,
} as const

export function createGameState(): GameState {
  return {
    phase: "ready",
    term: 1,
    elapsedMs: 0,
    courseElapsedMs: 0,
    completedTerms: [],
    energy: GAME_CONFIG.initialEnergy,
    ratio: GAME_CONFIG.initialRatio,
    maxRatio: GAME_CONFIG.initialRatio,
    playerY: GAME_CONFIG.groundY,
    playerVelocityY: 0,
    grounded: true,
    invulnerabilityMs: 0,
    hitsByKind: { ...EMPTY_HITS },
    obstacles: [],
    distanceTravelled: 0,
    distanceSinceLastSpawn: 0,
    nextObstacleGap: 300,
    spawnCount: 0,
    randomSeed: 42,
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
  if (state.phase === "between-terms" || state.phase === "finished") {
    return state
  }

  const safeDeltaMs = Math.max(0, Math.min(deltaMs, GAME_CONFIG.maxStepMs))
  const deltaSeconds = safeDeltaMs / 1000
  const elapsedMs = state.elapsedMs + safeDeltaMs
  const courseElapsedMs = state.courseElapsedMs + safeDeltaMs
  const initialRatio = GAME_CONFIG.termInitialRatios[state.term]
  const ratio =
    initialRatio +
    Math.floor(elapsedMs / GAME_CONFIG.ratioIntervalMs) * GAME_CONFIG.ratioStep
  let energy = Math.max(
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

  const travelledThisFrame = GAME_CONFIG.obstacleSpeed * deltaSeconds
  let obstacles: Obstacle[] = state.obstacles
    .map((obstacle) => ({
      ...obstacle,
      x: obstacle.x - travelledThisFrame,
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -20)
  let distanceSinceLastSpawn =
    state.distanceSinceLastSpawn + travelledThisFrame
  let nextObstacleGap = state.nextObstacleGap
  let spawnCount = state.spawnCount
  let randomSeed = state.randomSeed

  const stateForSpawn: GameState = {
    ...state,
    elapsedMs,
    distanceSinceLastSpawn,
  }
  const random = new SeededRandom(randomSeed)
  const spawned = spawnObstacle(stateForSpawn, random)
  if (spawned) {
    obstacles = [...obstacles, spawned.obstacle]
    distanceSinceLastSpawn = 0
    nextObstacleGap = spawned.nextGap
    spawnCount += 1
    randomSeed = random.seed
  }

  let invulnerabilityMs = Math.max(
    0,
    state.invulnerabilityMs - safeDeltaMs,
  )
  let hitsByKind = state.hitsByKind

  if (invulnerabilityMs === 0) {
    const collided = obstacles.find((obstacle) =>
      intersectsPlayer(obstacle, {
        ...state,
        playerY,
        playerVelocityY,
        grounded,
      }),
    )

    if (collided) {
      energy = Math.max(0, energy - GAME_CONFIG.collisionDamage)
      invulnerabilityMs = GAME_CONFIG.invulnerabilityMs
      hitsByKind = {
        ...hitsByKind,
        [collided.kind]: hitsByKind[collided.kind] + 1,
      }
    }
  }

  const nextState: GameState = {
    ...state,
    phase: "running",
    elapsedMs,
    courseElapsedMs,
    energy,
    ratio,
    maxRatio: Math.max(state.maxRatio, ratio),
    playerY,
    playerVelocityY,
    grounded,
    invulnerabilityMs,
    hitsByKind,
    obstacles,
    distanceTravelled: state.distanceTravelled + travelledThisFrame,
    distanceSinceLastSpawn,
    nextObstacleGap,
    spawnCount,
    randomSeed,
  }

  if (energy > 0) return nextState

  const endedState: GameState = {
    ...nextState,
    phase: state.term === 3 ? "finished" : "between-terms",
  }

  return {
    ...endedState,
    completedTerms: [
      ...state.completedTerms,
      currentTermResult(endedState),
    ],
  }
}

export function currentTermResult(state: GameState): TermResult {
  return {
    term: state.term,
    durationMs: state.elapsedMs,
    distanceTravelled: state.distanceTravelled,
    maxRatio: state.maxRatio,
    hitsByKind: { ...state.hitsByKind },
  }
}

export function startNextTerm(state: GameState): GameState {
  if (state.phase !== "between-terms") return state

  const term = Math.min(3, state.term + 1) as Term
  const ratio = GAME_CONFIG.termInitialRatios[term]

  return {
    ...state,
    phase: "running",
    term,
    elapsedMs: 0,
    energy: GAME_CONFIG.initialEnergy,
    ratio,
    maxRatio: ratio,
    playerY: GAME_CONFIG.groundY,
    playerVelocityY: 0,
    grounded: true,
    invulnerabilityMs: 0,
    hitsByKind: { ...EMPTY_HITS },
    obstacles: [],
    distanceTravelled: 0,
    distanceSinceLastSpawn: 0,
    nextObstacleGap: 300,
    spawnCount: 0,
  }
}
