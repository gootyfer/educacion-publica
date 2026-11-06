import { describe, expect, it } from "vitest"

import { EVIDENCE_FACTS } from "../../src/content/facts"

describe("EVIDENCE_FACTS", () => {
  it("publishes four distinct, attributable evidence cards", () => {
    expect(EVIDENCE_FACTS).toHaveLength(4)
    expect(new Set(EVIDENCE_FACTS.map((fact) => fact.id)).size).toBe(4)

    for (const fact of EVIDENCE_FACTS) {
      expect(fact.sourceUrl).toMatch(/^https:\/\//)
      expect(fact.period.trim()).not.toBe("")
      expect(fact.scope.trim()).not.toBe("")
      expect(["official", "union", "press-reporting"]).toContain(
        fact.sourceKind,
      )
    }
  })

  it("keeps the four checked values and their editorial cautions", () => {
    const byId = Object.fromEntries(
      EVIDENCE_FACTS.map((fact) => [fact.id, fact]),
    )

    expect(byId.ratio?.value).toBe("11,7 frente a 9,8")
    expect(byId.cost?.value).toBe("16.124 € por persona")
    expect(byId.salary?.value).toBe("2.797,37 € brutos al mes")
    expect(byId.climate?.value).toBe("hasta 20 centros detectados")

    expect(byId.cost?.caveat).toMatch(/no equivale/i)
    expect(byId.salary?.caveat).toMatch(/pagas extraordinarias/i)
    expect(byId.climate?.caveat).toMatch(/no es un censo/i)
  })
})
