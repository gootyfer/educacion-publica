import "@fontsource/schoolbell/400.css"
import "./styles.css"

import { createAudioController } from "./audio/controller"
import { EVIDENCE_FACTS } from "./content/facts"
import { intersectsPlayer } from "./game/obstacles"
import { createGameRuntime } from "./game/runtime"
import type { DamageKind, GameState, TermResult } from "./game/types"
import {
  buildResultViewModel,
  readRecord,
  writeRecord,
  type ResultViewModel,
} from "./ui/results"
import { shareResult } from "./ui/share"
import { buildTransitionViewModel } from "./ui/transitions"

const app = document.querySelector<HTMLElement>("#app")

if (!app) {
  throw new Error("No se encontró el contenedor principal de la aplicación")
}

app.dataset.appReady = "true"

const intro = requiredElement<HTMLElement>("#intro")
const gameRegion = requiredElement<HTMLElement>("#game-region")
const canvas = requiredElement<HTMLCanvasElement>("#game-canvas")
const results = requiredElement<HTMLElement>("#results")
const startButton = requiredElement<HTMLButtonElement>("#start-button")
const readJourneyButton = requiredElement<HTMLButtonElement>(
  "#read-journey-button",
)
const statusLive = requiredElement<HTMLElement>("#status-live")
const audioController = createAudioController({ storage: getOptionalStorage() })
const soundButton = document.createElement("button")
soundButton.id = "sound-toggle"
soundButton.className = "sound-toggle"
soundButton.type = "button"
app.append(soundButton)
updateSoundButton()

let previousState: GameState | null = null
let transitionTimers: number[] = []
let audioIntensity: 0 | 1 | 2 = 0

const runtime = createGameRuntime({
  canvas,
  onStateChange(state) {
    if (previousState?.grounded && !state.grounded) {
      statusLive.textContent = "El docente ha saltado."
      audioController.playJump()
    } else if (previousState && state.ratio > previousState.ratio) {
      statusLive.textContent = `Se incorporan ${state.ratio - previousState.ratio} alumnos. Ratio ${state.ratio}; apoyos adicionales: cero.`
    }
    if (previousState) {
      playNewCollisions(previousState, state)
      if (
        state.introducedObstacleVariants.length >
        previousState.introducedObstacleVariants.length
      ) {
        audioController.playNewObstacle()
      }
    }
    const nextIntensity = intensityFor(state.elapsedMs)
    if (nextIntensity !== audioIntensity) {
      audioIntensity = nextIntensity
      audioController.setIntensity(nextIntensity)
    }
    previousState = state
  },
  onTermEnd(_state, result) {
    audioController.playTermEnd(result.term)
    renderTransition(result)
  },
  onCourseFinish(state) {
    audioController.playCourseEnd()
    gameRegion.classList.add("is-hidden")
    results.classList.remove("is-hidden")
    const storage = getOptionalStorage()
    const previousRecord = readRecord(storage)
    const viewModel = buildResultViewModel(state, previousRecord)
    writeRecord(storage, viewModel.durationSeconds)
    renderResults(viewModel)
    results.querySelector<HTMLElement>("#results-title")?.focus()
  },
})

startButton.addEventListener("click", () => {
  startJornada()
})

readJourneyButton.addEventListener("click", renderTextJourney)
soundButton.addEventListener("click", () => {
  const nextMuted = !audioController.isMuted()
  audioController.setMuted(nextMuted)
  if (!nextMuted) void audioController.unlock()
  updateSoundButton()
  statusLive.textContent = nextMuted ? "Sonido desactivado." : "Sonido activado."
})

function startJornada() {
  clearTransitionTimers()
  intro.classList.add("is-hidden")
  results.classList.add("is-hidden")
  gameRegion.classList.remove("is-hidden")
  previousState = null
  audioIntensity = 0
  audioController.setIntensity(0)
  audioController.startTerm(1)
  void audioController.unlock()
  statusLive.textContent =
    "Curso en marcha. Primer trimestre. Energía 100. Ratio 20."
  runtime.start()
  canvas.focus()
}

