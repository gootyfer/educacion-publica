import { EVIDENCE_FACTS } from "../content/facts"
import type { EvidenceFact } from "../content/types"
import type { DamageKind, GameState } from "../game/types"

const RECORD_KEY = "jornada-docente-record-seconds"

export interface DamageRow {
  kind: DamageKind
  label: string
  hits: number
}

export interface ResultViewModel {
  title: "Fin de la jornada"
  durationSeconds: number
  durationLabel: string
  maxRatio: number
  damageRows: DamageRow[]
  ratioExplanation: string
  message: string
  facts: readonly EvidenceFact[]
  isRecord: boolean
}

interface RecordStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function buildResultViewModel(
  state: GameState,
  previousRecord: number | null,
): ResultViewModel {
  const durationSeconds = Math.floor(state.elapsedMs / 1000)

  return {
    title: "Fin de la jornada",
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    maxRatio: state.maxRatio,
    damageRows: [
      {
        kind: "paperwork",
        label: "Burocracia",
        hits: state.hitsByKind.paperwork,
      },
      {
        kind: "heat",
        label: "Climatización",
        hits: state.hitsByKind.heat,
      },
      {
        kind: "infrastructure",
        label: "Infraestructura",
        hits: state.hitsByKind.infrastructure,
      },
    ],
    ratioExplanation:
      "Al aumentar la ratio, atender al grupo consumía más energía y tu salto se hacía más corto.",
    message:
      "No has jugado mal. Intentabas hacer un trabajo cada vez más exigente con tiempo y recursos insuficientes.",
    facts: EVIDENCE_FACTS,
    isRecord: previousRecord === null || durationSeconds > previousRecord,
  }
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
