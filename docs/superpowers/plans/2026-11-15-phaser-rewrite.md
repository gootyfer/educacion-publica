# Phaser Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Una jornada decente as a landscape Phaser game with the approved pixel-art direction, recalibrated gameplay, accessible HTML support and the approved audio.

**Architecture:** Phaser owns scenes, rendering, animation, input, camera and collision presentation at a logical 640 × 360 resolution. Engine-independent TypeScript modules own course progression, energy, ratio, cadence and results; semantic DOM overlays own motivation, sources, accessible controls and status. The current game remains available until the new vertical slice passes, then the Phaser entry point replaces it and obsolete Canvas code is removed.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest, Playwright, HTML/CSS, existing static MP3 files.

**Spec:** `docs/superpowers/specs/2026-11-15-una-jornada-decente-art-phaser-design.md`

## Global Constraints

- Logical game size is exactly 640 × 360 and the primary orientation is landscape.
- Preserve the metaphors of energy, growing ratio and three terms; recalibrate all numeric gameplay values around the production sprites.
- Students are followers, never obstacles: they have no collision bodies and never jump.
- Only energy is persistently visible during play; no numeric ratio, term or score HUD.
- The teacher shirt suggests the full white slogan on green and never shows an isolated `@`.
- Use the three approved seasonal versions of the same Madrid public-school setting.
- Filled energy blocks are contiguous from the left; critical blocks are coral with the same mustard top-left shine.
- Motivation, facts, sources and accessible status remain semantic DOM content.
- Current and previous Safari mobile and Chrome Android are supported.
- Development and CI continue to require Node.js 24 or later.
- Target 60 FPS on a representative mid-range phone from the last five years, without sustained drops below 50 FPS.
- Compressed JavaScript plus critical visual assets must remain at or below 3 MB, excluding lazily loaded audio.
- `prefers-reduced-motion` completes nonessential transitions immediately.
- Installation icon and PWA installability are explicitly deferred to a later plan. The current repository has no web manifest or service worker.
- Do not replace or delete the current Canvas implementation until the Phaser vertical slice has passed its checks.

## Review Focus

- Portrait phone: show the rotate-device view while motivation, data and sources remain reachable and keyboard-focusable.
- Interrupted or very large frame delta: clamp simulation work so backgrounding the tab cannot skip collisions or end a term instantly.
- Missing WebGL or missing asset: use Phaser Canvas fallback where possible and expose a useful accessible error instead of a blank game.
- Repeated restart and scene transitions: release listeners, timers, physics bodies and sounds so memory and input do not multiply.
- Reduced motion and unavailable audio: all course transitions remain usable and the game completes without animation or sound.

---

### Task 1: Phaser foundation and landscape shell

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/phaser/config.ts`
- Create: `src/phaser/create-game.ts`
- Create: `src/phaser/scenes/BootScene.ts`
- Create: `src/phaser/scenes/PreloadScene.ts`
- Create: `tests/phaser/config.test.ts`

**Interfaces:**
- Produces: `GAME_WIDTH = 640`, `GAME_HEIGHT = 360`, and `buildGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig`.
- Produces: `createPhaserGame(parent: HTMLElement): Phaser.Game` for the new application entry point.
- Produces: scene keys `boot` and `preload` used by all later scene tasks.

- [ ] **Step 1: Add the Phaser dependency and failing configuration test**

Run `npm install phaser` and `npm install --save-dev happy-dom`. Mark the test with `@vitest-environment happy-dom`. In `tests/phaser/config.test.ts`, assert that `buildGameConfig()` returns width `640`, height `360`, `pixelArt: true`, `roundPixels: true`, Arcade Physics without debug rendering, `Phaser.Scale.FIT`, and `Phaser.Scale.CENTER_BOTH`.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- tests/phaser/config.test.ts`  
Expected: FAIL because `src/phaser/config.ts` does not exist.

- [ ] **Step 3: Implement the Phaser configuration and factories**

Implement `buildGameConfig(parent)` and `createPhaserGame(parent)`. Register only `BootScene` and `PreloadScene` initially. `BootScene` starts `preload`; `PreloadScene` exposes a loading progress event but does not yet switch the production entry point.

- [ ] **Step 4: Verify foundation tests and build**

Run: `npm test -- tests/phaser/config.test.ts && npm run typecheck`  
Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit the foundation**

```bash
git add package.json package-lock.json src/phaser tests/phaser/config.test.ts
git commit -m "feat: add Phaser game foundation"
```

