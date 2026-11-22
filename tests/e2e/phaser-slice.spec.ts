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

test("scrolls and wraps the September panorama on integer pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/?slice=1&backgroundOffset=3167")
  await expect(page.locator("canvas")).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__phaserSlice)).toBeTruthy()
  await expect
    .poll(() => page.evaluate(() => window.__phaserSlice?.backgroundOffset))
    .toBeGreaterThan(0)
  await expect
    .poll(() => page.evaluate(() => window.__phaserSlice?.backgroundOffset ?? 999))
    .toBeLessThan(100)
  const state = await page.evaluate(() => window.__phaserSlice)
  expect(state?.backgroundTexture).toBe("panoramaTerm1")
  expect(Number.isInteger(state?.backgroundOffset)).toBe(true)
})

test("starts each term at its matching seasonal panorama", async ({ page }) => {
  for (const [term, texture] of [
    [1, "panoramaTerm1"],
    [2, "panoramaTerm2"],
    [3, "panoramaTerm3"],
  ] as const) {
    await page.goto(`/?slice=1&term=${term}`)
    await page.waitForFunction(
      (expectedTexture) =>
        window.__phaserSlice?.backgroundTexture === expectedTexture,
      texture,
    )
    await expect
      .poll(() =>
        page.evaluate(
          (currentTerm) =>
            window.__sceneHistory?.find(
              ({ screen, term }) => screen === "game" && term === currentTerm,
            )?.backgroundOffset,
          term,
        ),
      )
      .toBe(0)
  }
})

for (const viewport of [
  { name: "mobile landscape", width: 844, height: 390 },
  { name: "desktop", width: 1280, height: 800 },
]) {
  test(`runs the Phaser slice on ${viewport.name}`, async ({ page }) => {
    await openSlice(page, viewport.width, viewport.height)
    const canvas = page.locator("canvas")

    await expect(canvas).toHaveAttribute("width", "640")
    await expect(canvas).toHaveAttribute("height", "360")
    expect(await page.evaluate(() => window.__phaserSlice?.groundY)).toBe(340)
    await canvas.click()
    await expect(page.getByRole("status")).toContainText("saltado")
    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = window.__phaserSlice
          return Boolean(
            state &&
              state.teacherY < state.groundY &&
              state.companionYs.every(
                (y) =>
                  y === state.groundY ||
                  y === state.groundY + 8 ||
                  y === state.groundY - 8 ||
                  y === state.groundY - 16,
              ),
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

test("shows multiple but never more than four obstacles at high pressure", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/?slice=1&term=3&perf=1&pressure=1&seed=2026")
  await expect(page.locator("canvas")).toBeVisible()
  let maximumActive = 0
  for (let index = 0; index < 24; index += 1) {
    await page.waitForTimeout(250)
    maximumActive = Math.max(
      maximumActive,
      (await page.evaluate(
        () => window.__phaserSlice?.activeObstacleCount,
      )) ?? 0,
    )
  }
  expect(maximumActive).toBeGreaterThanOrEqual(2)
  const state = await page.evaluate(() => window.__phaserSlice)
  expect(state?.obstaclePoolSize).toBe(4)
  expect(state?.activeObstacleCount).toBeLessThanOrEqual(4)
  expect(state?.obstacles.every(({ kind }) => Boolean(kind))).toBe(true)
})
