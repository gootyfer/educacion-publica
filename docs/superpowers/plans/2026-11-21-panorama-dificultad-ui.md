# Panorama, dificultad y pantallas fieles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incorporar el recorrido madrileño continuo ya diseñado, reproducir fielmente las pantallas aprobadas y recalibrar acompañantes, obstáculos y música para que el runner tenga movimiento y dificultad progresiva sin secuencias injustas.

**Architecture:** La implementación separa decisiones puras de juego (`course`) de objetos Phaser: una única función de presión controla velocidad, distancia entre obstáculos y tasa musical; un `TileSprite` desplaza panoramas estacionales enteros; y constantes de layout compartidas alinean el dibujo Phaser con los botones HTML. La producción visual es la primera tarea y sus evidencias se conservan para revisión, pero la ejecución continúa directamente con la integración por instrucción expresa del usuario.

**Tech Stack:** TypeScript 5, Phaser 3.90, Vite, Vitest, Playwright, CSS/DOM semántico, Sharp (solo desarrollo para preparar assets), ImageGen para el pixel art.

**Spec:** `docs/superpowers/specs/2026-11-20-panorama-dificultad-ui-design.md`

## Global Constraints

- Mantener el lienzo lógico en `640×360`, pixel snapping entero y juego móvil horizontal.
- Usar tres panoramas finales `3200×360` —septiembre, invierno y junio— del mismo recorrido, más una pausa primaveral estática `640×360`.
- No hornear texto, resultados, personajes ni controles en los fondos.
- No añadir tipos de obstáculo, vidas, monedas, ataques, movimiento lateral, plataformas, manifiesto PWA ni icono de instalación.
- Mantener los nueve sprites de alumnado como acompañantes sin físicas, saltos, impactos ni lectura de “carga”.
- Empezar cada trimestre con dos acompañantes; alcanzar nueve hacia el `65–75 %` de la duración esperada con cero, uno o dos impactos normales.
- Permitir hasta cuatro obstáculos activos; todos los huecos cortos deben seguir siendo saltables con la geometría y velocidad reales.
- El final del tercer trimestre debe alcanzar `1,7–2,0×` la frecuencia inicial y la música debe variar gradualmente entre `1,00×` y `1,24×`.
- Mantener teclado, toque, movimiento reducido, silencio, orientación vertical, fallbacks y equivalentes HTML.
- Mantener el paquete comprimido del juego en `≤ 3 MB`; optimizar los panoramas antes de plantear elevarlo.
- No modificar ni incluir en commits `docs/obstacle-art-review.png` ni `docs/obstacle-art-review.svg`.

## Review Focus

- Costura del panorama a cualquier velocidad: el paso `3199 → 0` no debe producir salto, destello ni subpíxel visible.
- Cadencia máxima con cuatro obstáculos: ninguna combinación de hueco corto y obstáculo alto debe exigir un salto imposible.
- Duraciones atípicas: una partida normal con hasta dos impactos debe llegar a nueve acompañantes, pero muchos impactos sí pueden terminar el trimestre antes.
- Reinicios y transiciones: panorama, pool, listeners y tasa musical deben volver a su estado inicial sin objetos o velocidad heredados.
- Fuente tardía y escalado responsive: el panel Phaser y las zonas HTML deben permanecer alineados en `844×390` y `740×360`.

---

## File map

- `docs/art-direction/una-jornada-decente/panorama-review/`: arte intermedio, hoja de contacto y pruebas de bucle para aprobación.
- `art-source/panoramas/`: tramos maestros aprobados y manifiesto de ensamblado; no se sirven al navegador.
- `scripts/prepare-panoramas.mjs`: ensambla, valida dimensiones/alfa y exporta WebP lossless de píxel duro.
- `public/game/backgrounds/`: panoramas y pausa primaveral finales servidos por Vite.
- `src/course/cadence.ts`: función pura de presión, velocidad, bandas de hueco y decisiones deterministas.
- `src/course/calibration.ts` y `src/course/progression.ts`: curva 2→9, reinicio por trimestre y máxima anual.
- `src/phaser/backgrounds/PanoramaModel.ts`: claves estacionales y aritmética pura de desplazamiento.
- `src/phaser/entities/ScrollingBackdrop.ts`: único responsable de mover y reiniciar el panorama.
- `src/phaser/entities/CompanionGroup.ts`: formación visual de hasta tres filas.
- `src/phaser/entities/ObstaclePool.ts`: cuatro cuerpos reciclables y spawn por distancia.
- `src/phaser/ui/ScreenLayout.ts`: geometría común para paneles y zonas semánticas.
- `src/phaser/ui/PixelPanel.ts`: componentes de panel dibujados en código, sin texto horneado.
- `src/phaser/scenes/*.ts`: composición de escenas usando los módulos anteriores.
- `src/phaser/audio/GameAudio.ts`: tasa musical cuantizada y ciclo de vida de sonidos.
- `src/ui/GameShell.ts` y `src/styles.css`: controles accesibles colocados con la misma geometría.

