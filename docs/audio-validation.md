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
| A | Charanga equilibrada: trompeta y clarinete a unos 112 BPM | Pendiente de generar |
| B | Xilófono juguetón: clarinete, bajo tipo tuba y unos 118 BPM | Pendiente de generar |
| C | Metales enérgicos: llamada y respuesta a unos 124 BPM | Pendiente de generar |

## Criterios antes de enseñar las candidatas

- Duración real cercana a 40 segundos.
- Ausencia de voz, palabras o muestras vocales.
- Volumen comparable entre A, B y C.
- Ataque inmediato y final sin una cola que impida evaluar el bucle.
- Archivos presentes únicamente en `artifacts/audio-review/`.

La candidata elegida seguirá siendo material de revisión hasta que también se
aprueben los tonos de fin de trimestre, vacaciones y efectos. Solo entonces se
podrá integrar un paquete de sonido en el juego.
