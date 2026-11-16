import { expect, test } from "@playwright/test"

test("keeps a bounded pool and stable frame samples at 740 by 360", async ({
  page,
}) => {
  await page.setViewportSize({ width: 740, height: 360 })
  await page.goto("/?slice=1&seed=2026")
  await expect
    .poll(() =>
      page.evaluate(() => window.__gameDiagnostics?.frameMs.length ?? 0),
    )
    .toBeGreaterThanOrEqual(30)

  const diagnostics = await page.evaluate(() => window.__gameDiagnostics)
  expect(diagnostics?.activeScenes).toBe(1)
  expect(diagnostics?.obstaclePoolSize).toBe(1)
  expect(diagnostics?.frameMs.length).toBeLessThanOrEqual(120)
  const regularFrames = diagnostics?.frameMs.filter((sample) => sample < 100) ?? []
  const average =
    regularFrames.reduce((total, sample) => total + sample, 0) /
    regularFrames.length
  expect(average).toBeLessThan(35)
})
