# Cadencia de obstáculos V4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aumentar progresivamente la frecuencia y variedad perceptible de los obstáculos, desde la cadencia actual hasta el máximo seguro calibrado con objetivo nominal de `2×`.

**Architecture:** Mantener el generador por distancia y la rotación estacional actuales. Añadir una curva pura de escala, un selector determinista de perfiles corto/medio/largo y una constante final obtenida mediante un arnés de calibración sintético; el runtime, Canvas, física, velocidad del mundo y audio no cambian.

**Tech Stack:** TypeScript, Vitest, Playwright, Vite y el motor determinista existente.

**Spec:** `docs/superpowers/specs/2026-11-08-cadencia-obstaculos-v4-design.md`

## Global Constraints

- Preservar sin incluir en commits los cambios locales preexistentes de `README.md`, `index.html`, `src/main.ts` y `tests/e2e/accessibility.spec.ts`.
- Mantener `spawnGraceMs: 1_500`, `worldSpeedFor`, salto, gravedad, energía, daño, ratio, invulnerabilidad, cajas de colisión, audio y UI sin cambios.
- La cadencia comienza en escala `1.00` y progresa hacia `GAME_CONFIG.finalSafeGapScale` mediante hitos globales `0`, `0.30`, `0.60` y `1` durante 60 segundos por trimestre.
- Perfiles sin escalar: corto `220–280` con 30 %, medio `300–380` con 45 %, largo `420–500` con 25 %.
- Cada elección de hueco consume exactamente dos valores del PRNG; un segundo corto consecutivo se promociona a medio sin otra tirada.
- La misma semilla, entradas y secuencia de deltas debe reproducir la misma partida; no se exige igualdad entre tasas de fotogramas distintas.
- La calibración mantiene energía 10, usa pasos de 16 ms y velocidad máxima; no promete saltabilidad general con deltas de 40–50 ms.
- El límite final se elige entre `0.50`, `0.55`, …, `1.00`: gana el menor candidato que satisface el invariante componible y todas las regresiones de secuencia.

## Review Focus

- **Límites temporales:** tiempos negativos usan el inicio del trimestre; 60 segundos o más quedan limitados al hito final de ese trimestre. Se fija en Task 1.
- **Reproducibilidad:** la promoción corto→medio no consume una tercera tirada y reiniciar trimestre borra solo `lastGapBand`, no la semilla. Se fija en Task 2.
- **Secuencias extremas:** un patrón legal corto–medio–corto y la semilla `973` deben formar parte del corpus de calibración. Se fija en Task 3.
- **Información visible:** la política sintética no puede leer obstáculos aún fuera de la ventana visible ni tiradas futuras. Se fija en Task 3.
- **Rendimiento lento:** V4 no debe modificar la física ni aparentar que la calibración de 16 ms cubre 40–50 ms; se revisa mediante diff y QA manual en Task 3.

---

### Task 1: Modelo de cadencia y estado de banda

**Files:**
- Modify: `src/game/config.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/obstacles.ts`
- Modify: `src/game/mechanics.ts`
- Create: `tests/game/cadence.test.ts`
- Modify: `tests/game/mechanics.test.ts`

**Interfaces:**
- Consumes: `Term`, `GameState.term`, `GameState.elapsedMs` y `speedRampDurationMs`.
- Produces: `GapBand`, `GameState.lastGapBand`, `GAME_CONFIG.gapProfiles`, `GAME_CONFIG.gapProgressByTerm`, `GAME_CONFIG.finalSafeGapScale` y `gapScaleFor(term: Term, elapsedMs: number, finalSafeScale?: number): number`.

- [ ] **Step 1: Escribir pruebas fallidas para la curva continua y sus límites**

Crear `tests/game/cadence.test.ts` con valores literales para un límite provisional `0.50`:

```ts
expect(gapScaleFor(1, -1, 0.5)).toBe(1)
expect(gapScaleFor(1, 60_000, 0.5)).toBeCloseTo(0.85)
expect(gapScaleFor(2, 0, 0.5)).toBeCloseTo(0.85)
expect(gapScaleFor(2, 60_000, 0.5)).toBeCloseTo(0.70)
expect(gapScaleFor(3, 0, 0.5)).toBeCloseTo(0.70)
expect(gapScaleFor(3, 60_000, 0.5)).toBe(0.5)
expect(gapScaleFor(3, 120_000, 0.5)).toBe(0.5)
```

Añadir una tabla para `finalSafeScale` `0.50`, `0.68` y `0.80` que compruebe monotonía dentro del trimestre y ausencia de retroceso entre el final de un trimestre y el inicio del siguiente.

