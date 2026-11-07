# Ajustes de jugabilidad y copy V3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afinar el copy, la representación de la ratio, los lazos, las transiciones, la dificultad y el tempo musical sin alterar la mecánica básica del runner.

**Architecture:** Mantener el motor y el Canvas actuales, extrayendo únicamente modelos puros pequeños para poder probar el grupo de alumnos, la verja y la conversión de velocidad a tempo. La interfaz DOM seguirá coordinándose desde `src/main.ts`; la mecánica seguirá siendo determinista en `src/game/mechanics.ts` y el controlador de audio seguirá tolerando silencio, reproducción bloqueada y archivos ausentes.

**Tech Stack:** TypeScript, Canvas 2D, Vite, Vitest, Playwright, HTML/CSS y audio nativo del navegador.

**Spec:** `docs/superpowers/specs/2026-11-07-ajustes-jugabilidad-copy-v3-design.md`

## Global Constraints

- No cambiar el sistema de energía, daño, incremento de ratio, puntuación, cajas de colisión ni los once audios aprobados.
- Conservar seis figuras visibles; `6 + x` debe coincidir siempre con la ratio total del HUD.
- Docente, seis figuras e indicador `+x` deben compartir el mismo `playerY` durante el salto.
- Los lazos deben usar el mismo desplazamiento horizontal que los postes y progresar `1→3`, `3→5`, `5→7` a los 0, 20 y 40 segundos de cada trimestre.
- El siguiente trimestre solo puede empezar al activar `Continuar el curso`; no existe avance automático.
- Conservar multiplicadores iniciales de mundo `1`, `1.09` y `1.18`; usar límites de rampa `0.20`, `0.25` y `0.30` en 60 segundos.
- Mapear la velocidad real del mundo de forma continua y acotada a un tempo entre `1.00×` y `1.24×`, conservando el tono cuando el navegador lo permita.
- `Informarme y apoyar` debe abrir `https://menoslectivas.org/` con `target="_blank"` y `rel="noreferrer"`.
- La experiencia debe seguir funcionando en móvil, con teclado, sin audio, sin almacenamiento y sin JavaScript donde ya existe contenido alternativo.

## Review Focus

- **Ratios límite:** una ratio igual o superior a seis produce seis figuras y un resto no negativo; la ratio normal 20 muestra `+14`. Se fija en la Task 2.
- **Transición abandonada o pestaña oculta:** esperar indefinidamente, incluso ocultando la página, no inicia otro trimestre; una pulsación sí lo hace y dos no saltan etapas. Se fija en la Task 4.
- **Audio no disponible o silenciado:** cambiar continuamente el tempo no debe iniciar audio, romper el mute ni impedir jugar si `play()` falla. Se fija en la Task 5.
- **Máxima dificultad con mínima energía:** las seis variantes deben seguir siendo atravesables a 16 ms por frame con el límite del tercer trimestre. Se fija en la Task 5.
- **Contenido alternativo y pantallas pequeñas:** el copy nuevo debe aparecer en la experiencia animada, en la explicación reducida y sin JavaScript sin introducir desbordamiento. Se fija en las Tasks 1 y 5.

---

### Task 1: Copy, resultado final y enlace de apoyo

**Files:**
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/ui/results.ts`
- Modify: `tests/ui/results.test.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `tests/e2e/game.spec.ts`

**Interfaces:**
- Consumes: `buildResultViewModel(state, previousRecord)` y el renderizado DOM actual.
- Produces: `ResultViewModel` sin `discoveredObstacles`, `discoveredSeasons` ni `ratioExplanation`; copy V3 exacto en portada, alternativa textual, compartir y contenido sin JavaScript.

- [ ] **Step 1: Escribir las pruebas de interfaz y modelo que fallen con el copy anterior**

Actualizar `tests/ui/results.test.ts` para que `ResultViewModel` ya no exponga las tres propiedades eliminadas y para que el payload de compartir use el título `Una jornada decente`.

Actualizar `tests/e2e/accessibility.spec.ts` para exigir:

