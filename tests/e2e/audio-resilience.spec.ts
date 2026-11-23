import { expect, test } from "@playwright/test"

declare global {
  interface Window {
    __audioStarts?: number
    __audioRate?: number
    __pressureSamples?: number[]
  }
}

test("acelera gradualmente el tema y restaura 1x durante las vacaciones", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/?pressure=1&fast=1")
  await page.getByRole("button", { name: "Empezar" }).click()
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window.__pressureSamples ?? []).some((pressure) => pressure === 1),
      ),
    )
    .toBe(true)
  await expect(page.getByRole("button", { name: "Continuar el curso" })).toBeVisible()
  expect(await page.evaluate(() => window.__audioRate)).toBe(1)
  expect(await page.evaluate(() => Math.max(...(window.__pressureSamples ?? [0])))).toBe(1)
})

test("reproduce el tema y el salto después de la interacción", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__audioStarts = 0
    const original = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__audioStarts = (window.__audioStarts ?? 0) + 1
      return original.apply(this, args as Parameters<AudioBufferSourceNode["start"]>)
    }
  })
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")
  await page.getByRole("button", { name: "Empezar" }).click()
  await expect.poll(() => page.evaluate(() => window.__audioStarts ?? 0)).toBeGreaterThan(0)
  const afterTheme = await page.evaluate(() => window.__audioStarts ?? 0)
  await page.keyboard.press("Space")
  await expect
    .poll(() => page.evaluate(() => window.__audioStarts ?? 0))
    .toBeGreaterThan(afterTheme)
})

test("desbloquea la música inicial con un toque en la PWA de iPhone", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext
    class InitiallyLockedAudioContext extends NativeAudioContext {
      private initiallyLocked = true

      get state(): AudioContextState {
        return this.initiallyLocked ? "suspended" : super.state
      }

      resume(): Promise<void> {
        this.initiallyLocked = false
        return super.resume()
      }
    }
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: InitiallyLockedAudioContext,
    })
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    })
    Object.defineProperty(navigator, "standalone", {
      configurable: true,
      value: true,
    })
    window.__audioStarts = 0
    const original = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__audioStarts = (window.__audioStarts ?? 0) + 1
      return original.apply(this, args as Parameters<AudioBufferSourceNode["start"]>)
    }
  })
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")

  const gate = page.getByRole("button", { name: "Toca para continuar" })
  await expect(gate).toBeVisible()
  await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible()
  await expect(gate).toBeFocused()
  expect(
    await page
      .locator(".game-stage")
      .evaluate((stage) => (stage as HTMLElement).inert),
  ).toBe(true)
  await gate.click()
  await expect(gate).toBeHidden()
  expect(
    await page
      .locator(".game-stage")
      .evaluate((stage) => (stage as HTMLElement).inert),
  ).toBe(false)
  await expect(page.locator(".semantic-controls h1")).toBeFocused()
  await expect
    .poll(() => page.evaluate(() => window.__audioStarts ?? 0))
    .toBeGreaterThan(0)

  await page.getByRole("button", { name: "Empezar" }).click()
  await expect(page.locator("#phaser-root")).toBeFocused()
})

test("inicia la música sin puerta si el audio del iPhone ya está desbloqueado", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    })
    Object.defineProperty(navigator, "standalone", {
      configurable: true,
      value: true,
    })
    window.__audioStarts = 0
    const original = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__audioStarts = (window.__audioStarts ?? 0) + 1
      return original.apply(this, args as Parameters<AudioBufferSourceNode["start"]>)
    }
  })
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")

  await expect(
    page.getByRole("button", { name: "Toca para continuar" }),
  ).toBeHidden()
  await expect
    .poll(() => page.evaluate(() => window.__audioStarts ?? 0))
    .toBeGreaterThan(0)
  await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible()
})

test("el juego funciona sin audio aunque fallen todos los mp3", async ({
  page,
}) => {
  await page.route("**/audio/approved/**", (route) => route.abort())
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")
  await page.getByRole("button", { name: "Empezar" }).click()

  await expect(page.locator("#phaser-root")).toBeFocused()
  await page.keyboard.press("Space")
  await expect(page.getByRole("status")).toContainText("saltado")
})

test("el silencio persiste al recargar", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 })
  await page.goto("/")
  await page.getByRole("button", { name: "Silenciar sonido" }).click()
  await expect(page.getByRole("button", { name: "Activar sonido" })).toBeVisible()

  await page.reload()
  await expect(page.getByRole("button", { name: "Activar sonido" })).toBeVisible()
})

test("carga las pistas aprobadas de los menús inicial y final", async ({
  page,
}) => {
  const loadedTracks = new Set<string>()
  page.on("response", (response) => {
    if (!response.ok()) return
    const fileName = new URL(response.url()).pathname.split("/").at(-1)
    if (fileName) loadedTracks.add(fileName)
  })

  await page.goto("/?fast=1")
  await expect
    .poll(() => loadedTracks.has("main-theme-extended-80s.mp3"))
    .toBe(true)
  await page.getByRole("button", { name: "Empezar" }).click()

  for (let term = 1; term <= 2; term += 1) {
    const continueButton = page.getByRole("button", {
      name: "Continuar el curso",
    })
    await expect(continueButton).toBeEnabled()
    await continueButton.click()
  }

  await expect(
    page.getByRole("button", { name: "Volver a intentar" }),
  ).toBeVisible()
  await expect
    .poll(() => loadedTracks.has("main-theme-electronic-80s.mp3"))
    .toBe(true)
})