### Task 1: Producir y validar el arte panorámico

**Files:**
- Create: `art-source/panoramas/manifest.json`
- Create: `art-source/panoramas/september-01.png` … `september-05.png`
- Create: `art-source/panoramas/winter-01.png` … `winter-05.png`
- Create: `art-source/panoramas/june-01.png` … `june-05.png`
- Create: `art-source/panoramas/spring-break.png`
- Create: `docs/art-direction/una-jornada-decente/panorama-review/contact-sheet.png`
- Create: `docs/art-direction/una-jornada-decente/panorama-review/loop-september.gif`
- Create: `docs/art-direction/una-jornada-decente/panorama-review/loop-winter.gif`
- Create: `docs/art-direction/una-jornada-decente/panorama-review/loop-june.gif`

**Interfaces:**
- Consumes: las referencias visuales aprobadas en `docs/art-direction/una-jornada-decente/`, especialmente `screen-title.png`, `screen-term-1-complete.png`, `screen-term-2-complete.png` y `screen-course-complete.png`.
- Produces: dieciséis PNG maestros a `640×360`; `manifest.json` fija el orden de los cinco tramos para cada estación.

- [ ] **Step 1: Crear el recorrido base de septiembre con ImageGen**

  Usar la skill `imagegen` con las referencias aprobadas. Generar cinco tramos contiguos del mismo centro público de Madrid, conservando línea de suelo, horizonte, arquitectura, lazos verdes y pixel art de 16 bits; excluir texto y personas. Guardar los originales en `art-source/panoramas/`.

- [ ] **Step 2: Ensamblar una vista temporal y comprobar la costura de septiembre**

  Colocar los cinco tramos en orden, duplicar los primeros `64 px` tras el final y producir `loop-september.gif`. La unión entre el borde derecho y el izquierdo debe conservar suelo, zócalo, tuberías, techo y horizonte.

- [ ] **Step 3: Transformar exactamente la misma geometría a invierno y junio**

  Editar los cinco tramos mediante ImageGen, usando septiembre como referencia estructural: invierno añade luz fría, lluvia, ramas desnudas y goteras; junio añade luz intensa, vegetación de verano, persianas y calor. No regenerar composiciones independientes.

- [ ] **Step 4: Crear la pausa primaveral estática**

  Editar el primer tramo del mismo recorrido a primavera, con luz cálida y vegetación florecida, siguiendo `screen-term-2-complete.png`.

- [ ] **Step 5: Crear evidencias de revisión visual**

  Usar el `ffmpeg` ya disponible en el entorno para ensamblar sin interpolación. La hoja de contacto debe mostrar los quince tramos en filas estacionales y la pausa primaveral; los tres GIF deben recorrer `3200 px` y cruzar una vez la costura final. Verificar con `ffprobe` que ningún frame reescala el arte fuera de múltiplos enteros.

- [ ] **Step 6: Conservar las evidencias y continuar con la integración**

  Guardar la hoja de contacto y los tres bucles como registro visual. Continuar con Task 2 sin una nueva pausa de aprobación, conforme a la instrucción explícita del usuario.

- [ ] **Step 7: Commit**

```bash
git add art-source/panoramas docs/art-direction/una-jornada-decente/panorama-review
git commit -m "art: add approved seasonal Madrid panorama"
```