- encabezado `Una jornada decente` y texto exacto de portada;
- botón `Cómo funciona`;
- antetítulo `Cómo funciona` y encabezado `Una jornada docente` en la alternativa textual;
- las tres frases aprobadas y ausencia de `septiembre a diciembre`, `enero a abril` y `abril a junio`;
- el mismo propósito y título nuevo sin JavaScript.

Actualizar `tests/e2e/game.spec.ts` para exigir:

- ausencia de `Lo que apareció durante el curso` y de la explicación eliminada;
- enlace `Informarme y apoyar` con `href="https://menoslectivas.org/"`;
- ausencia de elementos `[data-discovered-obstacle]` en el resultado final.

- [ ] **Step 2: Ejecutar las pruebas enfocadas para verificar el fallo**

Run: `npm test -- tests/ui/results.test.ts`

Expected: FAIL porque el modelo aún expone el resumen eliminado.

Run: `npx playwright test tests/e2e/accessibility.spec.ts tests/e2e/game.spec.ts`

Expected: FAIL en los selectores y textos V3.

- [ ] **Step 3: Aplicar el copy exacto y simplificar el modelo de resultado**

En `index.html`, sustituir metadatos, portada y contenido `noscript` según la especificación.

En `src/main.ts`:

- sustituir el copy de portada dependiente del DOM y el payload de compartir;
- renderizar la alternativa textual con las tres frases aprobadas y descripciones trimestrales sin meses;
- eliminar el cálculo y HTML de `discoveredObstacles`, la sección `.discovery-summary` y `.ratio-explanation`;
- cambiar el enlace externo a `https://menoslectivas.org/`.

En `src/ui/results.ts`, eliminar del tipo y del valor retornado:

```ts
discoveredObstacles
discoveredSeasons
ratioExplanation
```

Eliminar también los imports que queden sin uso.

- [ ] **Step 4: Ejecutar las pruebas enfocadas para verificar que pasan**

Run: `npm test -- tests/ui/results.test.ts`

Expected: PASS.

Run: `npx playwright test tests/e2e/accessibility.spec.ts tests/e2e/game.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html src/main.ts src/ui/results.ts tests/ui/results.test.ts tests/e2e/accessibility.spec.ts tests/e2e/game.spec.ts
git commit -m "feat: sharpen v3 copy and final results"
```

---

### Task 2: Grupo de alumnos y contador coherente con la ratio

**Files:**
- Modify: `src/game/art/characters.ts`
- Modify: `tests/game/visuals.test.ts`

**Interfaces:**
- Consumes: `GameState.ratio`, `GameState.playerY`, `GROUND_Y` y el dibujado actual del docente.
- Produces: `VISIBLE_PUPIL_COUNT = 6`, `hiddenPupilCount(ratio: number): number` y `pupilBottomForRow(row: number, teacherY: number): number` como modelo puro usado por el Canvas y sus pruebas.

- [ ] **Step 1: Escribir pruebas fallidas para seis figuras, resto y salto común**

En `tests/game/visuals.test.ts`, reemplazar la expectativa de alumnado inmóvil por estas condiciones:

```ts
expect(VISIBLE_PUPIL_COUNT).toBe(6)
expect(hiddenPupilCount(20)).toBe(14)
expect(hiddenPupilCount(24)).toBe(18)
expect(hiddenPupilCount(6)).toBe(0)
expect(pupilBottomForRow(0, -90)).toBe(pupilBottomForRow(0, 0) - 90)
expect(pupilBottomForRow(1, -90)).toBe(pupilBottomForRow(1, 0) - 90)
```

- [ ] **Step 2: Ejecutar la prueba y verificar el fallo**

Run: `npm test -- tests/game/visuals.test.ts`

Expected: FAIL porque el número visible varía y `teacherY` se ignora.

- [ ] **Step 3: Implementar el modelo estable del grupo**

En `src/game/art/characters.ts`:

```ts
export const VISIBLE_PUPIL_COUNT = 6
export function hiddenPupilCount(ratio: number): number
export function pupilBottomForRow(row: number, teacherY: number): number
```

`hiddenPupilCount` devuelve `Math.max(0, ratio - VISIBLE_PUPIL_COUNT)`. Dibujar siempre seis figuras, aplicar `teacherY` a ambas filas y colocar `+x` con el mismo desplazamiento vertical. No mostrar `+0`.

