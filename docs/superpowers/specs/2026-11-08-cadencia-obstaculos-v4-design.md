# Diseño V4: cadencia de obstáculos más exigente

## Intención

La partida sigue resultando demasiado fácil incluso para una persona que no se considera buena jugando. Esta iteración aumenta la presión del runner sin cambiar su control de un botón, el cansancio, la ratio, el daño ni la velocidad inicial del mundo.

El cambio se concentra en el generador de obstáculos: empieza con la cadencia actual, aumenta durante el curso y persigue una frecuencia final de hasta el doble de la actual. Los huecos deben sentirse variados —a veces el siguiente obstáculo llega antes y otras ofrece un respiro—, pero ninguna secuencia debe convertir el choque en matemáticamente inevitable dentro del modelo de calibración aprobado: pasos estables de 16 ms, energía fijada en 10 y velocidad máxima.

## Estado actual

Los obstáculos no aparecen hoy a una distancia idéntica. El generador elige de forma determinista un hueco continuo entre 260 y 420 píxeles, con una media de 340. Sin embargo, todos los huecos pertenecen a una única distribución moderada, por lo que visualmente el ritmo se percibe regular.

La frecuencia temporal actual depende de dos valores:

- la velocidad del mundo, que ya aumenta por trimestre y dentro de cada trimestre;
- el hueco espacial aleatorio, cuyo rango permanece constante durante todo el curso.

La V4 no vuelve a acelerar el mundo. Reduce progresivamente el hueco medio y hace más contrastada su variabilidad.

## Objetivos

- Mantener la misma cadencia media al inicio del primer trimestre.
- Hacer que los obstáculos aparezcan progresivamente con mayor frecuencia durante todo el curso.
- Perseguir una cadencia nominal final de `2×` respecto al generador actual a la misma velocidad del mundo.
- Alternar huecos cortos, medios y largos de forma perceptible.
- Evitar dos huecos cortos consecutivos.
- Mantener todas las secuencias generadas superables dentro del modelo sintético de 16 ms, energía 10 y velocidad máxima.
- Conservar el generador determinista para que una misma semilla, entradas y secuencia de deltas reproduzcan la misma partida y las pruebas sean estables.

## No objetivos

- No se cambia la velocidad del mundo ni la curva musical aprobada en V3.
- No se modifican salto, gravedad, cajas de colisión, energía, daño, ratio o invulnerabilidad.
- No se corrigen en esta iteración las limitaciones preexistentes de la física con deltas lentos de 40–50 ms; garantizar saltabilidad para todos los ritmos de fotogramas requeriría revisar runtime o física.
- No se añaden obstáculos dobles diseñados como una nueva mecánica.
- No se cambia qué siluetas están disponibles ni su orden estacional.
- No se introduce selector de dificultad.
- No se garantiza que una persona pueda terminar cada trimestre sin chocar; se garantiza que los choques no sean inevitables.

## Riesgos que deben evitarse

- Reducir los huecos hasta impedir aterrizar y volver a saltar entre dos obstáculos.
- Hacer que el primer minuto sea más difícil desde el primer obstáculo.
- Confundir frecuencia de aparición con velocidad de desplazamiento y volver a acelerar todo el escenario.
- Generar secuencias monótonas aunque sus valores numéricos sean distintos.
- Romper la reproducibilidad consumiendo números aleatorios de forma diferente según la tasa de fotogramas.
- Aumentar tanto los choques que el curso se reduzca a transiciones casi inmediatas.
- Presentar la calibración de 16 ms como una garantía para cualquier dispositivo o tasa de fotogramas.

## Enfoques considerados

### 1. Cadencia independiente con azar controlado — elegido

El hueco medio se reduce mediante una curva propia, mientras la selección de cada hueco usa perfiles corto, medio o largo. Es un cambio localizado en el generador existente, se puede probar de forma determinista y no altera el movimiento, la música ni el salto.

### 2. Escalar únicamente el rango actual

Reduciría linealmente `260–420` hasta `130–210`. Es más pequeño, pero conserva la sensación uniforme y permite secuencias de varios huecos mínimos consecutivos.

### 3. Duplicar la velocidad del mundo

Aumentaría indirectamente la frecuencia, pero también la velocidad visual y musical, y pondría en riesgo la saltabilidad ya validada. Se descarta.

## Curva de cadencia

La nueva función pura `gapScaleFor(term, elapsedMs, finalSafeScale)` devuelve un multiplicador aplicado a los perfiles de hueco. `finalSafeScale` es el límite obtenido por calibración. La curva reparte el recorrido desde `1.00` hasta ese límite en tres hitos de progreso global: `0 %`, `30 %`, `60 %` y `100 %`. Cada trimestre interpola linealmente durante sus primeros 60 segundos y después queda limitado.

