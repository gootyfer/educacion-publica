import { expect, test } from "@playwright/test"

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
