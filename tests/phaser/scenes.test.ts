import { describe, expect, it } from "vitest"

import {
  RESULTS_COPY,
  SCENE_ORDER,
  TERM_BREAK_COPY,
  TITLE_COPY,
  refillSchedule,
} from "../../src/phaser/scene-contracts"
import { staticBackgroundTextureFor } from "../../src/phaser/backgrounds/PanoramaModel"

describe("Phaser course scenes", () => {
  it("keeps the approved scene order", () => {
    expect(SCENE_ORDER).toEqual([
      "boot",
      "preload",
      "title",
      "game",
      "term-break",
      "results",
    ])
  })

  it("uses the approved title copy without decorative bursts", () => {
    expect(TITLE_COPY).toEqual({
      eyebrow: "EDUCACIÓN PÚBLICA Y DE CALIDAD",
      title: "UNA JORNADA DECENTE",
      start: "EMPEZAR",
      how: "CÓMO FUNCIONA",
      help: "UN TOQUE PARA SALTAR",
    })
    expect(Object.keys(TITLE_COPY)).not.toContain("bursts")
  })

  it("uses one template for Christmas and Easter", () => {
    expect(TERM_BREAK_COPY[1]).toMatchObject({
      eyebrow: "PRIMER TRIMESTRE COMPLETADO",
      title: "VACACIONES DE NAVIDAD",
    })
    expect(TERM_BREAK_COPY[2]).toMatchObject({
      eyebrow: "SEGUNDO TRIMESTRE COMPLETADO",
      title: "VACACIONES DE SEMANA SANTA",
    })
    expect(TERM_BREAK_COPY[1].continue).toBe("CONTINUAR EL CURSO")
    expect(TERM_BREAK_COPY[2].energy).toBe("ENERGÍA RECUPERADA")
  })

  it("fills ten blocks left-to-right in about one second", () => {
    expect(refillSchedule(false)).toEqual([
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    ])
    expect(refillSchedule(true)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  })

  it("keeps refill copy out of final results", () => {
    expect(RESULTS_COPY.title).toBe("FIN DE CURSO")
    expect(RESULTS_COPY.actions).toEqual([
      "VOLVER A INTENTAR",
      "POR QUÉ ESTE JUEGO",
      "COMPARTIR",
    ])
    expect(JSON.stringify(RESULTS_COPY)).not.toContain("RECUPERADA")
  })

  it("uses winter for Christmas, spring for Easter, and June for results", () => {
    expect(staticBackgroundTextureFor("christmas")).toBe("panoramaTerm2")
    expect(staticBackgroundTextureFor("spring-break")).toBe("springBreak")
    expect(staticBackgroundTextureFor("results")).toBe("panoramaTerm3")
  })
})
