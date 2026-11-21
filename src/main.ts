import "./styles.css"
import "@fontsource/jersey-10/latin-400.css"

import type Phaser from "phaser"

import type { CourseState, ObstacleKind } from "./course/types"
import { GameAudio } from "./phaser/audio/GameAudio"
import {
  PRELOAD_COMPLETE_EVENT,
  PRELOAD_ERROR_EVENT,
  PRELOAD_FATAL_EVENT,
  PRELOAD_PROGRESS_EVENT,
} from "./phaser/events"
import type { GameDebugState } from "./phaser/scenes/GameScene"
import {
  GameShell,
  announcementFor,
  type GameShellHandle,
  type ShellAction,
} from "./ui/GameShell"
import { shareResult } from "./ui/share"
import { waitForPixelFont } from "./phaser/ui/ScreenLayout"

declare global {
  interface Window {
    __phaserSlice?: GameDebugState
    __gameDiagnostics?: {
      activeScenes: number
      inputBindings: number
      obstaclePoolSize: number
      activeObstacleCount: number
      frameMs: number[]
    }
    __audioRate?: number
    __pressureSamples?: number[]
    __courseSamples?: Array<{
      term: number
      companionCount: number
      pressure: number
    }>
    __sceneHistory?: Array<{
      screen: string
      term?: number
      background?: string
      backgroundOffset?: number
    }>
  }
}

const app = document.querySelector<HTMLElement>("#app")
if (!app) throw new Error("No se encontró el contenedor de la aplicación")

let resultState: CourseState | null = null
void startApplication()

async function startApplication(): Promise<void> {
  if (!hasGraphicsRenderer()) {
    showFallback("Este navegador no ha podido iniciar el juego gráfico.")
    return
  }

  const shell = GameShell.mount(app!)
  app!.dataset.appReady = "true"

  try {
    await waitForPixelFont(document.fonts)
    const { createPhaserGame } = await import("./phaser/create-game")
    const game = createPhaserGame(shell.gameRoot)
    const audio = new GameAudio(game.sound)
    if (import.meta.env.DEV) {
      window.__courseSamples = []
      window.__sceneHistory = []
    }
    document.body.classList.add("app-ready")
    shell.setMuted(audio.isMuted())

    game.events.on(PRELOAD_PROGRESS_EVENT, (progress: number) => {
      shell.setLoading(progress)
    })
    game.events.on(PRELOAD_COMPLETE_EVENT, () => shell.setLoading(1))
    game.events.on(PRELOAD_ERROR_EVENT, () => {
      shell.announce("No se pudo cargar un recurso.")
    })
    game.events.once(PRELOAD_FATAL_EVENT, () => {
      audio.destroy()
      game.destroy(true)
      showFallback("El juego no ha podido cargar sus imágenes necesarias.")
    })
    game.events.on("scene:title", () => {
      shell.setScreen("title")
      recordScene({ screen: "title", background: "panoramaTerm1" })
    })
    game.events.on("scene:game", (term: 1 | 2 | 3, backgroundOffset: number) => {
      shell.setScreen("game")
      shell.announce(announcementFor("term", term))
      audio.startTerm(term)
      recordScene({
        screen: "game",
        term,
        background: `panoramaTerm${term}`,
        backgroundOffset,
      })
    })
    game.events.on("scene:term-break", (term: 1 | 2) => {
      shell.setScreen("term-break")
      audio.playHoliday(term)
      recordScene({
        screen: "term-break",
        term,
        background: term === 1 ? "panoramaTerm2" : "springBreak",
      })
      if (import.meta.env.DEV) window.__audioRate = audio.currentRate()
    })
    game.events.on("term-break:refilled", () => shell.setContinueReady(true))
    game.events.on("scene:results", (state: CourseState) => {
      resultState = state
      shell.setResults(state)
      shell.setScreen("results")
      audio.playCourseEnd()
      recordScene({ screen: "results", background: "panoramaTerm3" })
      if (import.meta.env.DEV) window.__audioRate = audio.currentRate()
    })
    game.events.on("game:energy", (energy: number) => shell.setEnergy(energy))
    game.events.on("game:pressure", (pressure: number) => {
      audio.setPressure(pressure)
      if (import.meta.env.DEV) {
        window.__audioRate = audio.currentRate()
        ;(window.__pressureSamples ??= []).push(pressure)
      }
    })
    game.events.on("game:jump", () => {
      shell.announce(announcementFor("jump"))
      audio.playJump()
    })
    game.events.on("game:impact", (kind: ObstacleKind) => {
      shell.announce(announcementFor("impact"))
      audio.playImpact(kind)
    })
    game.events.on("game:companions-added", (count: number) =>
      shell.announce(announcementFor("companions", count)),
    )

    if (import.meta.env.DEV) attachDiagnostics(game)

    shell.onAction((action, invoker) => {
      if (action === "start" || action === "continue" || action === "retry") {
        audio.unlock()
      }
      void handleAction(action, invoker, game, audio, shell)
    })
    shell.setAudioReady()
  } catch {
    shell.destroy()
    showFallback("Este navegador no ha podido iniciar el juego gráfico.")
  }
}

