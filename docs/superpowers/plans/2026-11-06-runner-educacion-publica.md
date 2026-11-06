# Runner de educación pública Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un runner web móvil de un solo toque que haga sentir cómo una ratio creciente y obstáculos sistémicos agotan progresivamente a un docente, y que explique al final las reivindicaciones con cuatro datos fuenteados.

**Architecture:** Aplicación web estática sin backend ni motor de juego. Un modelo TypeScript puro y determinista contiene energía, ratio, salto, obstáculos y fin de partida; un adaptador Canvas lo dibuja y una capa DOM separada presenta inicio, resultados, fuentes y acciones. La separación permite probar toda la mecánica sin navegador y reservar Playwright para interacción táctil, accesibilidad y diseño adaptable.

**Tech Stack:** Node.js 24, npm 11, TypeScript, Vite, Canvas 2D, Vitest, Playwright y `@axe-core/playwright`.

**Spec:** `docs/superpowers/specs/2026-11-06-juego-huelga-educacion-diseno.md`

## Global Constraints

- Web estática, ligera, sin instalación y sin backend en la primera versión.
- Diseño principal para pantalla móvil vertical; debe funcionar también en horizontal y escritorio.
- Un solo gesto de juego: tocar cualquier parte del área de juego para saltar; teclado con `Space` y `ArrowUp` como equivalentes.
- Solo el docente tiene colisión; el grupo de alumnos es una animación automática y nunca se controla ni colisiona individualmente.
- El alumnado, la diversidad y las necesidades educativas nunca se representan como obstáculos.
- Una sola variable principal visible: energía; ratio, tiempo y récord son indicadores secundarios no interactivos.
- La ratio creciente acelera el consumo de energía; la energía menor reduce la altura del salto de forma gradual y predecible.
- La partida termina con “Fin de la jornada”, no con “Game Over”, y siempre ofrece reinicio inmediato.
- Datos, explicaciones y fuentes solo aparecen tras la partida; cada cifra incluye periodo, ámbito, fuente, enlace y limitación.
- El color y el sonido nunca son el único medio de comunicar estado; el sonido es opcional y no se implementará en la primera versión.
- Sin agacharse, inventario, monedas, potenciadores, decisiones ramificadas, cuentas, analítica ni llamadas de red.

## Review Focus

- Una pausa larga, cambio de pestaña o `deltaMs` extremo no debe vaciar la energía ni teletransportar obstáculos; Task 2 prueba el límite de paso temporal.
- Toques repetidos en el aire no deben permitir doble salto; Task 2 prueba que solo se salta desde el suelo.
- Una misma colisión no debe descontar energía en varios fotogramas; Task 3 prueba la ventana de invulnerabilidad.
- `localStorage`, Web Share o portapapeles ausentes/bloqueados no deben impedir jugar, ver resultados o reintentar; Task 5 prueba los fallbacks.
- Pantallas estrechas, alto DPR y `prefers-reduced-motion` no deben ocultar controles, texto ni fuentes; Task 6 lo prueba en Playwright y axe.

---

## Estructura de archivos

```text
index.html                         Shell semántico y contenedores de pantallas
package.json                       Scripts y dependencias
tsconfig.json                      Configuración estricta de TypeScript
vite.config.ts                     Vite y Vitest
playwright.config.ts               Navegadores y viewports de integración
src/main.ts                        Arranque y composición de UI + juego
src/styles.css                     Diseño adaptable, estados y accesibilidad
src/content/facts.ts               Cuatro fichas editoriales y fuentes
src/content/types.ts               Contrato de datos editoriales
src/game/config.ts                 Constantes de equilibrio de la primera versión
src/game/types.ts                  Estado, entradas, obstáculos y métricas
src/game/mechanics.ts              Ratio, energía, salto y transición de estado
src/game/obstacles.ts              Generación determinista y colisiones
src/game/renderer.ts               Dibujo Canvas de escena, docente y grupo
src/game/runtime.ts                Bucle RAF, input y coordinación modelo-render
src/ui/results.ts                  Modelo de presentación del resultado
src/ui/share.ts                    Web Share y fallback de portapapeles
tests/content/facts.test.ts        Integridad y cautelas editoriales
tests/game/mechanics.test.ts       Reglas puras de energía, ratio y salto
tests/game/obstacles.test.ts       Spawn, colisión e invulnerabilidad
tests/ui/results.test.ts           Copy, récord y fallbacks de compartir
tests/e2e/game.spec.ts             Flujo móvil y escritorio
tests/e2e/accessibility.spec.ts    Axe, teclado, movimiento reducido y layout
README.md                          Uso, pruebas y actualización de fuentes
```

