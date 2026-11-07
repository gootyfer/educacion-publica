# Validación del prototipo

**Revisión interna:** 7 de noviembre de 2026
**Entorno:** Chromium, viewport móvil y escritorio

## Comprobado

- Los controles se entienden desde la portada y solo requieren tocar o pulsar espacio.
- La ratio creciente se muestra en el HUD, aumenta el desgaste y reduce gradualmente el salto.
- El alumnado acompaña al docente y no recibe colisiones; los obstáculos son burocracia, climatización e infraestructura.
- La pantalla final permite recordar al menos dos motivos de la protesta y explica explícitamente la relación entre ratio, energía y salto.
- El tono se dirige a situaciones y carencias, sin caricaturas de figuras políticas ni lenguaje partidista.
- Las cuatro cifras distinguen fuentes oficiales, sindicales e información de prensa, con cautelas visibles.
- La portada, las vacaciones y el resultado se revisaron visualmente en 390×844 y 844×390: no hay recortes ni solapamientos y la jerarquía se mantiene legible.
- La portada panorámica usa dos columnas para conservar instrucciones y controles dentro de la primera pantalla.
- La @ aparece una sola vez por menú como marca secundaria; no compite con la información ni se usa como control.
- La fuente manual Schoolbell se empaqueta con la aplicación y el cuerpo conserva una tipografía de sistema redondeada y legible.
- Axe no detecta problemas serios o críticos en portada, ambas vacaciones ni resultado; el recorrido completo funciona con teclado.
- Se añadió una regresión específica para asegurar que la portada permanezca oculta al jugar en 844×390.

## Validación pendiente con público general

1. Probar con al menos cinco personas ajenas a la comunidad educativa si interpretan al alumnado como responsabilidad y no como carga.
2. Medir si pueden nombrar dos reivindicaciones después de una sola partida.
3. Ajustar frecuencia de obstáculos y desgaste tras observar partidas reales; no cambiar simultáneamente más de un parámetro.
4. Comprobar rendimiento táctil en un móvil físico antiguo, además de los viewports emulados.
5. Revisar el texto compartido con organizaciones convocantes antes de una difusión pública amplia.
