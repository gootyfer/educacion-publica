import { AccessibleStatus } from "./AccessibleStatus"
import {
  MOTIVATION_SECTIONS,
  MotivationPanel,
} from "./MotivationPanel"

export { MOTIVATION_SECTIONS }

export type ShellScreen =
  | "loading"
  | "title"
  | "game"
  | "term-break"
  | "results"

export type ShellAction =
  | "start"
  | "how"
  | "continue"
  | "retry"
  | "why"
  | "share"
  | "mute"

export interface ShellControl {
  readonly action: ShellAction
  readonly label: string
}

export const CONTROLS_BY_SCREEN: Readonly<
  Record<ShellScreen, readonly ShellControl[]>
> = {
  loading: [],
  title: [
    { action: "start", label: "Empezar" },
    { action: "how", label: "Cómo funciona" },
  ],
  game: [],
  "term-break": [
    { action: "continue", label: "Continuar el curso" },
  ],
  results: [
    { action: "retry", label: "Volver a intentar" },
    { action: "why", label: "Por qué este juego" },
    { action: "share", label: "Compartir" },
  ],
}

export function announcementFor(
  event: "jump" | "companions" | "impact" | "term",
  value?: number,
): string {
  if (event === "jump") return "El docente ha saltado."
  if (event === "impact") return "Choque suave. Baja la energía."
  if (event === "companions") return `El grupo crece: ${value ?? 1} estudiantes.`
  const name = value === 2 ? "Segundo" : value === 3 ? "Tercer" : "Primer"
  return `${name} trimestre. Energía completa.`
}

export interface GameShellHandle {
  readonly gameRoot: HTMLElement
  readonly stage: HTMLElement
  setScreen(screen: ShellScreen): void
  setLoading(progress: number): void
  announce(message: string): void
  setMuted(muted: boolean): void
  setContinueReady(ready: boolean): void
  onAction(listener: (action: ShellAction, invoker: HTMLElement) => void): void
  showMotivation(invoker?: HTMLElement | null): void
  showSources(invoker?: HTMLElement | null): void
  destroy(): void
}

export class GameShell implements GameShellHandle {
  readonly gameRoot: HTMLElement
  readonly stage: HTMLElement
  private readonly controls: HTMLElement
  private readonly loading: HTMLProgressElement
  private readonly status: AccessibleStatus
  private readonly information: MotivationPanel
  private readonly actionListeners = new Set<
    (action: ShellAction, invoker: HTMLElement) => void
  >()

  static mount(root: HTMLElement): GameShellHandle {
    return new GameShell(root)
  }

  private constructor(private readonly root: HTMLElement) {
    root.innerHTML = `
      <section class="game-stage" aria-label="Una jornada decente">
        <div id="phaser-root" class="phaser-root" tabindex="0" role="application" aria-label="El docente corre con su grupo. Toca o pulsa espacio para saltar."></div>
        <div class="loading-layer" data-loading-layer>
          <p>Preparando el curso…</p>
          <progress max="1" value="0" aria-label="Progreso de carga"></progress>
        </div>
        <div class="semantic-controls" data-semantic-controls></div>
      </section>
      <aside class="portrait-guidance" aria-labelledby="rotate-title">
        <h1 id="rotate-title">Gira el dispositivo</h1>
        <p>Este juego está diseñado para pantalla horizontal.</p>
        <button type="button" data-portrait-motivation>Por qué este juego</button>
        <button type="button" data-portrait-sources>Datos y fuentes</button>
      </aside>
      <button class="sound-toggle" type="button" data-shell-action="mute" aria-label="Silenciar sonido"><span aria-hidden="true">🔊</span></button>
    `
    this.stage = root.querySelector<HTMLElement>(".game-stage")!
    this.gameRoot = root.querySelector<HTMLElement>("#phaser-root")!
    this.controls = root.querySelector<HTMLElement>("[data-semantic-controls]")!
    this.loading = root.querySelector<HTMLProgressElement>("progress")!
    this.status = new AccessibleStatus(root)
    this.information = new MotivationPanel(root)

    root
      .querySelector<HTMLElement>("[data-portrait-motivation]")
      ?.addEventListener("click", (event) =>
        this.showMotivation(event.currentTarget as HTMLElement),
      )
    root
      .querySelector<HTMLElement>("[data-portrait-sources]")
      ?.addEventListener("click", (event) =>
        this.showSources(event.currentTarget as HTMLElement),
      )
    root
      .querySelector<HTMLElement>("[data-shell-action='mute']")
      ?.addEventListener("click", this.handleAction)
    this.setScreen("loading")
  }

  setScreen(screen: ShellScreen): void {
    this.root.dataset.screen = screen
    this.controls.replaceChildren()
    const title = document.createElement("h1")
    title.className = "visually-hidden"
    title.tabIndex = -1
    title.textContent = screenName(screen)
    this.controls.append(title)

    for (const control of CONTROLS_BY_SCREEN[screen]) {
      const button = document.createElement("button")
      button.type = "button"
      button.className = `semantic-action action-${control.action}`
      button.dataset.shellAction = control.action
      button.setAttribute("aria-label", control.label)
      button.textContent = control.label
      if (control.action === "continue") button.disabled = true
      button.addEventListener("click", this.handleAction)
      this.controls.append(button)
    }

    if (screen === "game") {
      window.requestAnimationFrame(() => this.gameRoot.focus())
    } else if (screen !== "loading") {
      window.requestAnimationFrame(() => title.focus())
    }
  }

  setLoading(progress: number): void {
    this.loading.value = Math.min(1, Math.max(0, progress))
  }

  announce(message: string): void {
    this.status.announce(message)
  }

  setMuted(muted: boolean): void {
    const button = this.root.querySelector<HTMLButtonElement>(
      "[data-shell-action='mute']",
    )
    if (!button) return
    button.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar sonido")
    button.innerHTML = `<span aria-hidden="true">${muted ? "🔇" : "🔊"}</span>`
  }

  setContinueReady(ready: boolean): void {
    const button = this.controls.querySelector<HTMLButtonElement>(
      "[data-shell-action='continue']",
    )
    if (button) button.disabled = !ready
  }

  onAction(listener: (action: ShellAction, invoker: HTMLElement) => void): void {
    this.actionListeners.add(listener)
  }

  showMotivation(invoker?: HTMLElement | null): void {
    this.information.openMotivation(invoker)
  }

  showSources(invoker?: HTMLElement | null): void {
    this.information.openSources(invoker)
  }

  destroy(): void {
    this.actionListeners.clear()
    this.status.destroy()
    this.information.destroy()
    this.root.replaceChildren()
  }

  private readonly handleAction = (event: Event): void => {
    const invoker = event.currentTarget as HTMLElement
    const action = invoker.dataset.shellAction as ShellAction | undefined
    if (!action) return
    for (const listener of this.actionListeners) listener(action, invoker)
  }
}

function screenName(screen: ShellScreen): string {
  if (screen === "title") return "Una jornada decente"
  if (screen === "term-break") return "Vacaciones: energía recuperada"
  if (screen === "results") return "Fin de curso"
  if (screen === "game") return "Curso en marcha"
  return "Preparando el curso"
}
