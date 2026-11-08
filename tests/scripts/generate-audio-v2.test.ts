// @ts-expect-error Vitest runs in Node; this browser app intentionally omits @types/node.
import { readFile } from "node:fs/promises"

import { describe, expect, it } from "vitest"

describe("audio v2 generator", () => {
  it("validates the tracked approved reference before any paid API request", async () => {
    const source = await readFile("scripts/generate-audio-v2.mjs", "utf8")
    const referenceDeclaration = source.match(
      /const REFERENCE_FILE = ([^\n]+)/,
    )?.[1]

    expect(referenceDeclaration).toContain(
      '"public", "audio", "approved", "main-theme.mp3"',
    )
    expect(source.indexOf("await readFile(REFERENCE_FILE)")).toBeLessThan(
      source.indexOf("await fetch("),
    )
  })
})
