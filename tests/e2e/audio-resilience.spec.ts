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
