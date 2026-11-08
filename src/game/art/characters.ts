import { GAME_CONFIG } from "../config"
import type { GameState } from "../types"
import { GROUND_Y } from "./scene"
import { roundedRect } from "./primitives"

const PROTEST_GREEN = "#008f5a"
const MAX_VISIBLE_PUPILS = 6

export function drawTeacherAndPupils(
  context: CanvasRenderingContext2D,
  state: GameState,
) {
  drawPupils(context, state)
  drawTeacher(context, state)
}

function drawTeacher(context: CanvasRenderingContext2D, state: GameState) {
  const x = GAME_CONFIG.playerX
  const bottom = GROUND_Y + state.playerY
  const tired = 1 - state.energy / 100
  const blink =
    state.invulnerabilityMs > 0 && Math.floor(state.elapsedMs / 90) % 2 === 0

  context.save()
  context.globalAlpha = blink ? 0.35 : 1
  context.translate(x, bottom)
  context.rotate(tired * 0.09)

  context.strokeStyle = "#17352f"
  context.fillStyle = PROTEST_GREEN
  context.lineWidth = 3
  roundedRect(context, 0, -38, 30, 34, 8)
  context.fill()
  context.stroke()

  context.fillStyle = "#ffffff"
  context.font = "900 16px system-ui"
  context.fillText("@", 7, -15)

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
  const colors = ["#f7c85b", "#78b6b1", "#e88967", "#8b78b5"]
  const visiblePupils = visiblePupilCountForRatio(state.ratio)

  for (let index = 0; index < visiblePupils; index += 1) {
    const row = index % 2
    const column = Math.floor(index / 2)
    const x = 57 - column * 8 - row * 3
    const bottom = pupilBottomForRow(row, state.playerY)
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

  context.fillStyle = "#17352f"
  context.font = "800 12px system-ui"
  context.fillText(ratioLabelFor(state.ratio), 8, GROUND_Y + state.playerY - 8)
}

export function visiblePupilCountForRatio(ratio: number): number {
  return Math.min(MAX_VISIBLE_PUPILS, Math.max(0, Math.floor(ratio / 8)))
}

export function ratioLabelFor(ratio: number): string {
  return String(Math.max(0, Math.floor(ratio)))
}

export function pupilBottomForRow(row: number, teacherY: number): number {
  return GROUND_Y + teacherY - row * 16
}
