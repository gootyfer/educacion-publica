import "./styles.css"

const app = document.querySelector<HTMLElement>("#app")

if (!app) {
  throw new Error("No se encontró el contenedor principal de la aplicación")
}

app.dataset.appReady = "true"
