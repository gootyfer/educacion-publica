import type { ObstacleKind, Term } from "./types"

export type SpeedBand = "slow" | "medium" | "fast"
export type GapBand = "long" | "medium" | "short"

export const COURSE_GEOMETRY = {
  jumpAirtimeMs: 980,
  obstacleWidth: 62,
  readabilityPadding: 48,
} as const

export const SPEED_BY_BAND: Readonly<Record<SpeedBand, number>> = {
  slow: 150,
  medium: 180,
  fast: 215,
}

export interface RandomSource {
  next(): number
}

export interface SpawnRequest {
  readonly term: Term
  readonly energy: number
  readonly worldSpeed: number
  readonly jumpAirtimeMs: number
  readonly obstacleWidth: number
  readonly elapsedMs?: number
  readonly targetTermDurationMs?: number
  readonly previousKind?: ObstacleKind
  readonly previousGapBand?: GapBand
  readonly shortStreak?: number
}

export interface SpawnDecision {
  readonly kind: ObstacleKind
  readonly gap: number
  readonly speedBand: SpeedBand
  readonly gapBand: GapBand
  readonly pressure: number
}

export const TALL_OBSTACLES: readonly ObstacleKind[] = [
  "paper-stack",
  "filing-cart",
  "cold-climate",
  "wall",
]

const TERM_OBSTACLES: Readonly<Record<Term, readonly ObstacleKind[]>> = {
  1: ["paper-stack", "filing-cart", "cold-climate"],
  2: ["paper-stack", "filing-cart", "cold-climate", "leak", "wall"],
  3: ["paper-stack", "filing-cart", "heat-climate", "leak", "wall"],
}

export function eligibleObstacles(term: Term): readonly ObstacleKind[] {
  return TERM_OBSTACLES[term]
}

export function difficultyPressure(
  term: Term,
  elapsedMs: number,
  targetMs = 60_000,
): number {
  const base = (term - 1) * 0.08
  const progress = clamp(elapsedMs / Math.max(1, targetMs), 0, 1)
  return clamp(base + (1 - base) * progress, 0, 1)
}

export function worldSpeedFor(
  term: Term,
  elapsedMs: number,
  targetMs = 60_000,
): number {
  return 150 + difficultyPressure(term, elapsedMs, targetMs) * 150
}

export class SeededRandom implements RandomSource {
  private seed: number

  constructor(seed: number) {
    let mixed = seed >>> 0
    mixed ^= mixed >>> 16
    mixed = Math.imul(mixed, 0x7feb352d)
    mixed ^= mixed >>> 15
    mixed = Math.imul(mixed, 0x846ca68b)
    this.seed = (mixed ^ (mixed >>> 16)) >>> 0
  }

  next(): number {
    this.seed = (Math.imul(this.seed, 1_664_525) + 1_013_904_223) >>> 0
    return this.seed / 0x1_0000_0000
  }
}

export function nextObstacle(
  request: SpawnRequest,
  random: RandomSource,
): SpawnDecision {
  const elapsedMs = request.elapsedMs ?? 0
  const targetMs = request.targetTermDurationMs ?? 60_000
  const pressure = difficultyPressure(request.term, elapsedMs, targetMs)
  let gapBand = chooseGapBand(request, pressure, random)
  const eligible = TERM_OBSTACLES[request.term]
  let candidates = eligible
  if (request.previousKind && TALL_OBSTACLES.includes(request.previousKind)) {
    candidates =
      gapBand === "short"
        ? eligible.filter((kind) => !TALL_OBSTACLES.includes(kind))
        : eligible.filter((kind) => kind !== request.previousKind)
  }
  if (candidates.length === 0 && gapBand === "short") {
    gapBand = "medium"
    candidates = request.previousKind
      ? eligible.filter((kind) => kind !== request.previousKind)
      : eligible
  }
  if (candidates.length === 0) candidates = eligible
  const kind = candidates[Math.floor(random.next() * candidates.length)]!
  const speedBand: SpeedBand =
    pressure < 0.34 ? "slow" : pressure < 0.68 ? "medium" : "fast"
  const extraGap = gapExtra(gapBand, pressure)
  const minimumGap =
    request.worldSpeed * (request.jumpAirtimeMs / 1000) +
    request.obstacleWidth +
    COURSE_GEOMETRY.readabilityPadding

  return {
    kind,
    gap: minimumGap + extraGap + Math.floor(random.next() * 40),
    speedBand,
    gapBand,
    pressure,
  }
}

function chooseGapBand(
  request: SpawnRequest,
  pressure: number,
  random: RandomSource,
): GapBand {
  const elapsedMs = request.elapsedMs ?? 0
  const targetMs = request.targetTermDurationMs ?? 60_000
  const roll = random.next()
  if (elapsedMs < Math.min(4_500, targetMs * 0.08)) {
    return roll < 0.72 ? "long" : "medium"
  }

  const longWeight = 0.62 * (1 - pressure) + 0.05
  const shortWeight = 0.08 + 0.52 * pressure
  const mediumWeight = 1 - longWeight - shortWeight
  if ((request.shortStreak ?? 0) > 0 || request.previousGapBand === "short") {
    return roll < longWeight / (longWeight + mediumWeight) ? "long" : "medium"
  }
  if (roll < longWeight) return "long"
  if (roll < longWeight + mediumWeight) return "medium"
  return "short"
}

function gapExtra(gapBand: GapBand, pressure: number): number {
  if (gapBand === "long") return Math.round(180 - pressure * 60)
  if (gapBand === "medium") return Math.round(110 - pressure * 55)
  return Math.round(60 - pressure * 40)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