### Task 1: Shell del proyecto y contrato editorial

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Create: `src/content/types.ts`
- Create: `src/content/facts.ts`
- Test: `tests/content/facts.test.ts`

**Interfaces:**
- Consumes: ninguno.
- Produces: `EvidenceFact`, `SourceKind` y `EVIDENCE_FACTS: readonly EvidenceFact[]`; scripts `dev`, `build`, `typecheck`, `test`, `test:e2e` y `ci`.

- [ ] **Step 1: Crear la configuración mínima del proyecto**

Definir `package.json` como módulo ESM con Node `>=24`, scripts `dev: vite`, `build: tsc --noEmit && vite build`, `typecheck: tsc --noEmit`, `test: vitest run`, `test:e2e: playwright test` y `ci: npm run typecheck && npm test && npm run build && npm run test:e2e`. Añadir TypeScript, Vite, Vitest, Playwright y `@axe-core/playwright` como dependencias de desarrollo y generar `package-lock.json` mediante `npm install`.

- [ ] **Step 2: Escribir el test fallido del contrato editorial**

En `tests/content/facts.test.ts`, exigir exactamente cuatro fichas, identificadores únicos, enlaces HTTPS, fechas/ámbitos no vacíos, `sourceKind` válido y una `caveat` explícita para gasto, salario y climatización. Fijar estos cuatro mensajes:

```ts
expect(byId.ratio.value).toBe("11,7 frente a 9,8")
expect(byId.cost.value).toBe("16.124 € por persona")
expect(byId.salary.value).toBe("2.797,37 € brutos al mes")
expect(byId.climate.value).toBe("hasta 20 centros detectados")
```

- [ ] **Step 3: Ejecutar el test para verificar que falla**

Run: `npm test -- tests/content/facts.test.ts`

Expected: FAIL porque `src/content/facts.ts` todavía no existe.

- [ ] **Step 4: Implementar el contrato y las cuatro fichas**

En `src/content/types.ts` definir:

```ts
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
```

En `src/content/facts.ts`, exportar `EVIDENCE_FACTS` con estas bases editoriales:

- `ratio`: centros públicos madrileños, curso 2023-2024, 11,7 alumnos por profesor frente a 9,8 en España; fuente oficial del Consejo Escolar.
- `cost`: gasto medio por persona de 16.124 € en Madrid en 2025, segundo mayor resultado autonómico; advertir que gasto observado no equivale a un índice completo de coste de vida; fuente INE.
- `salary`: retribución ordinaria bruta mensual de maestros con 10 años, 2.797,37 € en Madrid; explicar que excluye pagas extraordinarias y depende de cuerpo/antigüedad; fuente comparativa UGT 2026.
- `climate`: CCOO detectó hasta 20 centros públicos con aulas por debajo de 17 °C en el invierno de 2026; atribuir expresamente la cifra al sindicato y advertir que no es un censo regional; fuente Cadena SER.

- [ ] **Step 5: Crear un shell semántico que muestre inicio y degradación sin JavaScript**

`index.html` tendrá `main`, un encabezado, una introducción de una frase, botón `#start-button`, región `#game-region` con `aria-label`, `canvas#game-canvas`, región viva `#status-live` y `section#results` inicialmente oculta. `src/main.ts` solo confirmará el arranque; `src/styles.css` fijará tipografía de sistema, contraste y ancho máximo móvil sin estilo visual definitivo.

- [ ] **Step 6: Ejecutar pruebas, tipos y build**

Run: `npm run typecheck && npm test -- tests/content/facts.test.ts && npm run build`

