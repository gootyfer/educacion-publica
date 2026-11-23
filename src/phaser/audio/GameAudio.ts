import type { ObstacleKind, Term } from "../../course/types"

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/approved/`

export const AUDIO_ASSETS = {
  "audio-title": `${AUDIO_BASE}main-theme-extended-80s.mp3`,
  "audio-theme": `${AUDIO_BASE}main-theme.mp3`,
  "audio-christmas": `${AUDIO_BASE}holiday-christmas.mp3`,
  "audio-spring": `${AUDIO_BASE}holiday-spring.mp3`,
  "audio-results": `${AUDIO_BASE}main-theme-electronic-80s.mp3`,
  "audio-jump": `${AUDIO_BASE}jump.mp3`,
  "audio-impact": `${AUDIO_BASE}new-obstacle.mp3`,
} as const

type MusicKey = "audio-title" | "audio-theme" | "audio-results"

const MUSIC_KEYS: readonly MusicKey[] = [
  "audio-title",
  "audio-theme",
  "audio-results",
]

interface SoundLike {
  readonly isPlaying?: boolean
  play(): unknown
  stop(): unknown
  setRate(rate: number): unknown
  destroy(): unknown
}

interface SoundManagerLike {
  mute: boolean
  readonly locked?: boolean
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
  private activeMusic: MusicKey | null = null
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
    if (this.destroyed || this.unlocked || this.manager.locked === true) return
    this.unlocked = true
    this.resumeMusic()
  }

  playTitle(): void {
    if (this.destroyed) return
    this.resetThemeRate()
    this.stopEffects()
    this.selectMusic("audio-title")
  }

  startTerm(_term: Term): void {
    if (this.destroyed) return
    this.resetThemeRate()
    this.stopEffects()
    this.selectMusic("audio-theme")
  }

  playJump(): void {
    this.playEffect("audio-jump")
  }

  playImpact(_kind: ObstacleKind): void {
    this.playEffect("audio-impact")
  }

  playHoliday(term: 1 | 2): void {
    if (this.destroyed) return
    this.resetThemeRate()
    this.selectMusic(null)
    this.playEffect(term === 1 ? "audio-christmas" : "audio-spring")
  }

  playCourseEnd(): void {
    if (this.destroyed) return
    this.resetThemeRate()
    this.stopEffects()
    this.selectMusic("audio-results")
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
    else this.resumeMusic()
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

  private resumeMusic(): void {
    if (this.destroyed || !this.unlocked || this.muted || !this.activeMusic) {
      return
    }
    const music = this.soundFor(this.activeMusic)
    if (!music || music.isPlaying) return
    safely(() => music.play())
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
      if (!MUSIC_KEYS.includes(key as MusicKey)) this.stop(key)
    }
  }

  private selectMusic(key: MusicKey | null): void {
    if (this.activeMusic === key) {
      this.resumeMusic()
      return
    }
    for (const musicKey of MUSIC_KEYS) this.stop(musicKey)
    this.activeMusic = key
    this.resumeMusic()
  }

  private stopAll(): void {
    for (const key of this.sounds.keys()) this.stop(key)
  }

  private soundFor(key: keyof typeof AUDIO_ASSETS): SoundLike | undefined {
    const existing = this.sounds.get(key)
    if (existing) return existing
    try {
      const sound = this.manager.add(key, {
        loop: MUSIC_KEYS.includes(key as MusicKey),
        volume: MUSIC_KEYS.includes(key as MusicKey) ? 0.32 : 0.78,
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
