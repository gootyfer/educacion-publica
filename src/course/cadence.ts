import type { ObstacleKind, Term } from "./types"

export type SpeedBand = "slow" | "medium" | "fast"

export interface RandomSource {
  next(): number
}

export interface SpawnRequest {
  readonly term: Term
  readonly energy: number
  readonly worldSpeed: number
  readonly jumpAirtimeMs: number
  readonly obstacleWidth: number
  readonly previousKind?: ObstacleKind
}

export interface SpawnDecision {
  readonly kind: ObstacleKind
  readonly gap: number
  readonly speedBand: SpeedBand
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

export class SeededRandom implements RandomSource {
  private seed: number

  constructor(seed: number) {
    this.seed = seed >>> 0
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
  const eligible = TERM_OBSTACLES[request.term]
  const candidates =
    request.previousKind && TALL_OBSTACLES.includes(request.previousKind)
      ? eligible.filter((kind) => kind !== request.previousKind)
      : eligible
  const kind = candidates[Math.floor(random.next() * candidates.length)]!
  const pressure =
    (request.term - 1) * 0.2 +
    ((100 - clamp(request.energy, 0, 100)) / 100) * 0.2 +
    random.next() * 0.6
  const speedBand: SpeedBand =
    pressure < 0.34 ? "slow" : pressure < 0.68 ? "medium" : "fast"
  const extraGap =
    speedBand === "slow" ? 160 : speedBand === "medium" ? 110 : 70
  const minimumGap =
    request.worldSpeed * (request.jumpAirtimeMs / 1000) +
    request.obstacleWidth +
    48

  return {
    kind,
    gap: minimumGap + extraGap + Math.floor(random.next() * 40),
    speedBand,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
