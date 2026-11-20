export interface ImageAsset {
  readonly kind: "image"
  readonly url: string
}

export interface SheetAsset {
  readonly kind: "spritesheet"
  readonly url: string
  readonly frameWidth: number
  readonly frameHeight: number
}

export type GameAsset = ImageAsset | SheetAsset

const GAME_BASE = `${import.meta.env.BASE_URL}game/`

export const GAME_ASSETS = {
  teacher: {
    kind: "spritesheet",
    url: `${GAME_BASE}characters/teacher.png`,
    frameWidth: 64,
    frameHeight: 64,
  },
  companions: {
    kind: "spritesheet",
    url: `${GAME_BASE}characters/companions.png`,
    frameWidth: 75,
    frameHeight: 75,
  },
  obstacles: {
    kind: "spritesheet",
    url: `${GAME_BASE}obstacles/obstacles.png`,
    frameWidth: 128,
    frameHeight: 128,
  },
  panoramaTerm1: {
    kind: "image",
    url: `${GAME_BASE}backgrounds/panorama-term-1.webp`,
  },
  panoramaTerm2: {
    kind: "image",
    url: `${GAME_BASE}backgrounds/panorama-term-2.webp`,
  },
  panoramaTerm3: {
    kind: "image",
    url: `${GAME_BASE}backgrounds/panorama-term-3.webp`,
  },
  springBreak: {
    kind: "image",
    url: `${GAME_BASE}backgrounds/spring-break.webp`,
  },
  energy: {
    kind: "spritesheet",
    url: `${GAME_BASE}ui/energy.png`,
    frameWidth: 100,
    frameHeight: 100,
  },
  panels: {
    kind: "spritesheet",
    url: `${GAME_BASE}ui/panels.png`,
    frameWidth: 100,
    frameHeight: 100,
  },
} as const satisfies Record<string, GameAsset>

export const TEACHER_ANIMATIONS = {
  run: Array.from({ length: 6 }, (_, index) => `teacher-run-${index}`),
  jump: Array.from({ length: 6 }, (_, index) => `teacher-jump-${index}`),
  hit: Array.from({ length: 4 }, (_, index) => `teacher-hit-${index}`),
  tired: Array.from({ length: 6 }, (_, index) => `teacher-tired-${index}`),
} as const

export const COMPANION_DEFINITIONS = Array.from(
  { length: 9 },
  (_, index) => ({
    id: `companion-${index + 1}`,
    frames: [
      `companion-${index + 1}-run-0`,
      `companion-${index + 1}-run-1`,
    ],
  }),
)

export const OBSTACLE_FRAMES = [
  "paper-stack",
  "filing-cart",
  "cold-climate",
  "heat-climate",
  "leak",
  "wall",
] as const
