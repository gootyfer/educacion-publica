import { expect, test } from "@playwright/test"

import type { GameDebugState } from "../../src/phaser/scenes/GameScene"

declare global {
  interface Window {
    __phaserSlice?: GameDebugState
  }
}

test("uses the three seasonal school backgrounds in course order", async ({
  page,
}) => {
  const backgrounds: string[] = []
  for (const term of [1, 2, 3]) {
    await page.goto(`/phaser.html?term=${term}&seed=2026`)
    await expect(page.locator("canvas")).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => window.__phaserSlice?.term))
      .toBe(term)
    backgrounds.push(
      await page.evaluate(() => window.__phaserSlice?.background ?? ""),
    )
  }

  expect(backgrounds).toEqual(["term1", "term2", "term3"])
})

test("deterministic impacts are recoverable and followers stay grounded", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/phaser.html?term=2&seed=9")
  await expect(page.locator("#slice-status")).toContainText(/choque/i, {
    timeout: 10_000,
  })

  const state = await page.evaluate(() => window.__phaserSlice)
  expect(state?.energy).toBeGreaterThan(0)
  expect(state?.energy).toBeLessThan(100)
  expect(state?.phase).toBe("running")
  expect(state?.companionYs.every((y) => y === state.groundY)).toBe(true)
})
