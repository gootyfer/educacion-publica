import "./styles.css"

import { createGameRuntime } from "./game/runtime"
import type { GameState } from "./game/types"

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
    results.innerHTML = `<h2 id="results-title" tabindex="-1">Fin de la jornada</h2><p>Has llegado hasta una ratio de ${state.maxRatio}.</p>`
    results.querySelector<HTMLElement>("#results-title")?.focus()
  },
})

startButton.addEventListener("click", () => {
  intro.classList.add("is-hidden")
  results.classList.add("is-hidden")
  gameRegion.classList.remove("is-hidden")
  previousState = null
  statusLive.textContent = "Jornada en marcha. Ratio 20."
  runtime.start()
  canvas.focus()
})

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Falta el elemento requerido: ${selector}`)
  }
  return element
}
