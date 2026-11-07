import { OBSTACLE_DIMENSIONS } from "../obstacles"
import type { Obstacle, ObstacleVariant } from "../types"
import { roundedRect } from "./primitives"
import { GROUND_Y } from "./scene"

export interface ObstacleArtDescriptor {
  label: string
  width: number
  height: number
}

export const OBSTACLE_ART: Record<
  ObstacleVariant,
  ObstacleArtDescriptor
> = {
  "paper-stack": {
    label: "Pila de formularios",
    ...OBSTACLE_DIMENSIONS["paper-stack"],
  },
  "filing-cart": {
    label: "Carro archivador desbordado",
    ...OBSTACLE_DIMENSIONS["filing-cart"],
  },
  "cold-climate": {
    label: "Climatización averiada por frío",
    ...OBSTACLE_DIMENSIONS["cold-climate"],
  },
  "heat-climate": {
    label: "Ventilador averiado por calor",
    ...OBSTACLE_DIMENSIONS["heat-climate"],
  },
  leak: {
    label: "Gotera con cubo",
    ...OBSTACLE_DIMENSIONS.leak,
  },
  wall: {
    label: "Pared agrietada y obra",
    ...OBSTACLE_DIMENSIONS.wall,
  },
}

export function obstacleArtFor(
  variant: ObstacleVariant,
): ObstacleArtDescriptor {
  return OBSTACLE_ART[variant]
}

export function drawObstacle(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
) {
  const top = GROUND_Y - obstacle.height
  context.save()
  context.translate(obstacle.x, top)
  context.strokeStyle = "#17352f"
  context.lineWidth = 3

  if (obstacle.variant === "paper-stack") drawPaperStack(context, obstacle)
  else if (obstacle.variant === "filing-cart") drawFilingCart(context, obstacle)
  else if (obstacle.variant === "cold-climate") drawColdClimate(context, obstacle)
  else if (obstacle.variant === "heat-climate") drawHeatClimate(context, obstacle)
  else if (obstacle.variant === "leak") drawLeak(context, obstacle)
  else drawWall(context, obstacle)

  context.restore()
}

function drawPaperStack(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
) {
  for (let page = 0; page < 4; page += 1) {
    context.fillStyle = page % 2 === 0 ? "#fffaf0" : "#f7c85b"
    context.fillRect(page * 2, page * 7, obstacle.width - page * 2, 12)
    context.strokeRect(page * 2, page * 7, obstacle.width - page * 2, 12)
  }
  context.fillStyle = "#a43e2b"
  context.fillRect(7, 4, 16, 4)
}

function drawFilingCart(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
) {
  context.fillStyle = "#78958f"
  roundedRect(context, 1, 13, obstacle.width - 2, obstacle.height - 18, 4)
  context.fill()
  context.stroke()
  for (let file = 0; file < 3; file += 1) {
    context.fillStyle = ["#f7c85b", "#e88967", "#fffaf0"][file] ?? "#fffaf0"
    context.fillRect(7 + file * 10, 5 - file * 2, 9, 25)
    context.strokeRect(7 + file * 10, 5 - file * 2, 9, 25)
  }
  context.fillStyle = "#17352f"
  context.beginPath()
  context.arc(9, obstacle.height - 2, 4, 0, Math.PI * 2)
  context.arc(obstacle.width - 9, obstacle.height - 2, 4, 0, Math.PI * 2)
  context.fill()
}

function drawColdClimate(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
) {
  drawThermometer(context, obstacle.height, "#4b9fc4")
  context.strokeStyle = "#4b9fc4"
  context.lineWidth = 2
  for (let line = 0; line < 3; line += 1) {
    context.beginPath()
    context.moveTo(22, 10 + line * 10)
    context.lineTo(29, 7 + line * 10)
    context.stroke()
  }
}

function drawHeatClimate(
  context: CanvasRenderingContext2D,
  obstacle: Obstacle,
) {
  context.fillStyle = "#fffaf0"
  context.beginPath()
  context.arc(17, 19, 14, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.fillStyle = "#e55536"
  for (let blade = 0; blade < 3; blade += 1) {
    context.save()
    context.translate(17, 19)
    context.rotate((blade * Math.PI * 2) / 3)
    context.beginPath()
    context.ellipse(0, -6, 4, 8, 0.35, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
  context.fillStyle = "#17352f"
  context.fillRect(15, 32, 4, obstacle.height - 32)
}

function drawLeak(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.fillStyle = "#6f9fac"
  roundedRect(context, 3, 14, obstacle.width - 6, obstacle.height - 14, 6)
  context.fill()
  context.stroke()
  context.strokeStyle = "#17352f"
  context.beginPath()
  context.arc(obstacle.width / 2, 15, 12, Math.PI, 0)
  context.stroke()
  context.fillStyle = "#4b9fc4"
  context.beginPath()
  context.ellipse(11, 5, 3, 6, 0, 0, Math.PI * 2)
  context.ellipse(27, 9, 2, 4, 0, 0, Math.PI * 2)
  context.fill()
}

function drawWall(context: CanvasRenderingContext2D, obstacle: Obstacle) {
  context.fillStyle = "#b8a995"
  roundedRect(context, 0, 7, obstacle.width, obstacle.height - 7, 4)
  context.fill()
  context.stroke()
  context.strokeStyle = "#6b5545"
  context.beginPath()
  context.moveTo(18, 7)
  context.lineTo(14, 18)
  context.lineTo(22, 25)
  context.lineTo(17, 37)
  context.stroke()
  context.fillStyle = "#fffaf0"
  context.fillRect(4, 28, obstacle.width - 8, 10)
  context.fillStyle = "#e55536"
  for (let stripe = 0; stripe < 3; stripe += 1) {
    context.save()
    context.translate(7 + stripe * 12, 28)
    context.rotate(-0.35)
    context.fillRect(0, 0, 6, 12)
    context.restore()
  }
}

function drawThermometer(
  context: CanvasRenderingContext2D,
  height: number,
  color: string,
) {
  context.fillStyle = "#fffaf0"
  roundedRect(context, 5, 0, 13, height, 7)
  context.fill()
  context.stroke()
  context.fillStyle = color
  context.fillRect(10, 9, 4, height - 17)
  context.beginPath()
  context.arc(12, height - 7, 7, 0, Math.PI * 2)
  context.fill()
  context.stroke()
}
