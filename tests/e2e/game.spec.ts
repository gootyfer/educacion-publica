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
})
