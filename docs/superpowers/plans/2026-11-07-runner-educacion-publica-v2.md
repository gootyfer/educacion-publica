# Runner de educación pública V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la partida actual en un curso móvil de tres trimestres con dificultad y obstáculos estacionales, identidad de marea verde y una banda sonora de charanga arcade validada por el usuario antes de integrarse.

**Architecture:** El modelo TypeScript puro seguirá gobernando física y colisiones, pero añadirá estado de curso, resultados por trimestre y selección estacional. El runtime Canvas se pausará entre rondas y la capa DOM mostrará transiciones y resultados acumulados. El audio será un subsistema opcional con recursos estáticos: se generará y validará fuera del juego en dos pasos antes de que el controlador de audio o los archivos aprobados entren en producción.

**Tech Stack:** Node.js 24, TypeScript, Vite, Canvas 2D, Vitest, Playwright, `@axe-core/playwright`, Web Audio/HTMLAudio y ElevenLabs Music/Sound Effects API durante desarrollo.

**Spec:** `docs/superpowers/specs/2026-11-07-juego-huelga-educacion-v2-diseno.md`

## Global Constraints

- El curso completo dura normalmente 3–4 minutos; cada trimestre, 55–75 segundos más una transición breve.
- Un único gesto de juego: tocar, `Space` o `ArrowUp` para saltar; ningún control adicional durante la carrera.
- Energía es la única condición visible de fin de trimestre; no existe contador de vidas ni de golpes.
- Al comenzar un trimestre se recupera energía, pero ratio y velocidad iniciales son mayores que en el anterior.
- La velocidad aumenta dentro de cada trimestre hasta un límite; los huecos espaciales no se reducen deliberadamente.
- Todos los obstáculos deben seguir siendo evitables a energía baja y velocidad máxima.
- Las tres siluetas iniciales son pila de formularios, carro archivador y clima frío; gotera, pared y clima cálido se incorporan según el calendario aprobado.
- El alumnado acompaña al docente, nunca es obstáculo y nunca colisiona individualmente.
- La puntuación y el récord usan el tiempo total acumulado del curso; la distancia es secundaria.
- Interfaz verde/crema limpia, con una sola arroba o dibujo decorativo por pantalla como máximo.
- El lazo verde solo aparece en el mundo del juego, nunca como premio, botón u obstáculo.
- El sonido es opcional y el juego sigue siendo comprensible silenciado.
- **Ningún audio se integra, referencia ni publica hasta que el usuario haya escuchado y aprobado expresamente los archivos candidatos.**
- No se añaden cifras educativas nuevas ni se altera el contenido editorial verificado.
- Sin backend, cuentas, analítica, llamadas de red durante la partida ni generación de audio en producción.

## Review Focus

- Un `deltaMs` extremo, pestaña oculta o reanudación no debe agotar un trimestre ni saltar una transición; Task 1 y Task 4 lo prueban.
- Energía mínima, velocidad máxima y cualquiera de las seis siluetas deben conservar al menos una ventana de salto completa; Task 2 lo simula.
- Toques repetidos o dos callbacks de final no deben avanzar dos trimestres ni duplicar totales; Task 1 y Task 4 lo prueban.
- Audio bloqueado, recurso ausente, almacenamiento inaccesible o reproducción rechazada no debe impedir jugar ni transicionar; Task 8 lo prueba.
- Pantalla de 320 px, horizontal de poca altura, movimiento reducido y teclado deben mantener controles, transiciones, resultados y silencio accesibles; Task 5 y Task 8 lo prueban.

---

## Estructura de archivos