### Task 2: Preparar y registrar los panoramas de producción

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/prepare-panoramas.mjs`
- Create: `tests/scripts/prepare-panoramas.test.ts`
- Create: `public/game/backgrounds/panorama-term-1.webp`
- Create: `public/game/backgrounds/panorama-term-2.webp`
- Create: `public/game/backgrounds/panorama-term-3.webp`
- Create: `public/game/backgrounds/spring-break.webp`
- Modify: `src/phaser/assets.ts`
- Modify: `tests/phaser/assets.test.ts`

**Interfaces:**
- Consumes: `manifest.json` y los PNG aprobados de Task 1.
- Produces: `preparePanoramas({ sourceDir, outputDir }): Promise<void>` y las claves `panoramaTerm1`, `panoramaTerm2`, `panoramaTerm3`, `springBreak` en `GAME_ASSETS`.

- [ ] **Step 1: Escribir pruebas fallidas del pipeline**

  En `prepare-panoramas.test.ts`, crear fixtures de cinco bloques de color y afirmar: salida `3200×360`, orden declarado por el manifiesto, WebP lossless, ausencia de alfa parcial (`alpha` solo `0` o `255`) y fallo descriptivo si un tramo no mide `640×360`. En `assets.test.ts`, exigir las cuatro claves y extensiones `.webp`.

- [ ] **Step 2: Ejecutar las pruebas y verificar el fallo**

  Run: `npm test -- tests/scripts/prepare-panoramas.test.ts tests/phaser/assets.test.ts`

  Expected: FAIL porque no existen el script ni las claves panorámicas.

- [ ] **Step 3: Implementar el pipeline mínimo**

  Añadir `sharp` como dependencia de desarrollo. Exportar `preparePanoramas(options: { sourceDir: string; outputDir: string }): Promise<void>` desde el script y ejecutarla cuando el módulo sea invocado directamente. Ensamblar sin interpolación, normalizar alfa y exportar WebP lossless; añadir script npm `art:panoramas`.

- [ ] **Step 4: Generar los cuatro assets y actualizar `GAME_ASSETS`**

  Añadir las claves nuevas sin retirar todavía `term1`, `term2`, `term3`, porque las escenas no migran hasta Task 3.

- [ ] **Step 5: Verificar pruebas y presupuesto provisional**

  Run: `npm run art:panoramas && npm test -- tests/scripts/prepare-panoramas.test.ts tests/phaser/assets.test.ts && npm run build && npm run budget`

  Expected: PASS. Registrar el coste provisional; los PNG duplicados se eliminan en Task 3 y el límite definitivo sigue siendo `≤ 3 MB`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/prepare-panoramas.mjs tests/scripts/prepare-panoramas.test.ts src/phaser/assets.ts tests/phaser/assets.test.ts public/game/backgrounds
git commit -m "feat: prepare seasonal panorama assets"
```

### Task 3: Añadir desplazamiento continuo y transformación estacional

