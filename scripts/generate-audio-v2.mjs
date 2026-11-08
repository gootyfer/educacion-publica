import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const MUSIC_API =
  "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192"
const MUSIC_PLAN_API = "https://api.elevenlabs.io/v1/music/plan"
const MUSIC_UPLOAD_API = "https://api.elevenlabs.io/v1/music/upload"
const SFX_API =
  "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128"
const OUTPUT_DIR = join(process.cwd(), "artifacts", "audio-review")
const REFERENCE_FILE = join(OUTPUT_DIR, "main-theme-reference-30s.mp3")
const key = process.env.ELEVENLABS_API_KEY

if (!key) throw new Error("Falta ELEVENLABS_API_KEY")

const cues = [
  {
    fileName: "holiday-christmas-v3.mp3",
    prompt:
      "Five-second original instrumental Christmas holiday transition for a playful browser game. Cheerful Spanish charanga with bright trumpet and clarinet, prominent sleigh bells, tiny handbells and glockenspiel sparkles, light marching snare, warm major resolution and a clean final hit. Festive and unmistakably Christmas, but no existing carol melody, no vocals, no speech, no fade-out.",
  },
  {
    fileName: "holiday-spring-v3.mp3",
    prompt:
      "Five-second original instrumental spring holiday transition for a playful browser game. Agile baroque string ensemble with solo violin gestures, harpsichord sparkle, light woodwinds and a subtle cheerful charanga brass answer. Fresh, bright and pastoral, evoking springtime energy without quoting any recognizable classical melody. Clean resolved ending, no vocals, no speech, no fade-out.",
  },
  {
    fileName: "course-end-v2.mp3",
    prompt:
      "Five-second original instrumental graduation and end-of-school-year game cue. A proud ceremonial processional march with warm brass, compact snare roll, clarinet and glockenspiel sparkle, ending in a satisfying major chord. Celebratory, playful and dignified, not pompous, with no quotation of any existing graduation march, no vocals, no speech, no fade-out.",
  },
]

const electronicPrompt =
  "Original 80-second instrumental loop-ready theme for a playful retro browser runner about public-school teachers. Spanish street-band charanga energy blended with vintage arcade electronics: trumpet, trombone and clarinet call-and-response over crisp 8-bit-style arpeggios, warm analog synth bass, chiptune percussion, light marching snare and occasional xylophone sparks. Around 124 BPM, witty, upbeat and increasingly energetic without becoming aggressive. Start immediately with a memorable four-note motif, develop it through several compact variations, keep space between parts, and end on a phrase compatible with looping back to the opening. No vocals, speech, lyrics, fade-out, artist references, song references or video-game franchise references."

await mkdir(OUTPUT_DIR, { recursive: true })
const manifest = {
  generatedAt: new Date().toISOString(),
  provider: "ElevenLabs API",
  candidates: [],
}

for (const cue of cues) {
  console.log(`Generating ${cue.fileName}...`)
  const response = await fetch(SFX_API, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      text: cue.prompt,
      loop: false,
      duration_seconds: 5,
      prompt_influence: 0.55,
      model_id: "eleven_text_to_sound_v3",
    }),
  })
  const audio = await audioResponse(response, cue.fileName)
  await writeFile(join(OUTPUT_DIR, cue.fileName), audio, { mode: 0o600 })
  manifest.candidates.push({
    fileName: cue.fileName,
    method: "sound-generation",
    modelId: "eleven_text_to_sound_v3",
    requestedDurationSeconds: 5,
    prompt: cue.prompt,
    bytes: audio.byteLength,
  })
}

console.log("Generating main-theme-electronic-80s.mp3...")
const electronic = await composeFromPrompt(electronicPrompt, 80_000)
await writeFile(
  join(OUTPUT_DIR, "main-theme-electronic-80s.mp3"),
  electronic.audio,
  { mode: 0o600 },
)
manifest.candidates.push({
  fileName: "main-theme-electronic-80s.mp3",
  method: "music-compose-prompt",
  modelId: "music_v2_5",
  requestedDurationSeconds: 80,
  prompt: electronicPrompt,
  songId: electronic.songId,
  bytes: electronic.audio.byteLength,
})

