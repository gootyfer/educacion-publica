import Phaser from "phaser"

import { advanceCourse, createCourseState } from "../../course/progression"
import type { CourseState, Term } from "../../course/types"
import { registerGameAnimations } from "../animations"
import { CompanionGroup } from "../entities/CompanionGroup"
import { ObstaclePool } from "../entities/ObstaclePool"
import { Teacher } from "../entities/Teacher"
import { EnergyHud } from "../ui/EnergyHud"

export interface GameSceneData {
  readonly term: Term
  readonly state?: CourseState
}

export interface GameDebugState {
  readonly teacherY: number
  readonly groundY: number
  readonly companionYs: number[]
  readonly energy: number
  readonly phase: string
}

const GROUND_Y = 318
const TEACHER_X = 198

export class GameScene extends Phaser.Scene {
  private courseState = createCourseState()
  private teacher!: Teacher
  private companions!: CompanionGroup
  private obstacles!: ObstaclePool
  private energyHud!: EnergyHud
  private pendingImpact = false

  constructor() {
    super("game")
  }

  init(data: Partial<GameSceneData>): void {
    this.courseState = data.state ?? createCourseState()
  }

  create(): void {
    this.add.image(320, 180, "term1").setDepth(0)
    this.physics.world.gravity.y = 980
    registerGameAnimations(this)

    this.teacher = new Teacher(this, TEACHER_X, GROUND_Y)
    this.companions = new CompanionGroup(this, TEACHER_X, GROUND_Y)
    this.companions.setCount(3)
    this.obstacles = new ObstaclePool(this, GROUND_Y)
    this.energyHud = new EnergyHud(this)
    this.energyHud.setEnergy(this.courseState.energy)

    this.physics.add.overlap(
      this.teacher,
      this.obstacles.active(),
      () => {
        this.pendingImpact = true
      },
    )

    this.input.on("pointerdown", this.requestJump, this)
    this.input.keyboard?.on("keydown-SPACE", this.requestJump, this)
    this.input.keyboard?.on("keydown-UP", this.requestJump, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
  }

  override update(_time: number, delta: number): void {
    this.obstacles.update()
    const step = advanceCourse(
      this.courseState,
      this.pendingImpact ? { impact: this.obstacles.activeKind() } : {},
      delta,
    )
    this.pendingImpact = false
    this.courseState = step.state
    this.energyHud.setEnergy(this.courseState.energy)
    this.teacher.setTiredness(this.courseState.energy)

    for (const event of step.events) {
      if (event.type !== "impact") continue
      this.teacher.playImpact()
      this.game.events.emit("game:impact", event.kind)
    }

    this.game.events.emit("game:debug", this.debugState())
  }

  private readonly requestJump = (): void => {
    if (!this.teacher.requestJump()) return
    this.game.events.emit("game:jump")
  }

  private debugState(): GameDebugState {
    return {
      teacherY: Math.round(this.teacher.y),
      groundY: GROUND_Y,
      companionYs: this.companions.visibleGroundPositions(),
      energy: this.courseState.energy,
      phase: this.courseState.phase,
    }
  }

  private shutdown(): void {
    this.input.off("pointerdown", this.requestJump, this)
    this.input.keyboard?.off("keydown-SPACE", this.requestJump, this)
    this.input.keyboard?.off("keydown-UP", this.requestJump, this)
    this.companions.destroy()
    this.obstacles.destroy()
    this.energyHud.destroy()
  }
}
