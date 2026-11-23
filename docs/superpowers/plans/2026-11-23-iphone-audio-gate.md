# iPhone Audio Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproducir la música inicial tras un único toque explícito en la PWA instalada en iPhone, sin afectar a otros dispositivos ni bloquear el juego si el audio falla.

**Architecture:** Una función pura identifica la PWA instalada en iPhone. El shell muestra una puerta táctil accesible solo cuando esa condición coincide con un gestor de sonido bloqueado y no silenciado; el coordinador espera la confirmación `UNLOCKED` de Phaser antes de reanudar la música pendiente.

**Tech Stack:** TypeScript, Phaser 3.90, Web Audio, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-23-iphone-audio-gate-design.md`

## Global Constraints

- La interacción debe ser un toque real; `orientationchange` no desbloquea Web Audio.
- La puerta solo aparece en una PWA instalada en iPhone, con audio no silenciado y `game.sound.locked === true`.
- El juego debe continuar aunque el desbloqueo o la pista fallen.
- No se modifican pistas, volumen ni preferencias persistidas.

## Review Focus

- iPhone instalado y bloqueado: muestra una sola puerta y reproduce el tema del título después del toque.
- iPhone instalado con silencio persistido: no muestra la puerta ni reproduce música.
- Safari normal, Android y escritorio: conservan el flujo actual sin pantalla adicional.
- Gestos o eventos repetidos: no crean pistas superpuestas ni varios listeners `UNLOCKED`.
- Fallo o demora de Web Audio: la puerta se retira tras el toque y el juego sigue siendo utilizable.

---

### Task 1: Detectar la PWA instalada en iPhone

**Files:**
- Create: `src/pwa/ios-audio-gate.ts`
- Create: `tests/pwa/ios-audio-gate.test.ts`

**Interfaces:**
- Consumes: `navigator.userAgent`, `navigator.standalone` y `matchMedia("(display-mode: standalone)")`.
- Produces: `isInstalledIphone(navigatorLike, displayModeStandalone): boolean` y `shouldOfferIphoneAudioGate({ installedIphone, soundLocked, muted }): boolean`.

- [ ] **Step 1: Write the failing tests** para iPhone instalado, Safari normal, Android/escritorio, audio ya desbloqueado y preferencia silenciada.
- [ ] **Step 2: Run `npm test -- tests/pwa/ios-audio-gate.test.ts`** y comprobar que falla por no existir las funciones.
- [ ] **Step 3: Implement the two pure predicates** sin depender de globals dentro de las funciones.
- [ ] **Step 4: Run `npm test -- tests/pwa/ios-audio-gate.test.ts`** y comprobar que pasa.
- [ ] **Step 5: Commit** con `test` y código de detección.

### Task 2: Añadir la puerta táctil accesible

**Files:**
- Modify: `src/ui/GameShell.ts`
- Modify: `src/styles.css`
- Modify: `tests/ui/game-shell.test.ts`

**Interfaces:**
- Consumes: la decisión calculada por `main.ts`.
- Produces: `showAudioGate(onActivate: () => void): void` y `hideAudioGate(): void` en `GameShellHandle`.

- [ ] **Step 1: Write failing shell-contract tests** que exijan el texto «Toca para continuar», un botón real y retirada idempotente de la capa.
- [ ] **Step 2: Run `npm test -- tests/ui/game-shell.test.ts`** y comprobar el fallo esperado.
- [ ] **Step 3: Implement the gate markup and methods** con foco en el botón, fondo coherente con la pantalla inicial y áreas seguras de iPhone.
- [ ] **Step 4: Make activation non-blocking:** el botón oculta la capa inmediatamente y ejecuta el callback una sola vez.
- [ ] **Step 5: Run the shell tests** y comprobar que pasan.
- [ ] **Step 6: Commit** la interfaz y estilos de la puerta.

### Task 3: Sincronizar la música con el desbloqueo real de Phaser

**Files:**
- Modify: `src/main.ts`
- Modify: `src/phaser/audio/GameAudio.ts`
- Modify: `tests/phaser/audio.test.ts`
- Modify: `tests/e2e/audio-resilience.spec.ts`

**Interfaces:**
- Consumes: `shouldOfferIphoneAudioGate`, `game.sound.locked` y `Phaser.Sound.Events.UNLOCKED`.
- Produces: una única transición de audio bloqueado a música pendiente reproducida.

- [ ] **Step 1: Write a failing unit test** que seleccione la música del título mientras el gestor está bloqueado y compruebe que solo se reproduce después de la confirmación de desbloqueo.
- [ ] **Step 2: Write a failing E2E test** con identidad de iPhone instalado: la puerta aparece, el toque la retira, arranca la música del título y «Empezar» continúa funcionando.
- [ ] **Step 3: Run the two targeted test files** y comprobar que fallan por la carrera actual y la puerta aún no coordinada.
- [ ] **Step 4: Coordinate the unlock in `main.ts`:** registrar como máximo un listener `UNLOCKED`, pedir la reanudación desde el toque y llamar a `GameAudio.unlock()` solo cuando el gestor esté realmente desbloqueado.
- [ ] **Step 5: Preserve graceful failure:** retirar la puerta en el toque y no condicionar navegación ni controles al resultado del audio.
- [ ] **Step 6: Run unit and E2E audio tests** y comprobar reproducción única, silencio persistente y continuidad sin archivos MP3.
- [ ] **Step 7: Run `npm run build` and the focused mobile E2E tests** para validar tipos, bundle y flujo de iPhone.
- [ ] **Step 8: Commit** la coordinación de audio.
