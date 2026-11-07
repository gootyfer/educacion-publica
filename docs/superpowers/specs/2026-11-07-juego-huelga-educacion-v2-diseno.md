# Diseño V2: un curso docente en tres trimestres

**Fecha:** 7 de noviembre de 2026
**Estado:** borrador para aprobación
**Parte de:** `2026-11-06-juego-huelga-educacion-diseno.md`

## Intención

La segunda versión conserva el runner móvil de un botón y su propósito: ayudar a la población general a comprender por qué protesta el profesorado de la educación pública madrileña y ponerse en su lugar. La ampliación convierte una única jornada abstracta en un curso breve de tres trimestres, con progresión, estaciones, descansos y una banda sonora memorable.

La idea central se mantiene: **la habilidad ayuda, pero no compensa indefinidamente unas condiciones que consumen cada vez más energía**. El alumnado acompaña al docente y nunca funciona como obstáculo ni recibe colisiones.

## Objetivos de esta versión

- Hacer la partida más variada y rejugable sin añadir controles.
- Dar importancia a los choques sin terminar toda la experiencia al primero.
- Permitir que la mayoría de jugadores descubra los seis obstáculos y los cuatro datos finales.
- Representar un curso completo mediante tres partidas cortas conectadas.
- Hacer perceptible el aumento de dificultad mediante velocidad, ratio y variedad, sin combinaciones injustas.
- Adoptar una identidad visual reconocible inspirada en la camiseta verde de la educación pública.
- Añadir música y efectos originales que refuercen ritmo, humor y transiciones.

## No objetivos

- Añadir agacharse, ataques, inventario, monedas, potenciadores o controles nuevos.
- Convertir el calendario escolar en una simulación realista.
- Crear tres juegos distintos o tres bandas sonoras completamente independientes.
- Hacer que el sonido sea necesario para jugar o entender el mensaje.
- Copiar melodías, personajes, sonidos o recursos gráficos de otros videojuegos.
- Introducir cifras nuevas o sustituir la revisión editorial ya realizada.

## Antiobjetivos

La versión habrá fallado si:

- Los trimestres se perciben como tres vidas con un nombre decorativo y no como partes de un curso.
- La suma de energía, choques, ratio, velocidad, estaciones y puntuación exige estudiar reglas.
- Un jugador medio queda atrapado repitiendo solo el comienzo y no ve el contenido avanzado.
- La reducción del salto o la aceleración hace inevitable un obstáculo.
- La estética de protesta reduce la legibilidad o parece partidista.
- La música cansa, tapa los efectos o no puede silenciarse.
- Los efectos se disparan continuamente hasta convertirse en ruido.

## Enfoques considerados

### Estructura de fallo

1. **Energía continua en una única partida.** Es la solución actual y comunica cansancio, pero los choques se sienten poco importantes y la variedad se agota pronto.
2. **Un choque termina toda la partida.** Reproduce la tensión del dinosaurio de Chrome, pero impide a muchas personas ver obstáculos avanzados y debilita la metáfora de acumulación.
3. **Curso de tres trimestres — elegido.** Cada trimestre conserva la energía y tolera uno o dos choques normalmente; al agotarse, llega una transición vacacional y empieza la siguiente ronda. El resultado se acumula durante el curso.

### Progresión de dificultad

1. **Reducir huecos.** Aumenta la frecuencia, pero puede producir secuencias injustas.
2. **Aumentar velocidad y reducir huecos.** Escala demasiado junto al cansancio y la ratio.
3. **Aumentar progresivamente la velocidad con huecos espaciales seguros — elegido.** Los obstáculos recorren antes la misma distancia, por lo que también aumenta su frecuencia temporal, como en un runner clásico.

### Identidad visual

1. **Camiseta completa.** Todo verde, letras manuales y muchos dibujos. Se descartó por saturación y dificultad de lectura.
2. **Sistema híbrido limpio — elegido.** Cabeceras verdes, títulos manuales blancos y contenido sobre crema limpio. Una sola arroba o dibujo por pantalla como máximo.
3. **Cartel de manifestación.** Papel, brochazos y collage. Se descartó porque se alejaba de la referencia concreta y competía con los datos.

### Música

1. **Una canción distinta por trimestre.** Aporta variedad, pero triplica generación, peso, revisión y riesgo de que la experiencia pierda identidad.
2. **Una sola pieza sin adaptación.** Es sencilla, pero no acompaña la aceleración.
3. **Un tema adaptable y transiciones breves — elegido.** Una melodía principal de charanga arcade se acelera suavemente; vacaciones y final de trimestre reutilizan su motivo.

## Bucle completo del curso