function renderResults(viewModel: ResultViewModel) {
  const recordBadge = viewModel.isRecord
    ? '<span class="record-badge">Nuevo récord</span>'
    : ""
  const damageRows = viewModel.damageRows
    .map(
      (row) => `
        <li>
          <span>${row.label}</span>
          <strong>${row.hits} ${row.hits === 1 ? "golpe" : "golpes"}</strong>
        </li>`,
    )
    .join("")
  const factCards = renderFactCards(viewModel.facts)
  const termRows = viewModel.termRows
    .map(
      (row) => `
        <li class="term-result">
          <span>${row.label}</span>
          <strong>${row.durationLabel}</strong>
          <small>Ratio máxima ${row.maxRatio}</small>
        </li>`,
    )
    .join("")

  results.innerHTML = `
    <header class="results-header panel-masthead">
      <span class="screen-mark" aria-hidden="true">@</span>
      <p class="eyebrow">Tu resultado</p>
      <h2 id="results-title" tabindex="-1">${viewModel.title}</h2>
      ${recordBadge}
    </header>
    <button id="retry-button" class="primary-action" type="button">Volver a intentarlo</button>
    <div class="result-score" aria-label="Resumen de la partida">
      <p><span>Tiempo total</span><strong>${viewModel.durationLabel}</strong></p>
      <p><span>Ratio máxima</span><strong>${viewModel.maxRatio}</strong></p>
    </div>
    <ol class="term-results" aria-label="Resultado por trimestre">${termRows}</ol>
    <p class="ratio-explanation">${viewModel.ratioExplanation}</p>
    <ul class="damage-list">${damageRows}</ul>
    <p class="result-message">${viewModel.message}</p>
    <section id="evidence" class="evidence-section" aria-labelledby="evidence-title">
      <p class="eyebrow">La realidad detrás del juego</p>
      <h2 id="evidence-title">Cuatro datos para entender la protesta</h2>
      <div class="fact-grid">${factCards}</div>
    </section>
    <section id="how-to-support" class="support-section" aria-labelledby="support-title">
      <h2 id="support-title">Ahora ya sabes por qué correr más no resuelve el problema</h2>
      <p>Consulta las reivindicaciones completas, contrasta las fuentes y comparte la experiencia si te ha ayudado a entenderlas.</p>
      <div class="result-actions">
        <button id="share-button" class="secondary-action" type="button">Compartir resultado</button>
        <a class="text-action" href="https://www.rtve.es/noticias/20261014/docentes-madrid-inician-huelga-indefinida-para-exigir-mejoras-laborales-educacion-publica-calidad/17264967.shtml" target="_blank" rel="noreferrer">Informarme y apoyar</a>
      </div>
    </section>
  `

  requiredElement<HTMLButtonElement>("#retry-button").addEventListener(
    "click",
    startJornada,
  )
  requiredElement<HTMLButtonElement>("#share-button").addEventListener(
    "click",
    async () => {
      const outcome = await shareResult(
        {
          title: "Una jornada docente",
          text: `Completé el curso en ${viewModel.durationLabel} con una ratio máxima de ${viewModel.maxRatio}. ¿Tú cuánto aguantarías?`,
          url: window.location.href,
        },
        {
          share: navigator.share?.bind(navigator),
          clipboard: navigator.clipboard,
        },
      )
      statusLive.textContent =
        outcome === "shared"
          ? "Resultado compartido."
          : outcome === "copied"
            ? "Resultado copiado al portapapeles."
            : "No se pudo compartir automáticamente. Puedes copiar la dirección de esta página."
    },
  )
}

function renderTransition(result: TermResult) {
  const viewModel = buildTransitionViewModel(result)
  if (!viewModel) return

  clearTransitionTimers()
  gameRegion.classList.add("is-hidden")
  results.classList.remove("is-hidden")
  results.innerHTML = `
    <section class="holiday-transition" aria-labelledby="results-title">
      <header class="panel-masthead">
        <span class="screen-mark" aria-hidden="true">@</span>
        <p class="eyebrow">${viewModel.eyebrow}</p>
        <h2 id="results-title" tabindex="-1">${viewModel.title}</h2>
      </header>
      <div class="panel-body">
        <p class="holiday-duration">Has aguantado ${viewModel.durationLabel}</p>
        <p class="result-message">${viewModel.message}</p>
        <button id="continue-course" class="primary-action" type="button" disabled>
          Continuar el curso
        </button>
      </div>
    </section>
  `
  results.querySelector<HTMLElement>("#results-title")?.focus()
  statusLive.textContent = viewModel.accessibleSummary

  const continueButton = requiredElement<HTMLButtonElement>("#continue-course")
  let continued = false
  const continueOnce = () => {
    if (continued) return
    continued = true
    clearTransitionTimers()
    results.classList.add("is-hidden")
    gameRegion.classList.remove("is-hidden")
    previousState = null
    audioIntensity = 0
    audioController.setIntensity(0)
    audioController.startTerm(viewModel.nextTerm)
    statusLive.textContent = `${termName(viewModel.nextTerm)} trimestre. Energía 100. Ratio en aumento.`
    runtime.resumeNextTerm()
  }

  continueButton.addEventListener("click", continueOnce)
  transitionTimers.push(
    window.setTimeout(() => {
      continueButton.disabled = false
    }, 1_000),
    window.setTimeout(() => {
      audioController.playHoliday(result.term as 1 | 2)
    }, 3_000),
    window.setTimeout(continueOnce, 8_000),
  )
}

function clearTransitionTimers() {
  for (const timer of transitionTimers) window.clearTimeout(timer)
  transitionTimers = []
}

