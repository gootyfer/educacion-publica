export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface ScreenLayout {
  readonly panel: Rect
  readonly actions: Readonly<Record<string, Rect>>
}

export type LayoutScreen = "title" | "term-break" | "results"

export const PIXEL_FONT_FAMILY = "'Jersey 10', monospace"

export const SCREEN_LAYOUTS = {
  title: {
    panel: { x: 178, y: 48, width: 284, height: 268 },
    actions: {
      start: { x: 204, y: 190, width: 232, height: 50 },
      how: { x: 214, y: 253, width: 212, height: 34 },
    },
  },
  "term-break": {
    panel: { x: 108, y: 66, width: 424, height: 268 },
    actions: {
      continue: { x: 148, y: 250, width: 344, height: 54 },
    },
  },
  results: {
    panel: { x: 164, y: 42, width: 312, height: 306 },
    actions: {
      retry: { x: 183, y: 210, width: 274, height: 48 },
      why: { x: 198, y: 265, width: 244, height: 34 },
      share: { x: 210, y: 306, width: 220, height: 32 },
    },
  },
} as const satisfies Readonly<Record<LayoutScreen, ScreenLayout>>

export function screenLayout(screen: LayoutScreen): ScreenLayout {
  return SCREEN_LAYOUTS[screen]
}

export function semanticRectStyle(rect: Rect): Readonly<
  Record<"left" | "top" | "width" | "height", string>
> {
  return {
    left: percentage(rect.x, 640),
    top: percentage(rect.y, 360),
    width: percentage(rect.width, 640),
    height: percentage(rect.height, 360),
  }
}

function percentage(value: number, total: number): string {
  return `${Number(((value / total) * 100).toFixed(6))}%`
}

export async function waitForPixelFont(
  fonts: Pick<FontFaceSet, "load"> | undefined,
  timeoutMs = 600,
): Promise<void> {
  if (!fonts) return
  await Promise.race([
    fonts
      .load(`32px ${PIXEL_FONT_FAMILY}`)
      .then(() => undefined)
      .catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ])
}