### Task 2: Production asset set and typed manifest

**Files:**
- Create: `public/game/characters/teacher.png`
- Create: `public/game/characters/companions.png`
- Create: `public/game/obstacles/obstacles.png`
- Create: `public/game/backgrounds/term-1.png`
- Create: `public/game/backgrounds/term-2.png`
- Create: `public/game/backgrounds/term-3.png`
- Create: `public/game/ui/energy.png`
- Create: `public/game/ui/panels.png`
- Create: `src/phaser/assets.ts`
- Create: `tests/phaser/assets.test.ts`
- Create: `docs/art-direction/una-jornada-decente/production-contact-sheet.png`
- Modify: `src/phaser/scenes/PreloadScene.ts`

**Interfaces:**
- Produces: `GAME_ASSETS`, a typed manifest whose keys are `teacher`, `companions`, `obstacles`, `term1`, `term2`, `term3`, `energy` and `panels`.
- Produces: animation frame names `teacher-run-0..5`, `teacher-jump-*`, `teacher-hit-*`, `teacher-tired-*`, plus grounded run frames for all nine companions.
- Produces: obstacle frame names `paper-stack`, `filing-cart`, `cold-climate`, `heat-climate`, `leak`, and `wall`.

- [ ] **Step 1: Write the failing manifest contract test**

Assert that every required manifest key exists, paths begin with `/game/`, teacher run contains exactly six frames, companion definitions contain exactly nine identities, and no companion animation contains a jump state.

- [ ] **Step 2: Run the asset test and confirm failure**

Run: `npm test -- tests/phaser/assets.test.ts`  
Expected: FAIL because the production manifest is absent.

- [ ] **Step 3: Produce transparent production sheets from the approved references**

Use the approved files under `docs/art-direction/una-jornada-decente/` as visual references, not as sprite sources. Create clean sheets with uniform cells, stable feet/pivots, no decorative background and no antialiasing. Keep the teacher near a 70 × 64 logical box; scale companions consistently below the teacher. Save the final raster sheets under `public/game/`.

- [ ] **Step 4: Produce seasonal backgrounds and UI components**

Prepare 640 × 360 backgrounds with a clear ground lane. Split energy blocks and panel elements into reusable frames; screen copy must remain live text rather than raster text.

- [ ] **Step 5: Create the typed manifest and load it in PreloadScene**

Declare sheet dimensions, frame names and URLs in `GAME_ASSETS`. `PreloadScene.preload()` must load from this manifest and report `0..1` progress. Add a load-error handler that emits a machine-readable error event for the DOM shell.

- [ ] **Step 6: Create and visually inspect the production contact sheet**

Place every production frame on a neutral checkerboard with labels. Compare it against the approved run, jump, collision, tired, student, obstacle, background and HUD references. Correct identity drift, stray earrings, hidden eyes, missing nose, isolated `@`, airborne companions and inconsistent scale before proceeding.

- [ ] **Step 7: Run manifest tests and typecheck**

