import type { DamageKind, ObstacleVariant, Term } from "../game/types"

export const APPROVED_AUDIO = {
  theme: "/audio/approved/main-theme.mp3",
  termEnd: "/audio/approved/term-end.mp3",
  christmas: "/audio/approved/holiday-christmas.mp3",
  spring: "/audio/approved/holiday-spring.mp3",
  courseEnd: "/audio/approved/course-end.mp3",
  jump: "/audio/approved/jump.mp3",
  paper: "/audio/approved/paper.mp3",
  fan: "/audio/approved/fan.mp3",
  leak: "/audio/approved/leak.mp3",
  rubble: "/audio/approved/rubble.mp3",
  newObstacle: "/audio/approved/new-obstacle.mp3",
} as const

export interface AudioLike {
  loop: boolean
  volume: number
  playbackRate: number
  currentTime: number
  preservesPitch?: boolean
  preload?: string
  play(): Promise<void> | void
  pause(): void
}

export interface AudioController {
  unlock(): Promise<void>
  startTerm(term: Term): void
  setWorldSpeed(worldSpeed: number): void
  playJump(): void
  playCollision(kind: DamageKind, variant?: ObstacleVariant): void
  playNewObstacle(): void
  playTermEnd(term: Term): void
  playHoliday(afterTerm: 1 | 2): void
  playCourseEnd(): void
  setMuted(muted: boolean): void
  isMuted(): boolean
  stop(): void
}

export interface AudioStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface AudioControllerOptions {
  createAudio?: (src: string) => AudioLike
  storage?: AudioStorage | null
}