function termName(term: 2 | 3) {
  return term === 2 ? "Segundo" : "Tercer"
}

function renderTextJourney() {
  audioController.stop()
  intro.classList.add("is-hidden")
  gameRegion.classList.add("is-hidden")
  results.classList.remove("is-hidden")
  results.innerHTML = `
    <header class="results-header panel-masthead">
      <span class="screen-mark" aria-hidden="true">@</span>
      <p class="eyebrow">Alternativa sin animación</p>
      <h2 id="results-title" tabindex="-1">La jornada, explicada</h2>
    </header>
    <section id="text-journey" class="text-journey" aria-labelledby="course-summary-title">
      <h2 id="course-summary-title">Un curso en tres trimestres</h2>
      <p class="result-message">La ratio aumenta. Atender bien a más personas consume más energía, el salto se hace más corto y los obstáculos del sistema siguen llegando. En vacaciones recuperas energía, pero las condiciones no desaparecen.</p>
      <ol class="term-summary-list">
        <li data-term-summary><strong>Primer trimestre · septiembre a diciembre.</strong> Empiezan el papeleo, los archivadores y el frío; al final llegan las vacaciones de Navidad.</li>
        <li data-term-summary><strong>Segundo trimestre · enero a abril.</strong> El curso vuelve algo más rápido; continúan los trámites y aparecen goteras antes de Semana Santa.</li>
        <li data-term-summary><strong>Tercer trimestre · abril a junio.</strong> La exigencia inicial es mayor y se suman el calor y el papeleo de cierre de curso.</li>
      </ol>
      <h3>Los seis obstáculos</h3>
      <ul class="obstacle-summary-list">
        <li data-obstacle>Pila de formularios</li>
        <li data-obstacle>Carro archivador desbordado</li>
        <li data-obstacle>Climatización averiada por frío</li>
        <li data-obstacle>Gotera con cubo</li>
        <li data-obstacle>Ventilador averiado por calor</li>
        <li data-obstacle>Pared agrietada y obra</li>
      </ul>
    </section>
    <section id="evidence" class="evidence-section" aria-labelledby="evidence-title">
      <p class="eyebrow">La realidad detrás del juego</p>
      <h2 id="evidence-title">Cuatro datos para entender la protesta</h2>
      <div class="fact-grid">${renderFactCards(EVIDENCE_FACTS)}</div>
    </section>
    <button id="back-to-intro" class="secondary-action" type="button">Volver al inicio</button>
  `
  results.querySelector<HTMLElement>("#results-title")?.focus()
  requiredElement<HTMLButtonElement>("#back-to-intro").addEventListener(
    "click",
    () => {
      results.classList.add("is-hidden")
      intro.classList.remove("is-hidden")
      startButton.focus()
    },
  )
}

function playNewCollisions(previous: GameState, current: GameState) {
  const kinds: DamageKind[] = ["paperwork", "heat", "infrastructure"]
  for (const kind of kinds) {
    if (current.hitsByKind[kind] <= previous.hitsByKind[kind]) continue
    const collided = current.obstacles.find(
      (obstacle) => obstacle.kind === kind && intersectsPlayer(obstacle, current),
    )
    audioController.playCollision(kind, collided?.variant)
  }
}

function intensityFor(elapsedMs: number): 0 | 1 | 2 {
  if (elapsedMs >= 40_000) return 2
  if (elapsedMs >= 20_000) return 1
  return 0
}

function updateSoundButton() {
  const muted = audioController.isMuted()
  soundButton.setAttribute(
    "aria-label",
    muted ? "Activar sonido" : "Silenciar sonido",
  )
  soundButton.setAttribute("aria-pressed", String(muted))
  soundButton.title = muted ? "Activar sonido" : "Silenciar sonido"
  soundButton.innerHTML = `<span aria-hidden="true">${muted ? "🔇" : "🔊"}</span>`
}

function renderFactCards(facts: ResultViewModel["facts"]): string {
  return facts
    .map(
      (fact) => `
        <article class="fact-card">
          <p class="fact-kicker">${sourceLabel(fact.sourceKind)} · ${fact.period}</p>
          <h3>${fact.title}</h3>
          <p class="fact-value">${fact.value}</p>
          <p>${fact.explanation}</p>
          <p class="fact-caveat">${fact.caveat}</p>
          <a href="${fact.sourceUrl}" target="_blank" rel="noreferrer">Ver fuente: ${fact.sourceName}</a>
        </article>`,
    )
    .join("")
}

function sourceLabel(sourceKind: "official" | "union" | "press-reporting") {
  if (sourceKind === "official") return "Fuente oficial"
  if (sourceKind === "union") return "Fuente sindical"
  return "Información de prensa"
}

function getOptionalStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Falta el elemento requerido: ${selector}`)
  }
  return element
}
