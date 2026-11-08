const NEGATIVE_STYLES = [
  "vocals",
  "speech",
  "lyrics",
  "singing",
  "choir",
  "fade-out",
]

const SHARED_STYLES = [
  "playful Spanish charanga",
  "bright trumpet and clarinet call-and-response",
  "light marching percussion",
  "playful acoustic bass",
  "small xylophone accents",
  "upbeat browser game music",
  "clear instrumental production",
  "same tempo and musical identity as the conditioning reference",
]

export function buildConditionedMainThemePlan(songId) {
  const chunks = [
    {
      text: "[Instrumental opening] {introduce the reference-inspired main motif immediately}",
      duration_ms: 20_000,
      positive_styles: [
        ...SHARED_STYLES,
        "memorable compact opening motif",
      ],
      negative_styles: [...NEGATIVE_STYLES],
      context_adherence: "high",
      conditioning_ref: {
        song_id: songId,
        range: { start_ms: 0, end_ms: 30_000 },
      },
      condition_strength: "xhigh",
    },
    {
      text: "[Instrumental variation] {develop the opening motif with a witty brass and clarinet answer}",
      duration_ms: 20_000,
      positive_styles: [...SHARED_STYLES, "close melodic variation"],
      negative_styles: [...NEGATIVE_STYLES],
      context_adherence: "high",
    },
    {
      text: "[Instrumental development] {increase energy while retaining the same motif and ensemble}",
      duration_ms: 20_000,
      positive_styles: [...SHARED_STYLES, "energetic compact development"],
      negative_styles: [...NEGATIVE_STYLES],
      context_adherence: "high",
    },
    {
      text: "[Instrumental ending] {resolve with the same motif and a phrase compatible with looping to the opening}",
      duration_ms: 20_000,
      positive_styles: [...SHARED_STYLES, "clean loop-compatible ending"],
      negative_styles: [...NEGATIVE_STYLES],
      context_adherence: "high",
    },
  ]

  return { chunks }
}
