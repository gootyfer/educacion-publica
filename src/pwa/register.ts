interface ServiceWorkerContainerLike {
  register(
    scriptUrl: string,
    options: { scope: string },
  ): Promise<unknown>
}

interface NavigatorLike {
  readonly serviceWorker?: ServiceWorkerContainerLike
}

export async function registerPwa(
  navigatorLike: NavigatorLike,
  baseUrl: string,
): Promise<void> {
  if (!navigatorLike.serviceWorker) return
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  try {
    await navigatorLike.serviceWorker.register(`${base}sw.js`, { scope: base })
  } catch {
    // La instalación es una mejora progresiva; el juego debe seguir funcionando.
  }
}
