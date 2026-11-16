import "./styles.css"

import type { CourseState, ObstacleKind } from "./course/types"
import { createPhaserGame } from "./phaser/create-game"
import { GameAudio } from "./phaser/audio/GameAudio"
import type { GameDebugState } from "./phaser/scenes/GameScene"
import {
  PRELOAD_COMPLETE_EVENT,
  PRELOAD_ERROR_EVENT,
  PRELOAD_PROGRESS_EVENT,
} from "./phaser/scenes/PreloadScene"
import {
  GameShell,
  announcementFor,
  type ShellAction,
} from "./ui/GameShell"
import { shareResult } from "./ui/share"

declare global {
  interface Window {
    __phaserSlice?: GameDebugState
    __gameDiagnostics?: {
      activeScenes: number
      inputBindings: number
      obstaclePoolSize: number
      frameMs: number[]
    }
  }
}

const app = document.querySelector<HTMLElement>("#app")
if (!app) throw new Error("No se encontró el contenedor de la aplicación")

const shell = GameShell.mount(app)
app.dataset.appReady = "true"

let resultState: CourseState | null = null
try {
  const game = createPhaserGame(shell.gameRoot)
  const audio = new GameAudio(game.sound)
  shell.setMuted(audio.isMuted())

  game.events.on(PRELOAD_PROGRESS_EVENT, (progress: number) => {
    shell.setLoading(progress)
  })
  game.events.on(PRELOAD_COMPLETE_EVENT, () => shell.setLoading(1))
  game.events.on(PRELOAD_ERROR_EVENT, () => {
    shell.announce("No se pudo cargar un recurso. El juego intentará continuar.")
  })
  game.events.on("scene:title", () => shell.setScreen("title"))
  game.events.on("scene:game", (term: 1 | 2 | 3) => {
    shell.setScreen("game")
    shell.announce(announcementFor("term", term))
    audio.startTerm(term)
  })
  game.events.on("scene:term-break", (term: 1 | 2) => {
    shell.setScreen("term-break")
    audio.playHoliday(term)
  })
  game.events.on("term-break:refilled", () => shell.setContinueReady(true))
  game.events.on("scene:results", (state: CourseState) => {
    resultState = state
    shell.setScreen("results")
    audio.playCourseEnd()
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

  if (import.meta.env.DEV) {
    const frameMs: number[] = []
    let previousSample = performance.now()
    game.events.on("game:debug", (state: GameDebugState) => {
      const now = performance.now()
      frameMs.push(now - previousSample)
      previousSample = now
      if (frameMs.length > 120) frameMs.shift()
      window.__phaserSlice = state
      window.__gameDiagnostics = {
        activeScenes: game.scene.getScenes(true).length,
        inputBindings: 3,
        obstaclePoolSize: state.obstaclePoolSize,
        frameMs: [...frameMs],
      }
    })
  }

  shell.onAction((action, invoker) => {
    if (action === "start" || action === "continue" || action === "retry") {
      audio.unlock()
    }
    void handleAction(action, invoker, game, audio)
  })
} catch {
  app.innerHTML = `
    <section class="fallback-panel" role="alert">
      <h1>Una jornada decente</h1>
      <p>Este navegador no ha podido iniciar el juego gráfico.</p>
      <p>La ratio crece, la energía baja y los obstáculos representan burocracia, clima e infraestructura; el alumnado no es el problema.</p>
    </section>
  `
}

async function handleAction(
  action: ShellAction,
  invoker: HTMLElement,
  game: Phaser.Game,
  audio: GameAudio,
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
