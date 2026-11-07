import type { TermResult } from "../game/types"

export interface TransitionViewModel {
  afterTerm: 1 | 2
  nextTerm: 2 | 3
  eyebrow: string
  title: string
  durationLabel: string
  message: string
  accessibleSummary: string
}

export function buildTransitionViewModel(
  result: TermResult,
): TransitionViewModel | null {
  if (result.term === 3) return null

  const christmas = result.term === 1
  return {
    afterTerm: result.term,
    nextTerm: christmas ? 2 : 3,
    eyebrow: christmas
      ? "Primer trimestre completado"
      : "Segundo trimestre completado",
    title: christmas
      ? "Vacaciones de Navidad"
      : "Vacaciones de Semana Santa",
    durationLabel: formatDuration(Math.floor(result.durationMs / 1000)),
    message:
      "El descanso recupera tu energía, pero no elimina las condiciones. Al volver, la ratio y la velocidad empiezan un poco más altas.",
    accessibleSummary: christmas
      ? "Vacaciones de Navidad. Energía recuperada. A continuación comienza el segundo trimestre."
      : "Vacaciones de Semana Santa. Energía recuperada. A continuación comienza el tercer trimestre.",
  }
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`
}
