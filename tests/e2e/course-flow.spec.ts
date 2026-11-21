import { expect, test } from "@playwright/test"

import type { GameDebugState } from "../../src/phaser/scenes/GameScene"

declare global {
  interface Window {
    __phaserSlice?: GameDebugState
    __courseSamples?: Array<{
      term: number
      companionCount: number
      pressure: number
    }>
    __sceneHistory?: Array<{
      screen: string
      term?: number
      background?: string
      backgroundOffset?: number
    }>
  }
}

test("completes the fast course with 2→9 resets and seasonal breaks", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/?slice=1&fast=1&seed=2026")
  await page.waitForFunction(() => window.__phaserSlice !== undefined)

  for (const term of [1, 2, 3]) {
    await expect
      .poll(() => page.evaluate(() => window.__phaserSlice?.term))
      .toBe(term)
    await expect
      .poll(() =>
        page.evaluate(
          (currentTerm) =>
            window.__courseSamples?.some(
              ({ term, companionCount }) =>
                term === currentTerm && companionCount === 9,
            ) ?? false,
          term,
        ),
      )
      .toBe(true)
    if (term < 3) {
      const continueButton = page.getByRole("button", {
        name: "Continuar el curso",
      })
      await expect(continueButton).toBeEnabled()
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      )
      await page.screenshot({
        path: testInfo.outputPath(`break-term-${term}.png`),
      })
      await continueButton.click()
    }
  }

  await expect(page.getByRole("button", { name: "Volver a intentar" })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("results.png") })
  const samples = await page.evaluate(() => window.__courseSamples ?? [])
  for (const term of [1, 2, 3]) {
    expect(samples.some((sample) => sample.term === term && sample.companionCount === 2)).toBe(true)
    expect(samples.some((sample) => sample.term === term && sample.companionCount === 9)).toBe(true)
  }
  const history = await page.evaluate(() => window.__sceneHistory ?? [])
  expect(history).toEqual(
    expect.arrayContaining([
      { screen: "term-break", term: 1, background: "panoramaTerm2" },
      { screen: "term-break", term: 2, background: "springBreak" },
      { screen: "results", background: "panoramaTerm3" },
    ]),
  )
  await expect(page.locator("[data-results-summary]")).toContainText(/Ratio máxima:/)
})

test("makes refill controls ready immediately with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?slice=1&fast=1")
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            window.__sceneHistory?.some(
              ({ screen }) => screen === "term-break",
            ) ?? false,
        ),
      { timeout: 5_000 },
    )
    .toBe(true)
  await expect(
    page.getByRole("button", { name: "Continuar el curso" }),
  ).toBeEnabled({ timeout: 500 })
})

test("uses the three seasonal school backgrounds in course order", async ({
  page,
}) => {
  const backgrounds: string[] = []
  for (const term of [1, 2, 3]) {
    await page.goto(`/?term=${term}&seed=2026`)
    await expect(page.locator("canvas")).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => window.__phaserSlice?.term))
      .toBe(term)
    backgrounds.push(
      await page.evaluate(() => window.__phaserSlice?.background ?? ""),
    )
  }

  expect(backgrounds).toEqual([
    "panoramaTerm1",
    "panoramaTerm2",
    "panoramaTerm3",
  ])
})

test("deterministic impacts are recoverable and followers stay grounded", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/?term=2&seed=9")
  await expect(page.getByRole("status")).toContainText(/energía/i, {
    timeout: 10_000,
  })

  const state = await page.evaluate(() => window.__phaserSlice)
  expect(state?.energy).toBeGreaterThan(0)
  expect(state?.energy).toBeLessThan(100)
  expect(state?.phase).toBe("running")
  expect(
    state?.companionYs.every(
      (y) =>
        y === state.groundY ||
        y === state.groundY - 10 ||
        y === state.groundY - 20,
    ),
  ).toBe(true)
})

test("the same obstacle can be cleared by jumping or hit deliberately", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/?term=1&seed=2026")
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            Math.min(
              ...(window.__phaserSlice?.obstacles.map(({ x }) => x) ?? [680]),
            ),
        ),
      { intervals: [10], timeout: 8_000 },
    )
    .toBeLessThan(290)
  await page.locator("canvas").click()
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            Math.min(
              ...(window.__phaserSlice?.obstacles.map(({ x }) => x) ?? [680]),
            ),
        ),
      { intervals: [10], timeout: 3_000 },
    )
    .toBeLessThan(100)
  expect(
    await page.evaluate(
      () => (window.__phaserSlice as unknown as { impactCount?: number })?.impactCount,
    ),
  ).toBe(0)

  await page.goto("/?term=1&seed=2026")
  await expect
    .poll(
      () => page.evaluate(() => window.__phaserSlice?.impactCount),
      { timeout: 10_000 },
    )
    .toBe(1)
})
