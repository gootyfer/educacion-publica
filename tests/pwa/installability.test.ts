// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { readFile } from "node:fs/promises"

import sharp from "sharp"
import { describe, expect, it, vi } from "vitest"

const projectUrl = new URL("../../", import.meta.url)
const projectPath = decodeURIComponent(projectUrl.pathname)

describe("PWA installability", () => {
  it("provides a standalone manifest with iPhone and maskable icons", async () => {
    const manifestBuffer = await readFile(
      `${projectPath}public/manifest.webmanifest`,
    ).catch(() => null)
    expect(manifestBuffer).not.toBeNull()
    if (!manifestBuffer) return

    const manifest = JSON.parse(manifestBuffer.toString()) as {
      name: string
      short_name: string
      display: string
      orientation: string
      start_url: string
      scope: string
      icons: Array<{ src: string; sizes: string; purpose?: string }>
    }
    expect(manifest).toMatchObject({
      name: "Una jornada decente",
      short_name: "Jornada decente",
      display: "standalone",
      orientation: "landscape",
      start_url: "./",
      scope: "./",
    })
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ sizes: "512x512", purpose: "any" }),
        expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
      ]),
    )

    for (const [file, size] of [
      ["app-icon-180.png", 180],
      ["app-icon-192.png", 192],
      ["app-icon-512.png", 512],
      ["app-icon-maskable-512.png", 512],
    ] as const) {
      const metadata = await sharp(`${projectPath}public/icons/${file}`).metadata()
      expect(metadata).toMatchObject({ width: size, height: size, format: "png" })
    }
  })

  it("registers the service worker at the deployment base path", async () => {
    const registrationModule = await import("../../src/pwa/register").catch(
      () => null,
    )
    expect(registrationModule).not.toBeNull()
    if (!registrationModule) return

    const register = vi.fn(async () => ({ scope: "ok" }))
    await registrationModule.registerPwa(
      { serviceWorker: { register } },
      "/educacion-publica/",
    )

    expect(register).toHaveBeenCalledWith(
      "/educacion-publica/sw.js",
      { scope: "/educacion-publica/" },
    )
  })
})
