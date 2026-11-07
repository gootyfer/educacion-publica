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
| `term-end-brass.mp3` | Fin de trimestre, opción de metales | 3,00 s | −25,4 / −7,2 dB |
| `term-end-xylophone.mp3` | Fin de trimestre, opción de xilófono | 3,00 s | −23,7 / −6,6 dB |
| `holiday-christmas.mp3` | Vacaciones de Navidad | 3,48 s | −23,3 / −5,8 dB |
| `holiday-spring.mp3` | Vacaciones de primavera | 3,48 s | −18,6 / −3,7 dB |
| `course-end.mp3` | Fin de curso | 5,00 s | −20,2 / −5,3 dB |
| `sfx-jump.mp3` | Salto | 0,68 s | −19,0 / −3,4 dB |
| `sfx-paper-stamp.mp3` | Papel y sello | 0,88 s | −39,5 / −23,2 dB |
| `sfx-fan-fault.mp3` | Ventilador averiado | 1,36 s | −23,6 / −13,8 dB |
| `sfx-leak-bucket.mp3` | Gotera y cubo | 1,00 s | −27,1 / −1,2 dB |
| `sfx-rubble.mp3` | Cascote ligero | 1,08 s | −31,7 / −8,0 dB |
| `sfx-new-obstacle.mp3` | Aviso de obstáculo nuevo | 0,80 s | −20,7 / −4,1 dB |

Comprobaciones:

- El manifiesto local contiene los once archivos esperados.
- Todos son MP3 reproducibles y sus picos permanecen por debajo de 0 dB.
- No existen rutas de estos archivos en el código del juego.
- `sfx-paper-stamp.mp3` ha resultado mucho más bajo que el conjunto. Si se
  aprueba su carácter, necesitará ganancia o una regeneración antes de entrar
  en producción.
- Las dos firmas de trimestre son alternativas: solo una debería incorporarse.
