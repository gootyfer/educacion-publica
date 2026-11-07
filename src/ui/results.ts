import { EVIDENCE_FACTS } from "../content/facts"
import type { EvidenceFact } from "../content/types"
import { obstacleArtFor } from "../game/art/obstacles"
import { sceneVisualFor } from "../game/art/scene"
import type { DamageKind, GameState, Term } from "../game/types"

const RECORD_KEY = "curso-docente-record-seconds-v2"

export interface DamageRow {
  kind: DamageKind
  label: string
  hits: number
}

export interface ResultViewModel {
  title: "Fin de curso"
  durationSeconds: number
  durationLabel: string
  totalDistance: number
  termRows: TermRow[]
  maxRatio: number
  damageRows: DamageRow[]
  discoveredObstacles: string[]
  discoveredSeasons: string[]
  ratioExplanation: string
  message: string
  facts: readonly EvidenceFact[]
  isRecord: boolean
}

export interface TermRow {
  term: Term
  label: string
  durationLabel: string
  maxRatio: number
}

interface RecordStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function buildResultViewModel(
  state: GameState,
  previousRecord: number | null,
): ResultViewModel {
  const durationSeconds = Math.floor(
    state.completedTerms.reduce(
      (total, result) => total + result.durationMs,
      0,
    ) / 1000,
  )
  const combinedHits = state.completedTerms.reduce(
    (total, result) => ({
      paperwork: total.paperwork + result.hitsByKind.paperwork,
      heat: total.heat + result.hitsByKind.heat,
      infrastructure:
        total.infrastructure + result.hitsByKind.infrastructure,
    }),
    { paperwork: 0, heat: 0, infrastructure: 0 },
  )
  const maxRatio = Math.max(
    GAME_BASELINE_RATIO,
    ...state.completedTerms.map(({ maxRatio }) => maxRatio),
  )

  return {
    title: "Fin de curso",
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    totalDistance: state.completedTerms.reduce(
      (total, result) => total + result.distanceTravelled,
      0,
    ),
    termRows: state.completedTerms.map((result) => ({
      term: result.term,
      label: `${ordinal(result.term)} trimestre`,
      durationLabel: formatDuration(Math.floor(result.durationMs / 1000)),
      maxRatio: result.maxRatio,
    })),
    maxRatio,
    damageRows: [
      {
        kind: "paperwork",
        label: "Burocracia",
        hits: combinedHits.paperwork,
      },
      {
        kind: "heat",
        label: "Climatización",
        hits: combinedHits.heat,
      },
      {
        kind: "infrastructure",
        label: "Infraestructura",
        hits: combinedHits.infrastructure,
      },
    ],
    discoveredObstacles: state.introducedObstacleVariants.map(
      (variant) => obstacleArtFor(variant).label,
    ),
    discoveredSeasons: [
      ...new Set(
        state.completedTerms.map(({ term }) => sceneVisualFor(term).label),
      ),
    ],
    ratioExplanation:
      "Al aumentar la ratio, atender al grupo consumía más energía y tu salto se hacía más corto.",
    message:
      "No has jugado mal. Intentabas hacer un trabajo cada vez más exigente con tiempo y recursos insuficientes.",
    facts: EVIDENCE_FACTS,
    isRecord: previousRecord === null || durationSeconds > previousRecord,
  }
}

const GAME_BASELINE_RATIO = 20

function ordinal(term: Term): string {
  if (term === 1) return "Primer"
  if (term === 2) return "Segundo"
  return "Tercer"
}

export function readRecord(storage: RecordStorage | null): number | null {
  if (!storage) return null
  try {
    const stored = storage.getItem(RECORD_KEY)
    if (stored === null) return null
    const seconds = Number(stored)
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : null
  } catch {
    return null
  }
}

export function writeRecord(
  storage: RecordStorage | null,
  seconds: number,
): boolean {
  if (!storage) return false
  try {
    const previous = readRecord(storage)
    if (previous !== null && seconds <= previous) return false
    storage.setItem(RECORD_KEY, String(seconds))
    return true
  } catch {
    return false
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`
}
