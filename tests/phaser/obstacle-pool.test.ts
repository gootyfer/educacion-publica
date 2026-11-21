import { describe, expect, it, vi } from "vitest"

import { createCourseStateAtTerm } from "../../src/course/progression"
import { ObstaclePool } from "../../src/phaser/entities/ObstaclePool"

describe("four-member obstacle pool", () => {
  it("spawns by travelled distance and never allocates a fifth image", () => {
    const scene = fakeScene()
    const state = createCourseStateAtTerm(3)
    const pool = new ObstaclePool(scene as never, 318, state, 2026)

    expect(scene.images).toHaveLength(4)
    expect(pool.size()).toBe(4)
    expect(pool.activeCount()).toBe(0)

    for (let index = 0; index < 5; index += 1) {
      pool.update(state, 5_000, 300)
    }

    expect(pool.activeCount()).toBe(4)
    expect(scene.images).toHaveLength(4)
    expect(pool.activeSnapshots().every(({ kind }) => Boolean(kind))).toBe(true)
    expect(scene.images.filter(({ active }) => active).every(({ velocityX }) => velocityX === -300)).toBe(true)
  })

  it("recycles an offscreen member and destroys the whole pool", () => {
    const scene = fakeScene()
    const state = createCourseStateAtTerm(2)
    const pool = new ObstaclePool(scene as never, 318, state, 42)
    for (let index = 0; index < 4; index += 1) {
      pool.update(state, 5_000, 260)
    }
    const first = scene.images.find(({ active }) => active)!
    const firstKind = pool.kindFor(first as never)
    first.x = -100

    pool.update(state, 0, 260)
    expect(pool.activeCount()).toBe(3)
    pool.update(state, 5_000, 275)
    expect(pool.activeCount()).toBe(4)
    expect(pool.kindFor(first as never)).toBeTruthy()
    expect(pool.kindFor(first as never)).not.toBe(undefined)
    expect(firstKind).toBeTruthy()

    pool.destroy()
    expect(scene.group.destroy).toHaveBeenCalledOnce()
    expect(scene.images.every(({ destroy }) => destroy.mock.calls.length === 1)).toBe(true)
  })

  it("starts a new pool empty for a new term", () => {
    const firstScene = fakeScene()
    const first = new ObstaclePool(
      firstScene as never,
      318,
      createCourseStateAtTerm(1),
    )
    first.update(createCourseStateAtTerm(1), 5_000, 200)
    expect(first.activeCount()).toBe(1)

    const next = new ObstaclePool(
      fakeScene() as never,
      318,
      createCourseStateAtTerm(2),
    )
    expect(next.activeCount()).toBe(0)
  })

  it("associates each scheduled gap with the obstacle that follows it", () => {
    const scene = fakeScene()
    const state = createCourseStateAtTerm(3)
    const pool = new ObstaclePool(scene as never, 318, state, 2026)

    for (let index = 0; index < 4; index += 1) {
      pool.update(state, 5_000, 300, 60_000)
    }

    const snapshots = pool.activeSnapshots()
    expect(snapshots).toHaveLength(4)
    for (let index = 1; index < snapshots.length; index += 1) {
      const previous = snapshots[index - 1]!
      const current = snapshots[index]!
      expect(current.gapBandBefore).toBeDefined()
      if (current.gapBandBefore === "short") {
        expect(
          [previous.kind, current.kind].every((kind) =>
            ["paper-stack", "filing-cart", "cold-climate", "wall"].includes(kind),
          ),
        ).toBe(false)
      }
    }
  })

  it("can prefill four active obstacles for the performance fixture", () => {
    const pool = new ObstaclePool(
      fakeScene() as never,
      318,
      createCourseStateAtTerm(3),
      2026,
      true,
    )

    expect(pool.activeCount()).toBe(4)
  })
})

class FakeImage {
  x = 680
  active = false
  visible = false
  velocityX = 0
  data = new Map<string, unknown>()
  destroy = vi.fn()
  body = {
    top: 280,
    enable: false,
    setAllowGravity: vi.fn(() => this.body),
    setSize: vi.fn(() => this.body),
    reset: vi.fn((x: number) => {
      this.x = x
      return this.body
    }),
    setVelocityX: vi.fn((velocity: number) => {
      this.velocityX = velocity
      return this.body
    }),
  }
  setOrigin() { return this }
  setDepth() { return this }
  setImmovable() { return this }
  setFrame() { return this }
  setDisplaySize() { return this }
  setPosition(x: number) { this.x = x; return this }
  setVelocityX(velocity: number) { this.velocityX = velocity; return this }
  setActive(active: boolean) { this.active = active; return this }
  setVisible(visible: boolean) { this.visible = visible; return this }
  setData(key: string, value: unknown) { this.data.set(key, value); return this }
  getData(key: string) { return this.data.get(key) }
}

function fakeScene() {
  const images: FakeImage[] = []
  const group = {
    add: vi.fn(),
    destroy: vi.fn((_destroyChildren: boolean) => {
      images.forEach((image) => image.destroy())
    }),
  }
  return {
    images,
    group,
    physics: {
      add: {
        group: vi.fn(() => group),
        image: vi.fn(() => {
          const image = new FakeImage()
          images.push(image)
          return image
        }),
      },
    },
  }
}
