import type { ObstacleKind, Term } from "../../course/types"

export const AUDIO_ASSETS = {
  "audio-theme": "/audio/approved/main-theme.mp3",
  "audio-christmas": "/audio/approved/holiday-christmas.mp3",
  "audio-spring": "/audio/approved/holiday-spring.mp3",
  "audio-course-end": "/audio/approved/course-end.mp3",
  "audio-jump": "/audio/approved/jump.mp3",
  "audio-impact": "/audio/approved/new-obstacle.mp3",
} as const

interface SoundLike {
  readonly isPlaying?: boolean
  play(): unknown
  stop(): unknown
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

export class GameAudio {
  private readonly sounds = new Map<keyof typeof AUDIO_ASSETS, SoundLike>()
  private unlocked = false
  private muted: boolean
  private activeTerm: Term | null = null
  private inTransition = false
  private destroyed = false

  constructor(
    private readonly manager: SoundManagerLike,
    private readonly storage: StorageLike | null = browserStorage(),
  ) {
    this.muted = this.readMuted()
    this.manager.mute = this.muted
    for (const key of Object.keys(AUDIO_ASSETS) as Array<
      keyof typeof AUDIO_ASSETS
    >) {
      try {
        this.sounds.set(
          key,
          manager.add(key, {
            loop: key === "audio-theme",
            volume: key === "audio-theme" ? 0.32 : 0.78,
          }),
        )
      } catch {
        // El audio es opcional: Phaser puede omitir una carga fallida.
      }
    }
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
    this.stop("audio-theme")
    this.playEffect(term === 1 ? "audio-christmas" : "audio-spring")
  }

  playCourseEnd(): void {
    if (this.destroyed) return
    this.activeTerm = null
    this.inTransition = true
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

  destroy(): void {
    if (this.destroyed) return
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
    const theme = this.sounds.get("audio-theme")
    if (!theme || theme.isPlaying) return
    safely(() => theme.play())
  }

  private playEffect(key: keyof typeof AUDIO_ASSETS): void {
    if (this.destroyed || !this.unlocked || this.muted) return
    const sound = this.sounds.get(key)
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

  private readMuted(): boolean {
    try {
      return this.storage?.getItem(MUTE_KEY) === "true"
    } catch {
      return false
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
