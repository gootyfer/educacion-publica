import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const API_URL =
  "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192"
const SOUND_EFFECTS_API_URL =
  "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128"
const MODEL_ID = "music_v2_5"
const SOUND_EFFECTS_MODEL_ID = "eleven_text_to_sound_v3"
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

const soundPack = [
  {
    id: "term-end-brass",
    label: "Fin de trimestre · metales",
    durationSeconds: 3,
    prompt:
      "Three-second original instrumental game cue in the approved cheerful Spanish charanga identity: a compact four-note descending trumpet and clarinet phrase, tiny marching snare roll, then a warm comic tuba punctuation. Clear one-shot ending, playful rather than sad. No voice, lyrics, speech, or references to existing music.",
  },
  {
    id: "term-end-xylophone",
    label: "Fin de trimestre · xilófono",
    durationSeconds: 3,
    prompt:
      "Three-second original instrumental game cue in a cheerful Spanish charanga and playful arcade identity: a descending four-note xylophone motif answered by one short brass chord and a soft comic percussion finish. Clear one-shot ending, friendly and witty. No voice, lyrics, speech, or references to existing music.",
  },
  {
    id: "holiday-christmas-v2",
    label: "Vacaciones de Navidad · versión 2",
    durationSeconds: 5,
    prompt:
      "Five-second original instrumental holiday transition in the approved playful charanga identity: compact four-note clarinet phrase, tiny sleigh bells and light brass. Build toward a deliberate final 1.5-second warm major chord with one clean xylophone sparkle and soft percussion punctuation; no awkward cutoff or fade. Festive winter feeling but absolutely no carol melody. No voice, lyrics, speech, or music references.",
  },
  {
    id: "holiday-spring-v2",
    label: "Vacaciones de primavera · versión 2",
    durationSeconds: 5,
    prompt:
      "Five-second original instrumental spring-break transition in the approved playful charanga identity: compact four-note clarinet and xylophone phrase, light hand percussion and an airy woodwind flourish. Finish with a deliberate 1.5-second warm resolved brass-and-xylophone chord and one soft final tap; no awkward cutoff or fade. Fresh, cheerful and non-religious. No voice, lyrics, speech, or music references.",
  },
  {
    id: "course-end",
    label: "Fin de curso",
    durationSeconds: 5,
    prompt:
      "Five-second original instrumental course-complete cue in the approved cheerful Spanish charanga identity: confident four-note brass and clarinet motif, light snare pickup, playful bass, xylophone sparkle, then a satisfying warm major resolution. Celebratory but modest. No voice, lyrics, speech, or references to existing music.",
  },
  {
    id: "sfx-jump",
    label: "Salto",
    durationSeconds: 0.7,
    prompt:
      "A single short elastic cartoon jump sound for a friendly browser game, soft springy boing with a tiny wooden xylophone tick, clean and light, no impact, no voice, no music bed.",
  },
  {
    id: "sfx-paper-stamp",
    label: "Papel y sello",
    durationSeconds: 0.9,
    prompt:
      "A single quick office paperwork sound: two crisp paper shuffles followed by one soft rubber stamp thump, friendly comic game effect, clean studio recording, no voice, no music.",
  },
  {
    id: "sfx-fan-fault",
    label: "Ventilador averiado",
    durationSeconds: 1.4,
    prompt:
      "A small desk fan starts, wobbles with two light mechanical rattles, then gives a harmless comic electrical sputter and stops, friendly game sound, not alarming, no voice, no music.",
  },
  {
    id: "sfx-leak-bucket",
    label: "Gotera y cubo",
    durationSeconds: 1,
    prompt:
      "One clear water drop falls into a metal bucket with a compact resonant plink, then a tiny second drip, clean playful game sound, no ambience, no voice, no music.",
  },
  {
    id: "sfx-rubble",
    label: "Cascote ligero",
    durationSeconds: 1.1,
    prompt:
      "Two small harmless pieces of plaster crumble and tap onto a wooden floor, light dry debris sound with a gentle comic finish, not a collapse, no voice, no music.",
  },
  {
    id: "sfx-new-obstacle",
    label: "Obstáculo nuevo",
    durationSeconds: 0.8,
    prompt:
      "A concise friendly game notification for a newly introduced obstacle: quick clarinet chirp, tiny xylophone ping, and soft muted brass pop, curious rather than alarming, no voice, no melody reference.",
  },
]

const mode = process.argv[2]
if (!["main", "pack"].includes(mode)) {
  fail(
    "Uso: node scripts/generate-audio-candidates.mjs main [a|b|c|all] | pack [all|holidays]",
  )
}

