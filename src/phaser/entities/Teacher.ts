import Phaser from "phaser"

export class Teacher extends Phaser.Physics.Arcade.Sprite {
  private grounded = true
  private tired = false
  private readonly groundY: number

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    super(scene, x, groundY, "teacher", 0)
    this.groundY = groundY
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setOrigin(0.5, 1)
    this.setScale(1.35)
    this.setDepth(20)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(28, 50).setOffset(18, 12)
    this.play("teacher-run")
  }

  requestJump(): boolean {
    if (!this.grounded) return false
    this.grounded = false
    this.setVelocityY(-410)
    this.play("teacher-jump", true)
    return true
  }

  playImpact(): void {
    this.play("teacher-hit", true)
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.play(this.tired ? "teacher-tired" : "teacher-run", true)
    })
  }

  setTiredness(energy: number): void {
    const nextTired = energy <= 35
    if (nextTired === this.tired) return
    this.tired = nextTired
    if (this.grounded) {
      this.play(this.tired ? "teacher-tired" : "teacher-run", true)
    }
  }

  isGrounded(): boolean {
    return this.grounded
  }

  override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)
    const body = this.body as Phaser.Physics.Arcade.Body
    if (this.y < this.groundY || body.velocity.y < 0) return

    const landed = !this.grounded
    this.y = this.groundY
    this.setVelocityY(0)
    this.grounded = true
    if (landed) {
      this.play(this.tired ? "teacher-tired" : "teacher-run", true)
    }
  }
}
