import { expect, test, type Page } from "@playwright/test"

import type { GameDebugState } from "../../src/phaser/scenes/GameScene"

declare global {
  interface Window {
    __phaserSlice?: GameDebugState
  }
}

async function openSlice(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height })
  await page.goto("/?slice=1")
  await expect(page.locator("canvas")).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__phaserSlice)).toBeTruthy()
}

for (const viewport of [
  { name: "mobile landscape", width: 844, height: 390 },
  { name: "desktop", width: 1280, height: 800 },
]) {
  test(`runs the Phaser slice on ${viewport.name}`, async ({ page }) => {
    await openSlice(page, viewport.width, viewport.height)
    const canvas = page.locator("canvas")

    await expect(canvas).toHaveAttribute("width", "640")
    await expect(canvas).toHaveAttribute("height", "360")
    await canvas.click()
    await expect(page.getByRole("status")).toContainText("saltado")
    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = window.__phaserSlice
          return Boolean(
            state &&
              state.teacherY < state.groundY &&
              state.companionYs.every((y) => y === state.groundY),
          )
        }),
      )
      .toBe(true)

    await page.keyboard.press("Space")
    await expect(page.locator("canvas")).toHaveCount(1)
    await expect(page.locator("[data-hud='ratio']")).toHaveCount(0)
    await expect(page.locator("[data-hud='term']")).toHaveCount(0)
  })
}

test("a collision lowers energy without ending the slice", async ({ page }) => {
  await openSlice(page, 844, 390)

  await expect(page.getByRole("status")).toContainText(/energía/i, {
    timeout: 8_000,
  })
  const state = await page.evaluate(() => window.__phaserSlice)
  expect(state?.energy).toBeLessThan(100)
  expect(state?.phase).toBe("running")
})
