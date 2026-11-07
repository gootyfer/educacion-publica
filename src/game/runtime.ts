import { advanceGame, createGameState, startNextTerm } from "./mechanics"
import { createRenderer } from "./renderer"
import type { GameState, TermResult } from "./types"

export interface GameRuntimeOptions {
  canvas: HTMLCanvasElement
  onStateChange: (state: GameState) => void
  onTermEnd: (state: GameState, result: TermResult) => void
  onCourseFinish: (state: GameState) => void
  randomSeed?: number
}

export interface GameRuntime {
  start(): void
  stop(): void
  jump(): void
  resumeNextTerm(): void
}

export function createGameRuntime({
  canvas,
  onStateChange,
  onTermEnd,
  onCourseFinish,
  randomSeed = 42,
}: GameRuntimeOptions): GameRuntime {
  const renderer = createRenderer(canvas)
  let state = { ...createGameState(), randomSeed }
  let running = false
  let pendingJump = false
  let animationFrame = 0
  let lastTimestamp: number | null = null

  function frame(timestamp: number) {
    if (!running) return

    const deltaMs = lastTimestamp === null ? 16 : timestamp - lastTimestamp
    lastTimestamp = timestamp
    state = advanceGame(state, { jumpPressed: pendingJump }, deltaMs)
    pendingJump = false
    renderer.render(state)
    onStateChange(state)

    if (state.phase === "between-terms") {
      running = false
      const result = state.completedTerms.at(-1)
      if (result) onTermEnd(state, result)
      return
    }

    if (state.phase === "finished") {
      running = false
      onCourseFinish(state)
      return
    }

    animationFrame = window.requestAnimationFrame(frame)
  }

  function jump() {
    if (running) {
      pendingJump = true
    }
  }

  function handlePointer(event: PointerEvent) {
    event.preventDefault()
    jump()
  }

  function handleKey(event: KeyboardEvent) {
    if (!running) return
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault()
      jump()
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame)
      lastTimestamp = null
    } else if (running) {
      lastTimestamp = null
      animationFrame = window.requestAnimationFrame(frame)
    }
  }

  canvas.addEventListener("pointerdown", handlePointer)
  window.addEventListener("keydown", handleKey)
  document.addEventListener("visibilitychange", handleVisibilityChange)

  return {
    start() {
      if (running) return
      state = { ...createGameState(), randomSeed }
      running = true
      pendingJump = false
      lastTimestamp = null
      renderer.render(state)
      onStateChange(state)
      animationFrame = window.requestAnimationFrame(frame)
    },
    stop() {
      running = false
      window.cancelAnimationFrame(animationFrame)
    },
    jump,
    resumeNextTerm() {
      if (running || state.phase !== "between-terms") return
      state = startNextTerm(state)
      running = true
      pendingJump = false
      lastTimestamp = null
      renderer.render(state)
      onStateChange(state)
      canvas.focus()
      animationFrame = window.requestAnimationFrame(frame)
    },
  }
}
