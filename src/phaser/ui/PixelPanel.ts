import Phaser from "phaser"

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", monospace',
  color: "#fff8de",
  align: "center",
  stroke: "#173f35",
  strokeThickness: 4,
}

export class PixelPanel {
  readonly container: Phaser.GameObjects.Container
  private nextY = -86

  constructor(scene: Phaser.Scene, width = 430, height = 250) {
    const backdrop = scene.add
      .image(0, 0, "panels", 0)
      .setDisplaySize(width, height)
    this.container = scene.add.container(320, 180, [backdrop]).setDepth(80)
  }

  addLabel(
    text: string,
    size: number,
    options: { color?: string; gap?: number } = {},
  ): Phaser.GameObjects.Text {
    const label = this.container.scene.add
      .text(0, this.nextY, text, {
        ...TEXT_STYLE,
        fontSize: `${size}px`,
        color: options.color ?? TEXT_STYLE.color,
        wordWrap: { width: 370 },
      })
      .setOrigin(0.5)
    this.container.add(label)
    this.nextY += options.gap ?? size + 10
    return label
  }

  addButton(
    label: string,
    onActivate: () => void,
    width = 210,
  ): Phaser.GameObjects.Container {
    const background = this.container.scene.add
      .image(0, 0, "panels", 4)
      .setDisplaySize(width, 38)
    const text = this.container.scene.add
      .text(0, 0, label, { ...TEXT_STYLE, fontSize: "14px" })
      .setOrigin(0.5)
    const button = this.container.scene.add
      .container(0, this.nextY, [background, text])
      .setSize(width, 38)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", onActivate)
    this.container.add(button)
    this.nextY += 46
    return button
  }

  destroy(): void {
    this.container.destroy(true)
  }
}
