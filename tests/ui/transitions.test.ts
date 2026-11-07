import { describe, expect, it } from "vitest"

import { buildTransitionViewModel } from "../../src/ui/transitions"
import type { TermResult } from "../../src/game/types"

function resultFor(term: 1 | 2 | 3): TermResult {
  return {
    term,
    durationMs: 64_000,
    distanceTravelled: 1_800,
    maxRatio: 32,
    hitsByKind: {
      paperwork: 1,
      heat: 0,
      infrastructure: 1,
    },
  }
}

describe("holiday transitions", () => {
  it("turns the first term into Christmas holidays and announces term two", () => {
    expect(buildTransitionViewModel(resultFor(1))).toEqual({
      afterTerm: 1,
      nextTerm: 2,
      eyebrow: "Primer trimestre completado",
      title: "Vacaciones de Navidad",
      durationLabel: "1 min 4 s",
      message:
        "Recuperas la energía. Al volver, la ratio y la velocidad empiezan un poco más altas.",
      accessibleSummary:
        "Vacaciones de Navidad. Energía recuperada. A continuación comienza el segundo trimestre.",
    })
  })

  it("turns the second term into Easter holidays and announces term three", () => {
    const transition = buildTransitionViewModel(resultFor(2))

    expect(transition?.title).toBe("Vacaciones de Semana Santa")
    expect(transition?.nextTerm).toBe(3)
    expect(transition?.accessibleSummary).toContain("tercer trimestre")
  })

  it("does not create a holiday after the third term", () => {
    expect(buildTransitionViewModel(resultFor(3))).toBeNull()
  })
})
