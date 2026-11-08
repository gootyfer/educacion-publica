import { describe, expect, it, vi } from "vitest"

import {
  createAudioController,
  playbackRateForWorldSpeed,
} from "../../src/audio/controller"
import { APPROVED_AUDIO } from "../../src/audio/types"
import { GAME_CONFIG } from "../../src/game/config"

class FakeAudio {
  loop = false
  volume = 1
  private themeRate = 1
  playbackRateWrites = 0
  currentTime = 0
  preservesPitch = false
  playCount = 0
  pauseCount = 0

  constructor(
    readonly src: string,
    private readonly rejectPlay = false,
  ) {}

  get playbackRate() {
    return this.themeRate
  }

  set playbackRate(value: number) {
    this.themeRate = value
    this.playbackRateWrites += 1
  }

  play() {
    this.playCount += 1
    return this.rejectPlay
      ? Promise.reject(new Error("Audio blocked"))
      : Promise.resolve()
  }

  pause() {
    this.pauseCount += 1
  }
}

function setup(options: { rejectPlay?: boolean; storage?: Storage } = {}) {
  const audioBySrc = new Map<string, FakeAudio>()
  const controller = createAudioController({
    createAudio(src) {
      const audio = new FakeAudio(src, options.rejectPlay)
      audioBySrc.set(src, audio)
      return audio
    },
    storage: options.storage ?? null,
  })
  return {
    controller,
    createdSources: [...audioBySrc.keys()],
    audio(path: string) {
      const audio = audioBySrc.get(path)
      if (!audio) throw new Error(`Audio no creado: ${path}`)
      return audio
    },
  }
}

