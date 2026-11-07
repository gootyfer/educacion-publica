import type { ObstacleVariant, Term } from "../game/types"
import {
  APPROVED_AUDIO,
  type AudioController,
  type AudioControllerOptions,
  type AudioLike,
} from "./types"

const MUTE_STORAGE_KEY = "curso-docente-audio-muted-v1"
const INTENSITY_RATES = [1, 1.075, 1.15] as const

export function createAudioController({
  createAudio = (src) => new Audio(src),
  storage = getBrowserStorage(),
}: AudioControllerOptions = {}): AudioController {
  const audio = {
    theme: createAudio(APPROVED_AUDIO.theme),
    termEnd: createAudio(APPROVED_AUDIO.termEnd),
    christmas: createAudio(APPROVED_AUDIO.christmas),
    spring: createAudio(APPROVED_AUDIO.spring),
    courseEnd: createAudio(APPROVED_AUDIO.courseEnd),
    jump: createAudio(APPROVED_AUDIO.jump),
    paper: createAudio(APPROVED_AUDIO.paper),
    fan: createAudio(APPROVED_AUDIO.fan),
    leak: createAudio(APPROVED_AUDIO.leak),
    rubble: createAudio(APPROVED_AUDIO.rubble),
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
  let lastEndedTerm: Term | null = null

  return {
    async unlock() {
      if (unlocked) return
      unlocked = true
      if (activeTerm !== null && !muted) await safePlay(audio.theme)
    },
    startTerm(term) {
      activeTerm = term
      lastEndedTerm = null
      pauseEffects(effects)
      audio.theme.currentTime = 0
      if (unlocked && !muted) void safePlay(audio.theme)
    },
    setIntensity(level) {
      audio.theme.playbackRate = INTENSITY_RATES[level]
      if ("preservesPitch" in audio.theme) audio.theme.preservesPitch = true
    },
    playJump() {
      playEffect(audio.jump)
    },
    playCollision(kind, variant) {
      playEffect(collisionAudio(audio, kind, variant))
    },
    playNewObstacle() {
      playEffect(audio.newObstacle)
    },
    playTermEnd(term) {
      if (lastEndedTerm === term) return
      lastEndedTerm = term
      audio.theme.pause()
      playEffect(audio.termEnd)
    },
    playHoliday(afterTerm) {
      audio.theme.pause()
      playEffect(afterTerm === 1 ? audio.christmas : audio.spring)
    },
    playCourseEnd() {
      activeTerm = null
      audio.theme.pause()
      playEffect(audio.courseEnd)
    },
    setMuted(nextMuted) {
      muted = nextMuted
      writeMuted(storage, muted)
      if (muted) {
        pauseAll(allAudio)
      } else if (unlocked && activeTerm !== null) {
        void safePlay(audio.theme)
      }
    },
    isMuted() {
      return muted
    },
    stop() {
      activeTerm = null
      pauseAll(allAudio)
    },
  }

  function playEffect(effect: AudioLike) {
    if (!unlocked || muted) return
    effect.currentTime = 0
    void safePlay(effect)
  }
}

function collisionAudio(
  audio: Record<"paper" | "fan" | "leak" | "rubble", AudioLike>,
  kind: "paperwork" | "heat" | "infrastructure",
  variant?: ObstacleVariant,
): AudioLike {
  if (variant === "leak") return audio.leak
  if (variant === "wall") return audio.rubble
  if (kind === "paperwork") return audio.paper
  if (kind === "heat") return audio.fan
  return audio.rubble
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
