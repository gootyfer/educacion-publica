import { mkdir, readFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import sharp from "sharp"

const OUTPUT_BY_SEASON = {
  september: "panorama-term-1.webp",
  winter: "panorama-term-2.webp",
  june: "panorama-term-3.webp",
}

export async function preparePanoramas({ sourceDir, outputDir }) {
  const manifest = JSON.parse(
    await readFile(join(sourceDir, "manifest.json"), "utf8"),
  )
  const frameWidth = manifest.frameWidth
  const frameHeight = manifest.frameHeight
  await mkdir(outputDir, { recursive: true })

  for (const [season, outputName] of Object.entries(OUTPUT_BY_SEASON)) {
    const files = manifest.seasons?.[season]
    if (!Array.isArray(files) || files.length !== 5) {
      throw new Error(`${season} must declare exactly five panorama frames`)
    }
    const inputs = []
    for (const [index, file] of files.entries()) {
      const pixels = await normalizedPixels(
          join(sourceDir, file),
          frameWidth,
          frameHeight,
          file,
        )
      inputs.push({
        input: pixels.data,
        raw: pixels.raw,
        left: index * frameWidth,
        top: 0,
      })
    }
    const quantized = await sharp({
      create: {
        width: frameWidth * files.length,
        height: frameHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(inputs)
      .png({ palette: true, colours: 128, dither: 0 })
      .toBuffer()
    await sharp(quantized)
      .webp({ lossless: true, effort: 6 })
      .toFile(join(outputDir, outputName))
  }

  const springFile = manifest.springBreak
  const springPixels = await normalizedPixels(
    join(sourceDir, springFile),
    frameWidth,
    frameHeight,
    springFile,
  )
  const springQuantized = await sharp(springPixels.data, {
    raw: springPixels.raw,
  })
    .png({ palette: true, colours: 128, dither: 0 })
    .toBuffer()
  await sharp(springQuantized)
    .webp({ lossless: true, effort: 6 })
    .toFile(join(outputDir, "spring-break.webp"))
}

async function normalizedPixels(path, width, height, label) {
  const metadata = await sharp(path).metadata()
  if (metadata.width !== width || metadata.height !== height) {
    throw new Error(
      `${label} must be ${width}x${height}; received ${metadata.width}x${metadata.height}`,
    )
  }
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  for (let index = 3; index < data.length; index += info.channels) {
    data[index] = data[index] >= 128 ? 255 : 0
  }
  return { data, raw: { width, height, channels: 4 } }
}

const scriptPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null
if (scriptPath === import.meta.url) {
  const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  await preparePanoramas({
    sourceDir: join(projectRoot, "art-source", "panoramas"),
    outputDir: join(projectRoot, "public", "game", "backgrounds"),
  })
}
