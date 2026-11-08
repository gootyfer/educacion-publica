import type { Term } from "../game/types"
import { GAME_CONFIG } from "../game/config"
import {
  APPROVED_AUDIO,
  type AudioController,
  type AudioControllerOptions,
  type AudioLike,
} from "./types"

const MUTE_STORAGE_KEY = "curso-docente-audio-muted-v1"
const MIN_PLAYBACK_RATE = 1
const MAX_PLAYBACK_RATE = 1.24

export function playbackRateForWorldSpeed(worldSpeed: number): number {
  if (Number.isNaN(worldSpeed)) return MIN_PLAYBACK_RATE
  const minWorldSpeed = GAME_CONFIG.obstacleSpeed
  const maxWorldSpeed =
    GAME_CONFIG.obstacleSpeed *
    GAME_CONFIG.termInitialSpeedMultipliers[3] *
    (1 + GAME_CONFIG.termMaxSpeedRamps[3])
  const progress = Math.min(
    1,
    Math.max(0, (worldSpeed - minWorldSpeed) / (maxWorldSpeed - minWorldSpeed)),
  )
  const rate =
    MIN_PLAYBACK_RATE + progress * (MAX_PLAYBACK_RATE - MIN_PLAYBACK_RATE)
  return Math.round(rate * 100) / 100
}

export function createAudioController({
  createAudio = (src) => new Audio(src),
  storage = getBrowserStorage(),
}: AudioControllerOptions = {}): AudioController {
  const audio = {
    theme: createAudio(APPROVED_AUDIO.theme),
    christmas: createAudio(APPROVED_AUDIO.christmas),
    spring: createAudio(APPROVED_AUDIO.spring),
    courseEnd: createAudio(APPROVED_AUDIO.courseEnd),
    jump: createAudio(APPROVED_AUDIO.jump),
    newObstacle: createAudio(APPROVED_AUDIO.newObstacle),
  }
  const allAudio = Object.values(audio)
  const effects = allAudio.filter((item) => item !== audio.theme)

  audio.theme.loop = true
  audio.theme.volume = 0.32
  audio.theme.preload = "auto"
  if ("preservesPitch" in audio.theme) audio.theme.preservesPitch = true
  for (const effect of effects) {
    effect.loop = false
    effect.volume = 0.78
    effect.preload = "auto"
  }

  let unlocked = false
  let muted = readMuted(storage)
  let activeTerm: Term | null = null
  let suspendedForTransition = false

  return {
    async unlock() {
      if (unlocked) return
      unlocked = true
      if (activeTerm !== null && !muted) await safePlay(audio.theme)
    },
    startTerm(term) {
      activeTerm = term
      suspendedForTransition = false
      pauseEffects(effects)
      audio.theme.currentTime = 0
      applyWorldSpeed(
        GAME_CONFIG.obstacleSpeed *
          GAME_CONFIG.termInitialSpeedMultipliers[term],
      )
      if (unlocked && !muted) void safePlay(audio.theme)
    },
    setWorldSpeed(worldSpeed) {
      applyWorldSpeed(worldSpeed)
    },
    playJump() {
      playEffect(audio.jump)
    },
    playCollision() {
      playEffect(audio.newObstacle)
    },
    playHoliday(afterTerm) {
      suspendedForTransition = true
      audio.theme.pause()
      playEffect(afterTerm === 1 ? audio.christmas : audio.spring)
    },
    playCourseEnd() {
      activeTerm = null
      suspendedForTransition = true
      audio.theme.pause()
      playEffect(audio.courseEnd)
    },
    setMuted(nextMuted) {
      muted = nextMuted
      writeMuted(storage, muted)
      if (muted) {
        pauseAll(allAudio)
      } else if (
        unlocked &&
        activeTerm !== null &&
        !suspendedForTransition
      ) {
        void safePlay(audio.theme)
      }
    },
    isMuted() {
      return muted
    },
    stop() {
      activeTerm = null
      suspendedForTransition = true
      pauseAll(allAudio)
    },
  }

  function applyWorldSpeed(worldSpeed: number) {
    const nextRate = playbackRateForWorldSpeed(worldSpeed)
    if (audio.theme.playbackRate === nextRate) return
    audio.theme.playbackRate = nextRate
    if ("preservesPitch" in audio.theme) audio.theme.preservesPitch = true
  }

  function playEffect(effect: AudioLike) {
    if (!unlocked || muted) return
    effect.currentTime = 0
    void safePlay(effect)
  }
}

async function safePlay(audio: AudioLike) {
  try {
    await audio.play()
  } catch {
    // Audio is optional: autoplay policies and missing files must not stop play.
  }
}

function pauseEffects(effects: AudioLike[]) {
  for (const effect of effects) {
    effect.pause()
    effect.currentTime = 0
  }
}

function pauseAll(items: AudioLike[]) {
  for (const item of items) item.pause()
}

function readMuted(storage: AudioControllerOptions["storage"]): boolean {
  try {
    return storage?.getItem(MUTE_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function writeMuted(
  storage: AudioControllerOptions["storage"],
  muted: boolean,
) {
  try {
    storage?.setItem(MUTE_STORAGE_KEY, String(muted))
  } catch {
    // Storage can be disabled without affecting audio or gameplay.
  }
}

function getBrowserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}