Run: `npm test -- tests/phaser/assets.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 8: Commit approved production assets**

```bash
git add public/game src/phaser/assets.ts src/phaser/scenes/PreloadScene.ts tests/phaser/assets.test.ts docs/art-direction/una-jornada-decente/production-contact-sheet.png
git commit -m "feat: add approved pixel art game assets"
```

### Task 3: Recalibratable course domain

**Files:**
- Create: `src/course/types.ts`
- Create: `src/course/calibration.ts`
- Create: `src/course/progression.ts`
- Create: `src/course/cadence.ts`
- Create: `tests/course/progression.test.ts`
- Create: `tests/course/cadence.test.ts`

**Interfaces:**
- Produces: `CourseState`, `Term = 1 | 2 | 3`, `ObstacleKind`, `CourseEvent`, and `CourseResult`.
- Produces: `createCourseState(profile?: CalibrationProfile): CourseState`.
- Produces: `advanceCourse(state: CourseState, input: CourseInput, deltaMs: number): CourseStep` where `CourseStep` contains the next immutable state and emitted events.
- Produces: `companionCountForRatio(ratio: number): number`, clamped to `1..9`.
- Produces: `nextObstacle(request: SpawnRequest, random: RandomSource): SpawnDecision` without importing Phaser.

- [ ] **Step 1: Write progression tests before implementation**

Cover: initial term and energy; delta clamped to the profile maximum; energy never outside `0..100`; companion count only increases and never exceeds nine; an impact subtracts energy but does not immediately finish a nonempty term; zero energy emits `term-ended`; advancing after term two starts term three with restored energy; zero energy in term three emits `course-ended`.

- [ ] **Step 2: Run progression tests and confirm failure**

Run: `npm test -- tests/course/progression.test.ts`  
Expected: FAIL because the course modules do not exist.

- [ ] **Step 3: Implement the immutable course state machine**

Keep all tuning values in `CalibrationProfile`, including term duration targets, energy drain, impact damage, ratio schedule, maximum delta and invulnerability. Use provisional values only here so Task 5 can tune one object without changing scene code.

- [ ] **Step 4: Write cadence property tests**

For each term and energy band, generate at least 500 deterministic spawn decisions. Assert that obstacle gaps exceed the minimum traversable distance derived from current world speed, jump airtime and sprite collision widths; forbid identical tall obstacles in unsafe succession.

- [ ] **Step 5: Run cadence tests and confirm failure**

Run: `npm test -- tests/course/cadence.test.ts`  
Expected: FAIL until `nextObstacle()` exists.

- [ ] **Step 6: Implement seeded cadence decisions**

Implement a deterministic `RandomSource` adapter and return only data: obstacle kind, gap and speed band. Do not create Phaser objects in this module.

- [ ] **Step 7: Verify the complete course domain**

Run: `npm test -- tests/course && npm run typecheck`  
Expected: PASS.

- [ ] **Step 8: Commit the course domain**

```bash
git add src/course tests/course
git commit -m "feat: add recalibratable course model"
```

### Task 4: Playable Phaser vertical slice

**Files:**
- Create: `src/phaser/scenes/GameScene.ts`
- Create: `src/phaser/animations.ts`
- Create: `src/phaser/entities/Teacher.ts`
- Create: `src/phaser/entities/CompanionGroup.ts`
- Create: `src/phaser/entities/ObstaclePool.ts`
- Create: `src/phaser/ui/EnergyHud.ts`
- Create: `tests/phaser/animations.test.ts`
- Create: `tests/e2e/phaser-slice.spec.ts`
- Modify: `src/phaser/config.ts`
- Modify: `src/phaser/scenes/PreloadScene.ts`

**Interfaces:**
- Produces: scene key `game` with `GameSceneData { term: Term; state?: CourseState }`.
- Produces: `Teacher.requestJump(): boolean`, `Teacher.playImpact(): void` and `Teacher.setTiredness(energy: number): void`.
- Produces: `CompanionGroup.setCount(count: number): void`; companions never receive physics bodies.
- Produces: `EnergyHud.setEnergy(energy: number): void` rendering ten contiguous blocks.

- [ ] **Step 1: Write animation and HUD contract tests**

Assert six run frames, named jump/hit/tired animations, nine grounded companion definitions and energy mapping: `100 → 10 green`, `70 → 7 green + 3 empty`, `30 → 3 coral + 7 empty`, `0 → 10 empty`.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm test -- tests/phaser/animations.test.ts`  
Expected: FAIL because the animation and HUD helpers are absent.

- [ ] **Step 3: Implement teacher, companions, obstacle pool and HUD**

Use Arcade Physics only for the teacher and obstacles. Anchor all running characters to the shared ground line. Arrange visible companions as a compact staggered group immediately behind the teacher; changing count must not move the teacher or create collision bodies.

- [ ] **Step 4: Implement GameScene against the pure course domain**

Translate pointer, `Space` and `ArrowUp` into jump requests; translate Phaser overlaps into one `impact` event per invulnerability window. Clamp frame delta before calling `advanceCourse()`. Keep the first slice to term-one background, three followers and paper-stack obstacle.

- [ ] **Step 5: Write the vertical-slice browser test**

Mount the Phaser game in a test page and assert: 640 × 360 internal canvas; pointer and Space trigger a jump status; three companions remain grounded while the teacher is airborne; collision lowers energy without ending play; only the energy HUD is visible.

- [ ] **Step 6: Run the slice in Chromium and mobile landscape**

Run: `npm run test:e2e -- tests/e2e/phaser-slice.spec.ts`  
Expected: PASS at 844 × 390 and 1280 × 800.

- [ ] **Step 7: Commit the vertical slice**

```bash
git add src/phaser tests/phaser/animations.test.ts tests/e2e/phaser-slice.spec.ts
git commit -m "feat: build playable Phaser vertical slice"
```

### Task 5: Full seasonal gameplay and calibration

