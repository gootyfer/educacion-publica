import { createPhaserGame } from "./phaser/create-game"
import type { GameDebugState } from "./phaser/scenes/GameScene"

declare global {
  interface Window {
    __phaserSlice?: GameDebugState
  }
}

const root = document.querySelector<HTMLElement>("#phaser-root")
const status = document.querySelector<HTMLElement>("#slice-status")

if (!root || !status) throw new Error("No se encontró el corte vertical")

const game = createPhaserGame(root)

game.events.on("game:jump", () => {
  status.textContent = "El docente ha saltado."
})
game.events.on("game:impact", () => {
  status.textContent = "Choque suave: baja la energía."
})
game.events.on("game:debug", (state: GameDebugState) => {
  window.__phaserSlice = state
})
