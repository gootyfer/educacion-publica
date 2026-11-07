export function roundedRect(
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

export function drawRibbon(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size = 12,
) {
  context.save()
  context.translate(x, y)
  context.strokeStyle = "#008f5a"
  context.lineWidth = Math.max(2, size * 0.22)
  context.lineCap = "round"
  context.beginPath()
  context.ellipse(0, 0, size * 0.3, size * 0.42, -0.25, 0, Math.PI * 2)
  context.moveTo(-size * 0.12, size * 0.28)
  context.lineTo(-size * 0.42, size * 0.78)
  context.moveTo(size * 0.12, size * 0.28)
  context.lineTo(size * 0.42, size * 0.78)
  context.stroke()
  context.restore()
}