const apiKey = process.env.ELEVENLABS_API_KEY
if (!apiKey) {
  fail(
    "Falta ELEVENLABS_API_KEY. Configúrala en el entorno antes de generar audio.",
  )
}

await mkdir(OUTPUT_DIR, { recursive: true })
if (mode === "main") await generateMainTheme(apiKey)
else await generateSoundPack(apiKey)

async function generateMainTheme(key) {
  const requestedVariant = (process.argv[3] ?? "all").toLowerCase()
  if (!["a", "b", "c", "all"].includes(requestedVariant)) {
    fail("La variante debe ser a, b, c o all.")
  }
  const selectedVariants =
    requestedVariant === "all"
      ? variants
      : variants.filter(({ id }) => id === requestedVariant)
  const manifest = {
    generatedAt: new Date().toISOString(),
    modelId: MODEL_ID,
    musicLengthMs: MUSIC_LENGTH_MS,
    forceInstrumental: true,
    candidates: [],
  }

  for (const variant of selectedVariants) {
    console.log(`Generando ${variant.id.toUpperCase()}: ${variant.label}…`)
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": key },
      body: JSON.stringify({
        prompt: variant.prompt,
        music_length_ms: MUSIC_LENGTH_MS,
        model_id: MODEL_ID,
        force_instrumental: true,
        store_for_inpainting: false,
        sign_with_c2pa: true,
      }),
    })
    await assertOk(response, variant.id.toUpperCase())

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

  await writeManifest("main-theme-manifest.json", manifest)
  console.log(`Candidatas guardadas en ${OUTPUT_DIR}`)
}

async function generateSoundPack(key) {
  const requestedPack = (process.argv[3] ?? "all").toLowerCase()
  if (!["all", "holidays"].includes(requestedPack)) {
    fail("El paquete debe ser all o holidays.")
  }
  const selectedCues =
    requestedPack === "holidays"
      ? soundPack.filter(({ id }) => id.startsWith("holiday-"))
      : soundPack
  const manifest = {
    generatedAt: new Date().toISOString(),
    modelId: SOUND_EFFECTS_MODEL_ID,
    candidates: [],
  }

  for (const cue of selectedCues) {
    if (cue.prompt.length > 450) {
      fail(`El prompt de ${cue.id} supera los 450 caracteres.`)
    }
    if (cue.durationSeconds < 0.5 || cue.durationSeconds > 30) {
      fail(`La duración de ${cue.id} está fuera del rango permitido.`)
    }
    console.log(`Generando ${cue.id}: ${cue.label}…`)
    const response = await fetch(SOUND_EFFECTS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": key },
      body: JSON.stringify({
        text: cue.prompt,
        loop: false,
        duration_seconds: cue.durationSeconds,
        prompt_influence: 0.55,
        model_id: SOUND_EFFECTS_MODEL_ID,
      }),
    })
    await assertOk(response, cue.id)

    const fileName = `${cue.id}.mp3`
    const audio = new Uint8Array(await response.arrayBuffer())
    await writeFile(join(OUTPUT_DIR, fileName), audio, { mode: 0o600 })
    manifest.candidates.push({
      id: cue.id,
      label: cue.label,
      fileName,
      prompt: cue.prompt,
      modelId: SOUND_EFFECTS_MODEL_ID,
      requestedDurationSeconds: cue.durationSeconds,
      characterCost: response.headers.get("character-cost"),
      bytes: audio.byteLength,
    })
  }

  const manifestName =
    requestedPack === "holidays"
      ? "sound-pack-holidays-manifest.json"
      : "sound-pack-manifest.json"
  await writeManifest(manifestName, manifest)
  console.log(`Paquete sonoro guardado en ${OUTPUT_DIR}`)
}

async function assertOk(response, label) {
  if (response.ok) return
  const apiDetail = await readSafeErrorDetail(response)
  fail(
    `ElevenLabs no pudo generar ${label} (${response.status} ${response.statusText})${apiDetail ? `: ${apiDetail}` : "."}`,
  )
}

async function writeManifest(fileName, manifest) {
  await writeFile(
    join(OUTPUT_DIR, fileName),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { mode: 0o600 },
  )
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

async function readSafeErrorDetail(response) {
  try {
    const payload = await response.json()
    const detail = payload?.detail
    if (typeof detail === "string") return detail.slice(0, 300)
    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter((message) => typeof message === "string")
        .join("; ")
        .slice(0, 300)
    }
    const status =
      typeof detail?.status === "string" ? detail.status : undefined
    const message =
      typeof detail?.message === "string" ? detail.message : undefined
    return [status, message].filter(Boolean).join(": ").slice(0, 300)
  } catch {
    return ""
  }
}
