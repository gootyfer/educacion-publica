import { advanceGame, createGameState } from "./mechanics"
import { createRenderer } from "./renderer"
import type { GameState } from "./types"

export interface GameRuntimeOptions {
  canvas: HTMLCanvasElement
  onStateChange: (state: GameState) => void
  onFinish: (state: GameState) => void
  randomSeed?: number
}

export interface GameRuntime {
  start(): void
  stop(): void
  jump(): void
}

export function createGameRuntime({
  canvas,
  onStateChange,
  onFinish,
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

    if (state.phase === "finished") {
      running = false
      onFinish(state)
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
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault()
      jump()
    }
  }

  canvas.addEventListener("pointerdown", handlePointer)
  window.addEventListener("keydown", handleKey)

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
  }
}