**Files:**
- Create: `src/phaser/backgrounds/PanoramaModel.ts`
- Create: `src/phaser/entities/ScrollingBackdrop.ts`
- Create: `tests/phaser/panorama.test.ts`
- Modify: `src/phaser/assets.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Modify: `src/phaser/scenes/TitleScene.ts`
- Modify: `src/phaser/scenes/TermBreakScene.ts`
- Modify: `src/phaser/scenes/ResultsScene.ts`
- Delete: `public/game/backgrounds/term-1.png`
- Delete: `public/game/backgrounds/term-2.png`
- Delete: `public/game/backgrounds/term-3.png`
- Modify: `tests/phaser/scenes.test.ts`
- Modify: `tests/e2e/phaser-slice.spec.ts`

**Interfaces:**
- Consumes: `Term`, las cuatro claves de Task 2 y `worldSpeedFor(term, elapsedMs)` de Task 5; hasta Task 5 se pasa una velocidad fija de `150`.
- Produces: `PANORAMA_WIDTH = 3200`, `panoramaTextureFor(term: Term): PanoramaTextureKey`, `wrapPanoramaOffset(offset: number): number`; clase `ScrollingBackdrop` con `update(deltaMs: number, worldSpeed: number): void`, `offset(): number`, `destroy(): void`.

- [ ] **Step 1: Escribir pruebas fallidas de selección, avance y wrap**

  Afirmar que términos `1/2/3` seleccionan sus texturas; `wrapPanoramaOffset(3200) === 0`, `wrapPanoramaOffset(3201) === 1`, y actualizaciones fraccionarias conservan un acumulador pero dibujan `tilePositionX` entero. Añadir un caso que cruza la costura a velocidad máxima sin offset negativo.

- [ ] **Step 2: Verificar el fallo**

  Run: `npm test -- tests/phaser/panorama.test.ts tests/phaser/scenes.test.ts`

  Expected: FAIL por módulos inexistentes y escenas todavía estáticas.

- [ ] **Step 3: Implementar modelo y `ScrollingBackdrop`**

  Usar un `Phaser.GameObjects.TileSprite` de `640×360`, origen `(0,0)`, filtro nearest y profundidad `0`. Reiniciar el offset a `0` al construir cada trimestre; no compartir instancia entre escenas.

- [ ] **Step 4: Integrar los fondos de escena**

  `GameScene` usa `ScrollingBackdrop`; portada usa el primer viewport de septiembre; Navidad usa el primer viewport de invierno; Semana Santa usa `springBreak`; resultados usan el primer viewport de junio. Retirar las tres claves estáticas y sus PNG cuando `rg "term[123]|term-[123]\\.png" src tests` confirme que no quedan consumidores.

- [ ] **Step 5: Exponer diagnóstico y probar movimiento real**

  Añadir `backgroundOffset` y `backgroundTexture` a `GameDebugState`. En Playwright comprobar que el offset crece durante la carrera, vuelve a `0` tras superar `3200` con un hook de desarrollo, y que el cambio de trimestre cambia textura y reinicia offset.

- [ ] **Step 6: Verificar**

  Run: `npm test -- tests/phaser/panorama.test.ts tests/phaser/scenes.test.ts && npm run build && npm run budget && npm run test:e2e -- tests/e2e/phaser-slice.spec.ts`

  Expected: PASS y presupuesto comprimido `≤ 3 MB` después de retirar los fondos duplicados.

- [ ] **Step 7: Commit**

```bash
git add public/game/backgrounds src/phaser/assets.ts src/phaser/backgrounds src/phaser/entities/ScrollingBackdrop.ts src/phaser/scenes tests/phaser/panorama.test.ts tests/phaser/scenes.test.ts tests/e2e/phaser-slice.spec.ts
git commit -m "feat: scroll seasonal panorama continuously"
```

### Task 4: Reproducir las cuatro pantallas aprobadas con layout compartido

**Files:**
- Create: `src/phaser/ui/ScreenLayout.ts`
- Create: `tests/phaser/screen-layout.test.ts`
- Modify: `src/phaser/ui/PixelPanel.ts`
- Modify: `src/phaser/scenes/TitleScene.ts`
- Modify: `src/phaser/scenes/TermBreakScene.ts`
- Modify: `src/phaser/scenes/ResultsScene.ts`
- Modify: `src/ui/GameShell.ts`
- Modify: `src/styles.css`
- Modify: `src/main.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tests/ui/game-shell.test.ts`
- Modify: `tests/e2e/game.spec.ts`

**Interfaces:**
- Consumes: `ShellScreen` y las copias vivas de `scene-contracts.ts`.
- Produces: `SCREEN_LAYOUTS: Readonly<Record<"title" | "term-break" | "results", ScreenLayout>>`, `screenLayout(screen): ScreenLayout`; cada `ScreenLayout` contiene rectángulo de panel y `actions: Record<string, Rect>` en coordenadas lógicas `640×360`.

- [ ] **Step 1: Escribir pruebas fallidas del contrato común**

  Afirmar proporciones del diseño: panel de portada ocupa aproximadamente `45 %` del ancho y `74 %` del alto; descansos son más anchos; cada acción HTML deriva `left/top/width/height` de su `Rect` dividido por `640/360`, sin números duplicados en CSS. Añadir test con `document.fonts.load` pendiente para verificar que los hitboxes no dependen de métricas de texto.

- [ ] **Step 2: Verificar el fallo**

  Run: `npm test -- tests/phaser/screen-layout.test.ts tests/ui/game-shell.test.ts`

  Expected: FAIL por `ScreenLayout` inexistente y posiciones CSS hardcodeadas.

- [ ] **Step 3: Implementar el sistema de panel**

  Añadir `@fontsource/jersey-10` y cargar su variante latina `400` desde `main.ts` antes de crear Phaser mediante `await document.fonts.load("32px 'Jersey 10'")`, con timeout defensivo y fallback monospace. Reescribir `PixelPanel` para dibujar con `Graphics` crema, borde verde oscuro escalonado, sombra pixelada, divisores mostaza, banda verde y botones primario/secundario. Mantener todo el texto Phaser vivo con `fontFamily: "'Jersey 10', monospace"`; no usar la spritesheet `panels`.

- [ ] **Step 4: Componer portada, descansos y resultado**

  Portada: antetítulo, divisor, título en dos líneas, `EMPEZAR`, `CÓMO FUNCIONA`, ayuda. Descansos: título, banda festiva, barra de diez pasos, `ENERGÍA RECUPERADA`, botón ancho sin solape. Resultado: título, frase, cajas separadas de tiempo y ratio máxima, principal y secundarias; sin recarga ni las tres líneas rojas descartadas.

- [ ] **Step 5: Derivar los botones semánticos del mismo layout**

  En `GameShell.setScreen`, aplicar propiedades inline en porcentajes a partir de `SCREEN_LAYOUTS`; CSS conserva solo estilo de foco y comportamiento. Mantener nombres accesibles y bloqueo de `Continuar` durante la recarga.

- [ ] **Step 6: Añadir comprobaciones visuales y responsive**

  Playwright hace clic en el centro calculado de cada acción en `844×390` y `740×360`, verifica la escena resultante y captura portada, ambos descansos y resultado para comparación manual con las cuatro referencias.

- [ ] **Step 7: Verificar**

  Run: `npm test -- tests/phaser/screen-layout.test.ts tests/ui/game-shell.test.ts tests/phaser/scenes.test.ts && npm run test:e2e -- tests/e2e/game.spec.ts`

  Expected: PASS y ninguna acción desalineada en ambos viewports.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/main.ts src/phaser/ui src/phaser/scenes/TitleScene.ts src/phaser/scenes/TermBreakScene.ts src/phaser/scenes/ResultsScene.ts src/ui/GameShell.ts src/styles.css tests/phaser tests/ui/game-shell.test.ts tests/e2e/game.spec.ts
git commit -m "feat: match approved game screens"
```