En `tests/game/mechanics.test.ts`, exigir `lastGapBand: null` tanto en `createGameState()` como después de `startNextTerm()`.

- [ ] **Step 2: Ejecutar las pruebas y verificar el fallo**

Run: `npm test -- tests/game/cadence.test.ts tests/game/mechanics.test.ts`

Expected: FAIL porque `gapScaleFor`, `GapBand` y `lastGapBand` aún no existen.

- [ ] **Step 3: Implementar el modelo mínimo de cadencia**

En `src/game/types.ts`:

```ts
export type GapBand = "short" | "medium" | "long"
```

Añadir `lastGapBand: GapBand | null` a `GameState`.

En `src/game/config.ts`, añadir:

```ts
gapProfiles: {
  short: { min: 220, max: 280, probability: 0.30 },
  medium: { min: 300, max: 380, probability: 0.45 },
  long: { min: 420, max: 500, probability: 0.25 },
},
gapProgressByTerm: {
  1: { start: 0, end: 0.30 },
  2: { start: 0.30, end: 0.60 },
  3: { start: 0.60, end: 1 },
},
finalSafeGapScale: 0.50,
```

`0.50` es el objetivo inicial que Task 3 sustituirá si la calibración exige otro valor.

En `src/game/obstacles.ts`, exportar:

```ts
export function gapScaleFor(
  term: Term,
  elapsedMs: number,
  finalSafeScale = GAME_CONFIG.finalSafeGapScale,
): number
```

Interpolar el progreso del trimestre en `[0, 1]` durante 60 segundos, interpolar después el progreso global entre los hitos del término y devolver `1 - globalProgress * (1 - finalSafeScale)`.

En `src/game/mechanics.ts`, inicializar y reiniciar `lastGapBand: null` sin reiniciar `randomSeed` al cambiar de trimestre.

- [ ] **Step 4: Ejecutar las pruebas y verificar que pasan**

Run: `npm test -- tests/game/cadence.test.ts tests/game/mechanics.test.ts`

Expected: PASS.

- [ ] **Step 5: Ejecutar la suite unitaria y revisar tipos**

Run: `npm run typecheck && npm test`

