import { expect, test } from "@playwright/test"

test("installs at the GitHub Pages scope and reopens offline", async ({
  context,
  page,
}) => {
  await page.goto("/educacion-publica/")
  await page.waitForFunction(async () => {
    if (!("serviceWorker" in navigator)) return false
    const registration = await navigator.serviceWorker.ready
    return (
      registration.scope.endsWith("/educacion-publica/") &&
      navigator.serviceWorker.controller !== null
    )
  })

  const iconResponse = await page.goto(
    "/educacion-publica/icons/app-icon-192.png",
  )
  expect(iconResponse?.headers()["content-type"]).toContain("image/png")

  await context.setOffline(true)
  try {
    await page.goto("/educacion-publica/")
    await expect(page.getByRole("button", { name: "Empezar" })).toBeVisible()
    await expect(page.locator("canvas")).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})