- [ ] **Step 4: Ejecutar la prueba y verificar que pasa**

Run: `npm test -- tests/game/visuals.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/art/characters.ts tests/game/visuals.test.ts
git commit -m "feat: align pupil group with ratio and jump"
```

---

### Task 3: Lazos progresivos anclados a la verja

**Files:**
- Modify: `src/game/art/scene.ts`
- Modify: `tests/game/visuals.test.ts`

**Interfaces:**
- Consumes: `GameState.term`, `GameState.elapsedMs` y el paralaje calculado desde `distanceTravelled`.
- Produces: `ribbonCountFor(term: Term, elapsedMs: number): number` y `fenceLayoutFor(term: Term, elapsedMs: number, parallax: number): { postXs: number[]; ribbonXs: number[] }`.

- [ ] **Step 1: Escribir pruebas fallidas para la progresión y el anclaje**

Añadir a `tests/game/visuals.test.ts`:

```ts
expect([0, 20_000, 40_000].map((ms) => ribbonCountFor(1, ms))).toEqual([1, 2, 3])
expect([0, 20_000, 40_000].map((ms) => ribbonCountFor(2, ms))).toEqual([3, 4, 5])
expect([0, 20_000, 40_000].map((ms) => ribbonCountFor(3, ms))).toEqual([5, 6, 7])
```

Para varios valores de `parallax`, afirmar que cada `ribbonX` pertenece exactamente a `postXs`; afirmar además que los conteos no bajan al cambiar de trimestre.

- [ ] **Step 2: Ejecutar la prueba y verificar el fallo**

Run: `npm test -- tests/game/visuals.test.ts`

Expected: FAIL porque el conteo depende solo del trimestre y el lazo usa `offset * 0.15`.

- [ ] **Step 3: Implementar un único modelo geométrico para verja y lazos**

En `src/game/art/scene.ts`, retirar `ribbonCount` de `SceneVisual` y `TERM_VISUALS`. Implementar:

```ts
export function ribbonCountFor(term: Term, elapsedMs: number): number
export function fenceLayoutFor(
  term: Term,
  elapsedMs: number,
  parallax: number,
): { postXs: number[]; ribbonXs: number[] }
```

Usar base `1 + (term - 1) * 2`, sumar un lazo en `20_000` y otro en `40_000`, y limitar el resultado a 7. Generar postes con la separación actual de 55 px y elegir entre esos mismos valores de `x` los anclajes de los lazos. `drawFenceAndRibbons` debe consumir el layout y nunca recalcular una velocidad distinta para el lazo.

- [ ] **Step 4: Ejecutar la prueba y verificar que pasa**

Run: `npm test -- tests/game/visuals.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/art/scene.ts tests/game/visuals.test.ts
git commit -m "feat: anchor progressive ribbons to fence"
```

---

### Task 4: Continuación manual entre trimestres

**Files:**
- Modify: `src/main.ts`
- Modify: `tests/e2e/game.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: `buildTransitionViewModel`, `AudioController.playTermEnd`, `AudioController.playHoliday` y `runtime.resumeNextTerm()`.
- Produces: una transición que permanece abierta hasta una única activación de `#continue-course`; conserva solo el temporizador de 3 segundos para el acento vacacional.

- [ ] **Step 1: Escribir la regresión fallida contra el avance automático**

En `tests/e2e/game.spec.ts`, cambiar el helper para no esperar que se habilite el botón y añadir una prueba que:

1. alcanza `Vacaciones de Navidad`;
2. comprueba que `Continuar el curso` está habilitado inmediatamente;
3. avanza el reloj virtual 60 segundos con la página visible;
4. comprueba que la pantalla de Navidad sigue visible y el segundo trimestre no se ha anunciado;
5. hace doble clic y comprueba que empieza exactamente el segundo trimestre.

Mantener la variante de pestaña oculta y comprobar el mismo resultado tras 60 segundos.

En `tests/e2e/accessibility.spec.ts`, retirar las esperas de un segundo y verificar activación inmediata mediante teclado.

- [ ] **Step 2: Ejecutar las pruebas y verificar el fallo**

Run: `npx playwright test tests/e2e/game.spec.ts tests/e2e/accessibility.spec.ts`