### Task 5: Unificar presión, velocidad y huecos seguros

**Files:**
- Modify: `src/course/cadence.ts`
- Modify: `tests/course/cadence.test.ts`
- Modify: `tests/gameplay/calibration.test.ts`

**Interfaces:**
- Consumes: `Term`, `COURSE_GEOMETRY`, `targetTermDurationMs`.
- Produces: `GapBand = "long" | "medium" | "short"`; `difficultyPressure(term: Term, elapsedMs: number, targetMs?: number): number`; `worldSpeedFor(term: Term, elapsedMs: number, targetMs?: number): number`; `nextObstacle(request, random): SpawnDecision`, donde request añade `elapsedMs`, `targetTermDurationMs`, `previousGapBand` y `shortStreak`, y decision añade `gapBand` y `pressure`.

- [ ] **Step 1: Escribir pruebas fallidas de la curva**

  Muestrear miles de decisiones con semillas deterministas y afirmar: presión acotada `0…1`, velocidad monótona, presencia de las tres bandas, máximo una banda corta consecutiva, ningún alto tras alto con hueco corto, y `frecuenciaFinalT3 / frecuenciaInicialT1` entre `1.7` y `2.0`. Calcular el mínimo saltables con `worldSpeed * jumpAirtime + obstacleWidth + readabilityPadding`.

- [ ] **Step 2: Verificar el fallo**

  Run: `npm test -- tests/course/cadence.test.ts tests/gameplay/calibration.test.ts`

  Expected: FAIL porque no existen presión ni bandas de hueco.

- [ ] **Step 3: Implementar una sola función de progreso**

  La presión combina progreso intratrimestre continuo y un pequeño escalón base por trimestre, manteniendo gracia inicial. `worldSpeedFor` interpola desde la velocidad inicial hasta la final; `nextObstacle` elige banda con pesos dependientes de presión y convierte esa banda a distancia segura. No usar energía para acelerar la dificultad.