1. El jugador inicia el primer trimestre con energía completa.
2. El docente corre automáticamente con su grupo; tocar o pulsar espacio hace saltar solo al docente.
3. La ratio sube a intervalos y acelera el consumo de energía. Al bajar la energía, el salto se acorta de forma gradual.
4. La velocidad del mundo aumenta suavemente hasta un límite. Los huecos se mantienen dentro de un rango espacial comprobado como saltable.
5. Chocar resta energía y concede invulnerabilidad breve. No existe un contador de golpes: la única condición visible para terminar el trimestre es energía cero.
6. Al llegar a cero suena la firma de fin de trimestre, aparece un resumen breve y comienza la transición de vacaciones.
7. El siguiente trimestre recupera la energía, pero empieza un poco más difícil que el anterior.
8. Tras el tercer trimestre se muestra el resultado acumulado, la traducción de las metáforas y los cuatro datos verificados.

Todas las personas que comiencen una partida podrán jugar los tres trimestres. No existe una derrota total anticipada.

## Estado que se reinicia y estado que se conserva

### Se reinicia al comenzar cada trimestre

- energía a 100;
- posición vertical y estado del salto;
- obstáculos presentes en pantalla;
- invulnerabilidad;
- tiempo interno usado para la progresión de ese trimestre.

### Se conserva durante el curso

- trimestre actual;
- tiempo y distancia totales;
- impactos acumulados por familia;
- ratio máxima alcanzada;
- obstáculos ya presentados al jugador;
- puntuación acumulada del curso.

La puntuación principal será el **tiempo total acumulado** durante los tres trimestres, no una fórmula opaca de monedas o bonificaciones. La distancia podrá mostrarse como dato secundario, pero no determinará el récord. El récord personal se calculará comparando el tiempo total del curso completo.

## Dificultad por trimestre

Los valores exactos son parámetros de equilibrio, no estadísticas educativas. Como punto de partida para pruebas:

- El curso completo debe durar normalmente entre tres y cuatro minutos, incluidas las dos transiciones.
- Cada trimestre debe durar normalmente entre 55 y 75 segundos; los choques pueden acortarlo.
- **Primer trimestre:** velocidad y ratio iniciales de referencia.
- **Segundo trimestre:** velocidad inicial aproximadamente un 8–10 % mayor y ratio inicial un paso por encima.
- **Tercer trimestre:** otro 8–10 % de velocidad inicial y otro paso de ratio.
- Dentro de cada trimestre, velocidad y ratio continúan aumentando.
- El inicio de un trimestre ofrece un respiro respecto al final del anterior, pero nunca vuelve al nivel inicial del curso.
- La velocidad máxima queda limitada a un rango en el que todos los obstáculos siguen siendo evitables con el salto mínimo.

La intención de equilibrio es que una persona pueda soportar normalmente uno o dos choques por trimestre. Esto se consigue ajustando daño y desgaste; no se codifica como regla ni se muestra como contador.

## Obstáculos y calendario

Se conservan las seis propuestas visuales aprobadas:

1. pila alta de formularios con sellos;
2. carro archivador desbordado de documentos;
3. termómetro con aparato de climatización o ventilador averiado;
4. climatización inútil bajo sol intenso;
5. gotera y cubo;
6. pared agrietada con barrera de mantenimiento.

Los números son referencias de producción y nunca se muestran al jugador.

La progresión estacional sustituye definitivamente el antiguo desbloqueo numérico rígido. El orden aprobado es:

- **Comienzo del primer trimestre:** pila de formularios, carro archivador y variante fría del termómetro o la climatización.
- **Final del primer trimestre:** pueden incorporarse paredes agrietadas y obras de forma poco frecuente.
- **Segundo trimestre:** continúan papeles, frío y desperfectos; se incorporan goteras y más infraestructura.
- **Tercer trimestre:** continúan papeleo de cierre y desperfectos; se incorporan calor, sol y ventiladores o climatización averiada.

La familia climática puede cambiar de apariencia —termómetro azul o radiador averiado en frío; termómetro rojo, sol o ventilador en calor— sin cambiar su caja de colisión ni comportamiento. La burocracia aparece todo el curso con textos o detalles estacionales. La pared agrietada puede aparecer en cualquier trimestre.

Hay exactamente tres siluetas disponibles al comienzo: pila de formularios, carro archivador y clima frío. El resto se presenta progresivamente según el orden estacional anterior y cada nueva silueta recibe una única señal breve; sus apariciones posteriores no reproducen esa señal.

No habrá obstáculos dobles en la primera implementación de la V2. Un generador deberá garantizar tiempo de reacción y saltabilidad incluso con energía baja y velocidad máxima.

