export type SourceKind = "official" | "union" | "press-reporting"

export interface EvidenceFact {
  id: "ratio" | "cost" | "salary" | "climate"
  title: string
  value: string
  explanation: string
  period: string
  scope: string
  sourceName: string
  sourceUrl: `https://${string}`
  sourceKind: SourceKind
  caveat: string
}
