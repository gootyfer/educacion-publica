import Phaser from "phaser"

import {
  COURSE_GEOMETRY,
  SPEED_BY_BAND,
  SeededRandom,
  nextObstacle,
} from "../../course/cadence"
import type { CourseState, ObstacleKind } from "../../course/types"

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
  private readonly random: SeededRandom
  private kind: ObstacleKind = "paper-stack"
  private previousKind?: ObstacleKind

  constructor(
    scene: Phaser.Scene,
    private readonly groundY: number,
    state: CourseState,
    seed = 2_026,
  ) {
    this.random = new SeededRandom(seed)
    this.obstacle = scene.physics.add
      .image(720, groundY, "obstacles", FRAME_BY_KIND[this.kind])
      .setOrigin(0.5, 1)
      .setDepth(18)
      .setImmovable(true)
    const body = this.obstacle.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    this.reset(state, 540)
  }

  active(): Phaser.Physics.Arcade.Image {
    return this.obstacle
  }

  activeKind(): ObstacleKind {
    return this.kind
  }

  update(state: CourseState): void {
    if (this.obstacle.x >= -80) return
    this.reset(state)
  }

  size(): number {
    return 1
  }

  activeX(): number {
    return this.obstacle.x
  }

  collisionTop(): number {
    return (this.obstacle.body as Phaser.Physics.Arcade.Body).top
  }

  destroy(): void {
    this.obstacle.destroy()
  }

  private reset(state: CourseState, initialX?: number): void {
    const decision = nextObstacle(
      {
        term: state.term,
        energy: state.energy,
        worldSpeed: SPEED_BY_BAND.medium,
        jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
        obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
        previousKind: this.previousKind,
      },
      this.random,
    )
    this.kind = decision.kind
    this.previousKind = decision.kind
    const speed = SPEED_BY_BAND[decision.speedBand]
    const spawnX = initialX ?? 640 + decision.gap

    this.obstacle
      .setFrame(FRAME_BY_KIND[this.kind])
      .setDisplaySize(62, 76)
      .setPosition(spawnX, this.groundY)
      .setVelocityX(-speed)
      .setActive(true)
      .setVisible(true)

    const body = this.obstacle.body as Phaser.Physics.Arcade.Body
    body.enable = true
    body.setSize(42, 28, true)
    body.reset(spawnX, this.groundY)
    body.setVelocityX(-speed)
  }
}
