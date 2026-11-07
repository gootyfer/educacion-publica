import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const API_URL =
  "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192"
const MODEL_ID = "music_v2_5"
const MUSIC_LENGTH_MS = 40_000
const OUTPUT_DIR = join(process.cwd(), "artifacts", "audio-review")

const variants = [
  {
    id: "a",
    label: "Charanga equilibrada",
    prompt:
      "Original instrumental loop-ready music for a short browser runner game about the everyday resilience of public-school teachers. Spanish street-band charanga character blended with clean, playful arcade energy. A memorable original four-to-five-note motif led by bright trumpet and clarinet, light marching snare and hand percussion, warm playful bass, and small xylophone accents. Around 112 BPM, cheerful, witty, buoyant, never frantic. Start immediately with the groove, keep a steady pulse, avoid a long intro, and finish on a phrase and harmony that can reconnect naturally to the opening. No fade-out. No vocals, spoken words, chants, vocal samples, or lyrics. No artist, song, film, television, or video-game references.",
  },
  {
    id: "b",
    label: "Xilófono juguetón",
    prompt:
      "Original instrumental loop-ready music for a short browser runner game about the everyday resilience of public-school teachers. A light Spanish charanga feel with a playful arcade pulse. A memorable original four-to-five-note motif shared by xylophone and clarinet, answered by compact trumpet phrases; bouncy tuba-like bass, soft hand percussion, and crisp but friendly snare. Around 118 BPM, humorous, nimble, warm, and slightly mischievous. Start directly on the rhythmic idea, keep the arrangement uncluttered, avoid a long intro, and end on a clean phrase that can loop naturally back to the first beat. No fade-out. No vocals, spoken words, chants, vocal samples, or lyrics. No artist, song, film, television, or video-game references.",
  },
  {
    id: "c",
    label: "Metales enérgicos",
    prompt:
      "Original instrumental loop-ready music for a short browser runner game about the everyday resilience of public-school teachers. Energetic Spanish street-band charanga instrumentation with tidy modern arcade-game momentum. A memorable original four-to-five-note brass motif, trumpet and trombone in short call-and-response, supportive clarinet, subtle xylophone sparks, light marching percussion, and a round playful bass. Around 124 BPM, upbeat and motivating without sounding aggressive or chaotic. Begin with the main groove immediately, maintain clear space between parts, avoid a long intro, and close on a short cadence compatible with looping into the opening. No fade-out. No vocals, spoken words, chants, vocal samples, or lyrics. No artist, song, film, television, or video-game references.",
  },
]

const mode = process.argv[2]
if (mode !== "main") {
  fail("Uso: node scripts/generate-audio-candidates.mjs main")
}

const apiKey = process.env.ELEVENLABS_API_KEY
if (!apiKey) {
  fail(
    "Falta ELEVENLABS_API_KEY. Configúrala en el entorno antes de generar audio.",
  )
}

await mkdir(OUTPUT_DIR, { recursive: true })
const generatedAt = new Date().toISOString()
const manifest = {
  generatedAt,
  modelId: MODEL_ID,
  musicLengthMs: MUSIC_LENGTH_MS,
  forceInstrumental: true,
  candidates: [],
}

for (const variant of variants) {
  console.log(`Generando ${variant.id.toUpperCase()}: ${variant.label}…`)
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: variant.prompt,
      music_length_ms: MUSIC_LENGTH_MS,
      model_id: MODEL_ID,
      force_instrumental: true,
      store_for_inpainting: false,
      sign_with_c2pa: true,
    }),
  })

  if (!response.ok) {
    fail(
      `ElevenLabs no pudo generar ${variant.id.toUpperCase()} (${response.status} ${response.statusText}).`,
    )
  }

  const fileName = `main-theme-${variant.id}.mp3`
  const audio = new Uint8Array(await response.arrayBuffer())
  await writeFile(join(OUTPUT_DIR, fileName), audio, { mode: 0o600 })
  manifest.candidates.push({
    id: variant.id.toUpperCase(),
    label: variant.label,
    fileName,
    prompt: variant.prompt,
    modelId: MODEL_ID,
    musicLengthMs: MUSIC_LENGTH_MS,
    songId: response.headers.get("song-id"),
    bytes: audio.byteLength,
  })
}

await writeFile(
  join(OUTPUT_DIR, "main-theme-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  { mode: 0o600 },
)

console.log(`Candidatas guardadas en ${OUTPUT_DIR}`)

function fail(message) {
  console.error(message)
  process.exit(1)
}