```text
src/game/config.ts                    Equilibrio por trimestre y límites de velocidad
src/game/types.ts                     Estado del curso, trimestres, variantes y resultados
src/game/mechanics.ts                 Energía, salto, cierre y avance entre trimestres
src/game/obstacles.ts                 Pools estacionales, spawn y colisiones
src/game/runtime.ts                   RAF, pausa y reanudación entre trimestres
src/game/renderer.ts                  Composición del Canvas
src/game/art/primitives.ts            Formas Canvas compartidas
src/game/art/scene.ts                 Aula estacional, lazos y HUD
src/game/art/characters.ts            Docente con camiseta/@ y alumnado
src/game/art/obstacles.ts             Seis siluetas y variantes fría/cálida
src/ui/transitions.ts                 Modelo de Navidad, Semana Santa y final
src/ui/results.ts                     Resultado acumulado, récord y copy
src/audio/types.ts                    Contratos del controlador de audio
src/audio/controller.ts               Música, efectos, mute y fallbacks
src/main.ts                           Orquestación de pantallas, curso y audio
src/styles.css                        Sistema visual híbrido limpio y responsive
index.html                            Shell, fallback sin JS y metadatos
scripts/generate-audio-candidates.mjs Generación de recursos solo en desarrollo
public/audio/                         Solo audio aprobado y optimizado
artifacts/audio-review/               Candidatas locales ignoradas por Git
docs/audio-validation.md              Prompts, candidatos y decisiones del usuario
tests/game/*.test.ts                  Estado, velocidad, obstáculos y saltabilidad
tests/ui/*.test.ts                    Transiciones, resultados y almacenamiento
tests/audio/controller.test.ts        Audio inyectado y degradación segura
tests/e2e/*.spec.ts                   Curso completo, accesibilidad y responsive
```

### Task 1: Estado puro del curso y tres trimestres

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/config.ts`
- Modify: `src/game/mechanics.ts`
- Modify: `tests/game/mechanics.test.ts`

**Interfaces:**
- Consumes: física, energía y métricas de la V1.
- Produces: `Term = 1 | 2 | 3`, `TermResult`, fase `"between-terms"`, `startNextTerm(state)` y totales acumulados en `GameState`.

- [ ] **Step 1: Escribir los tests fallidos del estado inicial y los cierres**

En `tests/game/mechanics.test.ts`, fijar que el curso empieza en trimestre 1; energía 100; ratio base; `courseElapsedMs: 0`; `completedTerms: []`. Forzar energía cero y comprobar que los trimestres 1 y 2 pasan a `between-terms` con exactamente un `TermResult`, mientras el tercero pasa a `finished` con tres resultados.

- [ ] **Step 2: Escribir los tests fallidos de reanudación y acumulación**

Comprobar que `startNextTerm(state)` solo actúa desde `between-terms`, recupera energía, vacía obstáculos de pantalla, conserva totales y comienza los trimestres 2 y 3 con ratio y multiplicador inicial superiores. Llamarlo dos veces sobre el mismo estado no debe saltarse un trimestre.

- [ ] **Step 3: Escribir el test de tiempo extremo**

Comprobar que un paso de 5.000 ms sigue limitado a 50 ms y no puede cerrar más de un trimestre, ni siquiera con energía casi agotada.

- [ ] **Step 4: Ejecutar para verificar RED**

Run: `npm test -- tests/game/mechanics.test.ts`

Expected: FAIL porque no existen los campos de curso ni `startNextTerm`.

- [ ] **Step 5: Definir el contrato de curso**

En `src/game/types.ts`, ampliar:

```ts
export type Term = 1 | 2 | 3
export type GamePhase = "ready" | "running" | "between-terms" | "finished"
export interface TermResult {
  term: Term
  durationMs: number
  distanceTravelled: number
  maxRatio: number
  hitsByKind: Record<DamageKind, number>
}
```

`GameState` añadirá `term`, `courseElapsedMs`, `completedTerms` y conservará `elapsedMs` como reloj del trimestre actual.

- [ ] **Step 6: Implementar las transiciones puras**

En `src/game/mechanics.ts`, mantener `createGameState()` como entrada pública y añadir:

```ts
export function startNextTerm(state: GameState): GameState
export function currentTermResult(state: GameState): TermResult
```

Al agotar energía, adjuntar un único resultado y elegir `between-terms` o `finished`. `startNextTerm` reinicia solo el estado enumerado en la especificación.

- [ ] **Step 7: Ejecutar GREEN y commit**

Run: `npm run typecheck && npm test -- tests/game/mechanics.test.ts`

Expected: PASS.

```bash
git add src/game/types.ts src/game/config.ts src/game/mechanics.ts tests/game/mechanics.test.ts
git commit -m "feat: model a three-term school year"
```

### Task 2: Velocidad progresiva y obstáculos estacionales seguros

**Files:**
- Modify: `src/game/config.ts`
- Modify: `src/game/types.ts`
- Modify: `src/game/mechanics.ts`
- Modify: `src/game/obstacles.ts`
- Modify: `tests/game/obstacles.test.ts`
- Modify: `tests/game/mechanics.test.ts`

**Interfaces:**
- Consumes: `Term`, `GameState` y física de Task 1.
- Produces: `ObstacleVariant`, `damageKindForObstacle`, `worldSpeedFor(state)` y `availableObstaclesFor(state)`.

- [ ] **Step 1: Escribir tests fallidos para velocidad**

Fijar que `worldSpeedFor` empieza en la velocidad V1 durante el primer trimestre, crece monótonamente dentro de cada ronda, queda limitado y los comienzos de los trimestres 2 y 3 son aproximadamente 9 % y 18 % superiores al primer comienzo. Verificar que el comienzo de cada trimestre es más lento que el final limitado del anterior.

- [ ] **Step 2: Escribir tests fallidos para pools estacionales**

Comprobar estas disponibilidades mínimas:

```ts
expect(availableObstaclesFor(term1Start)).toEqual([
  "paper-stack", "filing-cart", "cold-climate",
])
expect(availableObstaclesFor(term2)).toContain("leak")
expect(availableObstaclesFor(term3)).toContain("heat-climate")
```

La pared aparece al final del primer trimestre y puede continuar en 2 y 3. Cada variante mapea a `paperwork`, `heat` o `infrastructure` para resultados.

- [ ] **Step 3: Escribir simulaciones de justicia**

Para las seis variantes, simular un salto completo con energía 10 y velocidad máxima. Probar múltiples posiciones iniciales y exigir que exista al menos una ventana de salto sin colisión. Verificar también que el generador no crea obstáculos dobles y mantiene el hueco espacial configurado.

- [ ] **Step 4: Ejecutar para verificar RED**

Run: `npm test -- tests/game/mechanics.test.ts tests/game/obstacles.test.ts`

Expected: FAIL por funciones y variantes ausentes.

- [ ] **Step 5: Implementar configuración y variantes**

Definir:

```ts
export type ObstacleVariant =
  | "paper-stack"
  | "filing-cart"
  | "cold-climate"
  | "heat-climate"
  | "leak"
  | "wall"

