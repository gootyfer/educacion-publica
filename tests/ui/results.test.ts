import { describe, expect, it } from "vitest"

import { createGameState } from "../../src/game/mechanics"
import type { TermResult } from "../../src/game/types"
import {
  buildResultViewModel,
  readRecord,
  writeRecord,
} from "../../src/ui/results"
import { shareResult } from "../../src/ui/share"

describe("result view model", () => {
  it("translates three completed terms into an attributable course result", () => {
    const completedTerms: TermResult[] = [
      termResult(1, 64_000, 28, { paperwork: 2, heat: 0, infrastructure: 1 }),
      termResult(2, 71_000, 32, { paperwork: 1, heat: 1, infrastructure: 2 }),
      termResult(3, 75_000, 36, { paperwork: 3, heat: 2, infrastructure: 1 }),
    ]
    const state = {
      ...createGameState(),
      phase: "finished" as const,
      term: 3 as const,
      elapsedMs: 75_000,
      courseElapsedMs: 210_000,
      completedTerms,
      maxRatio: 36,
    }

    const result = buildResultViewModel(state, 200)

    expect(result.title).toBe("Fin de curso")
    expect(result.durationSeconds).toBe(210)
    expect(result.durationLabel).toBe("3 min 30 s")
    expect(result.maxRatio).toBe(36)
    expect(result.termRows.map(({ durationLabel }) => durationLabel)).toEqual([
      "1 min 4 s",
      "1 min 11 s",
      "1 min 15 s",
    ])
    expect(result.damageRows).toEqual([
      { kind: "paperwork", label: "Burocracia", hits: 6 },
      { kind: "heat", label: "Climatización", hits: 3 },
      { kind: "infrastructure", label: "Infraestructura", hits: 4 },
    ])
    expect(result.message).toBe(
      "No has jugado mal. Intentabas hacer un trabajo cada vez más exigente con tiempo y recursos insuficientes.",
    )
    expect(result.ratioExplanation).toBe(
      "Al aumentar la ratio, atender al grupo consumía más energía y tu salto se hacía más corto.",
    )
    expect(result.facts).toHaveLength(4)
    expect(result.isRecord).toBe(true)
  })
})

function termResult(
  term: 1 | 2 | 3,
  durationMs: number,
  maxRatio: number,
  hitsByKind: TermResult["hitsByKind"],
): TermResult {
  return {
    term,
    durationMs,
    maxRatio,
    hitsByKind,
    distanceTravelled: durationMs / 30,
  }
}

describe("record storage", () => {
  it("only replaces a record with a longer jornada", () => {
    const values = new Map<string, string>()
    const storage = {
      getItem(key: string) {
        return values.get(key) ?? null
      },
      setItem(key: string, value: string) {
        values.set(key, value)
      },
    }

    expect(writeRecord(storage, 74)).toBe(true)
    expect(writeRecord(storage, 60)).toBe(false)
    expect(readRecord(storage)).toBe(74)
    expect(writeRecord(storage, 90)).toBe(true)
    expect(readRecord(storage)).toBe(90)
  })

  it("treats blocked storage as unavailable", () => {
    const blockedStorage = {
      getItem() {
        throw new Error("blocked")
      },
      setItem() {
        throw new Error("blocked")
      },
    }

    expect(readRecord(blockedStorage)).toBeNull()
    expect(writeRecord(blockedStorage, 42)).toBe(false)
  })
})

describe("share result", () => {
  const payload = {
    title: "Una jornada docente",
    text: "Aguanté 74 segundos con una ratio máxima de 36.",
    url: "https://example.test",
  }

  it("uses native sharing when it is available", async () => {
    const shared: string[] = []

    const outcome = await shareResult(payload, {
      async share(data) {
        shared.push(data.text)
      },
    })

    expect(outcome).toBe("shared")
    expect(shared).toEqual([payload.text])
  })

  it("copies the complete message when native sharing is absent", async () => {
    const copied: string[] = []

    const outcome = await shareResult(payload, {
      clipboard: {
        async writeText(text) {
          copied.push(text)
        },
      },
    })

    expect(outcome).toBe("copied")
    expect(copied[0]).toContain(payload.text)
    expect(copied[0]).toContain(payload.url)
  })

  it("reports unavailable when sharing and clipboard both fail", async () => {
    const outcome = await shareResult(payload, {
      async share() {
        throw new Error("cancelled")
      },
      clipboard: {
        async writeText() {
          throw new Error("blocked")
        },
      },
    })

    expect(outcome).toBe("unavailable")
  })
})
