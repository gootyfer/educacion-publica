import { mkdir } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import sharp from "sharp"

const FRAME_SIZE = 75
const SHEET_WIDTH = 450
const BASE_HEIGHT = 225

export async function prepareCompanions({ sourceDir, outputPath }) {
  const basePath = join(sourceDir, "companions-base.png")
  const generatedPath = join(sourceDir, "wheelchair-student-source.png")
  const preparedPath = join(sourceDir, "wheelchair-student-frames.png")
  const base = await sharp(basePath).ensureAlpha().png().toBuffer()
  const frames = await Promise.all([
    prepareFrame(generatedPath, {
      left: 314,
      top: 134,
      width: 430,
      height: 641,
    }),
    prepareFrame(generatedPath, {
      left: 1048,
      top: 134,
      width: 432,
      height: 641,
    }),
  ])
  const prepared = await sharp({
    create: {
      width: FRAME_SIZE * 2,
      height: FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      frames.map((input, index) => ({
        input,
        left: index * FRAME_SIZE,
        top: 0,
      })),
    )
    .png()
    .toBuffer()

  await mkdir(dirname(outputPath), { recursive: true })
  await sharp(prepared).toFile(preparedPath)
  const assembled = await sharp({
    create: {
      width: SHEET_WIDTH,
      height: BASE_HEIGHT + FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: base, left: 0, top: 0 },
      { input: prepared, left: 0, top: BASE_HEIGHT },
    ])
    .png()
    .toBuffer()
  await normalizeRunningFrames(assembled).then((sheet) =>
    sharp(sheet).toFile(outputPath),
  )
}

async function normalizeRunningFrames(sheet) {
  const frames = await Promise.all(
    Array.from({ length: 20 }, async (_, index) => {
      const left = (index % 6) * FRAME_SIZE
      const top = Math.floor(index / 6) * FRAME_SIZE
      const frame = await sharp(sheet)
        .extract({ left, top, width: FRAME_SIZE, height: FRAME_SIZE })
        .png()
        .toBuffer()
      return {
        input: await alignOpaquePixelsToBottom(frame),
        left,
        top,
      }
    }),
  )

  return sharp({
    create: {
      width: SHEET_WIDTH,
      height: BASE_HEIGHT + FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(frames)
    .png()
    .toBuffer()
}

async function alignOpaquePixelsToBottom(frame) {
  const { data, info } = await sharp(frame)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let opaqueBottom = -1
  for (let y = info.height - 1; y >= 0 && opaqueBottom < 0; y -= 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > 0) {
        opaqueBottom = y
        break
      }
    }
  }
  if (opaqueBottom < 0 || opaqueBottom === info.height - 1) return frame

  return sharp({
    create: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: frame, left: 0, top: FRAME_SIZE - 1 - opaqueBottom }])
    .png()
    .toBuffer()
}

async function prepareFrame(path, extract) {
  const sprite = await sharp(path)
    .extract(extract)
    .resize(60, 70, { fit: "fill", kernel: "nearest" })
    .png()
    .toBuffer()
  return sharp({
    create: {
      width: FRAME_SIZE,
      height: FRAME_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: sprite, left: 7, top: 5 }])
    .png()
    .toBuffer()
}

const scriptPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null
if (scriptPath === import.meta.url) {
  const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
  await prepareCompanions({
    sourceDir: join(projectRoot, "art-source", "characters"),
    outputPath: join(projectRoot, "public", "game", "characters", "companions.png"),
  })
}