## Personaje y símbolos

El personaje aprobado es una docente adulta, amable y expresiva, de lectura clara en tamaño móvil. Corre con camiseta verde esmeralda inspirada en la camiseta de la educación pública. En el pecho lleva una arroba blanca grande y sencilla, legible cuando el sprite se reduce.

La camiseta real funciona como referencia de color y lenguaje gráfico, no se reproduce literalmente ni se intenta colocar su frase completa en el personaje.

Símbolos:

- **Arroba blanca:** identidad del personaje, educación inclusiva y firma gráfica de la interfaz. Se usa con moderación y nunca como obstáculo o premio.
- **Lazo verde:** solidaridad y extensión de la protesta. Aparece en fondos del mundo, atado a verjas, farolas o puentes; aumenta gradualmente a lo largo del curso. No es coleccionable, botón ni obstáculo.

## Interfaz visual

La V2 conserva la estructura accesible actual y cambia su lenguaje visual:

- verde esmeralda de la camiseta como color principal;
- blanco, crema cálido y verde muy oscuro como base;
- coral reservado a alertas o a la ratio;
- cabeceras verdes casi planas, con textura de tejido apenas perceptible;
- fondo crema limpio para párrafos, resultados y fuentes;
- títulos blancos de apariencia manual solo en encabezados;
- tipografía redondeada y altamente legible para cuerpo, cifras, botones y enlaces;
- una arroba o un dibujo blanco como máximo por pantalla;
- sin lazo verde en menús: queda reservado al mundo del juego;
- botones grandes, contraste suficiente y espacios amplios.

La introducción muestra título, personaje pequeño, explicación breve, botón principal, alternativa textual y control. La pantalla final muestra primero resultado acumulado y revancha; después metáforas, datos, fuentes y acciones informativas.

La cifra y el texto de las maquetas generadas durante el diseño eran ilustrativos y no se usarán. Se conservan exclusivamente las fichas editoriales y fuentes verificadas de la versión actual.

## Transiciones de vacaciones

Las transiciones duran aproximadamente entre dos y cuatro segundos y pueden saltarse después del primer instante. No deben parecer anuncios ni pantallas de carga.

### Navidad

- resumen muy breve del primer trimestre;
- recuperación visual de energía;
- campanillas juguetonas derivadas del motivo principal, sin convertirse en villancico;
- indicación clara de que comienza el segundo trimestre.

### Semana Santa

- resumen muy breve del segundo trimestre;
- recuperación visual de energía;
- acento ligero y primaveral, sin música religiosa ni procesional;
- indicación clara de que comienza el tercer trimestre.

En modo de movimiento reducido, las transiciones son estáticas. Con sonido desactivado, siguen siendo comprensibles mediante texto y animación visual breve.

## Diseño sonoro

### Tema principal

- una única composición instrumental original de 35–45 segundos;
- inspiración de charanga y arcade: percusión ligera, bajo juguetón, xilófono y viento;
- sin voces;
- comienzo y final adecuados para repetición mediante edición o fundido cruzado;
- motivo reconocible de cuatro o cinco notas que identifica todo el juego;
- tres escalones discretos de tempo ligados a la velocidad del mundo, con aumento máximo aproximado del 12–15 %;
- el segundo y tercer trimestre comienzan con un tempo base ligeramente superior.

Se prioriza que el cambio de tempo no altere el tono de forma molesta. La implementación utilizará preservación de tono cuando el navegador la permita; el rango limitado debe seguir siendo aceptable cuando no esté disponible.

### Firma de fin de trimestre

Cuando la energía llega a cero:

1. la música principal baja o se corta rápidamente;
2. suena una variación original de dos segundos basada en el motivo principal;
3. la variación usa metales descendentes, redoble corto y remate cómico;
4. tras el resumen suena el acento de vacaciones;
5. comienza el tema principal del trimestre siguiente.

Tras el tercer trimestre, el mismo motivo termina con una resolución algo más larga que conduce a resultados. La función narrativa se inspira en las firmas memorables de los juegos arcade, pero no copia melodía, ritmo, timbre ni arreglo de ninguna obra existente.

### Efectos

- salto: sonido corto, elástico y discreto;
- choque con burocracia: papel, sello o archivador;
- choque climático: ventilador, traqueteo o climatización averiada;
- choque de infraestructura: cubo, yeso o cascote ligero;
- obstáculo nuevo: señal breve reproducida una sola vez;
- interfaz: solo los botones principales necesitan confirmación sonora.

