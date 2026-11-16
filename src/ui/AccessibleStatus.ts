export class AccessibleStatus {
  readonly element: HTMLElement

  constructor(parent: HTMLElement) {
    this.element = document.createElement("p")
    this.element.className = "visually-hidden"
    this.element.setAttribute("role", "status")
    this.element.setAttribute("aria-live", "polite")
    parent.append(this.element)
  }

  announce(message: string): void {
    this.element.textContent = ""
    window.requestAnimationFrame(() => {
      this.element.textContent = message
    })
  }

  destroy(): void {
    this.element.remove()
  }
}
