import { mkdir } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import sharp from "sharp"

const BACKGROUND = { r: 255, g: 244, b: 214, alpha: 1 }

export async function preparePwaIcons({ sourcePath, outputDir }) {
  await mkdir(outputDir, { recursive: true })
  await Promise.all([
    writeIcon(sourcePath, join(outputDir, "favicon-32.png"), 32),
    writeIcon(sourcePath, join(outputDir, "app-icon-180.png"), 180),
    writeIcon(sourcePath, join(outputDir, "app-icon-192.png"), 192),
    writeIcon(sourcePath, join(outputDir, "app-icon-512.png"), 512),
    writeMaskableIcon(
      sourcePath,
      join(outputDir, "app-icon-maskable-512.png"),
    ),
  ])
}

async function writeIcon(sourcePath, outputPath, size) {
  await sharp(sourcePath)
    .resize(size, size, { fit: "cover", kernel: "nearest" })
    .flatten({ background: BACKGROUND })
    .png()
    .toFile(outputPath)
}

async function writeMaskableIcon(sourcePath, outputPath) {
  const safeArtwork = await sharp(sourcePath)
    .resize(410, 410, { fit: "cover", kernel: "nearest" })
    .flatten({ background: BACKGROUND })
    .png()
    .toBuffer()
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: safeArtwork, left: 51, top: 51 }])
    .png()
    .toFile(outputPath)
}

const scriptPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null
if (scriptPath === import.meta.url) {
  const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  await preparePwaIcons({
    sourcePath: join(projectRoot, "art-source", "pwa", "app-icon-master.png"),
    outputDir: join(projectRoot, "public", "icons"),
  })
}
