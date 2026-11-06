# Una jornada docente

Runner web móvil de un solo toque para comprender, mediante humor y una mecánica familiar, algunas reivindicaciones de la educación pública madrileña. La ratio aumenta durante la carrera, la energía docente baja y el salto pierde altura; al finalizar se explica qué representa cada obstáculo y se muestran cuatro datos con sus fuentes y limitaciones.

## Ejecutar el proyecto

Requiere Node.js 24 o posterior.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local. El juego no necesita backend ni llamadas de red durante la partida.

## Verificación

```bash
npm run ci
```

El comando ejecuta TypeScript, 20 pruebas unitarias, el build de producción y 11 recorridos Playwright. La primera ejecución de Playwright puede necesitar:

```bash
npx playwright install chromium
```

Para generar solamente la web estática:

```bash
npm run build
```

El resultado queda en `dist/`.

## Controles y soporte

- Móvil: tocar cualquier punto del área de juego para saltar.
- Teclado: `Espacio` o `Flecha arriba`.
- Movimiento reducido: el botón **Leer la jornada** abre la explicación sin animación.
- JavaScript desactivado: el HTML mantiene el propósito del proyecto y los cuatro enlaces de fuentes.
- Pantallas verificadas: 320×568, 390×844 con DPR 3, 844×390 y 1280×800.

## Estructura

- `src/game/`: estado puro, física, obstáculos, renderer Canvas y bucle de ejecución.
- `src/content/`: fichas editoriales con cifra, periodo, ámbito, fuente y cautela.
- `src/ui/`: resultado, récord local y compartir con fallbacks.
- `tests/game/` y `tests/ui/`: pruebas unitarias de mecánica y presentación.
- `tests/e2e/`: flujos táctiles, teclado, responsive, axe y degradación sin JavaScript.
- `docs/superpowers/specs/`: diseño aprobado.
- `docs/superpowers/plans/`: plan de construcción ejecutado.
- `docs/validation-notes.md`: revisión interna y pruebas pendientes con público general.

## Actualizar una cifra

Cada ficha vive en `src/content/facts.ts`. Antes de cambiarla:

1. Abrir la fuente y comprobar que sigue disponible.
2. Verificar el valor exacto, unidad, periodo y ámbito.
3. Identificar si la fuente es oficial, sindical o información de prensa.
4. Escribir una `caveat` que impida interpretar la cifra más allá de lo que demuestra.
5. Registrar la fecha de consulta en el documento de diseño.
6. Actualizar la expectativa correspondiente en `tests/content/facts.test.ts`.
7. Ejecutar `npm run ci`.

No se debe convertir gasto observado en “coste de vida”, una detección sindical en censo regional ni una retribución concreta en salario universal del profesorado.

## Alcance de la primera versión

No incluye cuentas, analítica, backend, monetización, motor de juego externo ni comparación exhaustiva entre pública y concertada. El alumnado acompaña al docente visualmente, pero nunca funciona como obstáculo ni tiene colisiones individuales.