- [ ] **Step 4: Verificar determinismo y seguridad**

  Run: `npm test -- tests/course/cadence.test.ts tests/gameplay/calibration.test.ts`

  Expected: PASS en todas las semillas y ratios de frecuencia.

- [ ] **Step 5: Commit**

```bash
git add src/course/cadence.ts tests/course/cadence.test.ts tests/gameplay/calibration.test.ts
git commit -m "feat: define progressive safe obstacle cadence"
```

### Task 6: Reiniciar la ratio y formar tres filas legibles

**Files:**
- Modify: `src/course/calibration.ts`
- Modify: `src/course/progression.ts`
- Modify: `src/phaser/entities/CompanionGroup.ts`
- Modify: `src/phaser/scenes/PreloadScene.ts`
- Modify: `src/content/facts.ts`
- Modify: `tests/course/progression.test.ts`
- Modify: `tests/gameplay/calibration.test.ts`
- Create: `tests/phaser/companion-group.test.ts`

**Interfaces:**
- Consumes: `CalibrationProfile`, `CourseState` y los nueve sprites existentes.
- Produces: `ratioIntervalMs: Readonly<Record<Term, number>>`; `companionFormation(count: number): readonly CompanionSlot[]`, con `CompanionSlot = { x: number; y: number; scale: number; depth: number }`; los tres términos usan ratio base `20`, que representa exactamente dos acompañantes.

- [ ] **Step 1: Escribir pruebas fallidas de progresión**

  Cambiar expectativas antiguas: cada trimestre comienza con `2`; `startNextTerm` reinicia ratio y representación a esa base; `maxRatio` anual conserva el máximo previo; una simulación sin impactos y otra con impactos a `20 %` y `45 %` alcanzan `9` entre `65 %` y `75 %` de la duración esperada. Muchos impactos pueden terminar antes sin forzar nueve.

- [ ] **Step 2: Escribir pruebas fallidas de formación**

  Para nueve slots, exigir tres filas, `8–14 px` de diferencia vertical entre filas, mayor separación horizontal que los `23 px` actuales, escala decreciente con profundidad y pies asentados en el suelo aparente de su fila. Ningún slot cambia con el salto del docente.

- [ ] **Step 3: Verificar el fallo**

  Run: `npm test -- tests/course/progression.test.ts tests/gameplay/calibration.test.ts tests/phaser/companion-group.test.ts`

  Expected: FAIL porque hoy empieza con uno, hereda nueve y solo usa dos columnas compactas.

- [ ] **Step 4: Implementar calibración y reinicio**

  Fijar `initialRatios` a `{ 1: 20, 2: 20, 3: 20 }`; cambiar `ratioIntervalMs` a `{ 1: 6500, 2: 6000, 3: 5600 }`; y hacer que `companionCountForProfile` calcule `clamp(2 + growth, 2, 9)`. En `startNextTerm`, fijar ratio a `20` y `companionCount` a dos, pero conservar `maxRatio: Math.max(state.maxRatio, ratio)`. Actualizar los perfiles rápido y de rendimiento de `PreloadScene` al nuevo tipo.

- [ ] **Step 5: Implementar la formación visual**

  Hacer de `companionFormation` una función pura exportada. `CompanionGroup.setCount` aplica sus slots a los sprites, sin cuerpos Arcade y sin leer `teacher.y`.

- [ ] **Step 6: Actualizar la explicación accesible**

  Indicar que cada trimestre vuelve a representar desde el principio cómo crece la presión de ratio dentro de esa etapa y que el alumnado acompaña, no obstaculiza.

- [ ] **Step 7: Verificar**

  Run: `npm test -- tests/course/progression.test.ts tests/gameplay/calibration.test.ts tests/phaser/companion-group.test.ts tests/content/facts.test.ts`

  Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/course src/phaser/entities/CompanionGroup.ts src/phaser/scenes/PreloadScene.ts src/content/facts.ts tests/course tests/gameplay/calibration.test.ts tests/phaser/companion-group.test.ts tests/content/facts.test.ts
git commit -m "feat: reset and spread companion ratio each term"
```

### Task 7: Convertir el obstáculo único en un pool de cuatro

**Files:**
- Modify: `src/phaser/entities/ObstaclePool.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Create: `tests/phaser/obstacle-pool.test.ts`
- Modify: `tests/phaser/scenes.test.ts`
- Modify: `tests/e2e/phaser-slice.spec.ts`

