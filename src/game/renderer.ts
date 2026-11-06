import { GAME_CONFIG } from "./config"
import type { GameState, Obstacle } from "./types"

const WORLD_WIDTH = 390
const WORLD_HEIGHT = 700
const GROUND_Y = 584

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
    drawRoom(context, state)
    drawPupils(context, state)
    drawTeacher(context, state)
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

function drawRoom(context: CanvasRenderingContext2D, state: GameState) {
  context.fillStyle = "#fff6df"
  context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  context.fillStyle = "#d8eef0"
  context.fillRect(0, 88, WORLD_WIDTH, 205)

  const parallax = (state.distanceTravelled * 0.12) % 150
  for (let x = -parallax - 100; x < WORLD_WIDTH + 100; x += 150) {
    context.fillStyle = "#f7c85b"
    roundedRect(context, x, 122, 92, 112, 10)
    context.fill()
    context.fillStyle = "#fffaf0"
    context.fillRect(x + 9, 132, 74, 76)
    context.strokeStyle = "#17352f"
    context.lineWidth = 3
    context.strokeRect(x + 9, 132, 74, 76)
    context.beginPath()
    context.moveTo(x + 46, 132)
    context.lineTo(x + 46, 208)
    context.moveTo(x + 9, 170)
    context.lineTo(x + 83, 170)
    context.stroke()
  }

  context.fillStyle = "#e8dcc2"
  context.fillRect(0, 293, WORLD_WIDTH, GROUND_Y - 293)
  context.strokeStyle = "#c8b894"
  context.lineWidth = 2
  for (let y = 325; y < GROUND_Y; y += 56) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(WORLD_WIDTH, y)
    context.stroke()
  }

  context.fillStyle = "#17352f"
  context.fillRect(0, GROUND_Y, WORLD_WIDTH, 5)
  context.fillStyle = "#d26b47"
  context.fillRect(0, GROUND_Y + 5, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y)
  context.strokeStyle = "rgb(23 53 47 / 24%)"
  for (let x = -(state.distanceTravelled % 64); x < WORLD_WIDTH; x += 64) {
    context.beginPath()
    context.moveTo(x, GROUND_Y + 5)
    context.lineTo(x + 28, WORLD_HEIGHT)
    context.stroke()
  }
}

function drawHud(context: CanvasRenderingContext2D, state: GameState) {
  context.fillStyle = "rgb(255 250 240 / 92%)"
  roundedRect(context, 16, 16, 358, 60, 18)
  context.fill()
  context.strokeStyle = "#17352f"
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = "#17352f"
  context.font = "800 13px system-ui"
  context.fillText("ENERGÍA DOCENTE", 31, 40)
  context.fillText(`RATIO  ${state.ratio}`, 287, 40)

  context.fillStyle = "#d9d4c6"
  roundedRect(context, 31, 49, 220, 12, 6)
  context.fill()
  context.fillStyle = state.energy > 35 ? "#3d9b73" : "#e55536"
  roundedRect(context, 31, 49, 220 * (state.energy / 100), 12, 6)
  context.fill()
}

function drawTeacher(context: CanvasRenderingContext2D, state: GameState) {
  const x = GAME_CONFIG.playerX
  const bottom = GROUND_Y + state.playerY
  const tired = 1 - state.energy / 100
  const blink = state.invulnerabilityMs > 0 && Math.floor(state.elapsedMs / 90) % 2 === 0

  context.save()
  context.globalAlpha = blink ? 0.35 : 1
  context.translate(x, bottom)
  context.rotate(tired * 0.09)

  context.strokeStyle = "#17352f"
  context.fillStyle = "#244f85"
  context.lineWidth = 3
  roundedRect(context, 0, -38, 30, 34, 8)
  context.fill()
  context.stroke()

  context.fillStyle = "#f1a36f"
  context.beginPath()
  context.arc(16, -48, 13, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.fillStyle = "#3e3028"
  context.beginPath()
  context.arc(16, -52, 13, Math.PI, Math.PI * 2)
  context.fill()

  context.strokeStyle = "#17352f"
  context.lineWidth = 5
  context.beginPath()
  context.moveTo(8, -5)
  context.lineTo(5, 0)
  context.moveTo(24, -5)
  context.lineTo(27, 0)
  context.stroke()

  if (state.energy < 55) {
    context.fillStyle = "#4b9fc4"
    context.beginPath()
    context.ellipse(34, -48, 3, 6, -0.25, 0, Math.PI * 2)
    context.fill()
  }
  context.restore()
}

function drawPupils(context: CanvasRenderingContext2D, state: GameState) {
  const addedGroups = Math.floor(
    (state.ratio - GAME_CONFIG.initialRatio) / GAME_CONFIG.ratioStep,
  )
  const visible = Math.min(12, 6 + addedGroups)
  const airborneOffset = state.playerY * 0.82
  const colors = ["#f7c85b", "#78b6b1", "#e88967", "#8b78b5"]

  for (let index = 0; index < visible; index += 1) {
    const row = index % 2
    const column = Math.floor(index / 2)
    const x = 57 - column * 8 - row * 3
    const bottom = GROUND_Y + airborneOffset - row * 16
    context.fillStyle = colors[index % colors.length] ?? "#f7c85b"
    context.strokeStyle = "#17352f"
    context.lineWidth = 2
    roundedRect(context, x, bottom - 25, 18, 22, 5)
    context.fill()
    context.stroke()
    context.fillStyle = "#b76e46"
    context.beginPath()
    context.arc(x + 9, bottom - 31, 7, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  }

  if (state.ratio > visible) {
    context.fillStyle = "#17352f"
    context.font = "800 12px system-ui"
    context.fillText(`+${state.ratio - visible}`, 8, GROUND_Y - 8)
  }
}

function drawObstacle(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
) {
  const top = GROUND_Y - obstacle.height
  context.save()
  context.translate(obstacle.x, top)
  context.strokeStyle = "#17352f"
  context.lineWidth = 3

  if (obstacle.kind === "paperwork") {
    for (let page = 0; page < 4; page += 1) {
      context.fillStyle = page % 2 === 0 ? "#fffaf0" : "#f7c85b"
      context.fillRect(page * 2, page * 7, obstacle.width - page * 2, 12)
      context.strokeRect(page * 2, page * 7, obstacle.width - page * 2, 12)
    }
    context.fillStyle = "#a43e2b"
    context.font = "900 10px system-ui"
    context.fillText("URG.", 5, 11)
  } else if (obstacle.kind === "heat") {
    context.fillStyle = "#fffaf0"
    roundedRect(context, 8, 0, 14, obstacle.height, 7)
    context.fill()
    context.stroke()
    context.fillStyle = "#e55536"
    context.fillRect(13, 9, 4, obstacle.height - 17)
    context.beginPath()
    context.arc(15, obstacle.height - 7, 7, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  } else {
    context.fillStyle = "#879b97"
    roundedRect(context, 0, 8, obstacle.width, obstacle.height - 8, 5)
    context.fill()
    context.stroke()
    context.fillStyle = "#fffaf0"
    context.fillRect(8, 0, obstacle.width - 16, 18)
    context.strokeRect(8, 0, obstacle.width - 16, 18)
    context.fillStyle = "#e55536"
    context.beginPath()
    context.arc(obstacle.width - 8, 20, 3, 0, Math.PI * 2)
    context.fill()
  }
  context.restore()
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2)
  context.beginPath()
  context.roundRect(x, y, Math.max(0, width), height, safeRadius)
}