Expected: los tres comandos terminan con código 0; Vite genera `dist/`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src tests/content
git commit -m "chore: scaffold runner and evidence model"
```

### Task 2: Modelo puro de ratio, energía y salto

**Files:**
- Create: `src/game/config.ts`
- Create: `src/game/types.ts`
- Create: `src/game/mechanics.ts`
- Test: `tests/game/mechanics.test.ts`

**Interfaces:**
- Consumes: ninguno de Task 1 salvo TypeScript/Vitest.
- Produces: `GAME_CONFIG`, `createGameState()`, `advanceGame(state, input, deltaMs)`, `jumpImpulseForEnergy(energy)` y tipos `GameState`, `GameInput`, `GamePhase`, `DamageKind`.

- [ ] **Step 1: Escribir tests fallidos para el estado inicial y la ratio**

En `tests/game/mechanics.test.ts`, comprobar que `createGameState()` empieza en fase `ready`, energía 100, ratio 20, docente en el suelo y métricas a cero; al avanzar 15.000 ms acumulados en pasos de 50 ms pasa a ratio 24, y a los 30.000 ms a 28.

- [ ] **Step 2: Escribir tests fallidos para energía y salto**

Comprobar que `energyDrainPerSecond(20) === 0.5`, `energyDrainPerSecond(28) === 0.7`; que el impulso es `-700` con energía 100, `-565` con energía 50 y `-430` con energía 0; y que toques en el aire no vuelven a aplicar impulso.

- [ ] **Step 3: Escribir tests fallidos para condiciones límite**

Comprobar que `advanceGame` limita cada `deltaMs` efectivo a 50 ms, nunca deja energía fuera de `[0, 100]`, cambia a `finished` al llegar a cero y no modifica un estado ya terminado.

- [ ] **Step 4: Ejecutar tests para verificar que fallan**

Run: `npm test -- tests/game/mechanics.test.ts`

Expected: FAIL por módulos no encontrados.

- [ ] **Step 5: Definir tipos y constantes exactas de equilibrio inicial**

En `src/game/config.ts` exportar `GAME_CONFIG` con `initialEnergy: 100`, `initialRatio: 20`, `ratioStep: 4`, `ratioIntervalMs: 15_000`, `baseDrainPerSecond: 0.5`, `extraDrainPerPupil: 0.025`, `gravity: 1600`, `maxJumpImpulse: -700`, `minJumpImpulse: -430`, `groundY: 0`, `maxStepMs: 50`, `collisionDamage: 14` e `invulnerabilityMs: 750`. Documentar que son valores de juego, no datos estadísticos.

- [ ] **Step 6: Implementar las funciones puras**

En `src/game/mechanics.ts` implementar:

```ts
export function createGameState(): GameState
export function energyDrainPerSecond(ratio: number): number
export function jumpImpulseForEnergy(energy: number): number
export function advanceGame(state: GameState, input: GameInput, deltaMs: number): GameState
```

Usar interpolación lineal para el salto, integración semimplícita para `playerY/playerVelocityY` y copia inmutable del estado. `GameInput` solo contiene `jumpPressed: boolean`.

- [ ] **Step 7: Ejecutar tests y tipos**

Run: `npm run typecheck && npm test -- tests/game/mechanics.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/game tests/game/mechanics.test.ts
git commit -m "feat: model ratio fatigue and jump decay"
```

### Task 3: Obstáculos deterministas y daño acumulativo

**Files:**
- Create: `src/game/obstacles.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/mechanics.ts`
- Test: `tests/game/obstacles.test.ts`
- Modify: `tests/game/mechanics.test.ts`

**Interfaces:**
- Consumes: `GameState`, `DamageKind`, `GAME_CONFIG` y `advanceGame` de Task 2.
- Produces: `ObstacleKind`, `Obstacle`, `SeededRandom`, `spawnObstacle(state, random)`, `intersectsPlayer(obstacle, state)` y métricas `hitsByKind`.

- [ ] **Step 1: Escribir tests fallidos de generación**

Comprobar con una semilla fija que no aparece ningún obstáculo durante los primeros 1.500 ms, que los tipos rotan entre `paperwork`, `heat` e `infrastructure`, y que la separación horizontal generada siempre queda entre 260 y 420 unidades lógicas.

- [ ] **Step 2: Escribir tests fallidos de colisión e invulnerabilidad**

Construir un obstáculo solapado con el docente y comprobar que el primer impacto resta exactamente 14 puntos, incrementa una vez `hitsByKind[kind]` y activa 750 ms de invulnerabilidad; nuevos fotogramas solapados durante esa ventana no vuelven a dañar.

- [ ] **Step 3: Escribir el test de jugabilidad con salto bajo**

Comprobar geométricamente que el obstáculo más alto mide 48 unidades y que un salto iniciado con energía 10 todavía alcanza más de 48 unidades antes de volver al suelo. Esto evita obstáculos matemáticamente imposibles antes del fin por agotamiento.

- [ ] **Step 4: Ejecutar tests para verificar que fallan**

Run: `npm test -- tests/game/obstacles.test.ts`

Expected: FAIL por exports ausentes.

- [ ] **Step 5: Implementar generación, movimiento y colisión**

Usar coordenadas lógicas independientes de píxeles. `SeededRandom` tendrá `next(): number` en `[0,1)`. Cada obstáculo define `kind`, `x`, `width` y `height`; las variantes visuales pertenecen al renderer. Ampliar `advanceGame` para mover, retirar, generar y resolver obstáculos sin introducir efectos laterales.

- [ ] **Step 6: Ejecutar la suite de juego**

Run: `npm test -- tests/game/mechanics.test.ts tests/game/obstacles.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game tests/game
git commit -m "feat: add systemic obstacles and collision fatigue"
```

### Task 4: Canvas, grupo visual e interacción de un toque

**Files:**
- Create: `src/game/renderer.ts`
- Create: `src/game/runtime.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Test: `tests/e2e/game.spec.ts`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: `createGameState`, `advanceGame`, `GameState` y `Obstacle` de Tasks 2–3.
- Produces: `createRenderer(canvas)`, `createGameRuntime(options)`, métodos `start()`, `stop()`, `jump()` y callback `onFinish(state)`.

