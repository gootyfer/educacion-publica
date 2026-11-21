import type Phaser from "phaser"

import {
  PANORAMA_WIDTH,
  type PanoramaTextureKey,
  wrapPanoramaOffset,
} from "../backgrounds/PanoramaModel"

export class ScrollingBackdrop {
  private readonly images: readonly Phaser.GameObjects.Image[]
  private preciseOffset: number

  constructor(
    scene: Phaser.Scene,
    readonly texture: PanoramaTextureKey,
    initialOffset = 0,
  ) {
    this.preciseOffset = wrapPanoramaOffset(initialOffset)
    this.images = [0, 1].map(() =>
      scene.add
        .image(0, 0, texture)
        .setOrigin(0, 0)
        .setDepth(0)
        .setScrollFactor(0),
    )
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
    this.images.forEach((image) => image.destroy())
  }

  private draw(): void {
    const offset = this.offset()
    this.images[0]?.setPosition(offset === 0 ? 0 : -offset, 0)
    this.images[1]?.setPosition(PANORAMA_WIDTH - offset, 0)
  }
}
