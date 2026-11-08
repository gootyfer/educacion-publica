# Validación de audio

Las candidatas se generan para revisión fuera del juego. Ningún archivo de esta
fase se copia a `public/` ni se referencia desde `src/`.

## Música principal

Parámetros comunes:

- Eleven Music `music_v2_5`.
- 40 segundos, instrumental forzado y MP3 a 48 kHz/192 kbps.
- Motivo original de cuatro o cinco notas, inspiración de charanga y energía de
  juego arcade sin referencias a obras, artistas o franquicias.
- Inicio directo, sin fundido de salida y cierre compatible con un futuro bucle.

| Candidata | Enfoque | Estado de revisión |
| --- | --- | --- |
| A | Charanga equilibrada: trompeta y clarinete a unos 112 BPM | Aprobada el 7 de noviembre de 2026 |
| B | Xilófono juguetón: clarinete, bajo tipo tuba y unos 118 BPM | Pendiente de generar |
| C | Metales enérgicos: llamada y respuesta a unos 124 BPM | Pendiente de generar |

Por petición del 7 de noviembre de 2026, la primera escucha se limita a una
única versión del tema principal: la candidata A. Las variantes B y C no se
generarán salvo que la primera propuesta sea rechazada o se pida una comparación.

## Criterios antes de enseñar las candidatas

- Duración real cercana a 40 segundos.
- Ausencia de voz, palabras o muestras vocales.
- Volumen comparable entre A, B y C.
- Ataque inmediato y final sin una cola que impida evaluar el bucle.
- Archivos presentes únicamente en `artifacts/audio-review/`.

La candidata elegida seguirá siendo material de revisión hasta que también se
aprueben los tonos de fin de trimestre, vacaciones y efectos. Solo entonces se
podrá integrar un paquete de sonido en el juego.

### Comprobación técnica de la candidata A

Revisión del 7 de noviembre de 2026:

- Archivo local: `artifacts/audio-review/main-theme-a.mp3`.
- Duración: 40,032 segundos.
- Formato: MP3 estéreo, 48 kHz y aproximadamente 195 kbps.
- Nivel medio: −17,6 dB; pico máximo: −0,6 dB.
- Instrumental solicitado y forzado mediante el parámetro de la API.
- ElevenLabs introdujo aproximadamente 1,23 segundos de silencio final. El
  usuario aprobó conservarlo sin recorte.
- El archivo y su manifiesto continúan ignorados por Git y no existen
  referencias desde `src/` ni `public/`.

## Paquete sonoro derivado

Generado el 7 de noviembre de 2026 con `eleven_text_to_sound_v3`. Todos los
archivos siguen en `artifacts/audio-review/` y están pendientes de aprobación.

| Archivo | Uso propuesto | Duración | Nivel medio / pico |
| --- | --- | ---: | ---: |
| `term-end-brass.mp3` | Fin de trimestre, opción de metales | 3,00 s | No elegida |
| `term-end-xylophone.mp3` | Fin de trimestre, opción de xilófono | 3,00 s | Aprobada |
| `holiday-christmas.mp3` | Vacaciones de Navidad | 3,48 s | Rechazada; regenerar final |
| `holiday-spring.mp3` | Vacaciones de primavera | 3,48 s | Rechazada; regenerar final |
| `course-end.mp3` | Fin de curso | 5,00 s | Aprobada |
| `sfx-jump.mp3` | Salto | 0,68 s | Aprobado |
| `sfx-paper-stamp.mp3` | Papel y sello | 0,88 s | Carácter aprobado; volumen insuficiente |
| `sfx-fan-fault.mp3` | Ventilador averiado | 1,36 s | Carácter aprobado; volumen insuficiente |
| `sfx-leak-bucket.mp3` | Gotera y cubo | 1,00 s | Aprobado |
| `sfx-rubble.mp3` | Cascote ligero | 1,08 s | Aprobado |
| `sfx-new-obstacle.mp3` | Aviso de obstáculo nuevo | 0,80 s | Aprobado |

Comprobaciones:

- El manifiesto local contiene los once archivos esperados.
- Todos son MP3 reproducibles y sus picos permanecen por debajo de 0 dB.
- No existen rutas de estos archivos en el código del juego.
- `sfx-paper-stamp.mp3` ha resultado mucho más bajo que el conjunto. Si se
  aprueba su carácter, necesitará ganancia o una regeneración antes de entrar
  en producción.
- Las dos firmas de trimestre son alternativas: solo una debería incorporarse.

### Segunda revisión solicitada

Tras el feedback del usuario se prepararon cuatro archivos de sustitución:

| Archivo | Cambio | Duración | Nivel medio / pico |
| --- | --- | ---: | ---: |
| `holiday-christmas-v2.mp3` | Nueva composición y nuevo final | 5,00 s | −14,0 / −2,3 dB |
| `holiday-spring-v2-louder.mp3` | Nueva composición, nuevo final y +10 dB | 5,00 s | −24,5 / −4,0 dB |
| `sfx-paper-stamp-louder-v2.mp3` | Mismo efecto original con +18 dB | 0,88 s | −22,0 / −5,6 dB |
| `sfx-fan-fault-louder.mp3` | Mismo efecto original con +6 dB | 1,36 s | −17,9 / −8,1 dB |