console.log("Uploading the 30-second approved-theme reference...")
const referenceAudio = await readFile(REFERENCE_FILE)
const form = new FormData()
form.append("file", new Blob([referenceAudio], { type: "audio/mpeg" }), "main-theme-reference-30s.mp3")
form.append("extract_composition_plan", "music_v2_5")
const uploadResponse = await fetch(MUSIC_UPLOAD_API, {
  method: "POST",
  headers: headers(),
  body: form,
})
await assertOk(uploadResponse, "music reference upload")
const uploaded = await uploadResponse.json()
if (!uploaded.composition_plan) {
  throw new Error("ElevenLabs did not return a composition plan for the reference")
}

const extensionPrompt =
  "Extend this instrumental reference into an original 80-second loop-ready browser-game theme while preserving its cheerful Spanish charanga identity, tempo, instrumentation, production feel and memorable motif. Develop the existing musical character through compact variations with trumpet, clarinet, light marching percussion, playful bass and xylophone accents. Start directly, remain energetic but uncluttered, and finish on a phrase that reconnects naturally to the opening. No vocals, speech, lyrics or fade-out."
console.log("Creating an 80-second plan from the reference...")
const planResponse = await fetch(MUSIC_PLAN_API, {
  method: "POST",
  headers: headers({ "Content-Type": "application/json" }),
  body: JSON.stringify({
    prompt: extensionPrompt,
    music_length_ms: 80_000,
    model_id: "music_v2_5",
    source_composition_plan: uploaded.composition_plan,
  }),
})
await assertOk(planResponse, "reference-based composition plan")
const extendedPlan = await planResponse.json()

console.log("Generating main-theme-extended-80s.mp3...")
const extendedResponse = await fetch(MUSIC_API, {
  method: "POST",
  headers: headers({ "Content-Type": "application/json" }),
  body: JSON.stringify({
    composition_plan: extendedPlan,
    model_id: "music_v2_5",
    store_for_inpainting: false,
    sign_with_c2pa: true,
  }),
})
const extendedAudio = await audioResponse(
  extendedResponse,
  "main-theme-extended-80s.mp3",
)
await writeFile(
  join(OUTPUT_DIR, "main-theme-extended-80s.mp3"),
  extendedAudio,
  { mode: 0o600 },
)
manifest.candidates.push({
  fileName: "main-theme-extended-80s.mp3",
  method: "music-upload + source-composition-plan + music-compose",
  modelId: "music_v2_5",
  requestedDurationSeconds: 80,
  prompt: extensionPrompt,
  sourceFile: "main-theme-reference-30s.mp3",
  sourceSongId: uploaded.song_id,
  songId: extendedResponse.headers.get("song-id"),
  bytes: extendedAudio.byteLength,
})

await writeFile(
  join(OUTPUT_DIR, "audio-v2-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  { mode: 0o600 },
)
console.log(`Done. Files written to ${OUTPUT_DIR}`)

async function composeFromPrompt(prompt, musicLengthMs) {
  const response = await fetch(MUSIC_API, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      prompt,
      music_length_ms: musicLengthMs,
      model_id: "music_v2_5",
      force_instrumental: true,
      store_for_inpainting: false,
      sign_with_c2pa: true,
    }),
  })
  return {
    audio: await audioResponse(response, "electronic main theme"),
    songId: response.headers.get("song-id"),
  }
}

function headers(extra = {}) {
  return { "xi-api-key": key, ...extra }
}

async function audioResponse(response, label) {
  await assertOk(response, label)
  return new Uint8Array(await response.arrayBuffer())
}

async function assertOk(response, label) {
  if (response.ok) return
  const detail = await response.text()
  throw new Error(`${label} failed (${response.status}): ${detail.slice(0, 800)}`)
}
