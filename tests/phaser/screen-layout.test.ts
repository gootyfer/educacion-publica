import { describe, expect, it } from "vitest"

import {
  SCREEN_LAYOUTS,
  semanticRectStyle,
  waitForPixelFont,
} from "../../src/phaser/ui/ScreenLayout"

describe("shared screen layout", () => {
  it("matches the approved title and wider break panel proportions", () => {
    const title = SCREEN_LAYOUTS.title.panel
    const termBreak = SCREEN_LAYOUTS["term-break"].panel

    expect(title.width / 640).toBeCloseTo(0.45, 1)
    expect(title.height / 360).toBeCloseTo(0.74, 1)
    expect(termBreak.width).toBeGreaterThan(title.width)
  })

  it("keeps the framed share action inside the taller results panel", () => {
    const { panel, actions } = SCREEN_LAYOUTS.results
    const share = actions.share!

    expect(panel.y + panel.height).toBeLessThanOrEqual(352)
    expect(share.y + share.height).toBeLessThan(panel.y + panel.height)
    expect(share.height).toBeGreaterThanOrEqual(32)
  })

  it("converts logical action rectangles to literal canvas percentages", () => {
    expect(semanticRectStyle(SCREEN_LAYOUTS.title.actions.start!)).toEqual({
      left: "31.875%",
      top: "52.777778%",
      width: "36.25%",
      height: "13.888889%",
    })
  })

  it("keeps action geometry available if the pixel font never loads", async () => {
    const pendingFonts = { load: () => new Promise<FontFace[]>(() => undefined) }
    await waitForPixelFont(pendingFonts, 1)

    expect(semanticRectStyle(SCREEN_LAYOUTS.results.actions.retry!)).toEqual({
      left: "28.59375%",
      top: "58.333333%",
      width: "42.8125%",
      height: "13.333333%",
    })
  })

  it("falls back when the pixel font request rejects", async () => {
    const failedFonts = {
      load: () => Promise.reject(new Error("font unavailable")),
    }

    await expect(waitForPixelFont(failedFonts, 50)).resolves.toBeUndefined()
  })
})
