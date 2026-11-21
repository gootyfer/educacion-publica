import type { ObstacleKind, Term } from "../../course/types"

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/approved/`

export const AUDIO_ASSETS = {
  "audio-theme": `${AUDIO_BASE}main-theme.mp3`,
  "audio-christmas": `${AUDIO_BASE}holiday-christmas.mp3`,
  "audio-spring": `${AUDIO_BASE}holiday-spring.mp3`,
  "audio-course-end": `${AUDIO_BASE}course-end.mp3`,
  "audio-jump": `${AUDIO_BASE}jump.mp3`,
  "audio-impact": `${AUDIO_BASE}new-obstacle.mp3`,
} as const

interface SoundLike {
  readonly isPlaying?: boolean
  play(): unknown
  stop(): unknown
  setRate(rate: number): unknown
  destroy(): unknown
}

interface SoundManagerLike {
  mute: boolean
  add(key: string, config?: Record<string, unknown>): SoundLike
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const MUTE_KEY = "jornada-muted"
const LEGACY_MUTE_KEY = "curso-docente-audio-muted-v1"

export class GameAudio {
  private readonly sounds = new Map<keyof typeof AUDIO_ASSETS, SoundLike>()
  private unlocked = false
  private muted: boolean
  private activeTerm: Term | null = null
  private inTransition = false
  private destroyed = false
  private desiredThemeRate = 1
  private appliedThemeRate = 1

  constructor(
    private readonly manager: SoundManagerLike,
    private readonly storage: StorageLike | null = browserStorage(),
  ) {
    this.muted = this.readMuted()
    this.manager.mute = this.muted
  }

  unlock(): void {
    if (this.destroyed || this.unlocked) return
    this.unlocked = true
    this.resumeTheme()
  }

  startTerm(term: Term): void {
    if (this.destroyed) return
    this.activeTerm = term
    this.inTransition = false
    this.resetThemeRate()
    this.stopEffects()
    this.resumeTheme()
  }

  playJump(): void {
    this.playEffect("audio-jump")
  }

  playImpact(_kind: ObstacleKind): void {
    this.playEffect("audio-impact")
  }

  playHoliday(term: 1 | 2): void {
    if (this.destroyed) return
    this.inTransition = true
    this.resetThemeRate()
    this.stop("audio-theme")
    this.playEffect(term === 1 ? "audio-christmas" : "audio-spring")
  }

  playCourseEnd(): void {
    if (this.destroyed) return
    this.activeTerm = null
    this.inTransition = true
    this.resetThemeRate()
    this.stop("audio-theme")
    this.playEffect("audio-course-end")
  }

  setMuted(muted: boolean): void {
    if (this.destroyed) return
    this.muted = muted
    this.manager.mute = muted
    try {
      this.storage?.setItem(MUTE_KEY, String(muted))
    } catch {
      // El almacenamiento no es necesario para jugar.
    }
    if (muted) this.stopAll()
    else this.resumeTheme()
  }

  isMuted(): boolean {
    return this.muted
  }

  setPressure(pressure: number): void {
    if (this.destroyed) return
    const nextRate = Math.round((1 + clamp(pressure, 0, 1) * 0.24) * 100) / 100
    if (nextRate === this.desiredThemeRate) return
    this.desiredThemeRate = nextRate
    this.applyThemeRate()
  }

  currentRate(): number {
    return this.desiredThemeRate
  }

  destroy(): void {
    if (this.destroyed) return
    this.resetThemeRate()
    this.destroyed = true
    for (const sound of this.sounds.values()) {
      safely(() => sound.stop())
      safely(() => sound.destroy())
    }
    this.sounds.clear()
  }

  private resumeTheme(): void {
    if (
      this.destroyed ||
      !this.unlocked ||
      this.muted ||
      this.activeTerm === null ||
      this.inTransition
    ) {
      return
    }
    const theme = this.soundFor("audio-theme")
    if (!theme || theme.isPlaying) return
    safely(() => theme.play())
  }

  private playEffect(key: keyof typeof AUDIO_ASSETS): void {
    if (this.destroyed || !this.unlocked || this.muted) return
    const sound = this.soundFor(key)
    if (!sound) return
    safely(() => sound.stop())
    safely(() => sound.play())
  }

  private stop(key: keyof typeof AUDIO_ASSETS): void {
    const sound = this.sounds.get(key)
    if (sound) safely(() => sound.stop())
  }

  private stopEffects(): void {
    for (const key of this.sounds.keys()) {
      if (key !== "audio-theme") this.stop(key)
    }
  }

  private stopAll(): void {
    for (const key of this.sounds.keys()) this.stop(key)
  }

  private soundFor(key: keyof typeof AUDIO_ASSETS): SoundLike | undefined {
    const existing = this.sounds.get(key)
    if (existing) return existing
    try {
      const sound = this.manager.add(key, {
        loop: key === "audio-theme",
        volume: key === "audio-theme" ? 0.32 : 0.78,
      })
      this.sounds.set(key, sound)
      if (key === "audio-theme") {
        this.appliedThemeRate = 1
        this.applyThemeRate()
      }
      return sound
    } catch {
      return undefined
    }
  }

  private readMuted(): boolean {
    try {
      const current = this.storage?.getItem(MUTE_KEY)
      if (current !== null && current !== undefined) return current === "true"
      const legacy = this.storage?.getItem(LEGACY_MUTE_KEY)
      if (legacy !== null && legacy !== undefined) {
        this.storage?.setItem(MUTE_KEY, legacy)
        return legacy === "true"
      }
      return false
    } catch {
      return false
    }
  }

  private resetThemeRate(): void {
    this.desiredThemeRate = 1
    this.applyThemeRate()
  }

  private applyThemeRate(): void {
    const theme = this.sounds.get("audio-theme")
    if (!theme || this.appliedThemeRate === this.desiredThemeRate) return
    safely(() => theme.setRate(this.desiredThemeRate))
    this.appliedThemeRate = this.desiredThemeRate
    const source = (theme as unknown as { source?: Record<string, unknown> }).source
    if (!source) return
    for (const property of ["preservesPitch", "mozPreservesPitch", "webkitPreservesPitch"]) {
      if (property in source) source[property] = true
    }
  }
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function safely(action: () => unknown): void {
  try {
    const result = action()
    if (result instanceof Promise) void result.catch(() => undefined)
  } catch {
    // La reproducción nunca controla el estado del juego.
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
