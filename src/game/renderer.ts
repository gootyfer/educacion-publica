import { drawTeacherAndPupils } from "./art/characters"
import { drawObstacle } from "./art/obstacles"
import {
  drawHud,
  drawScene,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./art/scene"
import type { GameState } from "./types"

export interface GameRenderer {
  render(state: GameState): void
  resize(): void
}

export function createRenderer(canvas: HTMLCanvasElement): GameRenderer {
  const context = get2dContext(canvas)

  function resize() {
    const pixelRatio = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = WORLD_WIDTH * pixelRatio
    canvas.height = WORLD_HEIGHT * pixelRatio
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  function render(state: GameState) {
    context.save()
    context.setTransform(
      canvas.width / WORLD_WIDTH,
      0,
      0,
      canvas.height / WORLD_HEIGHT,
      0,
      0,
    )
    drawScene(context, state)
    drawTeacherAndPupils(context, state)
    for (const obstacle of state.obstacles) {
      drawObstacle(context, obstacle)
    }
    drawHud(context, state)
    context.restore()
  }

  resize()
  window.addEventListener("resize", resize)

  return { render, resize }
}

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Canvas 2D no está disponible")
  }
  return context
}
