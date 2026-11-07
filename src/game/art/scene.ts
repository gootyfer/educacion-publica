import type { GameState, Term } from "../types"
import { drawRibbon, roundedRect } from "./primitives"

export const WORLD_WIDTH = 390
export const WORLD_HEIGHT = 700
export const GROUND_Y = 584

export interface SceneVisual {
  term: Term
  label: string
  ribbonCount: number
  wallColor: `#${string}`
  windowColor: `#${string}`
  floorColor: `#${string}`
  textColor: "#17352f"
}

const TERM_VISUALS: Record<Term, SceneVisual> = {
  1: {
    term: 1,
    label: "Septiembre · diciembre",
    ribbonCount: 1,
    wallColor: "#e7e0cf",
    windowColor: "#cfe4e8",
    floorColor: "#d26b47",
    textColor: "#17352f",
  },
  2: {
    term: 2,
    label: "Enero · abril",
    ribbonCount: 2,
    wallColor: "#dde5df",
    windowColor: "#b9d0d7",
    floorColor: "#bd684d",
    textColor: "#17352f",
  },
  3: {
    term: 3,
    label: "Abril · junio",
    ribbonCount: 3,
    wallColor: "#f2dfbb",
    windowColor: "#f5c967",
    floorColor: "#c86642",
    textColor: "#17352f",
  },
}

export function sceneVisualFor(term: Term): SceneVisual {
  return TERM_VISUALS[term]
}

export function drawScene(
  context: CanvasRenderingContext2D,
  state: GameState,
) {
  const visual = sceneVisualFor(state.term)
  context.fillStyle = "#fffaf0"
  context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

  context.fillStyle = visual.windowColor
  context.fillRect(0, 88, WORLD_WIDTH, 205)

  const parallax = (state.distanceTravelled * 0.12) % 150
  for (let x = -parallax - 100; x < WORLD_WIDTH + 100; x += 150) {
    drawWindow(context, x, state.term)
  }

  context.fillStyle = visual.wallColor
  context.fillRect(0, 293, WORLD_WIDTH, GROUND_Y - 293)
  context.strokeStyle = "rgb(23 53 47 / 18%)"
  context.lineWidth = 2
  for (let y = 325; y < GROUND_Y; y += 56) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(WORLD_WIDTH, y)
    context.stroke()
  }

  drawFenceAndRibbons(context, visual, parallax)

  context.fillStyle = visual.textColor
  context.fillRect(0, GROUND_Y, WORLD_WIDTH, 5)
  context.fillStyle = visual.floorColor
  context.fillRect(0, GROUND_Y + 5, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y)
  context.strokeStyle = "rgb(23 53 47 / 24%)"
  for (let x = -(state.distanceTravelled % 64); x < WORLD_WIDTH; x += 64) {
    context.beginPath()
    context.moveTo(x, GROUND_Y + 5)
    context.lineTo(x + 28, WORLD_HEIGHT)
    context.stroke()
  }
}

export function drawHud(
  context: CanvasRenderingContext2D,
  state: GameState,
) {
  context.fillStyle = "rgb(255 250 240 / 94%)"
  roundedRect(context, 16, 16, 358, 60, 18)
  context.fill()
  context.strokeStyle = "#17352f"
  context.lineWidth = 2
  context.stroke()

  context.fillStyle = "#17352f"
  context.font = "800 12px system-ui"
  context.fillText(`TRIMESTRE ${state.term} · ENERGÍA`, 31, 40)
  context.fillText(`RATIO  ${state.ratio}`, 287, 40)

  context.fillStyle = "#d9d4c6"
  roundedRect(context, 31, 49, 220, 12, 6)
  context.fill()
  context.fillStyle = state.energy > 35 ? "#008f5a" : "#e55536"
  roundedRect(context, 31, 49, 220 * (state.energy / 100), 12, 6)
  context.fill()
}

function drawWindow(
  context: CanvasRenderingContext2D,
  x: number,
  term: Term,
) {
  context.fillStyle = term === 3 ? "#e7a632" : "#f7c85b"
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

  if (term === 2) {
    context.strokeStyle = "#4b9fc4"
    context.lineWidth = 2
    for (let drop = 0; drop < 3; drop += 1) {
      context.beginPath()
      context.moveTo(x + 20 + drop * 22, 142)
      context.lineTo(x + 16 + drop * 22, 154)
      context.stroke()
    }
  }
}

function drawFenceAndRibbons(
  context: CanvasRenderingContext2D,
  visual: SceneVisual,
  parallax: number,
) {
  const offset = (parallax * 0.35) % 110
  context.save()
  context.strokeStyle = "rgb(23 53 47 / 46%)"
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(0, 420)
  context.lineTo(WORLD_WIDTH, 420)
  for (let x = -offset; x < WORLD_WIDTH + 30; x += 55) {
    context.moveTo(x, 382)
    context.lineTo(x, 458)
  }
  context.stroke()

  for (let index = 0; index < visual.ribbonCount; index += 1) {
    drawRibbon(context, 62 + index * 116 - offset * 0.15, 410, 13)
  }
  context.restore()
}
