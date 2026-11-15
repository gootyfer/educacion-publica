import type Phaser from "phaser"

export const TEACHER_FRAME_INDEXES = {
  run: [0, 1, 2, 3, 4, 5],
  jump: [6, 7, 8, 9, 10, 11],
  hit: [12, 13, 14, 15],
  tired: [18, 19, 20, 21, 22, 23],
} as const

export const COMPANION_FRAME_INDEXES = Array.from(
  { length: 9 },
  (_, index) => [index * 2, index * 2 + 1] as const,
)

export function registerGameAnimations(scene: Phaser.Scene): void {
  createAnimation(scene, "teacher-run", TEACHER_FRAME_INDEXES.run, 12, -1)
  createAnimation(scene, "teacher-jump", TEACHER_FRAME_INDEXES.jump, 10, 0)
  createAnimation(scene, "teacher-hit", TEACHER_FRAME_INDEXES.hit, 12, 0)
  createAnimation(
    scene,
    "teacher-tired",
    TEACHER_FRAME_INDEXES.tired,
    8,
    -1,
  )

  COMPANION_FRAME_INDEXES.forEach((frames, index) => {
    if (scene.anims.exists(`companion-${index + 1}-run`)) return
    scene.anims.create({
      key: `companion-${index + 1}-run`,
      frames: scene.anims.generateFrameNumbers("companions", {
        frames: [...frames],
      }),
      frameRate: 7,
      repeat: -1,
    })
  })
}

function createAnimation(
  scene: Phaser.Scene,
  key: string,
  frames: readonly number[],
  frameRate: number,
  repeat: number,
): void {
  if (scene.anims.exists(key)) return
  scene.anims.create({
    key,
    frames: scene.anims.generateFrameNumbers("teacher", {
      frames: [...frames],
    }),
    frameRate,
    repeat,
  })
}
