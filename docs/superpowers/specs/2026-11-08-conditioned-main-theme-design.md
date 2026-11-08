# Tema principal condicionado — diseño

## Intención

Regenerar el candidato principal de 80 segundos como una canción completa nueva
que conserve estrechamente la identidad musical del tema aprobado. No se debe
insertar ni mantener ningún fragmento literal del MP3 original.

## Resultado esperado

- Una única pista instrumental de aproximadamente 80 segundos.
- Toda la canción se genera de nuevo.
- El primer fragmento se condiciona con los primeros 30 segundos del tema
  aprobado usando ElevenLabs Music Inpainting.
- Como el primer fragmento determina el tono de los siguientes, el resto del
  plan continúa con alta adherencia al contexto para mantener motivo, tempo,
  instrumentación y carácter de charanga.
- Sin voces, letras, referencias a artistas, obras o franquicias.
- El resultado permanece en `artifacts/audio-review/` hasta su aprobación.

## Enfoques considerados

1. **Conservar los 40 segundos originales y generar otros 40.** Es una extensión
   literal, pero el usuario la ha descartado porque quiere una canción completa
   nuevamente generada.
2. **Generar una canción nueva condicionando solo el primer fragmento con los
   primeros 30 segundos.** Seleccionado. ElevenLabs indica que el primer fragmento
   influye en todos los posteriores; se reforzará con `condition_strength: xhigh`
   y `context_adherence: high`.
3. **Extraer un plan de la referencia y pedir una nueva composición.** Descartado:
   fue el método anterior y produjo otra melodía sin suficiente continuidad.

## Flujo de API

1. Validar antes de cualquier petición que existe
   `public/audio/approved/main-theme.mp3`.
2. Subirlo mediante `/v1/music/upload` y obtener su `song_id`.
3. Construir manualmente un plan de 80 segundos compuesto solo por fragmentos de
   generación. El primero incluirá `conditioning_ref` con el rango
   `0–30000 ms`, `condition_strength: xhigh` y `context_adherence: high`.
4. Mantener alta adherencia en los fragmentos posteriores y describir la misma
   charanga juguetona, motivo reconocible, instrumentación y tempo.
5. Componer con `music_v2_5`, guardar un candidato nuevo y registrar en el
   manifiesto el `song_id` de origen, el rango condicionado y el plan utilizado.

## Validación

- Confirmar duración y formato con `ffprobe`.
- La validación musical y la comparación con el tema aprobado las realizará
  directamente el usuario; el agente no decidirá si la melodía es suficientemente
  fiel.
- No integrar la pista hasta recibir aprobación explícita.

## Estado de las demás pistas

`holiday-christmas-v3.mp3`, `holiday-spring-v3.mp3` y `course-end-v2.mp3`
quedan aprobadas. No se regeneran en este trabajo.
