import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")
  await expect(page.locator("canvas")).toBeVisible()
  await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible()
})

test("supports a keyboard-only start and gameplay jump", async ({ page }) => {
  const start = page.getByRole("button", { name: "Empezar" })
  await start.focus()
  await page.keyboard.press("Enter")

  await expect(page.locator("#phaser-root")).toBeFocused()
  await page.keyboard.press("Space")
  await expect(page.getByRole("status")).toContainText("saltado")
})

test("opens motivation and real source links, then restores focus", async ({
  page,
}) => {
  const how = page.getByRole("button", { name: "Cómo funciona" })
  await how.focus()
  await page.keyboard.press("Enter")

  await expect(
    page.getByRole("heading", { name: "Por qué este juego" }),
  ).toBeFocused()
  await expect(page.getByText(/alumnado no es el problema/i)).toBeVisible()
  await page.keyboard.press("Shift+Tab")
  await expect(page.getByRole("button", { name: "Volver" })).toBeFocused()
  await page.getByRole("button", { name: "Datos y fuentes" }).click()
  const sources = page.locator(".source-list a")
  await expect(sources).toHaveCount(4)
  await expect(sources.first()).toHaveAttribute("href", /^https:\/\//)
  await page.getByRole("button", { name: "Volver" }).click()
  await expect(how).toBeFocused()
})

test("space on the mute control does not also jump", async ({ page }) => {
  await page.getByRole("button", { name: "Empezar" }).click()
  await expect(page.locator("#phaser-root")).toBeFocused()
  const mute = page.getByRole("button", { name: "Silenciar sonido" })
  await mute.focus()
  await page.keyboard.press("Space")
  await expect(page.getByRole("button", { name: "Activar sonido" })).toBeFocused()
  await page.waitForTimeout(100)
  expect(
    await page.evaluate(
      () => window.__phaserSlice?.teacherY === window.__phaserSlice?.groundY,
    ),
  ).toBe(true)
})

test("shows useful guidance and information access in portrait", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    page.getByRole("heading", { name: "Gira el dispositivo" }),
  ).toBeVisible()
  await expect(
    page.locator(".portrait-guidance").getByRole("button", {
      name: "Por qué este juego",
    }),
  ).toBeVisible()
  await expect(
    page.locator(".portrait-guidance").getByRole("button", {
      name: "Datos y fuentes",
    }),
  ).toBeVisible()
})

test("has no serious automated accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze()
  expect(
    results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    ),
  ).toEqual([])
})

test("keeps the motivation and sources available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "Una jornada decente" }),
  ).toBeVisible()
  await expect(page.getByText(/alumnado no es el problema/i)).toBeVisible()
  await expect(page.locator(".initial-fallback a")).toHaveCount(4)
  await context.close()
})

test("shows useful content when no graphics renderer is available", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null
  })
  await page.goto("/")
  await expect(page.getByRole("alert")).toContainText(/no ha podido iniciar/i)
  await expect(page.locator("[role='alert'] a")).toHaveCount(4)
})
