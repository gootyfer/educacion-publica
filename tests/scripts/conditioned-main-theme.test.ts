// @ts-expect-error The implementation is ESM JavaScript without a declaration file.
import { buildConditionedMainThemePlan } from "../../scripts/conditioned-main-theme-plan.mjs"
// @ts-expect-error Vitest runs in Node; this browser app intentionally omits @types/node.
import { readFile } from "node:fs/promises"

import { describe, expect, it } from "vitest"

describe("conditioned main theme", () => {
  it("conditions a completely generated 80-second song on the approved reference", () => {
    const plan = buildConditionedMainThemePlan("source-song")

    expect(plan.chunks).toHaveLength(4)
    expect(
      plan.chunks.reduce(
        (total: number, chunk: { duration_ms: number }) =>
          total + chunk.duration_ms,
        0,
      ),
    ).toBe(80_000)
    expect(plan.chunks.map((chunk: { duration_ms: number }) => chunk.duration_ms)).toEqual([
      20_000,
      20_000,
      20_000,
      20_000,
    ])
    for (const chunk of plan.chunks) {
      expect(chunk).not.toHaveProperty("song_id")
      expect(chunk).not.toHaveProperty("range")
      expect(chunk.context_adherence).toBe("high")
      expect(chunk.negative_styles).toEqual(
        expect.arrayContaining(["vocals", "speech", "lyrics"]),
      )
    }
    expect(plan.chunks[0]).toMatchObject({
      conditioning_ref: {
        song_id: "source-song",
        range: { start_ms: 0, end_ms: 30_000 },
      },
      condition_strength: "xhigh",
    })
  })

  it("validates the tracked reference before making a paid API request", async () => {
    const source = await readFile(
      "scripts/generate-conditioned-main-theme.mjs",
      "utf8",
    )

    expect(source).toContain(
      'join(process.cwd(), "public", "audio", "approved", "main-theme.mp3")',
    )
    expect(source.indexOf("await readFile(REFERENCE_FILE)")).toBeLessThan(
      source.indexOf("await fetch("),
    )
  })
})