**Files:**
- Modify: `src/phaser/scenes/GameScene.ts`
- Modify: `src/phaser/entities/CompanionGroup.ts`
- Modify: `src/phaser/entities/ObstaclePool.ts`
- Modify: `src/course/calibration.ts`
- Modify: `src/course/cadence.ts`
- Modify: `tests/course/cadence.test.ts`
- Create: `tests/gameplay/calibration.test.ts`
- Create: `tests/e2e/course-flow.spec.ts`

**Interfaces:**
- Consumes: `CourseStep`, `nextObstacle()` and production frame names from Tasks 2–4.
- Produces: complete term configuration with seasonal background, eligible obstacle set, speed curve, ratio curve and companion growth.

- [ ] **Step 1: Add failing full-course invariants**

Test that each term uses its approved background; winter can produce cold and leak obstacles; June can produce heat obstacles; all six obstacle variants appear across deterministic course seeds; companion count can reach nine only through ratio growth; no obstacle sequence is mathematically unavoidable at minimum supported energy.

- [ ] **Step 2: Run calibration tests and confirm failure**

Run: `npm test -- tests/gameplay/calibration.test.ts tests/course/cadence.test.ts`  
Expected: FAIL for missing seasonal and full-cast behavior.

- [ ] **Step 3: Add all obstacle and companion variants**

Pool obstacle sprites by frame and reset their bodies on reuse. Change follower identity order across a fixed diverse sequence while preserving the approved compact formation. Followers continue their run animation unchanged during teacher jumps and impacts.

- [ ] **Step 4: Tune the calibration profile with production geometry**

Measure actual collision widths and teacher jump airtime. Adjust term targets, energy drain, damage, speed ramps and gap bands so early play teaches the input, later play is demanding, collisions remain recoverable and all obstacle types are readable before contact.

- [ ] **Step 5: Add deterministic full-course browser coverage**

Expose a test-only seed through Vite test mode. Verify term-one, winter and June backgrounds in order; companion growth; recoverable impacts; and arrival at course end without test-only DOM manipulation of scene internals.

- [ ] **Step 6: Run unit and course-flow suites**

Run: `npm test -- tests/course tests/gameplay && npm run test:e2e -- tests/e2e/course-flow.spec.ts`  
Expected: PASS.

- [ ] **Step 7: Commit complete gameplay**

```bash
git add src/course src/phaser tests/course tests/gameplay tests/e2e/course-flow.spec.ts
git commit -m "feat: add seasonal course progression"
```

### Task 6: Title, term breaks and results scenes

**Files:**
- Create: `src/phaser/scenes/TitleScene.ts`
- Create: `src/phaser/scenes/TermBreakScene.ts`
- Create: `src/phaser/scenes/ResultsScene.ts`
- Create: `src/phaser/ui/PixelPanel.ts`
- Create: `tests/phaser/scenes.test.ts`
- Modify: `src/phaser/config.ts`
- Modify: `src/phaser/scenes/GameScene.ts`

**Interfaces:**
- Produces: scene keys `title`, `term-break`, and `results`.
- Produces: `TermBreakSceneData { completedTerm: 1 | 2; nextTerm: 2 | 3; state: CourseState }`.
- Produces: `ResultsSceneData { result: CourseResult }`.
- Produces: scene events `ui:start`, `ui:how`, `ui:continue`, `ui:retry`, `ui:why`, and `ui:share` for the DOM control layer.

- [ ] **Step 1: Write failing scene-flow tests**

