import { describe, expect, it } from "vitest"

import sharp from "sharp"

const FRAME_SIZE = 75
const COMPANION_FRAME_COUNT = 20

describe("prepared companion sprites", () => {
  it("places opaque pixels on the ground line in every running frame", async () => {
    const sheetUrl = new URL(
      "../../public/game/characters/companions.png",
      import.meta.url,
    )
    const sheet = await sharp(decodeURIComponent(sheetUrl.pathname))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    for (let frame = 0; frame < COMPANION_FRAME_COUNT; frame += 1) {
      const column = frame % 6
      const row = Math.floor(frame / 6)
      const groundY = row * FRAME_SIZE + FRAME_SIZE - 1
      const left = column * FRAME_SIZE
      const hasGroundPixel = Array.from({ length: FRAME_SIZE }, (_, x) => {
        const pixel = (groundY * sheet.info.width + left + x) * 4
        return sheet.data[pixel + 3]! > 0
      }).some(Boolean)

      expect(hasGroundPixel, `frame ${frame} has no pixel on its baseline`).toBe(
        true,
      )
    }
  })
})