Expected: FAIL porque `continueOnce()` se ejecuta a los 8 segundos.

- [ ] **Step 3: Eliminar el avance automático y habilitar el botón desde el renderizado**

En `src/main.ts`:

- retirar `disabled` del botón;
- conservar `continued` como guardia idempotente;
- eliminar `visibleElapsedMs`, el desbloqueo a 1 segundo y la rama de 8 segundos;
- programar únicamente `audioController.playHoliday(result.term)` a los 3 segundos;
- conservar `clearTransitionTimers()` al continuar, reiniciar o abandonar la pantalla;
- mover el foco al Canvas después de `runtime.resumeNextTerm()` si el runtime no lo hace ya, para preservar el control por teclado.

- [ ] **Step 4: Ejecutar las pruebas y verificar que pasan**

Run: `npx playwright test tests/e2e/game.spec.ts tests/e2e/accessibility.spec.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts tests/e2e/game.spec.ts tests/e2e/accessibility.spec.ts
git commit -m "fix: require manual term continuation"
```

---

### Task 5: Límites de velocidad por trimestre y tempo continuo

**Files:**
- Modify: `src/game/config.ts`
- Modify: `src/game/mechanics.ts`
- Modify: `src/audio/types.ts`
- Modify: `src/audio/controller.ts`
- Modify: `src/main.ts`
- Modify: `tests/game/mechanics.test.ts`
- Modify: `tests/game/obstacles.test.ts`
- Modify: `tests/audio/controller.test.ts`
- Modify: `tests/e2e/game.spec.ts`

**Interfaces:**
- Consumes: `worldSpeedFor(state)` y los multiplicadores iniciales existentes.
- Produces: `GAME_CONFIG.termMaxSpeedRamps`, `playbackRateForWorldSpeed(worldSpeed: number): number` y `AudioController.setWorldSpeed(worldSpeed: number): void`; elimina `setIntensity(level)` y el estado `audioIntensity`.

- [ ] **Step 1: Escribir pruebas fallidas para los tres límites del mundo**

En `tests/game/mechanics.test.ts`, conservar las expectativas de inicio y sustituir el límite común por:

```ts
expect(worldSpeedFor(term1End)).toBeCloseTo(GAME_CONFIG.obstacleSpeed * 1 * 1.20)
expect(worldSpeedFor(term2End)).toBeCloseTo(GAME_CONFIG.obstacleSpeed * 1.09 * 1.25)
expect(worldSpeedFor(term3End)).toBeCloseTo(GAME_CONFIG.obstacleSpeed * 1.18 * 1.30)
```

Comprobar también que la rampa es monótona, se satura después de 60 segundos y que cada inicio conserva `1`, `1.09` y `1.18`.

- [ ] **Step 2: Ejecutar mecánica y verificar el fallo**

Run: `npm test -- tests/game/mechanics.test.ts`

Expected: FAIL porque todos los trimestres usan `maxSpeedRamp: 0.15`.

- [ ] **Step 3: Implementar rampas máximas por trimestre**

En `src/game/config.ts`, sustituir `maxSpeedRamp` por:

```ts
termMaxSpeedRamps: { 1: 0.20, 2: 0.25, 3: 0.30 }
```

En `worldSpeedFor`, seleccionar la rampa por `state.term` sin cambiar `speedRampDurationMs` ni los huecos espaciales.

- [ ] **Step 4: Ejecutar mecánica y verificar que pasa**

Run: `npm test -- tests/game/mechanics.test.ts`

Expected: PASS.

- [ ] **Step 5: Ampliar la prueba de cruce completo al nuevo máximo**

Mantener la simulación de `tests/game/obstacles.test.ts` en trimestre 3, `elapsedMs: 120_000`, energía 10 y pasos de 16 ms. Añadir una aserción explícita de que ese estado usa `1.18 × 1.30` antes de probar las seis variantes.

- [ ] **Step 6: Ejecutar saltabilidad y verificar el resultado**

Run: `npm test -- tests/game/obstacles.test.ts`

Expected: PASS para las seis variantes. Si falla alguna, reducir únicamente `termMaxSpeedRamps[3]` hasta el valor más alto que permita las seis; actualizar el valor en especificación, pruebas y plan antes de seguir. No cambiar impulso, gravedad ni cajas de colisión.

