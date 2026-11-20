import Phaser from "phaser"

import {
  COURSE_GEOMETRY,
  SeededRandom,
  nextObstacle,
  type GapBand,
} from "../../course/cadence"
import type { CourseState, ObstacleKind } from "../../course/types"

const POOL_SIZE = 4
const SPAWN_X = 680
const INITIAL_GRACE_DISTANCE = 360

const FRAME_BY_KIND: Readonly<Record<ObstacleKind, number>> = {
  "paper-stack": 0,
  "filing-cart": 1,
  "cold-climate": 2,
  "heat-climate": 3,
  leak: 4,
  wall: 5,
}

export interface ActiveObstacleSnapshot {
  readonly kind: ObstacleKind
  readonly x: number
}

export class ObstaclePool {
  private readonly group: Phaser.Physics.Arcade.Group
  private readonly members: Phaser.Physics.Arcade.Image[]
  private readonly random: SeededRandom
  private previousKind?: ObstacleKind
  private previousGapBand?: GapBand
  private shortStreak = 0
  private distanceUntilSpawn = INITIAL_GRACE_DISTANCE

  constructor(
    scene: Phaser.Scene,
    private readonly groundY: number,
    _state: CourseState,
    seed = 2_026,
  ) {
    this.random = new SeededRandom(seed)
    this.group = scene.physics.add.group({ allowGravity: false, immovable: true })
    this.members = Array.from({ length: POOL_SIZE }, () => {
      const obstacle = scene.physics.add
        .image(SPAWN_X, groundY, "obstacles", 0)
        .setOrigin(0.5, 1)
        .setDepth(18)
        .setImmovable(true)
        .setActive(false)
        .setVisible(false)
      const body = obstacle.body as Phaser.Physics.Arcade.Body
      body.setAllowGravity(false)
      body.enable = false
      this.group.add(obstacle)
      return obstacle
    })
  }

  colliders(): Phaser.Physics.Arcade.Group {
    return this.group
  }

  kindFor(obstacle: Phaser.GameObjects.GameObject): ObstacleKind | undefined {
    return obstacle.getData("kind") as ObstacleKind | undefined
  }

  update(state: CourseState, deltaMs: number, worldSpeed: number): void {
    for (const obstacle of this.members) {
      if (!obstacle.active) continue
      if (obstacle.x < -80) {
        this.deactivate(obstacle)
        continue
      }
      obstacle.setVelocityX(-worldSpeed)
      ;(obstacle.body as Phaser.Physics.Arcade.Body).setVelocityX(-worldSpeed)
    }

    this.distanceUntilSpawn -= worldSpeed * (Math.max(0, deltaMs) / 1000)
    if (this.distanceUntilSpawn > 0) return
    const available = this.members.find((obstacle) => !obstacle.active)
    if (!available) {
      this.distanceUntilSpawn = 0
      return
    }
    this.spawn(available, state, worldSpeed)
  }

  size(): number {
    return this.members.length
  }

  activeCount(): number {
    return this.members.filter(({ active }) => active).length
  }

  activeSnapshots(): readonly ActiveObstacleSnapshot[] {
    return this.members
      .filter(({ active }) => active)
      .map((obstacle) => ({
        kind: this.kindFor(obstacle) ?? "paper-stack",
        x: Math.round(obstacle.x),
      }))
  }

  activeKind(): ObstacleKind {
    return this.activeSnapshots()[0]?.kind ?? "paper-stack"
  }

  activeX(): number {
    return this.activeSnapshots()[0]?.x ?? SPAWN_X
  }

  collisionTop(): number {
    const active = this.members.find(({ active }) => active)
    return active
      ? (active.body as Phaser.Physics.Arcade.Body).top
      : this.groundY
  }

  destroy(): void {
    this.group.destroy(true, true)
  }

  private spawn(
    obstacle: Phaser.Physics.Arcade.Image,
    state: CourseState,
    worldSpeed: number,
  ): void {
    const decision = nextObstacle(
      {
        term: state.term,
        energy: state.energy,
        worldSpeed,
        jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
        obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
        elapsedMs: state.elapsedMs,
        targetTermDurationMs: state.profile.targetTermDurationMs[state.term],
        previousKind: this.previousKind,
        previousGapBand: this.previousGapBand,
        shortStreak: this.shortStreak,
      },
      this.random,
    )
    this.previousKind = decision.kind
    this.previousGapBand = decision.gapBand
    this.shortStreak = decision.gapBand === "short" ? this.shortStreak + 1 : 0
    this.distanceUntilSpawn = decision.gap

    obstacle
      .setData("kind", decision.kind)
      .setFrame(FRAME_BY_KIND[decision.kind])
      .setDisplaySize(62, 76)
      .setPosition(SPAWN_X, this.groundY)
      .setVelocityX(-worldSpeed)
      .setActive(true)
      .setVisible(true)
    const body = obstacle.body as Phaser.Physics.Arcade.Body
    body.enable = true
    body.setSize(42, 28, true)
    body.reset(SPAWN_X, this.groundY)
    body.setVelocityX(-worldSpeed)
  }

  private deactivate(obstacle: Phaser.Physics.Arcade.Image): void {
    obstacle.setVelocityX(0).setActive(false).setVisible(false)
    const body = obstacle.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(0)
    body.enable = false
  }
}