**Interfaces:**
- Consumes: `nextObstacle`, `worldSpeedFor`, `CourseState` y `SpawnDecision` de Task 5.
- Produces: `ObstaclePool.update(state: CourseState, deltaMs: number, worldSpeed: number): void`; `colliders(): Phaser.Physics.Arcade.Group`; `activeCount(): number`; `activeSnapshots(): readonly { kind: ObstacleKind; x: number }[]`; máximo cuatro imágenes reciclables.

- [ ] **Step 1: Escribir pruebas fallidas del pool**

  Afirmar creación fija de cuatro objetos inactivos, spawn por distancia recorrida, reutilización sin crear un quinto, velocidad común actualizada en todos los activos, kind asociado a cada cuerpo, y `destroy()` que destruye grupo y sprites. Añadir transición/reinicio que no hereda obstáculos activos.

- [ ] **Step 2: Verificar el fallo**

  Run: `npm test -- tests/phaser/obstacle-pool.test.ts tests/phaser/scenes.test.ts`

  Expected: FAIL porque el pool actual siempre contiene una imagen.

- [ ] **Step 3: Implementar el pool reciclable**

  Mantener `distanceUntilSpawn`; restarle `worldSpeed * deltaMs / 1000`; al llegar a cero, activar un miembro libre en el borde derecho y cargar la siguiente distancia desde `SpawnDecision.gap`. Desactivar al salir por la izquierda. Si los cuatro están ocupados, esperar al primer hueco sin crear objetos.

- [ ] **Step 4: Integrar colisiones por objeto**

  Solapar al docente con el grupo. En callback, leer el `ObstacleKind` del objeto concreto y guardarlo como impacto pendiente; la invulnerabilidad existente evita dobles impactos.

- [ ] **Step 5: Integrar velocidad compartida y diagnóstico**

  En cada frame, calcular una vez presión/velocidad; usar la velocidad tanto para `ScrollingBackdrop.update` como para `ObstaclePool.update`. Exponer `obstaclePoolSize`, `activeObstacleCount` y snapshots en `GameDebugState`.

- [ ] **Step 6: Probar simultaneidad y jugabilidad**

  Playwright, con semilla fija, debe observar al menos dos obstáculos simultáneos en presión alta, nunca más de cuatro, y completar saltos automáticos sobre una secuencia máxima sin impacto. También verifica que tras cambio de trimestre el pool empieza vacío y respeta la gracia.

- [ ] **Step 7: Verificar**

  Run: `npm test -- tests/phaser/obstacle-pool.test.ts tests/phaser/scenes.test.ts && npm run test:e2e -- tests/e2e/phaser-slice.spec.ts`

  Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/phaser/entities/ObstaclePool.ts src/phaser/scenes/GameScene.ts tests/phaser/obstacle-pool.test.ts tests/phaser/scenes.test.ts tests/e2e/phaser-slice.spec.ts
git commit -m "feat: support four progressive obstacles"
```

### Task 8: Sincronizar la velocidad musical con la presión

**Files:**
- Modify: `src/phaser/audio/GameAudio.ts`
- Modify: `src/main.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Modify: `tests/phaser/audio.test.ts`
- Modify: `tests/e2e/audio-resilience.spec.ts`

**Interfaces:**
- Consumes: presión normalizada `0…1` emitida por `GameScene` como `game:pressure`.
- Produces: `GameAudio.setPressure(pressure: number): void`; tasa del tema `roundToHundredth(1 + clamp(pressure) * 0.24)`.

- [ ] **Step 1: Escribir pruebas fallidas de audio**

  Extender `FakeSound` con `rate` y `setRate(rate: number)`. Afirmar `0→1.00`, `0.5→1.12`, `1→1.24`, clamp fuera de rango y ninguna escritura cuando la centésima no cambia. `startTerm`, `playHoliday`, `playCourseEnd` y `destroy` deben dejar la tasa en `1.00`; no crear/reproducir audio antes de unlock.

- [ ] **Step 2: Verificar el fallo**

  Run: `npm test -- tests/phaser/audio.test.ts`

  Expected: FAIL porque `setPressure` no existe.

