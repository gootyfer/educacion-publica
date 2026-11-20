import Phaser from "phaser"

import { TERM_BACKGROUNDS } from "../../course/cadence"
import { advanceCourse, createCourseState } from "../../course/progression"
import type { CourseState, Term } from "../../course/types"
import { registerGameAnimations } from "../animations"
import { CompanionGroup } from "../entities/CompanionGroup"
import { ObstaclePool } from "../entities/ObstaclePool"
import { Teacher } from "../entities/Teacher"
import { EnergyHud } from "../ui/EnergyHud"
import { AUDIO_ASSETS } from "../audio/GameAudio"

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
  readonly term: Term
  readonly companionCount: number
  readonly obstacleKind: string
  readonly background: string
  readonly obstaclePoolSize: number
  readonly obstacleX: number
  readonly impactCount: number
  readonly teacherCollisionBottom: number
  readonly obstacleCollisionTop: number
  readonly inputBindingCount: number
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
  private lastEnergyBucket = 10

  constructor() {
    super("game")
  }

  init(data: Partial<GameSceneData>): void {
    this.courseState = data.state ?? createCourseState()
  }

  preload(): void {
    for (const key of ["audio-theme", "audio-jump", "audio-impact"] as const) {
      if (!this.cache.audio.exists(key)) this.load.audio(key, AUDIO_ASSETS[key])
    }
  }

  create(): void {
    const background = TERM_BACKGROUNDS[this.courseState.term]
    this.add.image(320, 180, background).setDepth(0)
    this.physics.world.gravity.y = 980
    registerGameAnimations(this)

    this.teacher = new Teacher(this, TEACHER_X, GROUND_Y)
    this.companions = new CompanionGroup(this, TEACHER_X, GROUND_Y)
    this.companions.setCount(this.courseState.companionCount)
    this.obstacles = new ObstaclePool(
      this,
      GROUND_Y,
      this.courseState,
      this.seedFromLocation(),
    )
    this.energyHud = new EnergyHud(this)
    this.energyHud.setEnergy(this.courseState.energy)
    this.lastEnergyBucket = Math.ceil(this.courseState.energy / 10)
    this.game.events.emit("game:energy", this.courseState.energy)

    this.physics.add.overlap(
      this.teacher,
      this.obstacles.active(),
      () => {
        this.pendingImpact = true
      },
    )

    this.input.on("pointerdown", this.requestJump, this)
    this.input.keyboard?.on("keydown-SPACE", this.requestKeyboardJump, this)
    this.input.keyboard?.on("keydown-UP", this.requestKeyboardJump, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this)
    this.game.events.emit("scene:game", this.courseState.term)
  }

  override update(_time: number, delta: number): void {
    this.obstacles.update(this.courseState)
    const step = advanceCourse(
      this.courseState,
      this.pendingImpact ? { impact: this.obstacles.activeKind() } : {},
      delta,
    )
    this.pendingImpact = false
    this.courseState = step.state
    this.companions.setCount(this.courseState.companionCount)
    this.energyHud.setEnergy(this.courseState.energy)
    const energyBucket = Math.ceil(this.courseState.energy / 10)
    if (energyBucket !== this.lastEnergyBucket) {
      this.lastEnergyBucket = energyBucket
      this.game.events.emit("game:energy", this.courseState.energy)
    }
    this.teacher.setTiredness(this.courseState.energy)

    for (const event of step.events) {
      if (event.type === "impact") {
        this.teacher.playImpact()
        this.game.events.emit("game:impact", event.kind)
      } else if (event.type === "companions-added") {
        this.game.events.emit(
          "game:companions-added",
          this.courseState.companionCount,
        )
      } else if (event.type === "term-ended") {
        this.physics.pause()
        this.game.events.emit("game:term-ended", event.term, this.courseState)
        this.scene.start("term-break", {
          completedTerm: event.term,
          nextTerm: event.term === 1 ? 2 : 3,
          state: this.courseState,
        })
      } else if (event.type === "course-ended") {
        this.physics.pause()
        this.game.events.emit("game:course-ended", this.courseState)
        const result = this.courseState.completedTerms.at(-1)
        if (result) {
          this.scene.start("results", { result, state: this.courseState })
        }
      }
    }

    this.game.events.emit("game:debug", this.debugState())
  }

  private readonly requestJump = (): void => {
    if (!this.teacher.requestJump()) return
    this.game.events.emit("game:jump")
  }

  private readonly requestKeyboardJump = (): void => {
    if (typeof document !== "undefined") {
      const gameSurface = this.game.canvas.parentElement
      if (document.activeElement !== gameSurface) return
    }
    this.requestJump()
  }

  private debugState(): GameDebugState {
    return {
      teacherY: Math.round(this.teacher.y),
      groundY: GROUND_Y,
      companionYs: this.companions.visibleGroundPositions(),
      energy: this.courseState.energy,
      phase: this.courseState.phase,
      term: this.courseState.term,
      companionCount: this.companions.visibleCount(),
      obstacleKind: this.obstacles.activeKind(),
      background: TERM_BACKGROUNDS[this.courseState.term],
      obstaclePoolSize: this.obstacles.size(),
      obstacleX: Math.round(this.obstacles.activeX()),
      impactCount: Object.values(this.courseState.impacts).reduce(
        (total, count) => total + count,
        0,
      ),
      teacherCollisionBottom: Math.round(this.teacher.collisionBottom()),
      obstacleCollisionTop: Math.round(this.obstacles.collisionTop()),
      inputBindingCount:
        this.input.listenerCount("pointerdown") +
        (this.input.keyboard?.listenerCount("keydown-SPACE") ?? 0) +
        (this.input.keyboard?.listenerCount("keydown-UP") ?? 0),
    }
  }

  private seedFromLocation(): number {
    if (typeof window === "undefined") return 2_026
    const seed = Number(new URLSearchParams(window.location.search).get("seed"))
    return Number.isFinite(seed) && seed > 0 ? seed : 2_026
  }

  private shutdown(): void {
    this.input.off("pointerdown", this.requestJump, this)
    this.input.keyboard?.off("keydown-SPACE", this.requestKeyboardJump, this)
    this.input.keyboard?.off("keydown-UP", this.requestKeyboardJump, this)
    this.companions.destroy()
    this.obstacles.destroy()
    this.energyHud.destroy()
  }
}
