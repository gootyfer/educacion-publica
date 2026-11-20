import { describe, expect, it, vi } from "vitest"

import {
  PANORAMA_WIDTH,
  panoramaTextureFor,
  staticBackgroundTextureFor,
  wrapPanoramaOffset,
} from "../../src/phaser/backgrounds/PanoramaModel"
import { ScrollingBackdrop } from "../../src/phaser/entities/ScrollingBackdrop"

describe("seasonal panorama", () => {
  it("selects the moving and static seasonal textures", () => {
    expect([1, 2, 3].map((term) => panoramaTextureFor(term as 1 | 2 | 3))).toEqual(
      ["panoramaTerm1", "panoramaTerm2", "panoramaTerm3"],
    )
    expect(staticBackgroundTextureFor("title")).toBe("panoramaTerm1")
    expect(staticBackgroundTextureFor("christmas")).toBe("panoramaTerm2")
    expect(staticBackgroundTextureFor("spring-break")).toBe("springBreak")
    expect(staticBackgroundTextureFor("results")).toBe("panoramaTerm3")
  })

  it("wraps positive and negative offsets inside the 3200 pixel route", () => {
    expect(PANORAMA_WIDTH).toBe(3200)
    expect(wrapPanoramaOffset(3200)).toBe(0)
    expect(wrapPanoramaOffset(3201)).toBe(1)
    expect(wrapPanoramaOffset(-1)).toBe(3199)
  })

  it("keeps fractional motion while drawing only integer pixel offsets", () => {
    const tile = new FakeTileSprite()
    const scene = fakeScene(tile)
    const backdrop = new ScrollingBackdrop(scene, "panoramaTerm1")

    backdrop.update(3, 150)
    backdrop.update(3, 150)
    expect(backdrop.offset()).toBe(0)
    expect(tile.tilePositionX).toBe(0)

    backdrop.update(1, 150)
    expect(backdrop.offset()).toBe(1)
    expect(tile.tilePositionX).toBe(1)
  })

  it("crosses the loop at maximum speed without a negative frame", () => {
    const tile = new FakeTileSprite()
    const backdrop = new ScrollingBackdrop(
      fakeScene(tile),
      "panoramaTerm3",
      3199,
    )

    backdrop.update(10, 320)

    expect(backdrop.offset()).toBe(2)
    expect(tile.tilePositionX).toBe(2)
    backdrop.destroy()
    expect(tile.destroy).toHaveBeenCalledOnce()
  })
})

class FakeTileSprite {
  tilePositionX = 0
  setOrigin = vi.fn(() => this)
  setDepth = vi.fn(() => this)
  setScrollFactor = vi.fn(() => this)
  destroy = vi.fn()
}

function fakeScene(tile: FakeTileSprite) {
  return {
    add: {
      tileSprite: vi.fn(() => tile),
    },
  } as never
}