- [ ] **Step 3: Implementar tasa gradual y preservación de tono**

  Añadir `setRate` a `SoundLike`; actualizar solo `audio-theme` existente y recordar la centésima pendiente para aplicarla cuando se cree tras unlock. Cuando el backend exponga el nodo WebAudio, activar `preservesPitch`/equivalente de forma defensiva; cualquier ausencia sigue siendo no fatal.

- [ ] **Step 4: Conectar el evento compartido**

  `GameScene` emite `game:pressure` únicamente cuando cambia la centésima. `main.ts` llama `audio.setPressure`; escenas de descanso y resultado mantienen cues a `1.00`.

- [ ] **Step 5: Probar integración y reinicio**

  Playwright instrumenta `game:pressure`: debe crecer dentro de un trimestre, volver al valor inicial del siguiente y no alterar cues festivas. Reiniciar partida no hereda `1.24×`.

- [ ] **Step 6: Verificar**

  Run: `npm test -- tests/phaser/audio.test.ts && npm run test:e2e -- tests/e2e/audio-resilience.spec.ts`

  Expected: PASS incluso con archivos de audio ausentes.

- [ ] **Step 7: Commit**

```bash
git add src/phaser/audio/GameAudio.ts src/phaser/scenes/GameScene.ts src/main.ts tests/phaser/audio.test.ts tests/e2e/audio-resilience.spec.ts
git commit -m "feat: accelerate theme with course pressure"
```

### Task 9: Integración, limpieza y aceptación final

**Files:**
- Modify: `scripts/check-game-budget.mjs`
- Modify: `tests/scripts/game-budget.test.ts`
- Modify: `tests/e2e/course-flow.spec.ts`
- Modify: `tests/e2e/performance.spec.ts`
- Modify: `README.md`
- Delete if unreferenced: `public/game/ui/panels.png`

**Interfaces:**
- Consumes: todas las interfaces y assets de Tasks 1–8.
- Produces: build de producción verificado y documentación de mantenimiento del panorama.

- [ ] **Step 1: Añadir el flujo E2E de aceptación**

  Recorrer los tres trimestres en modo rápido y afirmar: texturas septiembre/invierno/junio; primavera en Semana Santa; `2→9` y reset a `2`; recarga de diez bloques; máximo anual preservado; varios obstáculos; presión creciente; resultado y retry limpios. Ejecutar también con `prefers-reduced-motion`.

- [ ] **Step 2: Añadir checks de rendimiento y presupuesto**

  Con nueve acompañantes y cuatro obstáculos, exigir un percentil 95 de frame dentro del umbral actual del test y cero crecimiento de objetos/listeners tras tres transiciones. El budget debe incluir WebP y fallar por encima de `3 MB` comprimidos.

- [ ] **Step 3: Ejecutar tests enfocados**

  Run: `npm test && npm run test:e2e -- tests/e2e/course-flow.spec.ts tests/e2e/performance.spec.ts`

  Expected: PASS.

- [ ] **Step 4: Revisar visualmente los dos viewports**

  Levantar `npm run dev` y revisar `844×390` y `740×360`: cuatro pantallas contra referencias, tres panoramas en movimiento, primavera estática, costura, formación 2/5/9 y presión máxima. Confirmar que no reaparecen las líneas rojas descartadas.

- [ ] **Step 5: Eliminar assets obsoletos y documentar**

  Usar `rg "term-[123]\\.png|panels" src tests public` antes de borrar. Documentar `npm run art:panoramas`, dimensiones, orden del manifiesto y checkpoint de aprobación; preservar siempre los maestros aprobados.

- [ ] **Step 6: Ejecutar la verificación completa**

  Run: `npm run ci`

  Expected: typecheck, unit tests, build, budget y Playwright PASS; salida comprimida `≤ 3 MB`.

- [ ] **Step 7: Revisar el diff y confirmar que los archivos del usuario siguen intactos**

  Run: `git status --short && git diff --check && git diff --stat b827e96...HEAD`

  Expected: no whitespace errors; `docs/obstacle-art-review.png` y `.svg` siguen sin trackear y sin cambios.

- [ ] **Step 8: Commit**

```bash
git add README.md scripts/check-game-budget.mjs tests/scripts/game-budget.test.ts tests/e2e public/game src
git commit -m "test: verify panoramic course experience"
```