- [ ] **Step 7: Escribir pruebas fallidas para el tempo continuo y seguro**

En `tests/audio/controller.test.ts`, importar `playbackRateForWorldSpeed` y afirmar:

```ts
expect(playbackRateForWorldSpeed(GAME_CONFIG.obstacleSpeed)).toBe(1)
expect(playbackRateForWorldSpeed(maxCourseSpeed)).toBe(1.24)
expect(playbackRateForWorldSpeed(0)).toBe(1)
expect(playbackRateForWorldSpeed(Number.POSITIVE_INFINITY)).toBe(1.24)
```

Comprobar un punto medio, redondeado a centésimas, y que dos velocidades que redondean al mismo tempo no reescriben el valor. Verificar además que `preservesPitch` permanece activo y que `setWorldSpeed` no llama a `play()` al estar silenciado, bloqueado o antes de `unlock()`.

- [ ] **Step 8: Ejecutar audio y verificar el fallo**

Run: `npm test -- tests/audio/controller.test.ts`

Expected: FAIL porque solo existen tres intensidades discretas y `setWorldSpeed` no está definido.

- [ ] **Step 9: Implementar el mapeo continuo de velocidad a tempo**

En `src/audio/types.ts`, sustituir:

```ts
setIntensity(level: 0 | 1 | 2): void
```

por:

```ts
setWorldSpeed(worldSpeed: number): void
```

En `src/audio/controller.ts`, exportar:

```ts
export function playbackRateForWorldSpeed(worldSpeed: number): number
```

Mapear linealmente desde `GAME_CONFIG.obstacleSpeed` hasta `GAME_CONFIG.obstacleSpeed * 1.18 * 1.30`, acotar a `[1, 1.24]` y redondear a centésimas. `startTerm(term)` establece el tempo correspondiente a la velocidad inicial del trimestre. `setWorldSpeed` solo asigna `theme.playbackRate` cuando cambia el valor redondeado y vuelve a activar `preservesPitch`; nunca llama por sí mismo a `play()`.

En `src/main.ts`, eliminar `audioIntensity` e `intensityFor`. En cada `onStateChange`, llamar `audioController.setWorldSpeed(worldSpeedFor(state))`.

- [ ] **Step 10: Ejecutar audio y verificar que pasa**

Run: `npm test -- tests/audio/controller.test.ts`

Expected: PASS.

- [ ] **Step 11: Añadir una comprobación de integración del tempo**

En `tests/e2e/game.spec.ts`, ampliar el doble de `HTMLMediaElement` para registrar `playbackRate`. Con reloj virtual, comprobar que el tema empieza a `1`, aumenta durante el primer trimestre y nunca supera `1.24`; silenciar y reactivar sonido no debe romper la partida.

- [ ] **Step 12: Ejecutar la integración y verificar que pasa**

Run: `npx playwright test tests/e2e/game.spec.ts`

Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add src/game/config.ts src/game/mechanics.ts src/audio/types.ts src/audio/controller.ts src/main.ts tests/game/mechanics.test.ts tests/game/obstacles.test.ts tests/audio/controller.test.ts tests/e2e/game.spec.ts
git commit -m "feat: strengthen world and music progression"
```

---

## Verificación final

- [ ] Ejecutar `npm run ci` y exigir salida satisfactoria de TypeScript, Vitest, build y Playwright.
- [ ] Ejecutar `git diff --check` y exigir salida vacía.
- [ ] Recorrer manualmente un curso en `390×844`: comprobar el salto conjunto, la suma visual de ratio, los lazos fijos, la pausa manual y la aceleración audible.
- [ ] Recorrer el inicio y la pantalla «Cómo funciona» en `320×568`, `844×390` y `1280×800`; comprobar ausencia de recortes y desbordamiento.
- [ ] Mantener abierta cada transición más de un minuto y confirmar que no avanza sin pulsar.
- [ ] Revisar el resultado final: no debe aparecer el bloque de descubrimientos ni la frase eliminada, y `Informarme y apoyar` debe apuntar a `https://menoslectivas.org/`.

