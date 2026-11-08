import type { GameState, Term } from "../types"
import { drawRibbon, roundedRect } from "./primitives"

export const WORLD_WIDTH = 390
export const WORLD_HEIGHT = 700
export const GROUND_Y = 584
const SCENERY_SCROLL_FACTOR = 0.12

export interface SceneVisual {
  term: Term
  label: string
  wallColor: `#${string}`
  windowColor: `#${string}`
  floorColor: `#${string}`
  textColor: "#17352f"
}

const TERM_VISUALS: Record<Term, SceneVisual> = {
  1: {
    term: 1,
    label: "Septiembre · diciembre",
    wallColor: "#e7e0cf",
    windowColor: "#cfe4e8",
    floorColor: "#d26b47",
    textColor: "#17352f",
  },
  2: {
    term: 2,
    label: "Enero · abril",
    wallColor: "#dde5df",
    windowColor: "#b9d0d7",
    floorColor: "#bd684d",
    textColor: "#17352f",
  },
  3: {
    term: 3,
    label: "Abril · junio",
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

  const parallax = (state.distanceTravelled * SCENERY_SCROLL_FACTOR) % 150
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

  drawFenceAndRibbons(
    context,
    state.term,
    state.elapsedMs,
    state.distanceTravelled,
  )

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

  context.fillStyle = "#d9d4c6"
  roundedRect(context, 31, 49, 328, 12, 6)
  context.fill()
  context.fillStyle = state.energy > 35 ? "#008f5a" : "#e55536"
  roundedRect(context, 31, 49, 328 * (state.energy / 100), 12, 6)
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
  term: Term,
  elapsedMs: number,
  distanceTravelled: number,
) {
  const layout = fenceLayoutFor(term, elapsedMs, distanceTravelled)
  context.save()
  context.strokeStyle = "rgb(23 53 47 / 46%)"
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(0, 420)
  context.lineTo(WORLD_WIDTH, 420)
  for (const x of layout.postXs) {
    context.moveTo(x, 382)
    context.lineTo(x, 458)
  }
  context.stroke()

  for (const { x, y } of layout.ribbons) {
    drawRibbon(context, x, y, 13)
  }
  context.restore()
}

export function ribbonCountFor(term: Term, elapsedMs: number): number {
  const base = 1 + (term - 1) * 2
  const progress = Math.max(0, elapsedMs)
  const additions = Number(progress >= 20_000) + Number(progress >= 40_000)
  return Math.min(7, base + additions)
}

export function fenceLayoutFor(
  term: Term,
  elapsedMs: number,
  distanceTravelled: number,
): { postXs: number[]; ribbons: Array<{ x: number; y: number }> } {
  const scroll = Math.max(0, distanceTravelled) * SCENERY_SCROLL_FACTOR
  const firstPostIndex = Math.floor(scroll / 55) - 1
  const lastPostIndex = Math.ceil((scroll + WORLD_WIDTH) / 55) + 1
  const postXs: number[] = []
  const ribbons: Array<{ x: number; y: number }> = []
  const ribbonDensity = ribbonCountFor(term, elapsedMs)

  for (let index = firstPostIndex; index <= lastPostIndex; index += 1) {
    const x = index * 55 - scroll
    postXs.push(x)
    if (
      x >= -13 &&
      x <= WORLD_WIDTH + 13 &&
      positiveModulo(index, 7) < ribbonDensity
    ) {
      ribbons.push({ x, y: 397 + positiveModulo(index, 4) * 12 })
    }
  }

  return { postXs, ribbons }
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor
}
