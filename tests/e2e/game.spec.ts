import { expect, test } from "@playwright/test"

test.describe("runner controls", () => {
  test("starts and jumps with one touch on a phone", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    })
    const page = await context.newPage()

    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    const canvas = page.locator("#game-canvas")
    await expect(canvas).toBeVisible()
    await expect(page.locator("#status-live")).toContainText(
      "Jornada en marcha",
    )

    await canvas.tap({ position: { x: 190, y: 350 } })
    await expect(page.locator("#status-live")).toContainText(
      "El docente ha saltado",
    )

    await context.close()
  })

  test("starts and jumps with Space on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    const canvas = page.locator("#game-canvas")
    await expect(canvas).toBeFocused()
    await page.keyboard.press("Space")
    await expect(page.locator("#status-live")).toContainText(
      "El docente ha saltado",
    )
  })

  test("keeps native Space activation on controls outside gameplay", async ({
    page,
  }) => {
    await page.goto("/")
    const start = page.getByRole("button", { name: "Empezar la jornada" })
    await start.focus()
    await page.keyboard.press("Space")
    await expect(page.locator("#game-canvas")).toBeVisible()
  })

  test("explains a finished jornada and supports an immediate replay", async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    await page.clock.runFor(120_000)

    await expect(
      page.getByRole("heading", { name: "Fin de la jornada" }),
    ).toBeVisible()
    await expect(page.locator("#results .fact-card a")).toHaveCount(4)
    await expect(
      page.getByRole("button", { name: "Volver a intentarlo" }),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Informarme y apoyar" }),
    ).toBeVisible()

    const storedRecord = await page.evaluate(() =>
      localStorage.getItem("jornada-docente-record-seconds"),
    )
    expect(Number(storedRecord)).toBeGreaterThan(0)

    await page.getByRole("button", { name: "Volver a intentarlo" }).click()
    await expect(page.locator("#status-live")).toContainText(
      "Energía 100. Ratio 20",
    )

    await page.reload()
    expect(
      await page.evaluate(() =>
        localStorage.getItem("jornada-docente-record-seconds"),
      ),
    ).toBe(storedRecord)
  })

  test("still renders results when access to localStorage is blocked", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("Blocked", "SecurityError")
        },
      })
    })
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    await expect(
      page.getByRole("heading", { name: "Fin de la jornada" }),
    ).toBeVisible({ timeout: 20_000 })
    await expect(
      page.getByRole("button", { name: "Volver a intentarlo" }),
    ).toBeVisible()
  })
})
