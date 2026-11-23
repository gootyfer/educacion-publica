import { expect, test, type Page } from "@playwright/test"

async function continueTerm(page: Page) {
  const button = page.getByRole("button", { name: "Continuar el curso" })
  await expect(button).toBeEnabled({ timeout: 5_000 })
  await button.click()
}

async function finishFastCourse(page: Page) {
  await continueTerm(page)
  await continueTerm(page)
  await expect(
    page.getByRole("button", { name: "Volver a intentar" }),
  ).toBeVisible({ timeout: 5_000 })
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
})

for (const viewport of [
  { width: 844, height: 390 },
  { width: 740, height: 360 },
]) {
  test(`aligns title actions with the canvas at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto("/")
    const canvas = page.locator("canvas")
    await expect(canvas).toBeVisible()
    const canvasBox = await canvas.boundingBox()
    const startBox = await page
      .getByRole("button", { name: "Empezar" })
      .boundingBox()
    if (!canvasBox || !startBox) throw new Error("Missing title bounds")
    expect(startBox.x + startBox.width / 2).toBeCloseTo(
      canvasBox.x + (320 / 640) * canvasBox.width,
      0,
    )
    expect(startBox.y + startBox.height / 2).toBeCloseTo(
      canvasBox.y + (215 / 360) * canvasBox.height,
      0,
    )
    await page.screenshot({
      path: testInfo.outputPath(`title-${viewport.width}x${viewport.height}.png`),
    })
    await page.getByRole("button", { name: "Cómo funciona" }).click()
    await expect(
      page.getByRole("heading", { name: "Por qué este juego" }),
    ).toBeVisible()
  })
}

test("keeps the whole game inside iPhone landscape safe areas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")
  await page.locator(".app-shell").evaluate((shell) => {
    shell.style.setProperty("--safe-top", "6px")
    shell.style.setProperty("--safe-right", "47px")
    shell.style.setProperty("--safe-bottom", "21px")
    shell.style.setProperty("--safe-left", "47px")
    shell.style.padding = "var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)"
  })

  const stageBox = await page.locator(".game-stage").boundingBox()
  if (!stageBox) throw new Error("Game stage without bounds")

  expect(stageBox.x).toBeGreaterThanOrEqual(47)
  expect(stageBox.x + stageBox.width).toBeLessThanOrEqual(844 - 47)
  expect(stageBox.y).toBeGreaterThanOrEqual(6)
  expect(stageBox.y + stageBox.height).toBeLessThanOrEqual(390 - 21)
})

test("completes three terms, both refills and ten grounded followers", async ({
  page,
}) => {
  await page.goto("/?slice=1&fast=1&seed=2026")
  await expect(page.locator("[data-energy-status]")).toContainText(/Energía:/)
  await expect
    .poll(() => page.evaluate(() => window.__phaserSlice?.companionCount))
    .toBe(10)
  await finishFastCourse(page)
  await expect(page.locator("[data-results-summary]")).toContainText(
    /Tiempo total:.*Ratio máxima:/,
  )

  await page.getByRole("button", { name: "Por qué este juego" }).click()
  await expect(page.getByText(/alumnado no es el problema/i)).toBeVisible()
  await page.getByRole("button", { name: "Datos y fuentes" }).click()
  await expect(page.locator(".source-list a")).toHaveCount(4)
})

test("uses the share fallback and returns to the title on retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    })
  })
  await page.goto("/?slice=1&fast=1")
  await finishFastCourse(page)
  await page.getByRole("button", { name: "Compartir" }).click()
  await expect(page.getByRole("status")).toContainText("copiado")

  await page.getByRole("button", { name: "Volver a intentar" }).click()
  await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible()
})

test("painted results controls activate the matching semantic action", async ({
  page,
}) => {
  await page.goto("/?slice=1&fast=1")
  await finishFastCourse(page)
  const canvas = page.locator("canvas")
  const box = await canvas.boundingBox()
  if (!box) throw new Error("Canvas without bounds")
  await page.mouse.click(
    box.x + (320 / 640) * box.width,
    box.y + (286 / 360) * box.height,
  )
  await expect(
    page.getByRole("heading", { name: "Por qué este juego" }),
  ).toBeVisible()
})

test("keeps one active game and a bounded obstacle pool after retries", async ({
  page,
}) => {
  test.setTimeout(30_000)
  await page.goto("/?slice=1&fast=1")

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await finishFastCourse(page)
    const diagnostics = await page.evaluate(() => window.__gameDiagnostics)
    expect(diagnostics?.activeScenes).toBe(1)
    expect(diagnostics?.inputBindings).toBe(3)
    expect(diagnostics?.obstaclePoolSize).toBe(4)
    expect(diagnostics?.frameMs.length).toBeLessThanOrEqual(120)

    if (attempt < 4) {
      await page.getByRole("button", { name: "Volver a intentar" }).click()
      await page.getByRole("button", { name: "Empezar" }).click()
    }
  }
})

test("continues when one visual asset is unavailable", async ({ page }) => {
  await page.route("**/game/obstacles/obstacles.png", (route) => route.abort())
  await page.goto("/")
  await expect(page.getByRole("alert")).toContainText(/no ha podido cargar/i)
  await expect(page.locator("[role='alert'] a")).toHaveCount(4)
})

test("starts with the fallback font when the pixel font is unavailable", async ({
  page,
}) => {
  await page.route(/\.woff2?(?:\?|$)/, (route) => route.abort())
  await page.goto("/")

  await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible()
  await page.getByRole("button", { name: "Empezar" }).click()
  await expect(page.locator("[data-energy-status]")).toContainText("Energía:")
})
