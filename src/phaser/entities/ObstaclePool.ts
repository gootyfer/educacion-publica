import Phaser from "phaser"

import {
  COURSE_GEOMETRY,
  SeededRandom,
  nextObstacle,
  type GapBand,
  type SpawnDecision,
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
  readonly gapBandBefore: GapBand
}

export class ObstaclePool {
  private readonly group: Phaser.Physics.Arcade.Group
  private readonly members: Phaser.Physics.Arcade.Image[]
  private readonly random: SeededRandom
  private previousKind?: ObstacleKind
  private previousGapBand?: GapBand
  private shortStreak = 0
  private distanceUntilSpawn = INITIAL_GRACE_DISTANCE
  private pendingDecision?: SpawnDecision

  constructor(
    scene: Phaser.Scene,
    private readonly groundY: number,
    _state: CourseState,
    seed = 2_026,
    stressFixture = false,
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
    if (stressFixture) this.prefillStressFixture()
  }

  colliders(): Phaser.Physics.Arcade.Group {
    return this.group
  }

  kindFor(obstacle: Phaser.GameObjects.GameObject): ObstacleKind | undefined {
    return obstacle.getData("kind") as ObstacleKind | undefined
  }

  update(
    state: CourseState,
    deltaMs: number,
    worldSpeed: number,
    cadenceElapsedMs = state.elapsedMs,
  ): void {
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
    this.spawn(available, state, worldSpeed, cadenceElapsedMs)
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
        gapBandBefore:
          (obstacle.getData("gapBandBefore") as GapBand | undefined) ?? "long",
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
    cadenceElapsedMs: number,
  ): void {
    const decision =
      this.pendingDecision ??
      nextObstacle(
        {
          term: state.term,
          energy: state.energy,
          worldSpeed,
          jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
          obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
          elapsedMs: cadenceElapsedMs,
          targetTermDurationMs: state.profile.targetTermDurationMs[state.term],
        },
        this.random,
      )
    const gapBandBefore = this.pendingDecision?.gapBand ?? "long"
    this.previousKind = decision.kind
    this.previousGapBand = gapBandBefore
    this.shortStreak = gapBandBefore === "short" ? this.shortStreak + 1 : 0
    this.pendingDecision = nextObstacle(
      {
        term: state.term,
        energy: state.energy,
        worldSpeed,
        jumpAirtimeMs: COURSE_GEOMETRY.jumpAirtimeMs,
        obstacleWidth: COURSE_GEOMETRY.obstacleWidth,
        elapsedMs: cadenceElapsedMs,
        targetTermDurationMs: state.profile.targetTermDurationMs[state.term],
        previousKind: this.previousKind,
        previousGapBand: this.previousGapBand,
        shortStreak: this.shortStreak,
      },
      this.random,
    )
    this.distanceUntilSpawn = this.pendingDecision.gap

    this.activate(obstacle, decision.kind, SPAWN_X, gapBandBefore, worldSpeed)
  }

  private prefillStressFixture(): void {
    const kinds: readonly ObstacleKind[] = [
      "paper-stack",
      "leak",
      "heat-climate",
      "wall",
    ]
    this.members.forEach((obstacle, index) => {
      this.activate(obstacle, kinds[index]!, 450 + index * 70, "long", 0)
    })
    this.distanceUntilSpawn = Number.POSITIVE_INFINITY
  }

  private activate(
    obstacle: Phaser.Physics.Arcade.Image,
    kind: ObstacleKind,
    x: number,
    gapBandBefore: GapBand,
    worldSpeed: number,
  ): void {
    obstacle
      .setData("kind", kind)
      .setData("gapBandBefore", gapBandBefore)
      .setFrame(FRAME_BY_KIND[kind])
      .setDisplaySize(62, 76)
      .setPosition(x, this.groundY)
      .setVelocityX(-worldSpeed)
      .setActive(true)
      .setVisible(true)
    const body = obstacle.body as Phaser.Physics.Arcade.Body
    body.enable = true
    body.setSize(42, 28, true)
    body.reset(x, this.groundY)
    body.setVelocityX(-worldSpeed)
  }

  private deactivate(obstacle: Phaser.Physics.Arcade.Image): void {
    obstacle.setVelocityX(0).setActive(false).setVisible(false)
    const body = obstacle.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(0)
    body.enable = false
  }
}