| Momento | Progreso hacia el límite | Escala si el límite seguro es `0.50` | Frecuencia relativa |
|---|---:|---:|---:|
| Inicio del primer trimestre | `0 %` | `1.00` | `1.00×` |
| Final del primer trimestre | `30 %` | `0.85` | `1.18×` |
| Inicio del segundo trimestre | `30 %` | `0.85` | `1.18×` |
| Final del segundo trimestre | `60 %` | `0.70` | `1.43×` |
| Inicio del tercer trimestre | `60 %` | `0.70` | `1.43×` |
| Final del tercer trimestre | `100 %` | objetivo `0.50` | objetivo `2.00×` |

La escala no retrocede entre trimestres, incluso si la calibración exige un límite superior a `0.50`: los hitos intermedios se recalculan con la misma fórmula. Un descanso recupera energía, pero no devuelve la cadencia al comienzo del curso.

La gracia inicial de 1,5 segundos se conserva en cada trimestre. La curva afecta al hueco elegido después de cada aparición, no al movimiento de obstáculos ya presentes.

## Variabilidad reconocible

En lugar de una única distribución uniforme se usan tres perfiles base, todos expresados antes de aplicar la escala de cadencia:

| Perfil | Rango base | Probabilidad |
|---|---:|---:|
| Corto | `220–280 px` | `30 %` |
| Medio | `300–380 px` | `45 %` |
| Largo | `420–500 px` | `25 %` |

La media ponderada aproximada es 343 píxeles, equivalente a la media actual de 340; por eso el comienzo conserva la frecuencia aprobada aunque el contraste entre huecos sea mayor.

Cada aparición consume exactamente dos valores del generador sembrado:

1. uno selecciona corto, medio o largo según las probabilidades anteriores;
2. otro elige uniformemente una distancia dentro del rango del perfil.

Si se selecciona un perfil corto inmediatamente después de otro corto, el segundo se convierte en medio usando el mismo segundo valor aleatorio. No se realiza otra tirada. Así se evita una ráfaga injusta sin perder reproducibilidad.

El estado guarda `lastGapBand: "short" | "medium" | "long" | null`. Se reinicia a `null` al empezar cada trimestre; el primer hueco de un trimestre puede pertenecer a cualquier perfil.

## Límite de seguridad

`0.50` es un objetivo, no una promesa que prevalezca sobre la saltabilidad. Antes de fijar el valor de producción se ejecutará una calibración determinista sobre candidatos `0.50`, `0.55`, `0.60`, …, `1.00`, en ese orden.

Para cada candidato se simulan, como mínimo:

- los 36 pares ordenados de las seis variantes de obstáculo;
- la velocidad máxima del tercer trimestre;
- energía fijada sintéticamente en 10 durante toda la calibración, que representa un salto corto estable y evita que el fin del trimestre interrumpa la prueba antes de observar suficientes obstáculos;
- pasos de 16 ms;
- perfiles corto, medio y largo en sus extremos inferior y superior;
- una búsqueda razonable de instantes de salto, sin conocimiento imposible del futuro.
- secuencias legales largas de al menos 60 obstáculos, generadas por un conjunto fijo y documentado de semillas, incluyendo cualquier semilla de regresión que haya producido una secuencia insegura durante la calibración.

Se elige la escala final más baja que cumple dos capas:

1. **Invariante componible:** para cada variante y cada extremo de hueco existe una misma política de salto basada solo en el obstáculo visible que lo supera y devuelve al personaje a un estado preparado —en el suelo y con margen para decidir— antes de la siguiente ventana de decisión. Esta condición sobre el hueco mínimo es el argumento general que permite encadenar apariciones, no una enumeración finita de todas las secuencias posibles.
2. **Regresión de secuencias:** cada pareja y el corpus fijo de secuencias largas se completan sin colisión con esa política, energía mantenida en 10 y pasos de 16 ms.

No se permite que la simulación programe un salto gracias a conocer de antemano una tirada futura todavía fuera de pantalla. Las semillas largas son una frontera de regresión, no una afirmación estadística de que se enumeraron todas las partidas. Si una nueva semilla revela un fallo del invariante o de la política, se conserva como regresión y se vuelve a calibrar.

El valor elegido se convierte en una constante explícita y en una expectativa de prueba. Si `0.50` pasa, se alcanza el doble nominal. Si no pasa, la interfaz no promete `2×`: se aplica el máximo seguro resultante, se recalculan los hitos intermedios con la fórmula de progreso y se registra la frecuencia efectiva `1 / escala`. La seguridad y la monotonía prevalecen sobre alcanzar `1.5×`; no se cambian otras mecánicas para forzar esa cifra.

