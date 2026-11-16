// @ts-expect-error The budget implementation is ESM JavaScript without declarations.
import { checkGameBudget } from "../../scripts/check-game-budget.mjs"
// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { join } from "node:path"
// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { tmpdir } from "node:os"

import { describe, expect, it } from "vitest"

describe("production game budget", () => {
  it("excludes audio and fails when critical files exceed the limit", async () => {
    const root = await mkdtemp(join(tmpdir(), "jornada-budget-"))
    try {
      await mkdir(join(root, "assets"))
      await mkdir(join(root, "game"))
      await mkdir(join(root, "audio"))
      await writeFile(join(root, "assets", "app.js"), randomBytes(8_000))
      await writeFile(join(root, "game", "teacher.png"), randomBytes(8_000))
      await writeFile(join(root, "audio", "theme.mp3"), randomBytes(40_000))

      const result = await checkGameBudget(root, 4_000)
      expect(result.ok).toBe(false)
      expect(result.files).toEqual([
        "assets/app.js",
        "game/teacher.png",
      ])
      expect(result.files).not.toContain("audio/theme.mp3")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

function randomBytes(length: number): Uint8Array {
  let value = 0x12345678
  return Uint8Array.from({ length }, () => {
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    return value & 0xff
  })
}
