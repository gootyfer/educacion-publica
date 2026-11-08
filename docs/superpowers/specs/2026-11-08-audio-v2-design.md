# Audio V2 — diseño

## Intención

Mejorar la identidad musical estacional y simplificar el feedback sonoro del juego. Las nuevas piezas se generan como candidatas externas y solo sustituyen archivos de producción después de una escucha y aprobación explícitas.

## Alcance aprobado

- Generar en ElevenLabs cinco candidatas instrumentales:
  - Navidad, 5 segundos: charanga festiva, cascabeles y campanillas, sin melodías de villancicos existentes.
  - Primavera, 5 segundos: cuerdas barrocas, impulso ligero y carácter primaveral inspirado en la instrumentación de Vivaldi, sin reproducir una melodía reconocible.
  - Fin de curso, 5 segundos: marcha ceremonial de graduación, celebratoria y compatible con el humor del juego, sin citar una obra existente.
  - Tema principal extendido, 80 segundos: usar `public/audio/approved/main-theme.mp3` como referencia para conservar su motivo y carácter de charanga.
  - Tema principal alternativo, 80 segundos: charanga más electrónica, con timbres de videojuego retro y una composición original.
- Guardar las cinco candidatas y sus prompts/metadatos en `artifacts/audio-review/`; no sustituir audios aprobados durante esta fase.
- Presentar los archivos para escucha y esperar aprobación antes de integrarlos.
- Cambiar ya el comportamiento del sonido:
  - al terminar un trimestre no reproducir `term-end.mp3`;
  - después del primer y segundo trimestre reproducir solo Navidad o Primavera;
  - al terminar el tercero reproducir solo Fin de curso;
  - no reproducir sonido al introducir una variante nueva;
  - cualquier colisión reproduce `new-obstacle.mp3`;
  - salto y tema principal de producción permanecen sin cambios hasta la aprobación de sustitutos.

## Enfoques considerados

1. **Flujo por etapas, elegido:** generar fuera de producción, validar por escucha y después integrar. Evita que una generación poco lograda llegue al juego.
2. Sobrescritura inmediata: más rápida, pero elimina la comparación con el paquete aprobado y contradice la validación previa solicitada.
3. Conservar efectos diferenciados por obstáculo: aporta detalle, pero contradice la simplificación pedida para que todos los choques tengan una señal consistente.

## Restricciones y decisiones

- Piezas instrumentales, sin voz ni referencias melódicas a música protegida o franquicias.
- Los audios estacionales y de fin de curso serán señales breves de una sola reproducción, no bucles.
- Los dos temas principales deben empezar con energía, tolerar cambios de `playbackRate` y evitar un fundido final que dificulte el bucle.
- Si ElevenLabs no permite extender directamente desde un archivo de referencia, se usará su función de remix/variación o el identificador de la canción original; no se fingirá continuidad mediante simple concatenación.
- El cambio local preexistente en `src/game/config.ts` pertenece al usuario y queda fuera de este trabajo.

## Validación

- Antes de integrar: duración, formato reproducible, ausencia de voz, volumen razonable y escucha del usuario.
- Para el código: pruebas del controlador que demuestren la ausencia de aviso de obstáculo y tono de trimestre, y el uso de `new-obstacle` en todas las colisiones.
