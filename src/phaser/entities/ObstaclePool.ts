import Phaser from "phaser"

import type { ObstacleKind } from "../../course/types"

const FRAME_BY_KIND: Readonly<Record<ObstacleKind, number>> = {
  "paper-stack": 0,
  "filing-cart": 1,
  "cold-climate": 2,
  "heat-climate": 3,
  leak: 4,
  wall: 5,
}

export class ObstaclePool {
  private readonly obstacle: Phaser.Physics.Arcade.Image
  private kind: ObstacleKind = "paper-stack"

  constructor(
    scene: Phaser.Scene,
    private readonly groundY: number,
  ) {
    this.obstacle = scene.physics.add
      .image(520, groundY, "obstacles", FRAME_BY_KIND[this.kind])
      .setOrigin(0.5, 1)
      .setDisplaySize(62, 76)
      .setDepth(18)
      .setImmovable(true)
    const body = this.obstacle.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setSize(46, 68).setOffset(41, 54)
    this.obstacle.setVelocityX(-140)
  }

  active(): Phaser.Physics.Arcade.Image {
    return this.obstacle
  }

  activeKind(): ObstacleKind {
    return this.kind
  }

  update(): void {
    if (this.obstacle.x >= -80) return
    this.obstacle.setPosition(720, this.groundY)
    this.obstacle.setVelocityX(-140)
  }

  destroy(): void {
    this.obstacle.destroy()
  }
}
