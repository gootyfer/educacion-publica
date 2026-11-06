import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical",
  )
  expect(serious).toEqual([])
}

async function finishJornada(page: Page) {
  await page.clock.install()
  await page.goto("/")
  await page.getByRole("button", { name: "Empezar la jornada" }).click()
  await page.clock.runFor(120_000)
  await expect(
    page.getByRole("heading", { name: "Fin de la jornada" }),
  ).toBeVisible()
}

test.describe("accessible journey", () => {
  test("has no serious axe violations on the intro or results", async ({
    page,
  }) => {
    await page.goto("/")
    await expectNoSeriousAxeViolations(page)

    await finishJornada(page)
    await expectNoSeriousAxeViolations(page)
  })

  test("supports the complete play and replay flow from the keyboard", async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto("/")
    await page.keyboard.press("Tab")
    await expect(
      page.getByRole("button", { name: "Empezar la jornada" }),
    ).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.locator("#game-canvas")).toBeFocused()
    await page.keyboard.press("Space")
    await expect(page.locator("#status-live")).toContainText(
      "El docente ha saltado",
    )

    await page.clock.runFor(120_000)
    await expect(page.locator("#results-title")).toBeFocused()

    const retry = page.getByRole("button", { name: "Volver a intentarlo" })
    await retry.focus()
    await page.keyboard.press("Enter")
    await expect(page.locator("#game-canvas")).toBeFocused()
  })

  test("keeps the purpose and four source links without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto("/")

    await expect(
      page.getByRole("heading", { name: "Una jornada docente" }),
    ).toBeVisible()
    await expect(
      page.getByText(/entender las reivindicaciones/i).first(),
    ).toBeVisible()
    await expect(page.locator("a[data-fallback-source]")).toHaveCount(4)
    await context.close()
  })

  test("offers a non-animated explanation for reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")

    const readJourney = page.getByRole("button", { name: "Leer la jornada" })
    await expect(readJourney).toBeVisible()
    await readJourney.click()
    await expect(
      page.getByRole("heading", { name: "La jornada, explicada" }),
    ).toBeVisible()
    await expect(page.locator("#results .fact-card a")).toHaveCount(4)
  })

  for (const viewport of [
    { width: 320, height: 568, dpr: 1 },
    { width: 390, height: 844, dpr: 3 },
    { width: 844, height: 390, dpr: 1 },
    { width: 1280, height: 800, dpr: 1 },
  ]) {
    test(`does not overflow horizontally at ${viewport.width}x${viewport.height} dpr ${viewport.dpr}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.dpr,
      })
      const page = await context.newPage()
      await page.goto("/")

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }))
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth)

      const startBox = await page
        .getByRole("button", { name: "Empezar la jornada" })
        .boundingBox()
      expect(startBox).not.toBeNull()
      expect(startBox?.x).toBeGreaterThanOrEqual(0)
      expect((startBox?.x ?? 0) + (startBox?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      )
      await context.close()
    })
  }
})
