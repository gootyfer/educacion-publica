import { expect, test } from "@playwright/test"

test("keeps a bounded pool and stable frame samples at 740 by 360", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 740, height: 360 })
  await page.goto("/?term=3&perf=1&stress=1&pressure=1&seed=2026")
  await expect
    .poll(() =>
      page.evaluate(() => window.__gameDiagnostics?.activeObstacleCount ?? 0),
    )
    .toBe(4)
  await expect
    .poll(() =>
      page.evaluate(() => window.__gameDiagnostics?.frameMs.length ?? 0),
    )
    .toBeGreaterThanOrEqual(60)

  const diagnostics = await page.evaluate(() => window.__gameDiagnostics)
  expect(diagnostics?.activeScenes).toBe(1)
  expect(diagnostics?.obstaclePoolSize).toBe(4)
  expect(diagnostics?.activeObstacleCount).toBe(4)
  expect(await page.evaluate(() => window.__phaserSlice?.companionCount)).toBe(10)
  await page.screenshot({
    path: testInfo.outputPath("gameplay-ten-companions.png"),
  })
  expect(diagnostics?.frameMs.length).toBeLessThanOrEqual(120)
  const regularFrames = diagnostics?.frameMs.slice(-60) ?? []
  const average =
    regularFrames.reduce((total, sample) => total + sample, 0) /
    regularFrames.length
  const p95 = [...regularFrames].sort((a, b) => a - b)[
    Math.floor(regularFrames.length * 0.95)
  ]
  expect(average).toBeLessThan(25)
  expect(p95).toBeLessThan(35)
})