- [ ] **Step 1: Configurar Playwright y escribir el flujo táctil fallido**

En `tests/e2e/game.spec.ts`, viewport móvil `390x844`: abrir la portada, pulsar `#start-button`, verificar canvas visible y fase activa, tocar el canvas y comprobar mediante el texto accesible de estado que el docente ha saltado. Añadir el mismo test con `Space` en escritorio `1280x800`.

- [ ] **Step 2: Ejecutar E2E para verificar que falla**

Run: `npm run test:e2e -- tests/e2e/game.spec.ts`

Expected: FAIL porque el runtime todavía no conecta el botón ni el canvas.

- [ ] **Step 3: Implementar el renderer Canvas sin assets externos**

`createRenderer(canvas: HTMLCanvasElement)` dibuja en un mundo lógico de `390x700`, escala por `devicePixelRatio` y devuelve `render(state: GameState): void`. Dibujar con primitivas Canvas: docente, suelo, tres obstáculos, barra de energía y contador de ratio. El grupo tendrá seis figuras visibles al inicio, añadirá una por cada incremento de ratio hasta un máximo de doce y mostrará `+N` para el resto; solo el docente usa el rectángulo de colisión.

- [ ] **Step 4: Implementar el runtime y entradas**

`createGameRuntime({ canvas, onStateChange, onFinish, randomSeed })` encapsula `requestAnimationFrame`, limita el delta mediante el modelo y escucha `pointerdown`, `Space` y `ArrowUp`. Prevenir scroll solo cuando el evento táctil se origina dentro del canvas. El aviso accesible anuncia cada incremento de ratio, no cada fotograma.

- [ ] **Step 5: Conectar inicio y ajustar layout móvil**

En `src/main.ts`, iniciar solo tras acción del usuario, ocultar la introducción durante la carrera y pasar a resultados mediante `onFinish`. En CSS, usar `min-height: 100dvh`, canvas con `touch-action: manipulation`, ancho máximo `430px`, relación lógica 390:700 y controles con objetivo táctil mínimo de 44 px.

- [ ] **Step 6: Ejecutar unitarias, E2E y build**

Run: `npm test && npm run build && npm run test:e2e -- tests/e2e/game.spec.ts`

Expected: PASS en móvil y escritorio.

- [ ] **Step 7: Commit**

```bash
git add src index.html playwright.config.ts tests/e2e/game.spec.ts
git commit -m "feat: render touch-friendly classroom runner"
```

