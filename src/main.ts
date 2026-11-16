import "./styles.css"

import type { CourseState } from "./course/types"
import { createPhaserGame } from "./phaser/create-game"
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

const app = document.querySelector<HTMLElement>("#app")
if (!app) throw new Error("No se encontró el contenedor de la aplicación")

const shell = GameShell.mount(app)
app.dataset.appReady = "true"

let resultState: CourseState | null = null
let muted = readMuted()
shell.setMuted(muted)

try {
  const game = createPhaserGame(shell.gameRoot)

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
  })
  game.events.on("scene:term-break", () => shell.setScreen("term-break"))
  game.events.on("scene:results", (state: CourseState) => {
    resultState = state
    shell.setScreen("results")
  })
  game.events.on("game:jump", () => shell.announce(announcementFor("jump")))
  game.events.on("game:impact", () => shell.announce(announcementFor("impact")))
  game.events.on("game:companions-added", (count: number) =>
    shell.announce(announcementFor("companions", count)),
  )

  shell.onAction((action, invoker) => {
    void handleAction(action, invoker, game)
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
): Promise<void> {
  if (action === "how" || action === "why") {
    shell.showMotivation(invoker)
    return
  }
  if (action === "mute") {
    muted = !muted
    writeMuted(muted)
    shell.setMuted(muted)
    shell.announce(muted ? "Sonido desactivado." : "Sonido activado.")
    game.events.emit("audio:mute", muted)
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

function readMuted(): boolean {
  try {
    return window.localStorage.getItem("jornada-muted") === "true"
  } catch {
    return false
  }
}

function writeMuted(value: boolean): void {
  try {
    window.localStorage.setItem("jornada-muted", String(value))
  } catch {
    // El juego sigue funcionando cuando el almacenamiento está bloqueado.
  }
}
