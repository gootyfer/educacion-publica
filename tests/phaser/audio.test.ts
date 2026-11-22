import { describe, expect, it, vi } from "vitest"

import { AUDIO_ASSETS, GameAudio } from "../../src/phaser/audio/GameAudio"

class FakeSound {
  isPlaying = false
  playCount = 0
  stopCount = 0
  destroyCount = 0
  rate = 1
  setRateCount = 0

  play() {
    this.isPlaying = true
    this.playCount += 1
    return true
  }

  stop() {
    this.isPlaying = false
    this.stopCount += 1
    return this
  }

  destroy() {
    this.destroyCount += 1
  }

  setRate(rate: number) {
    this.rate = rate
    this.setRateCount += 1
    return this
  }
}

function setup(missing = new Set<string>()) {
  const sounds = new Map<string, FakeSound>()
  const manager = {
    mute: false,
    add: vi.fn((key: string) => {
      if (missing.has(key)) throw new Error("missing")
      const sound = new FakeSound()
      sounds.set(key, sound)
      return sound
    }),
  }
  const storage = { getItem: vi.fn(() => null), setItem: vi.fn() }
  const audio = new GameAudio(manager, storage)
  return { audio, manager, storage, sounds }
}

describe("Phaser audio lifecycle", () => {
  it("maps the approved intro and results menu tracks", () => {
    expect(AUDIO_ASSETS["audio-title"]).toContain(
      "main-theme-extended-80s.mp3",
    )
    expect(AUDIO_ASSETS["audio-results"]).toContain(
      "main-theme-electronic-80s.mp3",
    )
  })

  it("migrates the mute preference from the previous release", () => {
    const manager = { mute: false, add: vi.fn(() => new FakeSound()) }
    const storage = {
      getItem: vi.fn((key: string) =>
        key === "curso-docente-audio-muted-v1" ? "true" : null,
      ),
      setItem: vi.fn(),
    }
    const audio = new GameAudio(manager, storage)

    expect(audio.isMuted()).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith("jornada-muted", "true")
  })

  it("creates Phaser sounds lazily after their files can be cached", () => {
    const { audio, manager } = setup()
    expect(manager.add).not.toHaveBeenCalled()

    audio.startTerm(1)
    expect(manager.add).not.toHaveBeenCalled()
    audio.unlock()
    expect(manager.add).toHaveBeenCalledWith(
      "audio-theme",
      expect.objectContaining({ loop: true }),
    )
  })

  it("does not play before interaction and does not layer themes", () => {
    const { audio, sounds } = setup()
    audio.startTerm(1)
    expect(sounds.has("audio-theme")).toBe(false)

    audio.unlock()
    expect(sounds.get("audio-theme")?.playCount).toBe(1)
    audio.startTerm(2)
    audio.startTerm(2)
    expect(sounds.get("audio-theme")?.playCount).toBe(1)
  })

  it("switches between looping title, gameplay, and results music", () => {
    const { audio, manager, sounds } = setup()

    audio.playTitle()
    expect(manager.add).not.toHaveBeenCalled()
    audio.unlock()
    expect(sounds.get("audio-title")?.playCount).toBe(1)
    expect(manager.add).toHaveBeenCalledWith(
      "audio-title",
      expect.objectContaining({ loop: true }),
    )

    audio.startTerm(1)
    expect(sounds.get("audio-title")?.isPlaying).toBe(false)
    expect(sounds.get("audio-theme")?.playCount).toBe(1)

    audio.playCourseEnd()
    expect(sounds.get("audio-theme")?.isPlaying).toBe(false)
    expect(sounds.get("audio-results")?.playCount).toBe(1)
    expect(manager.add).toHaveBeenCalledWith(
      "audio-results",
      expect.objectContaining({ loop: true }),
    )
  })

  it("maps pressure to hundredth-quantized theme rates after unlock", () => {
    const { audio, sounds, manager } = setup()
    audio.startTerm(1)
    audio.setPressure(0.5)
    expect(manager.add).not.toHaveBeenCalled()

    audio.unlock()
    const theme = sounds.get("audio-theme")!
    expect(theme.rate).toBe(1.12)
    expect(theme.setRateCount).toBe(1)

    audio.setPressure(0.501)
    expect(theme.setRateCount).toBe(1)
    audio.setPressure(2)
    expect(theme.rate).toBe(1.24)
    audio.setPressure(-1)
    expect(theme.rate).toBe(1)
  })

  it("resets theme rate for new terms, holidays, course end, and destroy", () => {
    const { audio, sounds } = setup()
    audio.startTerm(1)
    audio.unlock()
    audio.setPressure(1)
    const theme = sounds.get("audio-theme")!
    expect(theme.rate).toBe(1.24)

    audio.startTerm(2)
    expect(theme.rate).toBe(1)
    audio.setPressure(1)
    audio.playHoliday(1)
    expect(theme.rate).toBe(1)
    audio.startTerm(3)
    audio.setPressure(1)
    audio.playCourseEnd()
    expect(theme.rate).toBe(1)
    audio.destroy()
    expect(theme.rate).toBe(1)
  })

  it("persists mute and suppresses effects", () => {
    const { audio, storage, sounds } = setup()
    audio.unlock()
    audio.setMuted(true)
    audio.playJump()
    audio.playImpact("paper-stack")

    expect(audio.isMuted()).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith("jornada-muted", "true")
    expect(sounds.get("audio-jump")?.playCount ?? 0).toBe(0)
    expect(sounds.get("audio-impact")?.playCount ?? 0).toBe(0)
  })

  it("survives when every audio file is missing", () => {
    const { audio } = setup(
      new Set([
        "audio-title",
        "audio-theme",
        "audio-christmas",
        "audio-spring",
        "audio-results",
        "audio-jump",
        "audio-impact",
      ]),
    )
    expect(() => {
      audio.unlock()
      audio.startTerm(1)
      audio.playJump()
      audio.playImpact("wall")
      audio.playHoliday(1)
      audio.playCourseEnd()
    }).not.toThrow()
  })

  it("stops and destroys every created sound", () => {
    const { audio, sounds } = setup()
    audio.unlock()
    audio.startTerm(1)
    audio.destroy()

    for (const sound of sounds.values()) {
      expect(sound.stopCount).toBeGreaterThan(0)
      expect(sound.destroyCount).toBe(1)
    }
  })
})
