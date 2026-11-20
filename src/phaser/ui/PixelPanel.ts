import Phaser from "phaser"

import { PIXEL_FONT_FAMILY, type Rect } from "./ScreenLayout"

const COLORS = {
  cream: 0xfff4d6,
  dark: 0x123e34,
  darkest: 0x071f1a,
  green: 0x0c9b4d,
  greenLight: 0x35d56e,
  mustard: 0xf2a900,
} as const

interface TextOptions {
  readonly color?: string
  readonly width?: number
  readonly align?: "left" | "center" | "right"
  readonly stroke?: boolean
  readonly lineSpacing?: number
}

export class PixelPanel {
  readonly container: Phaser.GameObjects.Container

  constructor(
    private readonly scene: Phaser.Scene,
    readonly rect: Rect,
  ) {
    const graphics = scene.add.graphics()
    drawSteppedBox(graphics, rect, COLORS.cream, COLORS.darkest, 4, 8)
    this.container = scene.add.container(0, 0, [graphics]).setDepth(80)
  }

  addText(
    text: string,
    x: number,
    y: number,
    size: number,
    options: TextOptions = {},
  ): Phaser.GameObjects.Text {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: `${size}px`,
        color: options.color ?? "#123e34",
        align: options.align ?? "center",
        lineSpacing: options.lineSpacing ?? 0,
        stroke: options.stroke ? "#071f1a" : undefined,
        strokeThickness: options.stroke ? 3 : 0,
        wordWrap: options.width ? { width: options.width } : undefined,
      })
      .setOrigin(0.5)
    this.container.add(label)
    return label
  }

  addDivider(rect: Rect): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics().fillStyle(COLORS.mustard)
    graphics.fillRect(rect.x, rect.y, rect.width, rect.height)
    this.container.add(graphics)
    return graphics
  }

  addBand(text: string, rect: Rect, size: number): void {
    const graphics = this.scene.add.graphics()
    drawSteppedBox(graphics, rect, COLORS.dark, COLORS.mustard, 3, 0)
    this.container.add(graphics)
    this.addText(text, rect.x + rect.width / 2, rect.y + rect.height / 2, size, {
      color: "#fff4d6",
    })
  }

  addButton(
    label: string,
    onActivate: () => void,
    rect: Rect,
    variant: "primary" | "secondary" | "text" = "primary",
  ): Phaser.GameObjects.Container {
    const graphics = this.scene.add.graphics()
    if (variant !== "text") {
      drawSteppedBox(
        graphics,
        rect,
        variant === "primary" ? COLORS.green : COLORS.cream,
        COLORS.darkest,
        3,
        variant === "primary" ? 5 : 0,
      )
      if (variant === "primary") {
        graphics
          .fillStyle(COLORS.greenLight)
          .fillRect(rect.x + 8, rect.y + 5, rect.width - 16, 3)
      }
    }
    const text = this.scene.add
      .text(0, 0, label, {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: `${variant === "primary" ? 27 : 20}px`,
        color: variant === "primary" ? "#fff4d6" : "#123e34",
        align: "center",
      })
      .setOrigin(0.5)
    const button = this.scene.add
      .container(rect.x + rect.width / 2, rect.y + rect.height / 2, [
        graphics,
        text,
      ])
      .setSize(rect.width, rect.height)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", onActivate)
    graphics.setPosition(-button.x, -button.y)
    this.container.add(button)
    return button
  }

  addStatBox(label: string, value: string, rect: Rect): void {
    const graphics = this.scene.add.graphics()
    drawSteppedBox(graphics, rect, COLORS.cream, COLORS.dark, 3, 0)
    graphics
      .fillStyle(COLORS.mustard)
      .fillRect(rect.x + 18, rect.y + 24, rect.width - 36, 3)
    this.container.add(graphics)
    this.addText(label, rect.x + rect.width / 2, rect.y + 15, 17)
    this.addText(value, rect.x + rect.width / 2, rect.y + 42, 29)
  }

  destroy(): void {
    this.container.destroy(true)
  }
}

function drawSteppedBox(
  graphics: Phaser.GameObjects.Graphics,
  rect: Rect,
  fill: number,
  border: number,
  borderSize: number,
  shadow: number,
): void {
  if (shadow > 0) {
    graphics
      .fillStyle(COLORS.darkest)
      .fillRect(rect.x + 4, rect.y + shadow, rect.width, rect.height)
  }
  graphics.fillStyle(border)
  graphics.fillRect(rect.x + 4, rect.y, rect.width - 8, rect.height)
  graphics.fillRect(rect.x, rect.y + 4, rect.width, rect.height - 8)
  graphics.fillStyle(fill)
  graphics.fillRect(
    rect.x + borderSize + 4,
    rect.y + borderSize,
    rect.width - borderSize * 2 - 8,
    rect.height - borderSize * 2,
  )
  graphics.fillRect(
    rect.x + borderSize,
    rect.y + borderSize + 4,
    rect.width - borderSize * 2,
    rect.height - borderSize * 2 - 8,
  )
}