Assert exact scene ordering; Christmas and Semana Santa copy; no decorative bursts; title and results use the approved backgrounds; term-break energy fills ten blocks left-to-right in roughly one second; reduced motion completes it immediately; final results never refill energy.

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test -- tests/phaser/scenes.test.ts`  
Expected: FAIL because the scenes are absent.

- [ ] **Step 3: Implement the shared PixelPanel and title scene**

Render panel borders and buttons from production UI frames. Keep every label as live text. Use the approved exact labels and omit all removed decorative rays.

- [ ] **Step 4: Implement both term breaks with one scene**

Drive copy and background from `completedTerm`. Disable continue until refill completes; allow immediate completion under reduced motion. Ensure repeated pointer or keyboard activation transitions exactly once.

- [ ] **Step 5: Implement results and scene routing**

Show final time and maximum ratio, then emit events for retry, motivation and share. The `GameScene` must stop physics and timers before switching scenes.

- [ ] **Step 6: Verify scene tests and typecheck**

Run: `npm test -- tests/phaser/scenes.test.ts && npm run typecheck`  
Expected: PASS.

- [ ] **Step 7: Commit the complete scene flow**

```bash
git add src/phaser tests/phaser/scenes.test.ts
git commit -m "feat: add Phaser course scenes"
```

### Task 7: Accessible DOM shell and responsive orientation

**Files:**
- Rewrite: `index.html`
- Rewrite: `src/main.ts`
- Rewrite: `src/styles.css`
- Create: `src/ui/GameShell.ts`
- Create: `src/ui/MotivationPanel.ts`
- Create: `src/ui/AccessibleStatus.ts`
- Modify: `src/ui/results.ts`
- Preserve: `src/ui/share.ts`
- Preserve: `src/content/facts.ts`
- Create: `tests/ui/game-shell.test.ts`
- Rewrite: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: `GameShell.mount(root: HTMLElement): GameShellHandle`.
- Produces: `GameShellHandle.setScreen(screen: ShellScreen): void`, `setLoading(progress: number): void`, `announce(message: string): void`, and `destroy(): void`.
- Consumes: Phaser `ui:*` events and translates them to semantic HTML controls and panels.

- [ ] **Step 1: Write failing shell tests**

Test focus movement for title, term break, results and motivation; live announcements for jump, companion addition, impact and term change; source links remain real anchors; portrait view exposes rotate guidance plus motivation and facts; `destroy()` removes listeners.

- [ ] **Step 2: Run shell tests and confirm failure**

Run: `npm test -- tests/ui/game-shell.test.ts`  
Expected: FAIL because `GameShell` is absent.

- [ ] **Step 3: Replace the document shell and visual CSS**

Mount Phaser into a landscape stage and layer transparent semantic controls over the corresponding Phaser buttons. Rebuild all presentation styles from the approved pixel-art palette; do not carry forward the old masthead, isolated `@`, portrait game ratio or rounded modern-card styling.

- [ ] **Step 4: Implement motivation, data and source panels**

Use the approved three-part motivation copy and existing `EVIDENCE_FACTS`. Provide `Datos y fuentes` and `Volver`, restore focus to the invoking control, and keep panels reachable from portrait guidance and the no-JavaScript fallback.

- [ ] **Step 5: Synchronize accessibility state with scenes**

Reflect energy, term changes and follower additions in the visually hidden live region without adding them to the visible HUD. Ensure semantic controls support pointer, Enter and Space while gameplay Space remains scoped to the focused game surface.

- [ ] **Step 6: Rewrite accessibility E2E coverage**

Cover keyboard-only navigation, focus restoration, reduced motion, portrait guidance, landscape play, source links, missing Canvas/WebGL fallback and no-JavaScript content.

- [ ] **Step 7: Run UI and accessibility suites**

Run: `npm test -- tests/ui && npm run test:e2e -- tests/e2e/accessibility.spec.ts`  
Expected: PASS with no serious axe violations.

- [ ] **Step 8: Commit the accessible application shell**

```bash
git add index.html src/main.ts src/styles.css src/ui src/content tests/ui tests/e2e/accessibility.spec.ts
git commit -m "feat: add accessible Phaser application shell"
```

### Task 8: Phaser audio integration and resilience

**Files:**
- Create: `src/phaser/audio/GameAudio.ts`
- Create: `tests/phaser/audio.test.ts`
- Modify: `src/phaser/scenes/PreloadScene.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Modify: `src/phaser/scenes/TermBreakScene.ts`
- Modify: `src/phaser/scenes/ResultsScene.ts`
- Modify: `src/ui/GameShell.ts`

**Interfaces:**
- Produces: `GameAudio` methods `unlock()`, `startTerm(term)`, `playJump()`, `playImpact(kind)`, `playHoliday(term)`, `playCourseEnd()`, `setMuted(muted)`, `isMuted()` and `destroy()`.
- Consumes: the approved files under `public/audio/approved/`; effects may be omitted only if the approved asset review finds they clash with the new animation.

- [ ] **Step 1: Write failing audio lifecycle tests**

Test no playback before interaction; mute persists; missing files reject safely; repeated scene starts do not layer duplicate theme instances; `destroy()` stops sounds and removes listeners; gameplay remains active when every audio load fails.

- [ ] **Step 2: Run audio tests and confirm failure**

Run: `npm test -- tests/phaser/audio.test.ts`  
Expected: FAIL because `GameAudio` is absent.

