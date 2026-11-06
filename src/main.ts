import "./styles.css"

import { EVIDENCE_FACTS } from "./content/facts"
import { createGameRuntime } from "./game/runtime"
import type { GameState } from "./game/types"
import {
  buildResultViewModel,
  readRecord,
  writeRecord,
  type ResultViewModel,
} from "./ui/results"
import { shareResult } from "./ui/share"

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

let previousState: GameState | null = null

const runtime = createGameRuntime({
  canvas,
  onStateChange(state) {
    if (previousState?.grounded && !state.grounded) {
      statusLive.textContent = "El docente ha saltado."
    } else if (previousState && state.ratio > previousState.ratio) {
      statusLive.textContent = `Se incorporan ${state.ratio - previousState.ratio} alumnos. Ratio ${state.ratio}; apoyos adicionales: cero.`
    }
    previousState = state
  },
  onFinish(state) {
    gameRegion.classList.add("is-hidden")
    results.classList.remove("is-hidden")
    const previousRecord = readRecord(window.localStorage)
    const viewModel = buildResultViewModel(state, previousRecord)
    writeRecord(window.localStorage, viewModel.durationSeconds)
    renderResults(viewModel)
    results.querySelector<HTMLElement>("#results-title")?.focus()
  },
})

startButton.addEventListener("click", () => {
  startJornada()
})

readJourneyButton.addEventListener("click", renderTextJourney)

function startJornada() {
  intro.classList.add("is-hidden")
  results.classList.add("is-hidden")
  gameRegion.classList.remove("is-hidden")
  previousState = null
  statusLive.textContent = "Jornada en marcha. Energía 100. Ratio 20."
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

  results.innerHTML = `
    <header class="results-header">
      <p class="eyebrow">Tu resultado</p>
      <h2 id="results-title" tabindex="-1">${viewModel.title}</h2>
      ${recordBadge}
    </header>
    <button id="retry-button" class="primary-action" type="button">Volver a intentarlo</button>
    <div class="result-score" aria-label="Resumen de la partida">
      <p><span>Has aguantado</span><strong>${viewModel.durationLabel}</strong></p>
      <p><span>Ratio máxima</span><strong>${viewModel.maxRatio}</strong></p>
    </div>
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
          text: `Aguanté ${viewModel.durationLabel} con una ratio máxima de ${viewModel.maxRatio}. ¿Tú cuánto aguantarías?`,
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

function renderTextJourney() {
  intro.classList.add("is-hidden")
  gameRegion.classList.add("is-hidden")
  results.classList.remove("is-hidden")
  results.innerHTML = `
    <header class="results-header">
      <p class="eyebrow">Alternativa sin animación</p>
      <h2 id="results-title" tabindex="-1">La jornada, explicada</h2>
    </header>
    <p class="result-message">La ratio aumenta. Atender bien a más personas consume más energía, el salto se hace más corto y los obstáculos del sistema siguen llegando.</p>
    <ul class="text-journey-list">
      <li><strong>Ratio:</strong> el grupo crece sin que aumenten los apoyos.</li>
      <li><strong>Burocracia:</strong> formularios y tareas restan tiempo para enseñar.</li>
      <li><strong>Climatización:</strong> el frío y el calor también condicionan el aula.</li>
      <li><strong>Infraestructura:</strong> averías y recursos insuficientes consumen energía.</li>
    </ul>
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

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Falta el elemento requerido: ${selector}`)
  }
  return element
}
