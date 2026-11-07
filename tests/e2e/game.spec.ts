import { expect, test, type Locator, type Page } from "@playwright/test"

declare global {
  interface Window {
    __audioEvents: string[]
  }
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

async function continueHoliday(page: Page, title: string) {
  const heading = page.getByRole("heading", { name: title })
  await advanceUntilVisible(page, heading)
  const continueButton = page.getByRole("button", {
    name: "Continuar el curso",
  })
  await expect(continueButton).toBeEnabled()
  await continueButton.evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  await expect(page.locator("#game-canvas")).toBeFocused()
}

async function completeCourse(page: Page) {
  await continueHoliday(page, "Vacaciones de Navidad")
  await continueHoliday(page, "Vacaciones de Semana Santa")
  await advanceUntilVisible(
    page,
    page.getByRole("heading", { name: "Fin de curso" }),
  )
}

test.describe("runner controls", () => {
  test("starts approved audio only after interaction and lets the player mute it", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const audioEvents: string[] = []
      Object.defineProperty(window, "__audioEvents", {
        value: audioEvents,
        configurable: true,
      })
      HTMLMediaElement.prototype.play = function () {
        audioEvents.push(this.getAttribute("src") ?? this.currentSrc)
        return Promise.resolve()
      }
      HTMLMediaElement.prototype.pause = function () {}
    })
    await page.goto("/")

    expect(
      await page.evaluate(() =>
        window.__audioEvents.slice(),
      ),
    ).toEqual([])

    await page.getByRole("button", { name: "Empezar la jornada" }).click()
    await expect
      .poll(() =>
        page.evaluate(() =>
          window.__audioEvents.some(
            (src) => src.includes("/audio/approved/main-theme.mp3"),
          ),
        ),
      )
      .toBe(true)

    await page.getByRole("button", { name: "Silenciar sonido" }).click()
    await expect(
      page.getByRole("button", { name: "Activar sonido" }),
    ).toBeVisible()
  })

  test("keeps the game responsive when every audio file is unavailable", async ({
    page,
  }) => {
    await page.route("**/audio/approved/**", (route) => route.abort())
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = () =>
        Promise.reject(new DOMException("Missing media", "NotSupportedError"))
    })
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()
    await page.keyboard.press("Space")

    await expect(page.locator("#status-live")).toContainText(
      "El docente ha saltado",
    )
    await expect(page.locator("#game-canvas")).toBeVisible()
  })

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
      "Curso en marcha",
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

  test("connects all three terms through the two holiday transitions", async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    await continueHoliday(page, "Vacaciones de Navidad")
    await expect(page.locator("#status-live")).toContainText(
      "Segundo trimestre",
    )
    await continueHoliday(page, "Vacaciones de Semana Santa")
    await expect(page.locator("#status-live")).toContainText(
      "Tercer trimestre",
    )
    await advanceUntilVisible(
      page,
      page.getByRole("heading", { name: "Fin de curso" }),
    )
    await expect(page.locator(".term-result")).toHaveCount(3)
    await expect(page.locator("[data-discovered-obstacle]")).toHaveCount(0)
  })

  test("waits indefinitely for the player before starting the next term", async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    const christmas = page.getByRole("heading", {
      name: "Vacaciones de Navidad",
    })
    await advanceUntilVisible(page, christmas)
    const continueButton = page.getByRole("button", {
      name: "Continuar el curso",
    })
    await expect(continueButton).toBeEnabled()

    await page.clock.runFor(60_000)
    await expect(christmas).toBeVisible()
    await expect(page.locator("#status-live")).not.toContainText(
      "Segundo trimestre",
    )

    await continueButton.evaluate((button: HTMLButtonElement) => {
      button.click()
      button.click()
    })
    await expect(page.locator("#status-live")).toContainText(
      "Segundo trimestre",
    )
    await expect(page.locator("#game-canvas")).toBeFocused()
  })

  test("does not skip a holiday while the page is hidden", async ({ page }) => {
    await page.clock.install()
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    const christmas = page.getByRole("heading", {
      name: "Vacaciones de Navidad",
    })
    await advanceUntilVisible(page, christmas)
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      })
      document.dispatchEvent(new Event("visibilitychange"))
    })
    await page.clock.runFor(60_000)
    await expect(christmas).toBeVisible()

    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      })
      document.dispatchEvent(new Event("visibilitychange"))
    })
    await expect(
      page.getByRole("button", { name: "Continuar el curso" }),
    ).toBeEnabled()
  })

  test("explains a finished course and supports an immediate replay", async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto("/")
    await page.getByRole("button", { name: "Empezar la jornada" }).click()

    await completeCourse(page)

    await expect(
      page.getByRole("heading", { name: "Fin de curso" }),
    ).toBeVisible()
    await expect(page.locator("#results .fact-card a")).toHaveCount(4)
    await expect(
      page.getByRole("button", { name: "Volver a intentarlo" }),
    ).toBeVisible()
    const supportLink = page.getByRole("link", { name: "Informarme y apoyar" })
    await expect(supportLink).toBeVisible()
    await expect(supportLink).toHaveAttribute("href", "https://menoslectivas.org/")
    await expect(
      page.getByRole("heading", { name: "Lo que apareció durante el curso" }),
    ).toHaveCount(0)
    await expect(page.locator("#results")).not.toContainText(
      "Al aumentar la ratio, atender al grupo consumía más energía y tu salto se hacía más corto.",
    )

    const storedRecord = await page.evaluate(() =>
      localStorage.getItem("curso-docente-record-seconds-v2"),
    )
    expect(Number(storedRecord)).toBeGreaterThan(0)

    await page.getByRole("button", { name: "Volver a intentarlo" }).click()
    await expect(page.locator("#status-live")).toContainText(
      "Energía 100. Ratio 20",
    )

    await page.reload()
    expect(
      await page.evaluate(() =>
        localStorage.getItem("curso-docente-record-seconds-v2"),
      ),
    ).toBe(storedRecord)
  })

  test("still renders results when access to localStorage is blocked", async ({
    page,
  }) => {
    await page.clock.install()
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
    await completeCourse(page)

    await expect(
      page.getByRole("heading", { name: "Fin de curso" }),
    ).toBeVisible({ timeout: 20_000 })
    await expect(
      page.getByRole("button", { name: "Volver a intentarlo" }),
    ).toBeVisible()
  })
})
