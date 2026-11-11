import type { Term } from "../game/types"

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/approved/`

export const APPROVED_AUDIO = {
  theme: `${AUDIO_BASE}main-theme.mp3`,
  christmas: `${AUDIO_BASE}holiday-christmas.mp3`,
  spring: `${AUDIO_BASE}holiday-spring.mp3`,
  courseEnd: `${AUDIO_BASE}course-end.mp3`,
  jump: `${AUDIO_BASE}jump.mp3`,
  newObstacle: `${AUDIO_BASE}new-obstacle.mp3`,
} as const

export interface AudioLike {
  loop: boolean
  volume: number
  playbackRate: number
  currentTime: number
  preservesPitch?: boolean
  preload?: string
  load?(): void
  play(): Promise<void> | void
  pause(): void
}

export interface AudioController {
  unlock(): Promise<void>
  prepareEssentialAudio(onProgress?: AudioProgress): Promise<void>
  prepareDeferredAudio(): Promise<void>
  startTerm(term: Term): void
  setWorldSpeed(worldSpeed: number): void
  playJump(): void
  playCollision(): void
  playHoliday(afterTerm: 1 | 2): void
  playCourseEnd(): void
  setMuted(muted: boolean): void
  isMuted(): boolean
  stop(): void
}

export type AudioProgress = (loaded: number, total: number) => void

export interface AudioStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface AudioControllerOptions {
  createAudio?: (src: string) => AudioLike
  storage?: AudioStorage | null
  loadAudio?: (src: string) => Promise<void>
}
