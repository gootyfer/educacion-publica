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

  it("wraps positive and negative offsets inside the overlap-free route", () => {
    expect(PANORAMA_WIDTH).toBe(3168)
    expect(wrapPanoramaOffset(3168)).toBe(0)
    expect(wrapPanoramaOffset(3169)).toBe(1)
    expect(wrapPanoramaOffset(-1)).toBe(3167)
  })

  it("uses two native images and draws only integer pixel offsets", () => {
    const scene = fakeScene()
    const backdrop = new ScrollingBackdrop(scene as never, "panoramaTerm1")

    backdrop.update(3, 150)
    backdrop.update(3, 150)
    expect(backdrop.offset()).toBe(0)
    expect(scene.images.map(({ x }) => x)).toEqual([0, 3168])

    backdrop.update(1, 150)
    expect(backdrop.offset()).toBe(1)
    expect(scene.images.map(({ x }) => x)).toEqual([-1, 3167])
  })

  it("crosses the loop at maximum speed without a negative frame", () => {
    const scene = fakeScene()
    const backdrop = new ScrollingBackdrop(
      scene as never,
      "panoramaTerm3",
      3167,
    )

    backdrop.update(10, 320)

    expect(backdrop.offset()).toBe(2)
    expect(scene.images.map(({ x }) => x)).toEqual([-2, 3166])
    backdrop.destroy()
    expect(scene.images.every(({ destroy }) => destroy.mock.calls.length === 1)).toBe(true)
  })
})

class FakeImage {
  x = 0
  setOrigin = vi.fn(() => this)
  setDepth = vi.fn(() => this)
  setScrollFactor = vi.fn(() => this)
  setPosition = vi.fn((x: number) => {
    this.x = x
    return this
  })
  destroy = vi.fn()
}

function fakeScene() {
  const images: FakeImage[] = []
  return {
    images,
    add: {
      image: vi.fn(() => {
        const image = new FakeImage()
        images.push(image)
        return image
      }),
    },
  }
}
