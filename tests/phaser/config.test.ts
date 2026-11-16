import { describe, expect, it, vi } from "vitest"

vi.mock("phaser", () => {
  class Scene {}
  class Game {}
  class Sprite {}
  const phaser = {
    AUTO: 0,
    Game,
    Scene,
    Physics: { Arcade: { Sprite } },
    Loader: { Events: { PROGRESS: "progress" } },
    Scale: { FIT: 1, CENTER_BOTH: 2 },
  }
  return { default: phaser }
})

import Phaser from "phaser"

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  buildGameConfig,
} from "../../src/phaser/config"

describe("Phaser game configuration", () => {
  it("uses the approved landscape pixel-art viewport", () => {
    const parent = {} as HTMLElement
    const config = buildGameConfig(parent)

    expect(GAME_WIDTH).toBe(640)
    expect(GAME_HEIGHT).toBe(360)
    expect(config.width).toBe(640)
    expect(config.height).toBe(360)
    expect(config.pixelArt).toBe(true)
    expect(config.roundPixels).toBe(true)
    expect(config.physics).toEqual({
      default: "arcade",
      arcade: { debug: false },
    })
    expect(config.scale).toMatchObject({
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    })
    expect(config.parent).toBe(parent)
  })
})
