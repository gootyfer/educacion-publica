import type { EvidenceFact } from "./types"

export const EVIDENCE_FACTS = [
  {
    id: "ratio",
    title: "Más alumnado por docente en la pública",
    value: "11,7 frente a 9,8",
    explanation:
      "Los centros públicos madrileños registraron 11,7 alumnos por profesor, frente a 9,8 en el conjunto de centros públicos de España.",
    period: "Curso 2023-2024",
    scope: "Enseñanzas de Régimen General, centros públicos",
    sourceName: "Consejo Escolar de la Comunidad de Madrid",
    sourceUrl:
      "https://www.comunidad.madrid/sites/default/files/informe_-_capitulo_b_-_2025.pdf",
    sourceKind: "official",
    caveat:
      "Es una ratio media de alumnado por profesor, no el tamaño concreto de cada aula.",
  },
  {
    id: "cost",
    title: "Vivir en Madrid exige uno de los mayores gastos",
    value: "16.124 € por persona",
    explanation:
      "Madrid tuvo el segundo mayor gasto medio por persona entre las comunidades autónomas.",
    period: "Año 2025",
    scope: "Gasto medio anual por persona",
    sourceName: "Instituto Nacional de Estadística",
    sourceUrl: "https://www.ine.es/dyngs/Prensa/EPF2025.htm",
    sourceKind: "official",
    caveat:
      "El gasto observado no equivale a un índice completo del coste de vida.",
  },
  {
    id: "salary",
    title: "El sueldo depende del cuerpo y la antigüedad",
    value: "2.797,37 € brutos al mes",
    explanation:
      "La comparativa de UGT sitúa en esa cifra la retribución ordinaria de un maestro de Madrid con diez años de antigüedad.",
    period: "Comparativa 2026",
    scope: "Maestros con 10 años de antigüedad",
    sourceName: "UGT Servicios Públicos",
    sourceUrl:
      "https://ugt-sp.es/wp-content/uploads/boletin-retribuciones-profesorado-comparativa-europa-2026_web-1.pdf",
    sourceKind: "union",
    caveat:
      "La cifra es mensual ordinaria, excluye las pagas extraordinarias y cambia según cuerpo y antigüedad.",
  },
  {
    id: "climate",
    title: "Aulas fuera del rango térmico",
    value: "hasta 20 centros detectados",
    explanation:
      "CCOO comunicó que había detectado centros públicos madrileños con aulas por debajo de 17 °C.",
    period: "Invierno de 2026",
    scope: "Centros públicos señalados por CCOO",
    sourceName: "Cadena SER, con datos atribuidos a CCOO",
    sourceUrl:
      "https://cadenaser.com/cmadrid/2026/02/02/una-veintena-de-centros-educativos-de-madrid-con-aulas-a-menos-de-17-grados-en-pleno-invierno-radio-madrid/",
    sourceKind: "press-reporting",
    caveat:
      "Es una detección sindical difundida por prensa, no es un censo regional de climatización.",
  },
] as const satisfies readonly EvidenceFact[]
