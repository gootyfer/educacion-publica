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
- El curso completo enlaza los tres trimestres, las dos vacaciones y el resultado acumulado; cada trimestre empieza algo más rápido que el anterior.
- Las seis siluetas aparecen progresivamente y la alternativa textual las enumera junto con su estacionalidad.
- Solo los once audios aprobados están en `public/audio/approved/`; las versiones rechazadas no forman parte del build.
- La música usa tres velocidades hasta 1,15×, se pausa en vacaciones y convive con firma de trimestre, finales y efectos sin controlar el estado del juego.
- El botón de sonido tiene nombre accesible, conserva la preferencia y mantiene la partida operativa con reproducción rechazada, archivos ausentes o `localStorage` bloqueado.
- `npm run ci` completa 48 pruebas unitarias, build de producción y 17 recorridos Playwright.
- El build funciona con recursos locales: fuente, código, cifras y audio no requieren peticiones de red durante la partida.

## Recorrido de QA interno

- 390×844: portada, partida, HUD, tres estaciones, vacaciones, resultado, repetición y control de sonido.
- 844×390: portada en dos columnas, Canvas contenido en viewport, resultado sin reaparición de la portada y botón de sonido separado del contenido.
- Teclado: foco de inicio, salto con espacio, continuación de vacaciones, resultado enfocado y repetición.
- Sonido activado y silenciado: la preferencia cambia de forma accesible; las pruebas instrumentadas confirman que no hay reproducción antes de interactuar y que el silencio impide los eventos posteriores.
- Degradación: la partida continúa cuando todos los `play()` se rechazan y cuando las rutas de audio se abortan.

## Validación pendiente con público general

1. Probar con al menos cinco personas ajenas a la comunidad educativa si interpretan al alumnado como responsabilidad y no como carga.
2. Medir si pueden nombrar dos reivindicaciones después de una sola partida.
3. Ajustar frecuencia de obstáculos y desgaste tras observar partidas reales; no cambiar simultáneamente más de un parámetro.
4. Comprobar rendimiento táctil en un móvil físico antiguo, además de los viewports emulados.
5. Revisar el texto compartido con organizaciones convocantes antes de una difusión pública amplia.

### Guion mínimo de prueba

Después de una sola partida, sin explicar previamente las metáforas, preguntar:

1. ¿Qué crees que representa que el salto se haga más corto?
2. ¿Por qué aumenta el número de alumnos y qué efecto tiene?
3. ¿Qué obstáculos recuerdas y cuáles relacionas con cada trimestre?
4. ¿Interpretaste al alumnado como una carga o como una responsabilidad que exige más energía y apoyos?
5. ¿Qué dos reivindicaciones explicarías a otra persona?

Registrar respuestas literales y el dispositivo utilizado. Si se ajusta el
equilibrio, cambiar un único parámetro por iteración para poder atribuir el
resultado observado.
