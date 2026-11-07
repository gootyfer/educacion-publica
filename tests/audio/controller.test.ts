import { describe, expect, it, vi } from "vitest"

import { createAudioController } from "../../src/audio/controller"
import { APPROVED_AUDIO } from "../../src/audio/types"

class FakeAudio {
  loop = false
  volume = 1
  playbackRate = 1
  currentTime = 0
  preservesPitch = false
  playCount = 0
  pauseCount = 0

  constructor(
    readonly src: string,
    private readonly rejectPlay = false,
  ) {}

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

  it("uses three discrete intensities and caps playback speed at 1.15", async () => {
    const { controller, audio } = setup()
    await controller.unlock()
    controller.startTerm(1)

    controller.setIntensity(0)
    expect(audio(APPROVED_AUDIO.theme).playbackRate).toBe(1)
    controller.setIntensity(1)
    expect(audio(APPROVED_AUDIO.theme).playbackRate).toBe(1.075)
    controller.setIntensity(2)
    expect(audio(APPROVED_AUDIO.theme).playbackRate).toBe(1.15)
    expect(audio(APPROVED_AUDIO.theme).preservesPitch).toBe(true)
  })

  it("plays one term signature and pauses the theme during holidays", async () => {
    const { controller, audio } = setup()
    await controller.unlock()
    controller.startTerm(1)

    controller.playTermEnd(1)
    controller.playTermEnd(1)
    expect(audio(APPROVED_AUDIO.termEnd).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.theme).pauseCount).toBeGreaterThan(0)

    controller.playHoliday(1)
    controller.playHoliday(2)
    expect(audio(APPROVED_AUDIO.christmas).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.spring).playCount).toBe(1)
  })

  it("differentiates collisions and the remaining game cues", async () => {
    const { controller, audio } = setup()
    await controller.unlock()

    controller.playJump()
    controller.playCollision("paperwork", "paper-stack")
    controller.playCollision("heat", "heat-climate")
    controller.playCollision("infrastructure", "leak")
    controller.playCollision("infrastructure", "wall")
    controller.playNewObstacle()
    controller.playCourseEnd()

    expect(audio(APPROVED_AUDIO.jump).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.paper).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.fan).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.leak).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.rubble).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.newObstacle).playCount).toBe(1)
    expect(audio(APPROVED_AUDIO.courseEnd).playCount).toBe(1)
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
    controller.playCollision("paperwork")
    controller.playNewObstacle()
    controller.playTermEnd(1)
    controller.playHoliday(1)
    controller.playCourseEnd()

    expect(controller.isMuted()).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      "curso-docente-audio-muted-v1",
      "true",
    )
    expect(audio(APPROVED_AUDIO.jump).playCount).toBe(0)
    expect(audio(APPROVED_AUDIO.termEnd).playCount).toBe(0)
    expect(audio(APPROVED_AUDIO.courseEnd).playCount).toBe(0)
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
    expect(() => controller.playJump()).not.toThrow()
    expect(() => controller.setMuted(true)).not.toThrow()
    await Promise.resolve()
  })
})