export function damageKindForObstacle(variant: ObstacleVariant): DamageKind
export function worldSpeedFor(state: GameState): number
export function availableObstaclesFor(state: GameState): readonly ObstacleVariant[]
```

Mantener el random determinista. El spawn rota dentro del pool disponible con variación seeded; guarda qué variantes han sido presentadas para disparar una sola señal de novedad más adelante.

- [ ] **Step 6: Ajustar el equilibrio inicial**

Usar como punto de partida multiplicadores `1`, `1.09` y `1.18`, y una rampa interna limitada al 15 %. Ajustar drenaje/daño mediante una simulación con uno o dos choques para situar el trimestre típico en 55–75 segundos; documentar valores finales en `config.ts` como equilibrio, no estadísticas.

- [ ] **Step 7: Ejecutar GREEN y commit**

Run: `npm run typecheck && npm test -- tests/game/mechanics.test.ts tests/game/obstacles.test.ts`

Expected: PASS.

```bash
git add src/game tests/game/mechanics.test.ts tests/game/obstacles.test.ts
git commit -m "feat: add seasonal obstacles and speed progression"
```

### Task 3: Arte Canvas de marea verde y estaciones

**Files:**
- Create: `src/game/art/primitives.ts`
- Create: `src/game/art/scene.ts`
- Create: `src/game/art/characters.ts`
- Create: `src/game/art/obstacles.ts`
- Modify: `src/game/renderer.ts`
- Test: `tests/game/visuals.test.ts`

**Interfaces:**
- Consumes: `GameState`, `Term` y `ObstacleVariant` de Tasks 1–2.
- Produces: `sceneVisualFor(term)`, `drawScene`, `drawTeacherAndPupils`, `drawObstacle` y `drawHud` consumidos por `createRenderer`.

- [ ] **Step 1: Escribir tests fallidos del modelo visual**

En `tests/game/visuals.test.ts`, comprobar que `sceneVisualFor(1|2|3)` devuelve etiquetas estacionales distintas, densidad de lazos no decreciente y paletas con contraste textual oscuro. Comprobar que todas las variantes tienen descriptor de dibujo y dimensiones coincidentes con su caja de colisión.

- [ ] **Step 2: Ejecutar para verificar RED**

Run: `npm test -- tests/game/visuals.test.ts`

Expected: FAIL porque `src/game/art/` no existe.

- [ ] **Step 3: Extraer primitivas y escena**

Mover `roundedRect` y formas compartidas a `primitives.ts`. Implementar `sceneVisualFor(term)` en `scene.ts`; dibujar aula con cambios sutiles de luz/ventana, verjas o puentes de fondo y lazos verdes ambientales. Los lazos nunca entran en la zona de colisión.

- [ ] **Step 4: Redibujar personaje y grupo**

En `characters.ts`, conservar caja y física actuales. Cambiar la camiseta a verde esmeralda y añadir una @ blanca legible; el cansancio sigue dependiendo de energía. Mantener al alumnado detrás del docente y sin cajas de colisión.

- [ ] **Step 5: Dibujar las seis siluetas**

En `art/obstacles.ts`, implementar las propuestas aprobadas: pila, carro, frío, calor/ventilador, gotera y pared/barrera. Priorizar silueta y contraste; no añadir texto pequeño necesario para reconocerlas.

- [ ] **Step 6: Componer renderer y verificar**

Run: `npm run typecheck && npm test -- tests/game/visuals.test.ts && npm run build`

Expected: PASS y build válido.

Realizar QA visual en 390×844 y 844×390: camiseta/@ legibles, seis obstáculos distinguibles, lazos fuera de la acción y HUD sin solapes.

- [ ] **Step 7: Commit**

```bash
git add src/game/art src/game/renderer.ts tests/game/visuals.test.ts
git commit -m "feat: refresh runner art for the green wave"
```

### Task 4: Runtime, vacaciones y resultados acumulados

**Files:**
- Modify: `src/game/runtime.ts`
- Create: `src/ui/transitions.ts`
- Modify: `src/ui/results.ts`
- Modify: `src/main.ts`
- Modify: `tests/ui/results.test.ts`
- Create: `tests/ui/transitions.test.ts`
- Modify: `tests/e2e/game.spec.ts`

**Interfaces:**
- Consumes: `startNextTerm`, `TermResult` y estado del curso de Task 1.
- Produces: callbacks `onTermEnd`, `onCourseFinish`, `resumeNextTerm()` y modelos `buildTransitionViewModel`/`buildResultViewModel`.

- [ ] **Step 1: Escribir tests fallidos de transiciones**

Fijar en `transitions.test.ts` que el final del trimestre 1 produce “Vacaciones de Navidad”, el 2 “Vacaciones de Semana Santa” y que no existe transición vacacional tras el 3. Incluir energía recuperada y siguiente trimestre en texto accesible.

- [ ] **Step 2: Actualizar tests de resultados**

Construir un estado con tres `TermResult` y exigir tiempo total, desglose por trimestre, ratio máxima global, impactos sumados y récord basado en segundos totales. Mantener exactamente cuatro fichas editoriales.

- [ ] **Step 3: Escribir E2E del curso completo**

Con reloj de Playwright, comenzar, forzar/esperar tres agotamientos y comprobar: transición navideña, transición de Semana Santa, foco recuperado en Canvas al continuar y resultados solo tras el tercero. Pulsar dos veces el botón de continuar no debe omitir una ronda.

- [ ] **Step 4: Ejecutar para verificar RED**

Run: `npm test -- tests/ui/results.test.ts tests/ui/transitions.test.ts && npm run test:e2e -- tests/e2e/game.spec.ts`

Expected: FAIL por contratos de curso y pantallas ausentes.

- [ ] **Step 5: Ampliar runtime sin temporizadores duplicados**

`GameRuntimeOptions` tendrá `onTermEnd(state, result)` y `onCourseFinish(state)`. `resumeNextTerm()` llama una sola vez a `startNextTerm`, renderiza, restaura foco y reanuda RAF. Ocultar pestaña mantiene pausa y reinicia timestamp.

- [ ] **Step 6: Implementar las pantallas de transición**

Mostrar una pantalla estática de 3 segundos. El botón “Continuar el curso” se habilita al segundo 1; el avance automático al segundo 3 comparte una protección idempotente con el botón. `prefers-reduced-motion` elimina movimiento, no la información.

- [ ] **Step 7: Implementar el resultado de curso**

Actualizar clave de récord a `curso-docente-record-seconds-v2` para no comparar partidas V1 con cursos V2. Mostrar tiempo total como puntuación, tres resultados breves, ratio máxima e impactos por familia antes de los cuatro datos.

- [ ] **Step 8: Ejecutar GREEN y commit**

Run: `npm run typecheck && npm test -- tests/ui/results.test.ts tests/ui/transitions.test.ts && npm run test:e2e -- tests/e2e/game.spec.ts`

Expected: PASS.

```bash
git add src/game/runtime.ts src/ui src/main.ts tests/ui tests/e2e/game.spec.ts
git commit -m "feat: connect terms with holiday transitions"
```

### Task 5: Interfaz híbrida limpia y accesibilidad completa

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`
- Modify: `src/main.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `docs/validation-notes.md`

**Interfaces:**
- Consumes: pantallas de Task 4.
- Produces: sistema visual responsive y recorrido textual V2.

- [ ] **Step 1: Ampliar pruebas E2E de accesibilidad**

Comprobar axe en inicio, ambas vacaciones y resultado; navegación completa con teclado; alternativa textual con tres trimestres y seis obstáculos; fallback sin JavaScript con las cuatro fuentes. Repetir ausencia de overflow en 320×568, 390×844 DPR 3, 844×390 y 1280×800.

- [ ] **Step 2: Ejecutar para verificar RED**

Run: `npm run test:e2e -- tests/e2e/accessibility.spec.ts`

Expected: FAIL porque la UI V2 todavía no satisface textos/estados nuevos.

- [ ] **Step 3: Aplicar el sistema visual aprobado**

Usar verde esmeralda, crema, blanco y verde oscuro; coral solo para alerta/ratio. Cabeceras verdes casi planas, cuerpo crema limpio, título manual mediante una fuente abierta servida localmente y cuerpo redondeado legible. Máximo una @ o dibujo blanco por pantalla; sin lazos en menús.

- [ ] **Step 4: Actualizar alternativas y copy**

La introducción explica “un curso en tres trimestres”. La alternativa textual describe energía, vacaciones y estacionalidad. Las transiciones indican que descansar recupera energía, no elimina las condiciones.

- [ ] **Step 5: Ejecutar GREEN, QA y commit**

Run: `npm run test:e2e -- tests/e2e/accessibility.spec.ts && npm run build`

Expected: PASS.

Realizar QA visual del inicio, vacaciones y resultado en móvil vertical y horizontal; registrar observaciones en `docs/validation-notes.md`.

```bash
git add index.html src/styles.css src/main.ts tests/e2e/accessibility.spec.ts docs/validation-notes.md
git commit -m "feat: apply the clean green-wave interface"
```

### Task 6: Generar y validar candidatas de música principal

**Files:**
- Create: `scripts/generate-audio-candidates.mjs`
- Create: `docs/audio-validation.md`
- Modify: `.gitignore`
- Create locally, do not commit: `artifacts/audio-review/main-theme-*.mp3`

**Interfaces:**
- Consumes: variable local `ELEVENLABS_API_KEY`; Eleven Music API con modelo vigente `music_v2_5` si está disponible en la cuenta.
- Produces: tres candidatas independientes y un manifiesto sin secretos; no produce todavía recursos consumidos por el juego.

- [ ] **Step 1: Preparar script seguro de desarrollo**

`scripts/generate-audio-candidates.mjs` leerá la clave solo desde entorno, fallará con mensaje claro si falta, nunca imprimirá cabeceras ni respuesta sensible y escribirá en `artifacts/audio-review/`. Añadir esa carpeta a `.gitignore`.

- [ ] **Step 2: Definir los tres prompts**

Generar tres variaciones instrumentales originales de 35–45 segundos con motivo de 4–5 notas, charanga arcade, percusión ligera, bajo juguetón, xilófono y viento; sin voces, sin nombres de artistas ni referencias a canciones/juegos protegidos. Variar solo energía e instrumentación para poder comparar.

- [ ] **Step 3: Ejecutar generación con autorización de red/coste**

Run: `ELEVENLABS_API_KEY` configurada localmente + `node scripts/generate-audio-candidates.mjs main`

Expected: tres archivos de audio reproducibles y un JSON local con prompt, modelo, duración y fecha, sin incluir la clave.

- [ ] **Step 4: Verificar candidatas fuera del juego**

Comprobar duración, ausencia de voz, inicio/final aprovechables para bucle y volumen comparable. Registrar en `docs/audio-validation.md` nombres y observaciones, sin añadir archivos a `public/` ni referencias en `src/`.

- [ ] **Step 5: Presentar las tres candidatas al usuario y detenerse**

Entregar los archivos reproducibles con etiquetas A/B/C y diferencias resumidas.

**HARD GATE — STOP:** no ejecutar Task 7 ni Task 8 hasta que el usuario elija o rechace explícitamente una candidata. Si rechaza las tres, iterar únicamente Task 6 con su feedback.

- [ ] **Step 6: Commit del proceso, no del audio candidato**

```bash
git add .gitignore scripts/generate-audio-candidates.mjs docs/audio-validation.md
git commit -m "chore: add review-first audio generation workflow"
```

### Task 7: Generar y validar el paquete sonoro derivado

**Files:**
- Modify: `scripts/generate-audio-candidates.mjs`
- Modify: `docs/audio-validation.md`
- Create locally, do not commit: `artifacts/audio-review/term-end-*.mp3`
- Create locally, do not commit: `artifacts/audio-review/holiday-*.mp3`
- Create locally, do not commit: `artifacts/audio-review/sfx-*.mp3`

**Interfaces:**
- Consumes: candidata principal elegida y feedback del usuario de Task 6.
- Produces: paquete candidato coherente; todavía no produce rutas usadas por la aplicación.

- [ ] **Step 1: Generar la firma de fin de trimestre**

Crear 2–3 variaciones originales de unos 2 segundos basadas en el motivo aprobado: metales descendentes, redoble breve y remate cómico. No mencionar ni imitar melodías de videojuegos existentes.

- [ ] **Step 2: Generar acentos vacacionales y final**

Crear campanillas navideñas sin melodía de villancico, acento primaveral no religioso y resolución final más larga, todos derivados del motivo principal.

- [ ] **Step 3: Generar efectos mínimos**

Crear salto elástico, papel/sello, ventilador/avería, gotera/cubo, cascote ligero y señal de obstáculo nuevo. Mantenerlos cortos, sin voz y con picos controlados.

- [ ] **Step 4: Presentar el paquete completo y detenerse**

Entregar tema elegido, firma, vacaciones, final y efectos como archivos separados. Registrar feedback en `docs/audio-validation.md`.

**HARD GATE — STOP:** no copiar a `public/audio`, no crear manifiesto de producción y no ejecutar Task 8 hasta recibir aprobación explícita del paquete completo.

- [ ] **Step 5: Registrar aprobación**

Tras la aprobación, anotar fecha, nombres exactos y decisión en `docs/audio-validation.md`; cualquier archivo rechazado permanece fuera de producción.

### Task 8: Integrar exclusivamente el audio aprobado

**Files:**
- Create: `public/audio/approved/*`
- Create: `src/audio/types.ts`
- Create: `src/audio/controller.ts`
- Create: `tests/audio/controller.test.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify: `tests/e2e/game.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: únicamente archivos aprobados en Tasks 6–7 y eventos del runtime de Task 4.
- Produces: `createAudioController(options): AudioController`, mute persistente y música adaptativa.

- [ ] **Step 1: Escribir tests fallidos del controlador**

Con una fábrica de audio inyectada, probar que: no reproduce antes de interacción; inicia el tema al comenzar; aplica tres velocidades discretas con máximo 1.15; reproduce una sola firma al cerrar trimestre; pausa tema durante vacaciones; diferencia colisiones por familia; y mute impide toda reproducción.

- [ ] **Step 2: Escribir tests de degradación**

Simular `play()` rechazado, archivo ausente y almacenamiento bloqueado. Ningún método debe lanzar ni impedir callbacks del juego. El estado accesible del botón debe seguir indicando “Activar sonido” o “Silenciar sonido”.

- [ ] **Step 3: Ejecutar para verificar RED**

Run: `npm test -- tests/audio/controller.test.ts`

Expected: FAIL porque el subsistema no existe.

- [ ] **Step 4: Copiar solo recursos aprobados y crear manifiesto tipado**

Optimizar y colocar los archivos seleccionados bajo `public/audio/approved/`. Definir rutas constantes en `src/audio/types.ts`; ninguna candidata rechazada entra en Git, build o HTML.

- [ ] **Step 5: Implementar controlador**

Exponer:

```ts
export interface AudioController {
  unlock(): Promise<void>
  startTerm(term: Term): void
  setIntensity(level: 0 | 1 | 2): void
  playJump(): void
  playCollision(kind: DamageKind): void
  playNewObstacle(): void
  playTermEnd(term: Term): void
  playHoliday(afterTerm: 1 | 2): void
  playCourseEnd(): void
  setMuted(muted: boolean): void
  isMuted(): boolean
  stop(): void
}
```

Usar reproducción local, `preservesPitch` cuando exista, volumen de música menor que efectos y captura de promesas rechazadas.

- [ ] **Step 6: Conectar eventos y control visible**

El primer inicio desbloquea audio. Saltos, choques, novedades, finales y transiciones llaman al controlador. Añadir un botón accesible persistente; guardar preferencia en `localStorage` de forma segura.

- [ ] **Step 7: Ejecutar GREEN y E2E**

Run: `npm run typecheck && npm test -- tests/audio/controller.test.ts && npm run test:e2e -- tests/e2e/game.spec.ts tests/e2e/accessibility.spec.ts`

Expected: PASS con audio permitido y bloqueado.

- [ ] **Step 8: Commit**

```bash
git add public/audio/approved src/audio src/main.ts src/styles.css tests/audio tests/e2e docs/audio-validation.md
git commit -m "feat: add the approved adaptive soundtrack"
```

### Task 9: Verificación integral, documentación y validación humana

**Files:**
- Modify: `README.md`
- Modify: `docs/validation-notes.md`
- Modify as needed: tests or implementation files implicated by failures

**Interfaces:**
- Consumes: Tasks 1–8.
- Produces: V2 verificable y documentación de ejecución/validación.

- [ ] **Step 1: Actualizar documentación**

Documentar curso de tres trimestres, controles, mute, audio aprobado, ausencia de generación en producción y comando de CI. No afirmar impacto persuasivo sin pruebas con público.

- [ ] **Step 2: Ejecutar verificación automatizada completa**

Run: `npm run ci`

Expected: typecheck, unit tests, build y Playwright terminan con código 0.

- [ ] **Step 3: Ejecutar QA manual proporcional al riesgo**

Jugar un curso completo con sonido y otro silenciado en 390×844; repetir teclado en escritorio y layout 844×390. Comprobar estaciones, seis siluetas, dos vacaciones, firma sonora, tempo, foco, fuentes y replay. Verificar que el build no realiza peticiones de red.

- [ ] **Step 4: Prueba con público general**

Usar las preguntas del diseño con personas ajenas a educación. Registrar comprensión de trimestres, obstáculos, ratio y símbolos; no cambiar simultáneamente más de un parámetro de equilibrio por iteración.

- [ ] **Step 5: Commit final de documentación**

```bash
git add README.md docs/validation-notes.md
git commit -m "docs: record v2 verification and playtest guidance"
```
