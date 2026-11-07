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