describe("audio controller", () => {
  it("does not play before interaction and starts the approved theme once unlocked", async () => {
    const { controller, audio } = setup()

    controller.startTerm(1)
    expect(audio(APPROVED_AUDIO.theme).playCount).toBe(0)

    await controller.unlock()
    expect(audio(APPROVED_AUDIO.theme).playCount).toBe(1)
    await controller.unlock()
    expect(audio(APPROVED_AUDIO.theme).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.theme).loop).toBe(true)
    expect(audio(APPROVED_AUDIO.theme).volume).toBeLessThan(
      audio(APPROVED_AUDIO.jump).volume,
    )
  })

  it("maps world speed continuously into the approved musical range", () => {
    const maxCourseSpeed =
      GAME_CONFIG.obstacleSpeed *
      GAME_CONFIG.termInitialSpeedMultipliers[3] *
      (1 + GAME_CONFIG.termMaxSpeedRamps[3])
    const midCourseSpeed = (GAME_CONFIG.obstacleSpeed + maxCourseSpeed) / 2

    expect(playbackRateForWorldSpeed(GAME_CONFIG.obstacleSpeed)).toBe(1)
    expect(playbackRateForWorldSpeed(midCourseSpeed)).toBe(1.12)
    expect(playbackRateForWorldSpeed(maxCourseSpeed)).toBe(1.24)
    expect(playbackRateForWorldSpeed(0)).toBe(1)
    expect(playbackRateForWorldSpeed(Number.POSITIVE_INFINITY)).toBe(1.24)
  })

  it("updates tempo only when its hundredth changes without starting playback", () => {
    const { controller, audio } = setup()
    controller.startTerm(1)
    const theme = audio(APPROVED_AUDIO.theme)
    const writesAfterStart = theme.playbackRateWrites

    controller.setWorldSpeed(GAME_CONFIG.obstacleSpeed + 1)
    expect(theme.playbackRateWrites).toBe(writesAfterStart)
    const maxCourseSpeed =
      GAME_CONFIG.obstacleSpeed *
      GAME_CONFIG.termInitialSpeedMultipliers[3] *
      (1 + GAME_CONFIG.termMaxSpeedRamps[3])
    controller.setWorldSpeed((GAME_CONFIG.obstacleSpeed + maxCourseSpeed) / 2)
    expect(theme.playbackRate).toBe(1.12)
    expect(theme.playbackRateWrites).toBe(writesAfterStart + 1)
    expect(theme.preservesPitch).toBe(true)
    expect(theme.playCount).toBe(0)

    controller.setMuted(true)
    controller.setWorldSpeed(maxCourseSpeed)
    expect(theme.playbackRate).toBe(1.24)
    expect(theme.playCount).toBe(0)
  })

  it("starts later terms at a higher musical intensity", async () => {
    const { controller, audio } = setup()
    await controller.unlock()

    controller.startTerm(1)
    expect(audio(APPROVED_AUDIO.theme).playbackRate).toBe(1)
    controller.startTerm(2)
    expect(audio(APPROVED_AUDIO.theme).playbackRate).toBe(
      playbackRateForWorldSpeed(
        GAME_CONFIG.obstacleSpeed * GAME_CONFIG.termInitialSpeedMultipliers[2],
      ),
    )
    controller.startTerm(3)
    expect(audio(APPROVED_AUDIO.theme).playbackRate).toBe(
      playbackRateForWorldSpeed(
        GAME_CONFIG.obstacleSpeed * GAME_CONFIG.termInitialSpeedMultipliers[3],
      ),
    )
  })

  it("plays only the seasonal cue and pauses the theme during holidays", async () => {
    const { controller, audio } = setup()
    await controller.unlock()
    controller.startTerm(1)

    expect("playTermEnd" in controller).toBe(false)

    controller.playHoliday(1)
    controller.playHoliday(2)
    expect(audio(APPROVED_AUDIO.christmas).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.spring).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.theme).pauseCount).toBeGreaterThan(0)
  })

  it("uses the same notification for every collision and creates no obsolete effects", async () => {
    const { controller, audio, createdSources } = setup()
    await controller.unlock()

    controller.playJump()
    controller.playCollision()
    controller.playCollision()
    controller.playCollision()
    controller.playCollision()
    controller.playCourseEnd()

    expect(audio(APPROVED_AUDIO.jump).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.newObstacle).playCount).toBe(4)
    expect(audio(APPROVED_AUDIO.courseEnd).playCount).toBe(1)
    expect(createdSources).not.toEqual(
      expect.arrayContaining([
        "/audio/approved/term-end.mp3",
        "/audio/approved/paper.mp3",
        "/audio/approved/fan.mp3",
        "/audio/approved/leak.mp3",
        "/audio/approved/rubble.mp3",
      ]),
    )
  })

  it("persists mute and prevents every kind of playback", async () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    } as unknown as Storage
    const { controller, audio } = setup({ storage })
    await controller.unlock()
    controller.setMuted(true)

    controller.startTerm(1)
    controller.playJump()
    controller.playCollision()
    controller.playHoliday(1)
    controller.playCourseEnd()

    expect(controller.isMuted()).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      "curso-docente-audio-muted-v1",
      "true",
    )
    expect(audio(APPROVED_AUDIO.jump).playCount).toBe(0)
    expect(audio(APPROVED_AUDIO.newObstacle).playCount).toBe(0)
    expect(audio(APPROVED_AUDIO.courseEnd).playCount).toBe(0)
  })

  it("does not restart the theme when unmuted during a holiday", async () => {
    const { controller, audio } = setup()
    await controller.unlock()
    controller.startTerm(1)
    expect(audio(APPROVED_AUDIO.theme).playCount).toBe(1)

    controller.playHoliday(1)
    controller.setMuted(true)
    controller.setMuted(false)

    expect(audio(APPROVED_AUDIO.theme).playCount).toBe(1)
  })

  it("swallows rejected playback and blocked storage", async () => {
    const blockedStorage = {
      getItem() {
        throw new DOMException("Blocked", "SecurityError")
      },
      setItem() {
        throw new DOMException("Blocked", "SecurityError")
      },
    } as unknown as Storage
    const { controller } = setup({ rejectPlay: true, storage: blockedStorage })

    await expect(controller.unlock()).resolves.toBeUndefined()
    expect(() => controller.startTerm(1)).not.toThrow()
    expect(() => controller.setWorldSpeed(240)).not.toThrow()
    expect(() => controller.playJump()).not.toThrow()
    expect(() => controller.setMuted(true)).not.toThrow()
    await Promise.resolve()
  })
})
