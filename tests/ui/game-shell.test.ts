import { describe, expect, it } from "vitest"

import {
  CONTROLS_BY_SCREEN,
  MOTIVATION_SECTIONS,
  announcementFor,
} from "../../src/ui/GameShell"

describe("accessible Phaser shell contracts", () => {
  it("exposes semantic controls for every non-game screen", () => {
    expect(CONTROLS_BY_SCREEN.title.map(({ label }) => label)).toEqual([
      "Empezar",
      "Cómo funciona",
    ])
    expect(CONTROLS_BY_SCREEN["term-break"][0]?.label).toBe(
      "Continuar el curso",
    )
    expect(CONTROLS_BY_SCREEN.results.map(({ label }) => label)).toEqual([
      "Volver a intentar",
      "Por qué este juego",
      "Compartir",
    ])
  })

  it("explains the metaphors without blaming students", () => {
    expect(MOTIVATION_SECTIONS.map(({ title }) => title)).toEqual([
      "La ratio crece",
      "La energía baja",
      "Los obstáculos siguen",
    ])
    expect(MOTIVATION_SECTIONS[1]?.body).toContain("alumnado no es el problema")
  })

  it("announces gameplay changes without adding visible HUD text", () => {
    expect(announcementFor("jump")).toBe("El docente ha saltado.")
    expect(announcementFor("companions", 7)).toContain("7 estudiantes")
    expect(announcementFor("impact")).toContain("energía")
    expect(announcementFor("term", 3)).toContain("Tercer trimestre")
  })
})
