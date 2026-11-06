export interface SharePayload {
  title: string
  text: string
  url?: string
}

export interface ShareCapabilities {
  share?: (payload: SharePayload) => Promise<void>
  clipboard?: {
    writeText(text: string): Promise<void>
  }
}

export type ShareOutcome = "shared" | "copied" | "unavailable"

export async function shareResult(
  payload: SharePayload,
  capabilities: ShareCapabilities,
): Promise<ShareOutcome> {
  if (capabilities.share) {
    try {
      await capabilities.share(payload)
      return "shared"
    } catch {
      // La cancelación o el bloqueo permiten intentar el fallback de texto.
    }
  }

  if (capabilities.clipboard) {
    try {
      const text = [payload.text, payload.url].filter(Boolean).join("\n")
      await capabilities.clipboard.writeText(text)
      return "copied"
    } catch {
      // El resultado explícito permite a la interfaz mostrar una alternativa.
    }
  }

  return "unavailable"
}