### Task 5: Fin de jornada, fuentes, récord y compartir

**Files:**
- Create: `src/ui/results.ts`
- Create: `src/ui/share.ts`
- Modify: `src/main.ts`
- Modify: `index.html`
- Modify: `src/styles.css`
- Test: `tests/ui/results.test.ts`
- Modify: `tests/e2e/game.spec.ts`

**Interfaces:**
- Consumes: `GameState`, `hitsByKind` y `EVIDENCE_FACTS`.
- Produces: `buildResultViewModel(state, previousRecord)`, `readRecord(storage)`, `writeRecord(storage, seconds)`, `shareResult(payload, capabilities)` y la pantalla DOM de resultados.

- [ ] **Step 1: Escribir tests fallidos del resultado**

Comprobar que `buildResultViewModel` usa el título “Fin de la jornada”, incluye duración, ratio máxima y desgaste por las tres categorías, y termina con “No has jugado mal. Intentabas hacer un trabajo cada vez más exigente con tiempo y recursos insuficientes.” Comprobar que siempre incorpora las cuatro fichas de Task 1.

- [ ] **Step 2: Escribir tests fallidos de récord y compartir**

Probar que un récord nuevo reemplaza al anterior, uno menor no lo hace, un `Storage` que lanza excepción devuelve `null` sin romper y `shareResult` usa `navigator.share` cuando existe, `clipboard.writeText` como fallback y devuelve `"unavailable"` si ambos fallan.

- [ ] **Step 3: Ejecutar tests para verificar que fallan**

Run: `npm test -- tests/ui/results.test.ts`

Expected: FAIL por módulos no encontrados.

- [ ] **Step 4: Implementar funciones puras y adaptadores defensivos**

Definir `ResultViewModel` con `title`, `durationLabel`, `maxRatio`, `damageRows`, `message`, `facts` y `isRecord`. Inyectar `Storage` y capacidades de compartir para no acceder a globals dentro de las funciones probadas.

- [ ] **Step 5: Construir la pantalla de resultados**

Renderizar primero `Volver a intentarlo`, después resultado personal, traducción de obstáculos, cuatro tarjetas de evidencia con enlaces visibles y, al final, botones `Compartir` e `Informarme y apoyar`. El último enlaza a una sección con las reivindicaciones y fuentes, no a una organización partidista concreta. El copy de compartir incluye duración y ratio máxima, nunca una afirmación estadística sin contexto.

- [ ] **Step 6: Ampliar E2E hasta el fin y la revancha**

Usar `page.clock` para adelantar el tiempo sin esperas reales. Verificar “Fin de la jornada”, cuatro enlaces de fuente, botón de revancha, persistencia del récord tras recargar y que una segunda partida comienza con energía 100 y ratio 20.

- [ ] **Step 7: Ejecutar pruebas y build**

Run: `npm run typecheck && npm test && npm run build && npm run test:e2e -- tests/e2e/game.spec.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src index.html tests/ui tests/e2e/game.spec.ts
git commit -m "feat: explain the jornada and support replay sharing"
```

### Task 6: Accesibilidad, movimiento reducido y robustez adaptable

