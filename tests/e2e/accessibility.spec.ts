import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(({ impact }) =>
    impact === "serious" || impact === "critical",
  )
  expect(serious).toEqual([])
}

async function advanceUntilVisible(
  page: Page,
  locator: Locator,
  maxVirtualMs = 150_000,
) {
  for (let elapsed = 0; elapsed < maxVirtualMs; elapsed += 1_000) {
    await page.clock.runFor(1_000)
    if (await locator.isVisible()) return
  }
  throw new Error(`No apareció el estado esperado en ${maxVirtualMs} ms`)
}

async function continueHolidayWithKeyboard(page: Page, title: string) {
  await reachHoliday(page, title)
  const continueButton = page.getByRole("button", {
    name: "Continuar el curso",
  })
  await continueButton.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#game-canvas")).toBeFocused()
}

async function reachHoliday(page: Page, title: string) {
  await advanceUntilVisible(page, page.getByRole("heading", { name: title }))
}

test.describe("accessible journey", () => {
  test("has no serious axe violations on the intro, holidays or results", async ({
    page,
  }) => {
    await page.goto("/")
    await expectNoSeriousAxeViolations(page)

    await page.clock.install()
    await page.getByRole("button", { name: "Empezar la jornada" }).click()
    await reachHoliday(page, "Vacaciones de Navidad")
    await expectNoSeriousAxeViolations(page)
    await page.getByRole("button", { name: "Continuar el curso" }).click()
    await reachHoliday(page, "Vacaciones de Semana Santa")
    await expectNoSeriousAxeViolations(page)
    await page.getByRole("button", { name: "Continuar el curso" }).click()
    await advanceUntilVisible(
      page,
      page.getByRole("heading", { name: "Fin de curso" }),
    )
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

    await continueHolidayWithKeyboard(page, "Vacaciones de Navidad")
    await continueHolidayWithKeyboard(page, "Vacaciones de Semana Santa")
    await advanceUntilVisible(
      page,
      page.getByRole("heading", { name: "Fin de curso" }),
    )
    await expect(page.locator("#results-title")).toBeFocused()
    await expect(page.locator("#results-title")).toHaveCSS(
      "outline-style",
      "none",
    )

    const retry = page.getByRole("button", { name: "Volver a intentarlo" })
    await retry.focus()
    await page.keyboard.press("Enter")
    await expect(page.locator("#game-canvas")).toBeFocused()
  })

  test("exposes and persists an accessible sound preference", async ({ page }) => {
    await page.goto("/")
    const mute = page.getByRole("button", { name: "Silenciar sonido" })
    await expect(mute).toBeVisible()

    await mute.click()
    const unmute = page.getByRole("button", { name: "Activar sonido" })
    await expect(unmute).toBeVisible()

    await page.reload()
    await expect(
      page.getByRole("button", { name: "Activar sonido" }),
    ).toBeVisible()
  })

  test("keeps the purpose and four source links without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto("/")

    await expect(
      page.locator(".noscript-panel").getByText(/un curso en tres trimestres/i),
    ).toBeVisible()

    await expect(
      page
        .locator(".noscript-panel")
        .getByRole("heading", { name: "Una jornada decente" }),
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

    await expect(
      page.getByText("Educación pública y de calidad", { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Una jornada decente" }),
    ).toBeVisible()
    await expect(
      page.getByText(
        "Un curso en tres trimestres para entender las reivindicaciones del profesorado: corre y salta mientras la ratio crece.",
        { exact: true },
      ),
    ).toBeVisible()

    const readJourney = page.getByRole("button", { name: "Cómo funciona" })
    await expect(readJourney).toBeVisible()
    await readJourney.click()
    await expect(
      page.locator("#results .eyebrow").getByText("Cómo funciona", {
        exact: true,
      }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Una jornada decente" }),
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Un curso en tres trimestres" }),
    ).toBeVisible()
    await expect(page.locator("[data-term-summary]")).toHaveCount(3)
    await expect(page.locator("[data-obstacle]")).toHaveCount(6)
    await expect(page.locator("#text-journey")).toContainText(
      "Atender a más alumn@s consume más energía.",
    )
    await expect(page.locator("#text-journey")).toContainText(
      "El salto se hace más corto y los obstáculos siguen llegando.",
    )
    await expect(page.locator("#text-journey")).toContainText(
      "En vacaciones recuperas energía, pero los obstáculos siguen.",
    )
    await expect(page.locator("#text-journey")).not.toContainText(
      "septiembre a diciembre",
    )
    await expect(page.locator("#text-journey")).not.toContainText(
      "enero a abril",
    )
    await expect(page.locator("#text-journey")).not.toContainText(
      "abril a junio",
    )
    await expect(page.locator("#results .fact-card a")).toHaveCount(4)
    const backButton = page.getByRole("button", { name: "Volver al inicio" })
    const [buttonBox, resultsBox] = await Promise.all([
      backButton.boundingBox(),
      page.locator("#results").boundingBox(),
    ])
    expect(buttonBox).not.toBeNull()
    expect(resultsBox).not.toBeNull()
    expect(buttonBox?.width ?? 0).toBeGreaterThan(
      (resultsBox?.width ?? 0) * 0.8,
    )
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

      await page.getByRole("button", { name: "Empezar la jornada" }).click()
      await expect(page.locator("#intro")).toBeHidden()
      const canvas = page.locator("#game-canvas")
      await expect(canvas).toBeVisible()
      const canvasBox = await canvas.boundingBox()
      expect(canvasBox).not.toBeNull()
      expect(canvasBox?.y).toBeGreaterThanOrEqual(0)
      expect((canvasBox?.y ?? 0) + (canvasBox?.height ?? 0)).toBeLessThanOrEqual(
        viewport.height,
      )
      await context.close()
    })
  }
})
