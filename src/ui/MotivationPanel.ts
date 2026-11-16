import { EVIDENCE_FACTS } from "../content/facts"

export const MOTIVATION_SECTIONS = [
  {
    title: "La ratio crece",
    body: "Más alumnado necesita más tiempo, apoyos y recursos.",
  },
  {
    title: "La energía baja",
    body: "El cansancio limita, pero el alumnado no es el problema.",
  },
  {
    title: "Los obstáculos siguen",
    body: "Representan burocracia, clima e infraestructura.",
  },
] as const

export class MotivationPanel {
  readonly element: HTMLElement
  private readonly title: HTMLElement
  private readonly content: HTMLElement
  private restoreFocus: HTMLElement | null = null

  constructor(parent: HTMLElement) {
    this.element = document.createElement("section")
    this.element.className = "information-panel"
    this.element.hidden = true
    this.element.setAttribute("role", "dialog")
    this.element.setAttribute("aria-modal", "true")
    this.element.setAttribute("aria-labelledby", "information-title")
    this.element.innerHTML = `
      <div class="information-card">
        <h2 id="information-title" tabindex="-1"></h2>
        <div data-information-content></div>
      </div>
    `
    this.title = this.element.querySelector("h2")!
    this.content = this.element.querySelector("[data-information-content]")!
    parent.append(this.element)
  }

  openMotivation(invoker?: HTMLElement | null): void {
    this.restoreFocus = invoker ?? (document.activeElement as HTMLElement | null)
    this.title.textContent = "Por qué este juego"
    this.content.innerHTML = `
      <ol class="motivation-list">
        ${MOTIVATION_SECTIONS.map(
          ({ title, body }) => `<li><h3>${title}</h3><p>${body}</p></li>`,
        ).join("")}
      </ol>
      <div class="information-actions">
        <button type="button" data-show-sources>Datos y fuentes</button>
        <button type="button" data-close-information>Volver</button>
      </div>
    `
    this.content
      .querySelector("[data-show-sources]")
      ?.addEventListener("click", () => this.openSources())
    this.bindClose()
    this.show()
  }

  openSources(invoker?: HTMLElement | null): void {
    if (invoker) this.restoreFocus = invoker
    this.title.textContent = "Datos y fuentes"
    this.content.innerHTML = `
      <div class="source-list">
        ${EVIDENCE_FACTS.map(
          (fact) => `<article>
            <p class="source-meta">${fact.period} · ${fact.scope}</p>
            <h3>${fact.title}</h3>
            <strong>${fact.value}</strong>
            <p>${fact.explanation}</p>
            <p class="source-caveat">${fact.caveat}</p>
            <a href="${fact.sourceUrl}" target="_blank" rel="noreferrer">Ver fuente: ${fact.sourceName}</a>
          </article>`,
        ).join("")}
      </div>
      <div class="information-actions">
        <button type="button" data-back-motivation>Por qué este juego</button>
        <button type="button" data-close-information>Volver</button>
      </div>
    `
    this.content
      .querySelector("[data-back-motivation]")
      ?.addEventListener("click", () => this.openMotivation(this.restoreFocus))
    this.bindClose()
    this.show()
  }

  close(): void {
    this.element.hidden = true
    this.restoreFocus?.focus()
  }

  destroy(): void {
    this.element.remove()
  }

  private bindClose(): void {
    this.content
      .querySelector("[data-close-information]")
      ?.addEventListener("click", () => this.close())
  }

  private show(): void {
    this.element.hidden = false
    this.title.focus()
  }
}
