import { expect, test } from "@playwright/test"

test("exposes install metadata and icons for iPhone home screen", async ({
  page,
}) => {
  await page.goto("/")

  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  )
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/icons/app-icon-180.png",
  )
  await expect(
    page.locator('meta[name="apple-mobile-web-app-capable"]'),
  ).toHaveAttribute("content", "yes")

  const manifestResponse = await page.request.get("/manifest.webmanifest")
  expect(manifestResponse.ok()).toBe(true)
  const manifest = (await manifestResponse.json()) as {
    display: string
    icons: Array<{ src: string }>
  }
  expect(manifest.display).toBe("standalone")
  for (const icon of manifest.icons) {
    expect((await page.request.get(`/${icon.src}`)).ok()).toBe(true)
  }
  expect((await page.request.get("/icons/app-icon-180.png")).ok()).toBe(true)
})