- [ ] **Step 3: Implement Phaser-backed audio orchestration**

Load the main theme and transition cues through Phaser. Keep storage access guarded. Start or resume audio only after user interaction and make all public methods safe when a sound is missing.

- [ ] **Step 4: Connect scene events and semantic mute control**

Map jump, impact, holiday and finish events once. Keep the mute button as a real HTML button with current `aria-label` and persisted state.

- [ ] **Step 5: Run audio and browser resilience tests**

Run: `npm test -- tests/phaser/audio.test.ts && npm run test:e2e -- --grep "audio|sonido"`  
Expected: PASS, including aborted MP3 requests.

- [ ] **Step 6: Commit audio integration**

```bash
git add src/phaser/audio src/phaser/scenes src/ui/GameShell.ts tests/phaser/audio.test.ts
git commit -m "feat: integrate approved audio with Phaser"
```

### Task 9: Switch production entry point, remove obsolete renderer and verify release

**Files:**
- Delete: `src/game/art/characters.ts`
- Delete: `src/game/art/obstacles.ts`
- Delete: `src/game/art/primitives.ts`
- Delete: `src/game/art/scene.ts`
- Delete: `src/game/renderer.ts`
- Delete: `src/game/runtime.ts`
- Delete or replace after migration: `src/game/config.ts`
- Delete or replace after migration: `src/game/mechanics.ts`
- Delete or replace after migration: `src/game/obstacles.ts`
- Delete or replace after migration: `src/game/types.ts`
- Remove or rewrite: `tests/game/*.test.ts`
- Modify: `README.md`
- Modify: `docs/validation-notes.md`
- Modify: `vite.config.ts`
- Modify: `tests/e2e/game.spec.ts`
- Create: `tests/e2e/performance.spec.ts`
- Create: `scripts/check-game-budget.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: all Phaser, course and shell interfaces from Tasks 1–8.
- Produces: one production entry point with no imports from the obsolete Canvas runtime.

- [ ] **Step 1: Add final regression tests before removing old code**

Cover start, touch and keyboard jump, three terms, both refills, nine followers, all obstacle classes, recoverable collisions, results, retry, motivation, sources, share fallback, mute persistence, reduced motion, portrait guidance and missing-asset error handling.

- [ ] **Step 2: Add performance and lifecycle instrumentation in test mode**

Expose test-only counters for active Phaser scenes, input listeners, obstacle pool size and frame timing samples. Assert that five retries leave one active game, one input binding and bounded pool size.

- [ ] **Step 3: Add a deterministic production bundle budget check**

Implement `scripts/check-game-budget.mjs` to gzip production JavaScript and critical files under `dist/game/`, exclude `dist/audio/`, sum their byte sizes and fail above `3 * 1024 * 1024`. Add `npm run budget` and a small script test that verifies audio exclusion and over-budget failure using fixture directories.

- [ ] **Step 4: Run regressions against the Phaser entry point**

Run: `npm run typecheck && npm test && npm run build && npm run test:e2e`  
Expected: PASS before old runtime deletion.

- [ ] **Step 5: Remove obsolete Canvas implementation and superseded tests**

Delete only files with no remaining imports. Preserve `src/content`, `src/ui/share.ts` and any pure result/storage code still used. Replace old tests with course, Phaser and browser tests rather than deleting behavioral coverage.

- [ ] **Step 6: Update project documentation**

Document Phaser structure, asset locations, calibration workflow, horizontal orientation, test commands and the deferred PWA manifest/icon follow-up. Remove README claims about the old renderer and portrait game dimensions.

- [ ] **Step 7: Run full release verification after cleanup**

Run: `npm run ci`  
Expected: TypeScript, unit tests, production build and all Playwright projects pass.

Run: `npm run build` and inspect Vite output plus `dist/` asset sizes.  
Run: `npm run budget`  
Expected: critical compressed JavaScript and visual assets meet the 3 MB budget; audio remains separately loadable and excluded from the sum.

- [ ] **Step 8: Perform manual visual and mobile checks**

Verify at 844 × 390, 740 × 360 and a real or emulated mid-range mobile: pixel snapping, readable glasses and nose, shirt treatment, grouped grounded followers, all seasonal backgrounds, energy states, one-second refill, reduced motion, portrait guidance, 60 FPS target and no memory growth after repeated retries.

- [ ] **Step 9: Commit the production switch**

```bash
git add -A
git commit -m "feat: replace Canvas runner with Phaser"
```
