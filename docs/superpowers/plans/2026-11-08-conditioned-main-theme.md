# Conditioned Main Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generar mediante la API de ElevenLabs una canción instrumental nueva de 80 segundos cuyo conjunto esté condicionado por los primeros 30 segundos del tema aprobado.

**Architecture:** Un módulo puro construirá un plan Music v2.5 de cuatro fragmentos de generación y permitirá probar su estructura sin llamar a la API. Un script separado validará y subirá el tema aprobado, compondrá ese plan con el `song_id` recibido y guardará un único candidato y su manifiesto fuera de producción.

**Tech Stack:** JavaScript ESM, Vitest, ElevenLabs Music v2.5 Inpainting API, MP3 y ffprobe.

**Spec:** `docs/superpowers/specs/2026-11-08-conditioned-main-theme-design.md`

## Global Constraints

- Usar exclusivamente la API de ElevenLabs.
- Generar una canción completa nueva: ningún fragmento del MP3 original puede insertarse como `audio reference chunk`.
- Condicionar el primer fragmento con el rango `0–30000 ms`, `condition_strength: xhigh` y `context_adherence: high`.
- Duración total solicitada: `80000 ms`.
- Instrumental, sin voces, letras, referencias a artistas, obras o franquicias.
- No modificar ni regenerar las tres transiciones aprobadas.
- No copiar el candidato a `public/audio/approved/` antes de la validación directa del usuario.

## Review Focus

- **Referencia literal por error:** el plan debe contener únicamente fragmentos de generación; la prueba rechazará cualquier fragmento con `song_id` y `range` en el nivel superior.
- **Condicionamiento parcial o débil:** el primer fragmento debe referenciar exactamente `0–30000 ms` con fuerza `xhigh`; la prueba fijará los tres valores.
- **Deriva entre fragmentos:** los cuatro fragmentos deben usar `context_adherence: high` y estilos instrumentales coherentes; la prueba comprobará adherencia y ausencia de estilos vocales.
- **Duración incorrecta:** la suma de `duration_ms` debe ser exactamente `80000`; la prueba sumará el plan.
- **Créditos consumidos antes de validar:** el script debe leer el tema aprobado y la clave antes de cualquier `fetch`; la prueba estática fijará el orden.

---

### Task 1: Generar un tema completo condicionado

**Files:**
- Create: `scripts/conditioned-main-theme-plan.mjs`
- Create: `scripts/generate-conditioned-main-theme.mjs`
- Create: `tests/scripts/conditioned-main-theme.test.ts`
- Modify: `docs/audio-validation.md`
- Create, ignored: `artifacts/audio-review/main-theme-conditioned-80s.mp3`
- Create, ignored: `artifacts/audio-review/main-theme-conditioned-80s.json`

**Interfaces:**
- Consumes: `public/audio/approved/main-theme.mp3`, `ELEVENLABS_API_KEY`, `POST /v1/music/upload` y `POST /v1/music`.
- Produces: `buildConditionedMainThemePlan(songId: string): { chunks: GenerationChunk[] }`, el MP3 condicionado y un manifiesto con `sourceSongId`, rango, modelo, plan y tamaño.

- [ ] **Step 1: Escribir las pruebas fallidas del plan y del preflight**

En `tests/scripts/conditioned-main-theme.test.ts`, importar `buildConditionedMainThemePlan("source-song")` y exigir:

- cuatro fragmentos de `20000 ms` cuya suma sea `80000`;
- ningún fragmento con `song_id` o `range` de referencia literal;
- primer fragmento con `conditioning_ref: { song_id: "source-song", range: { start_ms: 0, end_ms: 30000 } }`;
- `condition_strength: "xhigh"` en el primero y `context_adherence: "high"` en todos;
- listas negativas que excluyan voces, habla y letras;
- en el script, `readFile(REFERENCE_FILE)` aparece antes del primer `fetch(` y la referencia apunta al tema aprobado.

- [ ] **Step 2: Ejecutar las pruebas y verificar el fallo**

Run: `npm test -- tests/scripts/conditioned-main-theme.test.ts`

Expected: FAIL porque el módulo y el script aún no existen.

- [ ] **Step 3: Implementar el constructor puro del plan**

Crear `buildConditionedMainThemePlan(songId)` con cuatro secciones instrumentales de 20 segundos: presentación del motivo, primera variación, desarrollo enérgico y cierre compatible con bucle. Solo el primer fragmento contiene `conditioning_ref`; todos usan alta adherencia y mantienen charanga, trompeta, clarinete, percusión ligera, bajo juguetón y xilófono.

- [ ] **Step 4: Implementar el generador API dedicado**

El script debe validar clave y referencia antes de red. Después:

1. subir `public/audio/approved/main-theme.mp3` a `/v1/music/upload` sin pedir extracción de plan;
2. construir el plan con el `song_id` devuelto;
3. enviarlo a `/v1/music?output_format=mp3_48000_192` con `model_id: music_v2_5`, `store_for_inpainting: false` y `sign_with_c2pa: true`;
4. escribir únicamente `main-theme-conditioned-80s.mp3` y su manifiesto dedicado.

- [ ] **Step 5: Ejecutar pruebas y comprobaciones estáticas**

Run: `npm test -- tests/scripts/conditioned-main-theme.test.ts`

Expected: PASS.

Run: `node --check scripts/conditioned-main-theme-plan.mjs && node --check scripts/generate-conditioned-main-theme.mjs && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Generar una única candidata mediante API**

Run: `node --env-file=.env.local scripts/generate-conditioned-main-theme.mjs`

Expected: se crean solo `main-theme-conditioned-80s.mp3` y `main-theme-conditioned-80s.json`; no se regeneran las transiciones ni el tema electrónico.

- [ ] **Step 7: Inspección técnica y documentación**

Run: `ffprobe -v error -show_entries format=filename,duration,size -of default=noprint_wrappers=1 artifacts/audio-review/main-theme-conditioned-80s.mp3`

Expected: MP3 reproducible, duración cercana a 80 segundos y tamaño mayor que cero.

Actualizar `docs/audio-validation.md`: marcar Navidad, primavera y fin de curso como aprobadas, registrar el método de condicionamiento y dejar el tema nuevo como “pendiente de validación directa del usuario”.

- [ ] **Step 8: Commit**

```bash
git add scripts/conditioned-main-theme-plan.mjs scripts/generate-conditioned-main-theme.mjs tests/scripts/conditioned-main-theme.test.ts docs/audio-validation.md
git commit -m "feat: generate conditioned main theme"
```

## Verificación final

- [ ] La prueba del plan pasa.
- [ ] `npm run typecheck` y `npm run build` pasan.
- [ ] El MP3 y su manifiesto están ignorados y no hay referencias de producción.
- [ ] La entrega presenta el MP3 al usuario sin emitir un juicio musical.