async function handleAction(
  action: ShellAction,
  invoker: HTMLElement,
  game: Phaser.Game,
  audio: GameAudio,
  shell: GameShellHandle,
): Promise<void> {
  if (action === "how" || action === "why") {
    shell.showMotivation(invoker)
    return
  }
  if (action === "mute") {
    const muted = !audio.isMuted()
    audio.setMuted(muted)
    shell.setMuted(muted)
    shell.announce(muted ? "Sonido desactivado." : "Sonido activado.")
    return
  }
  if (action === "share") {
    const maxRatio = Math.max(
      20,
      ...(resultState?.completedTerms.map((result) => result.maxRatio) ?? []),
    )
    const outcome = await shareResult(
      {
        title: "Una jornada decente",
        text: `He terminado el curso con una ratio máxima de ${maxRatio}.`,
        url: window.location.href,
      },
      {
        share: navigator.share?.bind(navigator),
        clipboard: navigator.clipboard,
      },
    )
    shell.announce(
      outcome === "shared"
        ? "Resultado compartido."
        : outcome === "copied"
          ? "Resultado copiado."
          : "No se pudo compartir automáticamente.",
    )
    return
  }

  game.events.emit(`ui:${action}`)
}

function attachDiagnostics(game: Phaser.Game): void {
  const frameMs: number[] = []
  let previousSample = performance.now()
  let previousCourseSample = ""
  game.events.on("game:debug", (state: GameDebugState) => {
    const now = performance.now()
    frameMs.push(now - previousSample)
    previousSample = now
    if (frameMs.length > 120) frameMs.shift()
    window.__phaserSlice = state
    window.__gameDiagnostics = {
      activeScenes: game.scene.getScenes(true).length,
      inputBindings: state.inputBindingCount,
      obstaclePoolSize: state.obstaclePoolSize,
      activeObstacleCount: state.activeObstacleCount,
      frameMs: [...frameMs],
    }
    const courseSample = `${state.term}:${state.companionCount}:${state.pressure}`
    if (courseSample !== previousCourseSample) {
      previousCourseSample = courseSample
      const samples = (window.__courseSamples ??= [])
      samples.push({
        term: state.term,
        companionCount: state.companionCount,
        pressure: state.pressure,
      })
      if (samples.length > 500) samples.shift()
    }
  })
}

function recordScene(entry: NonNullable<Window["__sceneHistory"]>[number]): void {
  if (!import.meta.env.DEV) return
  ;(window.__sceneHistory ??= []).push(entry)
}

function hasGraphicsRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(
      canvas.getContext("2d") ||
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl"),
    )
  } catch {
    return false
  }
}

function showFallback(message: string): void {
  document.body.classList.remove("app-ready")
  app!.innerHTML = fallbackMarkup(message)
}

function fallbackMarkup(message: string): string {
  return `
    <section class="fallback-panel" role="alert">
      <h1>Una jornada decente</h1>
      <p>${message}</p>
      <p>La ratio crece, la energía baja y los obstáculos representan burocracia, clima e infraestructura; el alumnado no es el problema.</p>
      <h2>Datos y fuentes</h2>
      <ul>
        <li><a href="https://www.comunidad.madrid/publicacion/ref/51717">Consejo Escolar de la Comunidad de Madrid: ratios</a></li>
        <li><a href="https://www.ine.es/dyngs/Prensa/EPF2025.htm">INE: gasto medio por persona</a></li>
        <li><a href="https://ugt-sp.es/wp-content/uploads/boletin-retribuciones-profesorado-comparativa-europa-2026_web-1.pdf">UGT: retribuciones docentes</a></li>
        <li><a href="https://cadenaser.com/cmadrid/2026/02/02/una-veintena-de-centros-educativos-de-madrid-con-aulas-a-menos-de-17-grados-en-pleno-invierno-radio-madrid/">Cadena SER: climatización</a></li>
      </ul>
    </section>
  `
}
