// @ts-expect-error The panorama implementation is ESM JavaScript without declarations.
import { preparePanoramas } from "../../scripts/prepare-panoramas.mjs"
// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { tmpdir } from "node:os"
// @ts-expect-error Vitest runs in Node; the browser app omits @types/node.
import { join } from "node:path"

import sharp from "sharp"
import { describe, expect, it } from "vitest"

describe("panorama preparation", () => {
  it("removes the declared overlap from the lossless seasonal loop", async () => {
    const root = await mkdtemp(join(tmpdir(), "jornada-panorama-"))
    const sourceDir = join(root, "source")
    const outputDir = join(root, "output")
    await mkdir(sourceDir)

    try {
      const colors = [
        { r: 255, g: 0, b: 0, alpha: 0.5 },
        { r: 0, g: 255, b: 0, alpha: 1 },
        { r: 0, g: 0, b: 255, alpha: 1 },
        { r: 255, g: 255, b: 0, alpha: 1 },
        { r: 255, g: 0, b: 255, alpha: 1 },
      ]
      const names = colors.map((_, index) => `frame-${index + 1}.png`)
      for (const [index, background] of colors.entries()) {
        const frame = sharp({
          create: { width: 640, height: 360, channels: 4, background },
        })
        if (index === 0) {
          frame.composite([
            {
              input: {
                create: {
                  width: 1,
                  height: 360,
                  channels: 4,
                  background: { r: 0, g: 0, b: 0, alpha: 1 },
                },
              },
              left: 0,
              top: 0,
            },
          ])
        }
        await frame.png().toFile(join(sourceDir, names[index]!))
      }
      await sharp({
        create: {
          width: 640,
          height: 360,
          channels: 4,
          background: { r: 12, g: 34, b: 56, alpha: 1 },
        },
      })
        .png()
        .toFile(join(sourceDir, "spring.png"))
      await writeFile(
        join(sourceDir, "manifest.json"),
        JSON.stringify({
          frameWidth: 640,
          frameHeight: 360,
          seamWidth: 32,
          seasons: {
            september: names,
            winter: names,
            june: names,
          },
          springBreak: "spring.png",
        }),
      )

      await preparePanoramas({ sourceDir, outputDir })

      const output = join(outputDir, "panorama-term-1.webp")
      const metadata = await sharp(output).metadata()
      expect(metadata).toMatchObject({ width: 3168, height: 360, format: "webp" })
      const { data, info } = await sharp(output)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      const pixel = (x: number) => {
        const offset = (180 * info.width + x) * info.channels
        return [...data.subarray(offset, offset + 4)]
      }
      expect(pixel(320)).toEqual([255, 0, 0, 255])
      expect(pixel(0)).toEqual([255, 0, 0, 255])
      expect(pixel(960)).toEqual([0, 255, 0, 255])
      expect(pixel(1600)).toEqual([0, 0, 255, 255])
      expect(pixel(3167)).toEqual([255, 0, 255, 255])
      expect(
        new Set(
          data.filter((_value: number, index: number) => index % 4 === 3),
        ),
      ).toEqual(
        new Set([255]),
      )
      expect((await readFile(output)).subarray(0, 4).toString()).toBe("RIFF")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it("rejects a frame whose dimensions are not 640 by 360", async () => {
    const root = await mkdtemp(join(tmpdir(), "jornada-panorama-bad-"))
    const sourceDir = join(root, "source")
    const outputDir = join(root, "output")
    await mkdir(sourceDir)

    try {
      await sharp({
        create: {
          width: 639,
          height: 360,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toFile(join(sourceDir, "bad.png"))
      await writeFile(
        join(sourceDir, "manifest.json"),
        JSON.stringify({
          frameWidth: 640,
          frameHeight: 360,
          seasons: {
            september: Array.from({ length: 5 }, () => "bad.png"),
          },
          springBreak: "bad.png",
        }),
      )

      await expect(preparePanoramas({ sourceDir, outputDir })).rejects.toThrow(
        "bad.png must be 640x360; received 639x360",
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
