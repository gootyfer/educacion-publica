import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { buildConditionedMainThemePlan } from "./conditioned-main-theme-plan.mjs"

const MUSIC_API =
  "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192"
const MUSIC_UPLOAD_API = "https://api.elevenlabs.io/v1/music/upload"
const OUTPUT_DIR = join(process.cwd(), "artifacts", "audio-review")
const REFERENCE_FILE = join(process.cwd(), "public", "audio", "approved", "main-theme.mp3")
const OUTPUT_FILE = join(OUTPUT_DIR, "main-theme-conditioned-80s.mp3")
const MANIFEST_FILE = join(OUTPUT_DIR, "main-theme-conditioned-80s.json")
const key = process.env.ELEVENLABS_API_KEY

if (!key) throw new Error("Falta ELEVENLABS_API_KEY")
const referenceAudio = await readFile(REFERENCE_FILE)

await mkdir(OUTPUT_DIR, { recursive: true })

console.log("Uploading the approved main theme for conditioning...")
const form = new FormData()
form.append(
  "file",
  new Blob([referenceAudio], { type: "audio/mpeg" }),
  "main-theme.mp3",
)
const uploadResponse = await fetch(MUSIC_UPLOAD_API, {
  method: "POST",
  headers: { "xi-api-key": key },
  body: form,
})
await assertOk(uploadResponse, "music reference upload")
const uploaded = await uploadResponse.json()
if (!uploaded.song_id) {
  throw new Error("ElevenLabs did not return a song_id for the reference")
}

const compositionPlan = buildConditionedMainThemePlan(uploaded.song_id)
console.log("Generating main-theme-conditioned-80s.mp3...")
const composeResponse = await fetch(MUSIC_API, {
  method: "POST",
  headers: {
    "xi-api-key": key,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    composition_plan: compositionPlan,
    model_id: "music_v2_5",
    store_for_inpainting: false,
    sign_with_c2pa: true,
  }),
})
await assertOk(composeResponse, "conditioned music composition")
const audio = new Uint8Array(await composeResponse.arrayBuffer())
await writeFile(OUTPUT_FILE, audio, { mode: 0o600 })

const manifest = {
  generatedAt: new Date().toISOString(),
  provider: "ElevenLabs API",
  modelId: "music_v2_5",
  method: "music-upload + conditioned-generation-plan + music-compose",
  sourceFile: "public/audio/approved/main-theme.mp3",
  sourceSongId: uploaded.song_id,
  conditioningRange: { startMs: 0, endMs: 30_000 },
  conditionStrength: "xhigh",
  requestedDurationSeconds: 80,
  outputSongId: composeResponse.headers.get("song-id"),
  bytes: audio.byteLength,
  compositionPlan,
}
await writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, {
  mode: 0o600,
})

console.log(`Done. Candidate written to ${OUTPUT_FILE}`)

async function assertOk(response, label) {
  if (response.ok) return
  const detail = await response.text()
  throw new Error(`${label} failed (${response.status}): ${detail.slice(0, 800)}`)
}