Expected: typecheck exitoso y todas las pruebas PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/config.ts src/game/types.ts src/game/obstacles.ts src/game/mechanics.ts tests/game/cadence.test.ts tests/game/mechanics.test.ts
git commit -m "feat: model progressive obstacle cadence"
```

---

### Task 2: Selector de huecos contrastados e integración del generador

**Files:**
- Modify: `src/game/obstacles.ts`
- Modify: `src/game/mechanics.ts`
- Modify: `tests/game/cadence.test.ts`
- Modify: `tests/game/obstacles.test.ts`

**Interfaces:**
- Consumes: `GapBand`, `gapScaleFor`, `GameState.lastGapBand`, `SeededRandom` y perfiles de `GAME_CONFIG`.
- Produces: `chooseObstacleGap(state: Pick<GameState, "term" | "elapsedMs" | "lastGapBand">, random: SeededRandom): { gap: number; band: GapBand }`; `SpawnResult` añade `nextGapBand: GapBand`.

- [ ] **Step 1: Escribir pruebas fallidas para perfiles, escala y consumo del PRNG**

En `tests/game/cadence.test.ts`, usar un doble mínimo de PRNG que devuelva pares literales y afirmar:

- rollo de banda `0.00` y rollo interno `0.00` → corto mínimo `220 × escala`;
- `0.2999` y `1.00` → corto máximo `280 × escala`;
- `0.30` y `0.50` → medio central `340 × escala`;
- `0.7499` y `0.00` → medio mínimo `300 × escala`;
- `0.75` y `1.00` → largo máximo `500 × escala`;
- estado con `lastGapBand: "short"` y nueva selección corta → banda `medium` y rango medio usando el mismo segundo rollo.

Con `SeededRandom(42)`, comparar la semilla resultante con otro PRNG avanzado exactamente dos veces. Repetir una secuencia de 100 elecciones y afirmar que nunca contiene `short, short`.

- [ ] **Step 2: Ejecutar las pruebas y verificar el fallo**

Run: `npm test -- tests/game/cadence.test.ts`

Expected: FAIL porque `chooseObstacleGap` no existe.

- [ ] **Step 3: Implementar `chooseObstacleGap` y ampliar `SpawnResult`**

En `src/game/obstacles.ts`, definir una interfaz estructural privada `{ next(): number }` para que las pruebas puedan inyectar rolls literales, manteniendo compatibilidad con `SeededRandom`.

Seleccionar banda con umbrales acumulados `0.30` y `0.75`; promocionar un corto repetido a medio; consumir siempre el segundo rollo; interpolar dentro del perfil elegido y multiplicar por `gapScaleFor(state.term, state.elapsedMs)`.

Cambiar `spawnObstacle` para devolver:

```ts
interface SpawnResult {
  obstacle: Obstacle
  nextGap: number
  nextGapBand: GapBand
}
```

- [ ] **Step 4: Integrar la banda en `advanceGame`**

En `src/game/mechanics.ts`, copiar `state.lastGapBand` al comienzo del frame y asignar `spawned.nextGapBand` únicamente cuando aparece un obstáculo. Incluir el valor actualizado en `nextState`.

No cambiar la elección rotatoria de variantes, la posición de aparición ni el tratamiento actual del exceso de distancia.

- [ ] **Step 5: Actualizar y ampliar las pruebas del generador**

En `tests/game/obstacles.test.ts`:

- sustituir los límites fijos `260–420` por aserciones del perfil y escala retornados;
- conservar el orden de las tres siluetas iniciales;
- comprobar que `advanceGame` persiste `lastGapBand` solo al aparecer un obstáculo;
- comprobar que `startNextTerm` deja la semilla intacta y reinicia la banda;
- ejecutar dos secuencias con la misma semilla, estado y deltas y exigir igualdad completa de variantes, huecos y bandas;
- ejecutar otra semilla y exigir una secuencia distinta.

- [ ] **Step 6: Ejecutar las pruebas enfocadas y verificar que pasan**

Run: `npm test -- tests/game/cadence.test.ts tests/game/obstacles.test.ts tests/game/mechanics.test.ts`

Expected: PASS.

- [ ] **Step 7: Ejecutar suite unitaria y typecheck**

Run: `npm run typecheck && npm test`

Expected: typecheck exitoso y todas las pruebas PASS.

- [ ] **Step 8: Commit**

```bash
git add src/game/obstacles.ts src/game/mechanics.ts tests/game/cadence.test.ts tests/game/obstacles.test.ts tests/game/mechanics.test.ts
git commit -m "feat: vary obstacle gaps by cadence bands"
```

---

### Task 3: Calibración de seguridad, regresiones largas y frecuencia efectiva

**Files:**
- Create: `tests/game/helpers/cadenceSafety.ts`
- Create: `tests/game/cadence-safety.test.ts`
- Modify: `src/game/config.ts`
- Modify: `tests/game/cadence.test.ts`
- Modify: `docs/superpowers/specs/2026-11-08-cadencia-obstaculos-v4-design.md`

**Interfaces:**
- Consumes: `advanceGame`, `worldSpeedFor`, las seis `OBSTACLE_DIMENSIONS`, perfiles escalados y el selector determinista de Task 2.
- Produces en código de prueba: `CALIBRATION_CANDIDATES`, `calibrateFinalGapScale(): number`, `visibleJumpPolicy(state: GameState): GameInput` y `sequenceIsSafe(scenario: SafetyScenario): boolean`; fija el valor definitivo de `GAME_CONFIG.finalSafeGapScale`.

- [ ] **Step 1: Crear primero una prueba fallida que exige que la configuración coincida con la calibración**

Crear `tests/game/cadence-safety.test.ts`:

```ts
expect(calibrateFinalGapScale()).toBe(GAME_CONFIG.finalSafeGapScale)
```

La primera ejecución usa todavía el objetivo provisional `0.50`; debe fallar si el arnés demuestra que no es seguro.

- [ ] **Step 2: Implementar el arnés sintético en código de prueba**

En `tests/game/helpers/cadenceSafety.ts`, definir:

```ts
export const CALIBRATION_CANDIDATES = [
  0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00,
] as const

export interface SafetyScenario {
  variants: ObstacleVariant[]
  unscaledGaps: number[]
  scale: number
}

