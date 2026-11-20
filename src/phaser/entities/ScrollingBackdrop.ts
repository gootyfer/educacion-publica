import type Phaser from "phaser"

import {
  type PanoramaTextureKey,
  wrapPanoramaOffset,
} from "../backgrounds/PanoramaModel"

export class ScrollingBackdrop {
  private readonly tile: Phaser.GameObjects.TileSprite
  private preciseOffset: number

  constructor(
    scene: Phaser.Scene,
    readonly texture: PanoramaTextureKey,
    initialOffset = 0,
  ) {
    this.preciseOffset = wrapPanoramaOffset(initialOffset)
    this.tile = scene.add
      .tileSprite(0, 0, 640, 360, texture)
      .setOrigin(0, 0)
      .setDepth(0)
      .setScrollFactor(0)
    this.draw()
  }

  update(deltaMs: number, worldSpeed: number): void {
    const distance = Math.max(0, worldSpeed) * (Math.max(0, deltaMs) / 1000)
    this.preciseOffset = wrapPanoramaOffset(this.preciseOffset + distance)
    this.draw()
  }

  offset(): number {
    return Math.floor(this.preciseOffset)
  }

  destroy(): void {
    this.tile.destroy()
  }

  private draw(): void {
    this.tile.tilePositionX = this.offset()
  }
}