La prueba de seguridad evalúa secuencias completas, no solo que cada obstáculo aislado quede por debajo del punto más alto del salto.

La garantía termina en el modelo sintético indicado. La CI conserva además las pruebas actuales de fotogramas y el recorrido manual se hará en móvil físico o emulado, pero una trayectoria imposible causada por deltas lentos se documentará como limitación preexistente y no se intentará compensar aumentando los huecos de V4, porque un hueco no repara un obstáculo aislado que ya es imposible con esa física.

### Resultado de la calibración

El corpus selecciona `0.95` como primer valor que garantiza aterrizar antes de cada ventana de decisión. Para priorizar la dificultad y la validación manual, producción usa deliberadamente `finalSafeGapScale = 0.50`: la frecuencia final objetivo es `2×` y los hitos quedan en `1.00 → 0.85 → 0.70 → 0.50`. Esta configuración conserva la física y puede generar secuencias donde no se haya aterrizado antes de la siguiente ventana de salto.

## Estado y arquitectura

- `GAME_CONFIG` contiene los perfiles, probabilidades, hitos de progreso `0/0.30/0.60/1` y la escala final calibrada.
- `gapScaleFor(term, elapsedMs)` vive junto a las reglas de generación y no depende del Canvas ni del reloj del navegador.
- `chooseObstacleGap(state, random)` devuelve `{ gap, band }` y consume siempre dos valores aleatorios.
- `spawnObstacle` conserva la rotación estacional de siluetas y usa el nuevo selector únicamente para `nextGap`.
- `GameState.lastGapBand` se inicializa y reinicia con el trimestre; no se acumula en resultados ni se muestra en pantalla.
- La aparición continúa basada en distancia recorrida, de modo que el sistema se integra con el motor actual sin temporizadores nuevos.
- La reproducibilidad se garantiza para la misma semilla, entradas y secuencia de deltas. No se exige que dos navegadores con tasas de fotogramas distintas produzcan una partida idéntica: corregir el descarte actual del exceso de distancia y hacer el runtime independiente de RAF queda fuera de esta iteración.

## Accesibilidad y presentación

No se añade información que el jugador tenga que estudiar. La dificultad se percibe jugando, no mediante un nuevo indicador o texto.

Los anuncios de ratio, energía, trimestre y obstáculos nuevos permanecen iguales. El modo sin animación y la pantalla final no cambian. El juego debe seguir funcionando si el audio está silenciado o bloqueado.

## Validación

- Pruebas unitarias de los seis hitos de `gapScaleFor`, su monotonía y sus límites antes de 0 y después de 60 segundos.
- Pruebas deterministas de selección de bandas, rangos escalados y consumo de exactamente dos valores aleatorios por aparición.
- Prueba de que nunca aparecen dos bandas cortas consecutivas.
- Prueba estadística con semilla fija sobre una muestra grande: media inicial cercana a 343 px y presencia de los tres perfiles, sin exigir aleatoriedad real.
- Pruebas de que la misma semilla, entradas y deltas producen la misma secuencia y semillas distintas producen secuencias distintas.
- Simulación exhaustiva de secuencias de dos obstáculos en el límite calibrado, energía mantenida en 10 y velocidad máxima, exigiendo volver al estado preparado definido por el invariante.
- Simulaciones de al menos 60 obstáculos con semillas fijas, energía mantenida en 10 y decisiones de salto basadas solo en el estado visible; toda semilla insegura descubierta se conserva como regresión.
- Prueba de integración del motor que confirme que durante el tercer trimestre aparecen más obstáculos por minuto que con el generador V3, sin cambiar `worldSpeedFor`.
- CI completa de TypeScript, Vitest, build y Playwright.
- Prueba manual en móvil: tres cursos completos para valorar si el final exige atención constante y si los huecos cortos y largos se distinguen claramente.
- Prueba manual adicional con rendimiento limitado para confirmar que V4 no empeora de forma evidente la limitación preexistente de deltas lentos; no constituye una garantía matemática fuera de 16 ms.

## Criterio de aceptación perceptivo

En el inicio del primer trimestre el ritmo debe sentirse familiar. Al final del tercero, una persona que antes lograba una partida casi perfecta debe afrontar la máxima frecuencia segura obtenida por calibración —con objetivo de hasta `2×` y sin mínimo artificial— y debe poder reconocer pequeñas ráfagas seguidas de descansos más largos. El valor efectivo se documentará como `1 / finalSafeScale` para que el resultado del ajuste sea visible y revisable.