export function visibleJumpPolicy(state: GameState): GameInput
export function sequenceIsSafe(scenario: SafetyScenario): boolean
export function calibrateFinalGapScale(): number
```

El simulador usa trimestre 3 a 60 segundos, velocidad máxima, pasos de 16 ms, generador deshabilitado y obstáculos colocados por sus distancias acumuladas. Después de cada `advanceGame`, restablece `energy: 10` antes del siguiente frame; no modifica posición, velocidad vertical, invulnerabilidad ni obstáculos.

`visibleJumpPolicy` solo inspecciona el obstáculo más cercano cuyo borde izquierdo está dentro del Canvas; nunca recibe la lista de huecos futuros. Debe usar una tabla fija de umbrales por variante obtenida mediante búsqueda exhaustiva de umbrales de 2 px y congelada en el helper. La misma tabla se usa para todos los candidatos y semillas.

La condición componible exige que, después de cada obstáculo, el docente esté en el suelo antes de que el siguiente alcance el umbral de decisión de su variante. Un escenario termina con éxito solo cuando el último obstáculo sale a la izquierda sin golpes.

- [ ] **Step 3: Cubrir pares, extremos y regresiones largas**

Generar los 216 escenarios ordenados: seis variantes iniciales × seis siguientes × tres perfiles × extremos mínimo/máximo. Añadir explícitamente:

- `paper-stack → filing-cart → heat-climate → wall` con huecos sin escalar `223.5884, 300.2930, 221.5242`;
- una cadena de nueve obstáculos que alterna mínimos legales corto/medio `220, 300`;
- secuencias de al menos 60 obstáculos para semillas fijas `[42, 973, 2_026_1108]`, usando la promoción de cortos de producción.

Para cada candidato, exigir que el invariante de pares y todas las regresiones pasen. `calibrateFinalGapScale` devuelve el primer candidato válido.

- [ ] **Step 4: Ejecutar la calibración y leer el valor real**

Run: `npm test -- tests/game/cadence-safety.test.ts`

Expected: FAIL mostrando el valor calibrado si difiere del provisional `0.50`; PASS únicamente si `0.50` satisface todas las condiciones.

Registrar el valor observado en el ledger de ejecución antes de modificar producción.

- [ ] **Step 5: Fijar la constante calibrada y sus expectativas**

Actualizar `GAME_CONFIG.finalSafeGapScale` al valor exacto devuelto. En `tests/game/cadence.test.ts`, añadir aserciones literales para los seis hitos derivados de ese límite y para la frecuencia efectiva `1 / finalSafeGapScale`.

Actualizar la sección de límite de seguridad del diseño con el valor obtenido y la frecuencia efectiva; no cambiar otras mecánicas para alcanzar una cifra mayor.

- [ ] **Step 6: Verificar calibración y toda la unidad**

Run: `npm test -- tests/game/cadence-safety.test.ts tests/game/cadence.test.ts tests/game/obstacles.test.ts`

Expected: PASS.

Run: `npm run typecheck && npm test`

Expected: typecheck exitoso y todas las pruebas PASS.

- [ ] **Step 7: Añadir una prueba de frecuencia efectiva del motor**

En `tests/game/cadence-safety.test.ts`, simular 60 segundos con la misma semilla, deltas de 16 ms, energía mantenida en 100 y la política visible. Comparar:

- generador V4 al inicio del primer trimestre frente a una referencia V3 con media 340 px: diferencia de conteo no superior a un obstáculo;
- final del tercer trimestre V4 frente a la misma referencia a igual `worldSpeedFor`: el cociente de apariciones debe aproximarse a `1 / finalSafeGapScale` con tolerancia de 10 %.

La prueba compara frecuencia; no modifica ni vuelve a probar la velocidad del mundo.

- [ ] **Step 8: Ejecutar CI completa y revisión manual acotada**

Run: `npm run ci`

Expected: typecheck, pruebas unitarias, build y Playwright PASS.

Run: `git diff --check`

Expected: salida vacía.

QA manual:

- jugar tres cursos a `390×844` y confirmar inicio familiar, ráfagas/descansos distinguibles y mayor presión final;
- probar con CPU limitada o deltas lentos y confirmar que no hay una degradación evidente respecto a V3, documentando que no existe garantía fuera de 16 ms;
- comprobar que música, velocidad del escenario, copy y pantallas no han cambiado.

- [ ] **Step 9: Commit**

```bash
git add tests/game/helpers/cadenceSafety.ts tests/game/cadence-safety.test.ts src/game/config.ts tests/game/cadence.test.ts docs/superpowers/specs/2026-11-08-cadencia-obstaculos-v4-design.md
git commit -m "test: calibrate safe obstacle cadence"
```

---

## Verificación final

- [ ] Confirmar que `git status --short` solo muestra, además de los commits V4, los cuatro cambios locales preexistentes preservados.
- [ ] Ejecutar `npm run ci` una vez más sobre el árbol final y leer el recuento completo.
- [ ] Ejecutar `git diff --check` y exigir salida vacía.
- [ ] Revisar el diff V4 y confirmar que no modifica `worldSpeedFor`, audio, física, UI ni los cuatro archivos locales excluidos.
- [ ] Documentar en la entrega el `finalSafeGapScale` obtenido, su frecuencia efectiva y la limitación de 16 ms.

