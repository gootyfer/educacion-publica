export const SCENE_ORDER = [
  "boot",
  "preload",
  "title",
  "game",
  "term-break",
  "results",
] as const

export const TITLE_COPY = {
  eyebrow: "EDUCACIÓN PÚBLICA Y DE CALIDAD",
  title: "UNA JORNADA DECENTE",
  start: "EMPEZAR",
  how: "CÓMO FUNCIONA",
  help: "UN TOQUE PARA SALTAR",
} as const

export const TERM_BREAK_COPY = {
  1: {
    eyebrow: "PRIMER TRIMESTRE COMPLETADO",
    title: "VACACIONES DE NAVIDAD",
    energy: "ENERGÍA RECUPERADA",
    continue: "CONTINUAR EL CURSO",
  },
  2: {
    eyebrow: "SEGUNDO TRIMESTRE COMPLETADO",
    title: "VACACIONES DE SEMANA SANTA",
    energy: "ENERGÍA RECUPERADA",
    continue: "CONTINUAR EL CURSO",
  },
} as const

export const RESULTS_COPY = {
  title: "FIN DE CURSO",
  actions: ["VOLVER A INTENTAR", "POR QUÉ ESTE JUEGO", "COMPARTIR"],
} as const

export function refillSchedule(reducedMotion: boolean): number[] {
  return Array.from({ length: 10 }, (_, index) =>
    reducedMotion ? 0 : (index + 1) * 100,
  )
}