**Files:**
- Modify: `src/game/runtime.ts`
- Modify: `src/game/renderer.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Create: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: UI y runtime completos de Tasks 1–5.
- Produces: alternativa textual, soporte `prefers-reduced-motion`, foco estable y layout validado.

- [ ] **Step 1: Escribir pruebas E2E fallidas de accesibilidad**

Con axe, exigir cero violaciones `serious` o `critical` en portada y resultados. Con teclado, verificar foco visible, inicio, salto y revancha. Con JavaScript desactivado, comprobar que se conservan título, propósito y enlaces a fuentes editoriales básicas.

- [ ] **Step 2: Escribir pruebas fallidas de layout y movimiento reducido**

Probar viewports `320x568`, `390x844`, `844x390` y `1280x800`, DPR 1 y 3, sin scroll horizontal ni elementos interactivos fuera del viewport. Emular `prefers-reduced-motion: reduce` y comprobar que aparece una alternativa “Leer la jornada” que permite ir directamente a la explicación sin animación.

- [ ] **Step 3: Ejecutar E2E para verificar que falla**

Run: `npm run test:e2e -- tests/e2e/accessibility.spec.ts`

Expected: FAIL hasta implementar alternativa, foco y estilos.

- [ ] **Step 4: Implementar la alternativa y estados accesibles**

Añadir un resumen textual de la mecánica y obstáculos, disponible siempre para tecnología asistiva y visible mediante “Leer la jornada”. Mover el foco al canvas al empezar, al encabezado de resultados al terminar y al inicio al reintentar. Pausar al ocultarse la pestaña y reanudar sin acumular delta.

- [ ] **Step 5: Corregir renderer y CSS para DPR y viewports extremos**

Recalcular backing store al cambiar tamaño/DPR sin cambiar unidades lógicas; añadir `overflow-x: clip`, tamaños fluidos, área segura con `env(safe-area-inset-*)` y estilos de foco con contraste. En modo reducido, no iniciar animación automáticamente y priorizar la alternativa textual.

- [ ] **Step 6: Ejecutar toda la verificación**

Run: `npm run ci`

Expected: tipos, unitarias, build y todos los proyectos Playwright terminan con código 0.

- [ ] **Step 7: Commit**

```bash
git add src tests/e2e/accessibility.spec.ts
git commit -m "feat: make the runner accessible and resilient"
```

### Task 7: Documentación y auditoría final del prototipo

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/specs/2026-11-06-juego-huelga-educacion-diseno.md`
- Modify: `src/content/facts.ts` only if source audit finds a discrepancy

**Interfaces:**
- Consumes: aplicación y suite completas.
- Produces: instrucciones reproducibles, registro editorial y build final auditable.

- [ ] **Step 1: Documentar ejecución y mantenimiento editorial**

En `README.md`, incluir `npm install`, `npm run dev`, `npm run ci`, `npm run build`, estructura del proyecto, controles, soporte móvil y proceso para actualizar una ficha: verificar fuente, periodo, ámbito, cifra, caveat, fecha de consulta y test correspondiente.

- [ ] **Step 2: Auditar manualmente las cuatro fuentes contra el copy exacto**

Registrar en el spec, bajo “Fuentes iniciales”, fecha de consulta 6 de noviembre de 2026 y confirmar:

- ratio 11,7 Madrid pública / 9,8 España pública, curso 2023-2024;
- gasto medio 16.124 € por persona, Madrid 2025, sin llamarlo índice de coste de vida;
- maestros con 10 años 2.797,37 € brutos mensuales ordinarios, UGT 2026, sin pagas extra;
- hasta 20 centros bajo 17 °C atribuidos a CCOO vía Cadena SER, no censo regional.

Si una fuente no confirma literalmente esos extremos, corregir ficha y test en el mismo cambio antes de continuar.

- [ ] **Step 3: Ejecutar verificación final limpia**

Run: `npm run ci`

Expected: todos los comandos pasan desde una instalación reproducible y `dist/` contiene la web estática.

- [ ] **Step 4: Revisar manualmente el mensaje**

Jugar en un móvil real o emulado y comprobar cinco criterios del spec: controles sin explicación, ratio entendida como consumo de atención, alumnado no culpabilizado, dos motivos de la huelga recordables y tono no partidista. Documentar hallazgos como issues separados; no ampliar el alcance de esta primera versión durante la auditoría.

- [ ] **Step 5: Commit**

```bash
git add README.md docs src/content tests/content
git commit -m "docs: finalize runner evidence and handoff"
```

## Self-review

- **Cobertura del spec:** mecánica, metáforas, pantalla final, fuentes, móvil, accesibilidad, validación y no objetivos tienen una tarea explícita. La prueba con público general queda como validación posterior al prototipo, no como requisito de código.
- **Granularidad:** cada paso produce un archivo, prueba, comportamiento o verificación observable; no se incluye código de implementación salvo contratos y valores fijados.
- **Consistencia:** `GameState`, `EvidenceFact`, `GAME_CONFIG`, `createGameState`, `advanceGame` y `buildResultViewModel` conservan los mismos nombres entre tareas.
- **Review Focus:** las cinco condiciones están cubiertas por tests en Tasks 2, 3, 5 y 6.
- **Proporción:** siete tareas producen incrementos independientes y revisables sin separar artificialmente configuración de su primer entregable.