Todos comparten la paleta de charanga arcade. La música permanece por debajo de los efectos y ambos pueden silenciarse. El estado de silencio se recuerda localmente. El sonido comienza únicamente tras una interacción del usuario para respetar las restricciones de reproducción automática.

### Generación prevista

- tema mediante Eleven Music, preferentemente `music_v2_5`, sujeto a disponibilidad, plan y licencia de la cuenta;
- efectos puntuales mediante ElevenLabs Sound Effects, preferentemente el modelo vigente no obsoleto;
- la clave de API nunca se incluye en el cliente, repositorio ni sitio publicado;
- la generación se realiza durante desarrollo y los archivos finales optimizados se sirven de forma estática;
- antes de integrar se escuchan y aprueban el bucle, la firma y los efectos;
- si la salida no enlaza limpiamente, se edita con un fundido cruzado; no se genera música en tiempo real durante la partida.

## Accesibilidad y preferencias

- El juego sigue siendo totalmente comprensible sin sonido.
- Existe un control visible de silencio con etiqueta accesible; el estado no se comunica solo mediante icono.
- `prefers-reduced-motion` elimina aceleraciones visuales decorativas y deja transiciones estáticas.
- El aumento de velocidad no cambia el tamaño de las zonas táctiles ni exige gestos adicionales.
- La @, el lazo y los colores nunca son la única forma de comunicar estado.
- La alternativa textual se actualiza para explicar los tres trimestres y la estacionalidad.

## Pantalla final y resultado

La pantalla final conserva los cuatro datos verificados actuales y añade un resumen del curso:

- tiempo total acumulado como puntuación principal;
- distancia total, solo como dato secundario si la interfaz mantiene suficiente claridad;
- resultado por trimestre;
- ratio máxima;
- impactos por familia;
- obstáculos y estaciones descubiertos;
- récord personal del curso completo.

La explicación aclara que recuperar energía durante vacaciones no elimina la ratio, las condiciones materiales ni la carga de trabajo. Después aparecen las fuentes y acciones ya aprobadas.

## Validación

Además de las preguntas de la V1, las pruebas con público general deberán comprobar:

- si se entiende por qué la experiencia continúa después de energía cero;
- si los tres trimestres se perciben como un curso y no como vidas;
- si las vacaciones resultan divertidas sin trivializar el desgaste;
- si la dificultad aumenta de forma perceptible pero justa;
- si cada obstáculo se identifica sin explicación previa;
- si el motivo musical y la firma de fin de trimestre se recuerdan;
- si música y efectos cansan después de un curso completo;
- si la identidad verde se reconoce sin parecer propaganda partidista;
- si la @ y los lazos se interpretan como símbolos de inclusión y apoyo.

## Alcance de implementación

Incluido en esta V2:

- curso de tres trimestres y resultados acumulados;
- recuperación de energía y dificultad inicial creciente;
- aceleración progresiva limitada;
- seis diseños de obstáculo con selección estacional;
- variante fría y cálida de la familia climática;
- personaje con camiseta verde y @ blanca;
- lazos verdes ambientales;
- interfaz híbrida limpia en inicio, instrucciones y resultados;
- Navidad y Semana Santa como transiciones;
- un tema adaptable, firma de fin de trimestre y conjunto mínimo de efectos;
- controles de sonido, movimiento reducido y alternativa textual;
- pruebas automáticas de estado, progresión, saltabilidad, audio y accesibilidad.

Fuera de alcance por ahora:

- tres canciones completas independientes;
- obstáculos dobles o aéreos;
- tablas de clasificación, cuentas o servidor;
- música generada durante la partida;
- nuevos datos editoriales o comparaciones no verificadas;
- personalización del personaje;
- niveles infinitos después del tercer trimestre.

## Decisiones dejadas a construcción

- Valores finales de daño, drenaje, velocidades, huecos e intervalos, siempre dentro de los objetivos de equilibrio anteriores.
- Familia tipográfica abierta concreta y método de servirla sin seguimiento externo.
- Técnica exacta de animación del personaje, lazos y transiciones dentro del Canvas existente.
- Formato final y compresión de audio según compatibilidad y peso.
- Texto humorístico exacto, sujeto a una revisión para evitar culpabilización o afirmaciones fácticas nuevas.
- Diseño interno del gestor de audio y del estado del curso.

## Fuentes técnicas de audio consultadas

- ElevenLabs, *Eleven Music*: https://elevenlabs.io/docs/overview/capabilities/music
- ElevenLabs, *Sound effects*: https://elevenlabs.io/docs/overview/capabilities/sound-effects
- ElevenLabs, *Compose music API*: https://elevenlabs.io/docs/api-reference/music/compose
