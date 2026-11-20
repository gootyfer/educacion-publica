import type { Term } from "../../course/types"

export const PANORAMA_WIDTH = 3200

export type PanoramaTextureKey =
  | "panoramaTerm1"
  | "panoramaTerm2"
  | "panoramaTerm3"

export type StaticBackground =
  | "title"
  | "christmas"
  | "spring-break"
  | "results"

const TEXTURE_BY_TERM: Readonly<Record<Term, PanoramaTextureKey>> = {
  1: "panoramaTerm1",
  2: "panoramaTerm2",
  3: "panoramaTerm3",
}

export function panoramaTextureFor(term: Term): PanoramaTextureKey {
  return TEXTURE_BY_TERM[term]
}

export function staticBackgroundTextureFor(
  background: StaticBackground,
): PanoramaTextureKey | "springBreak" {
  if (background === "christmas") return "panoramaTerm2"
  if (background === "spring-break") return "springBreak"
  if (background === "results") return "panoramaTerm3"
  return "panoramaTerm1"
}

export function wrapPanoramaOffset(offset: number): number {
  return ((offset % PANORAMA_WIDTH) + PANORAMA_WIDTH) % PANORAMA_WIDTH
}