Estos cuatro archivos quedan pendientes de una última escucha. Las versiones
originales rechazadas o con volumen insuficiente permanecen fuera de producción.

### Aprobación del paquete

Paquete aprobado por el usuario el 7 de noviembre de 2026. Archivos exactos
seleccionados para producción:

- `main-theme-a.mp3`
- `term-end-xylophone.mp3`
- `holiday-christmas-v2.mp3`
- `holiday-spring-v2-louder.mp3`
- `course-end.mp3`
- `sfx-jump.mp3`
- `sfx-paper-stamp-louder-v2.mp3`
- `sfx-fan-fault-louder.mp3`
- `sfx-leak-bucket.mp3`
- `sfx-rubble.mp3`
- `sfx-new-obstacle.mp3`

Las demás variantes quedan rechazadas o sin seleccionar y no deben copiarse a
producción.

### Integración de producción

Los once archivos aprobados se copiaron a `public/audio/approved/` con nombres
estables. La integración incluye música en bucle cuya velocidad aumenta
progresivamente de `1×` a `1,24×` con la velocidad del mundo, firma de xilófono,
transiciones, fin de curso y efectos diferenciados. El control de silencio es
persistente y cualquier fallo de reproducción o almacenamiento se trata como
opcional: nunca detiene el juego.

Ninguna variante rechazada, pista de metales ni primera versión de vacaciones
forma parte del directorio público.

## Segunda pasada musical (Audio V2)

Por decisión del usuario del 8 de noviembre de 2026, todas las generaciones se
realizan mediante la API de ElevenLabs y quedan fuera de producción hasta una
escucha explícita. El flujo reproducible está en
`scripts/generate-audio-v2.mjs` y produce:

- `holiday-christmas-v3.mp3`: charanga navideña con cascabeles, campanillas y
  glockenspiel, sin melodía de villancico.
- `holiday-spring-v3.mp3`: cuerdas barrocas, violín solista, clave y maderas,
  sin citar una melodía clásica reconocible.
- `course-end-v2.mp3`: marcha ceremonial de graduación original.
- `main-theme-electronic-80s.mp3`: charanga electrónica y timbres arcade retro.
- `main-theme-extended-80s.mp3`: generación de 80 segundos condicionada por un
  plan extraído mediante API de los primeros 30 segundos del tema aprobado.

La referencia se sube con `/v1/music/upload`, se transforma en un plan de 80
segundos con `/v1/music/plan` y se compone con Music v2.5. ElevenLabs documenta
que Audio Reference guía estilo, instrumentación, tempo y producción, pero no
copia ni remezcla literalmente la pista original.

La candidata existente se generó con ese recorte de 30 segundos y su manifiesto
conserva ese origen real. Para futuras ejecuciones, el generador lee y valida
`public/audio/approved/main-theme.mp3` completo antes de hacer ninguna petición a
la API; así, un checkout limpio no depende de un recorte ignorado ni puede
consumir créditos si falta la referencia.

Generación completada mediante API el 8 de noviembre de 2026:

| Candidata | Duración real | Estado |
| --- | ---: | --- |
| `holiday-christmas-v3.mp3` | 5,00 s | Aprobada el 8 de noviembre de 2026 |
| `holiday-spring-v3.mp3` | 5,00 s | Aprobada el 8 de noviembre de 2026 |
| `course-end-v2.mp3` | 5,00 s | Aprobada el 8 de noviembre de 2026 |
| `main-theme-electronic-80s.mp3` | 80,04 s | Pendiente de escucha |
| `main-theme-extended-80s.mp3` | 80,04 s | Rechazada: generó otra melodía |

El manifiesto `artifacts/audio-review/audio-v2-manifest.json` conserva prompts,
modelos, métodos, tamaños e identificadores de canción. Ningún archivo de esta
tabla se ha copiado a producción.

### Tema completo condicionado mediante inpainting

Tras descartar la falsa extensión, se generó
`main-theme-conditioned-80s.mp3` con un plan manual de Music v2.5 formado por
cuatro fragmentos de generación de 20 segundos. Ninguno inserta audio original.
El primero usa `conditioning_ref` sobre los primeros 30 segundos del tema
aprobado, `condition_strength: xhigh` y `context_adherence: high`; los tres
fragmentos posteriores mantienen alta adherencia al contexto creado por el
primero.

- Duración real: 80,04 segundos.
- Método: subida de referencia + plan condicionado + composición Music v2.5.
- Estado: aprobada por el usuario el 8 de noviembre de 2026.
- Manifiesto: `artifacts/audio-review/main-theme-conditioned-80s.json`.
- Integración: la candidata original de 80,04 segundos se conserva intacta en
  revisión. Una copia MP3 sin recodificar, cortada a 78,048 segundos, sustituye
  `public/audio/approved/main-theme.mp3` y se reproduce en bucle.
