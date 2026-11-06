# Diseño: juego de empatía sobre la huelga educativa de Madrid

**Fecha:** 6 de noviembre de 2026  
**Estado:** borrador para aprobación

## Intención

Crear una experiencia web breve y humorística para que la población general comprenda por qué protesta el profesorado de la educación pública madrileña y pueda ponerse en su lugar. El juego no pretende explicar toda la negociación laboral: convierte varias presiones acumulativas de una jornada docente en una mecánica conocida y termina relacionándolas con datos verificables.

La idea central es: **jugar mejor ayuda, pero no compensa indefinidamente una ratio creciente y unos recursos insuficientes**.

## Público

Población general, especialmente personas que no conocen en detalle el conflicto. No se presupone conocimiento de terminología sindical, estructura del sistema educativo ni videojuegos más allá de interacciones básicas en el móvil.

## Objetivos

- Generar empatía con el profesorado mediante una experiencia de aproximadamente uno o dos minutos.
- Explicar que las reivindicaciones afectan a la calidad de la atención que recibe el alumnado, no solo a la comodidad del personal.
- Presentar de forma memorable cuatro presiones: ratios, carga de trabajo y burocracia, condiciones térmicas e insuficiencia de tiempo o apoyos.
- Permitir comprobar las cifras, conocer las reivindicaciones y compartir el juego.
- Funcionar directamente en el navegador móvil sin instalación.

## No objetivos

- Simular fielmente toda una jornada docente.
- Representar todas las etapas educativas o todas las reivindicaciones en la primera versión.
- Persuadir mediante ataques personales a responsables políticos.
- Comparar exhaustivamente presupuestos de centros públicos y concertados en la primera versión.
- Crear un censo propio de centros sin climatización antes del primer prototipo.
- Incluir tablas salariales complejas durante la partida.

## Antiobjetivos

El proyecto habrá fallado si:

- Presenta al alumnado, la diversidad o las necesidades educativas como problemas u obstáculos.
- Hace afirmaciones rotundas que las fuentes disponibles no sostienen, como que Madrid tiene necesariamente los docentes peor pagados o el coste de vida más alto de España.
- Se percibe como propaganda partidista, sermón, ataque personal o trivialización de la huelga.
- La mecánica requiere explicación o controles difíciles en móvil.
- El jugador tiene que vigilar colisiones individuales de varios personajes.
- La información y las fuentes interrumpen el ritmo de la carrera.

## Contexto comprobado

La huelga indefinida de la enseñanza pública madrileña comenzó el 14 de octubre de 2026. Entre sus ejes están salarios y poder adquisitivo, reducción de ratios y horas lectivas, atención a la diversidad, infraestructuras y financiación. Las movilizaciones continuaron el 4 y 5 de noviembre y el comité de huelga busca abrir una negociación con la Consejería.

El diseño se apoya inicialmente en estos datos y fuentes:

- El Consejo Escolar de la Comunidad de Madrid indica que en 2023-2024 la ratio de alumnado por profesor fue 1,6 puntos superior a la media nacional; en los centros públicos, 1,9 puntos superior. Fuente: *Informe 2025 sobre el sistema educativo en la Comunidad de Madrid*, capítulo B.
- La Encuesta de Presupuestos Familiares del INE sitúa a Madrid entre las comunidades con mayor gasto medio por persona en 2025. Esto es un indicador de gasto, no un índice completo del coste de vida.
- Una comparativa sindical de UGT de 2026 sitúa la retribución docente de Madrid en la zona media y por debajo de varias comunidades según cuerpo y antigüedad. Cualquier cifra usada deberá indicar supuesto, fecha, salario bruto y fuente.
- Existen casos documentados de temperaturas inadecuadas en centros, pero no se ha localizado un inventario público completo que permita afirmar qué porcentaje de las aulas madrileñas carece de climatización.
- La Comunidad anunció 40 nuevas aulas TEA para 2026-2027. El número de aulas no permite por sí solo concluir si el personal o los apoyos son suficientes.

Las cifras definitivas se someterán a una ficha editorial antes de publicarse: texto exacto, unidad, periodo, ámbito, fuente primaria cuando exista, enlace, fecha de consulta y limitaciones.

## Enfoques considerados

### 1. Runner de un botón inspirado en el dinosaurio de Chrome — elegido

Una mecánica conocida, inmediata y compatible con móvil. El humor y el mensaje se concentran en los obstáculos, la ratio creciente, el cansancio y el informe final. Es la opción con mejor equilibrio entre alcance, coste y capacidad de generar empatía.

### 2. Simulador de decisiones en un aula

Permitía representar mejor los dilemas de atención, pero exigía varias reglas, controles y métricas. Se descartó porque la complejidad competía con el mensaje y elevaba mucho el coste de la primera versión.

### 3. Calculadora satírica interactiva

Era la alternativa más barata y rigurosa para comparar tiempo, ratio y gastos. Se descartó como formato principal porque informa mejor de lo que hace sentir. Podría reutilizarse más adelante como contenido complementario.

## Mecánica central

### Bucle de juego

1. Un profesor o profesora corre automáticamente.
2. El jugador toca cualquier parte de la pantalla para saltar.
3. Un grupo de alumnos sigue al personaje mediante animación. Solo el docente tiene colisión; el grupo nunca se controla ni choca de forma individual.
4. Periódicamente se incorporan alumnos al grupo y aumenta el contador de ratio. Los avisos usan humor administrativo, por ejemplo: “Se incorporan 4 alumnos; apoyos adicionales: 0”.
5. La ratio creciente acelera el consumo de energía. La metáfora explícita es que atender adecuadamente a más personas requiere más energía; el alumnado no constituye una carga física.
6. Al bajar la energía, el salto pierde altura de forma gradual y predecible. El personaje muestra señales visuales de cansancio.
7. Chocar con un obstáculo consume energía adicional y concede unos instantes de invulnerabilidad para evitar golpes encadenados.
8. Cuando la energía llega a cero, aparece “Fin de la jornada”, seguido del resultado y la opción inmediata de volver a intentarlo.

### Controles y variables

- Un solo gesto: tocar para saltar.
- Una sola variable principal visible: energía.
- Indicadores secundarios no interactivos: ratio actual, tiempo o distancia y récord personal.
- Sin agacharse, decisiones ramificadas, inventario, monedas, potenciadores ni colisiones de alumnos en la primera versión.

### Dificultad

La dificultad aumenta mediante tres factores: ratio creciente, menor altura de salto conforme cae la energía y aparición progresiva de obstáculos. Debe ser posible aprender y mejorar, pero todas las partidas terminan tarde o temprano. El equilibrio debe evitar que la reducción de salto convierta un obstáculo en matemáticamente inevitable sin suficiente aviso visual.

## Metáforas y obstáculos

Los obstáculos representan condiciones del sistema, nunca personas:

- **Burocracia:** pilas de formularios, ventanas emergentes o sellos gigantes.
- **Calor:** termómetros desbordados, ondas de calor o un ventilador que solo desplaza papeles.
- **Infraestructura:** fotocopiadora averiada, goteras u obras que bloquean el paso.
- **Tiempo insuficiente:** relojes, correcciones y tutorías acumuladas.
- **Trabajo invisible:** aparece sobre todo en el cierre, después de la supuesta finalización de las clases.

El salario y el coste de vivir en Madrid no serán una economía jugable. Se explicarán en el resultado mediante una comparación rigurosa y limitada; como gag visual opcional, el alquiler puede aparecer al final de la jornada sin funcionar como moneda ni daño.

La atención a la diversidad y las aulas TEA no se convertirán en obstáculos. Si se incorporan al primer relato, se representarán mediante la ausencia o simultaneidad imposible de apoyos profesionales, no mediante rasgos del alumnado.

## Tono y lenguaje visual

- Humor absurdo y reconocible, dirigido contra situaciones administrativas y carencias materiales.
- Personajes amables y expresivos, sin ridiculizar a docentes ni estudiantes.
- Textos muy breves durante la partida; no se muestran datos, fuentes ni explicaciones largas mientras se juega.
- Sin caricaturizar a responsables políticos concretos.
- El cansancio debe verse como acumulación de trabajo, no como incompetencia del personaje.

## Final de partida

La pantalla final contiene:

1. **Resultado personal:** duración, ratio máxima y energía consumida por categorías.
2. **Traducción de la metáfora:** qué representaban los obstáculos encontrados.
3. **Realidad documentada:** hasta cuatro datos breves, fechados, con fuente y enlace.
4. **Mensaje:** “No has jugado mal. Intentabas hacer un trabajo cada vez más exigente con tiempo y recursos insuficientes”. Como remate posible: “Ahora ya sabes por qué correr más no resuelve el problema”.
5. **Acciones:** volver a jugar, compartir el resultado, consultar las reivindicaciones y fuentes, y conocer formas legales y voluntarias de apoyo.

Las acciones informativas o de apoyo serán voluntarias y estarán separadas de la revancha; el jugador no debe sentirse obligado a adoptar una posición para volver a jugar.

## Experiencia móvil y accesibilidad

- Web adaptable, sin instalación y con carga ligera.
- Diseño principal para pantalla vertical, comprobado también en horizontal y escritorio.
- Zona táctil equivalente a toda el área de juego.
- Obstáculos grandes, contraste suficiente y ausencia de texto pequeño durante la carrera.
- El color no será el único medio de comunicar energía, peligro o cansancio.
- Opción para reducir movimiento y alternativa textual accesible con el resumen y los datos.
- Sonido opcional; nunca necesario para jugar o comprender el resultado.

## Primera versión y validación

La primera versión debe contener solamente:

- un personaje docente y una animación sencilla de grupo;
- salto de un botón;
- energía, ratio y récord;
- tres familias de obstáculos reutilizables;
- aumento automático de ratio;
- descenso gradual de energía y altura de salto;
- fin de jornada, reinicio y pantalla con cuatro datos fuenteados;
- funcionamiento táctil en móvil.

Antes de ampliar contenido se probará con personas ajenas a la comunidad educativa. Las preguntas de validación serán:

- ¿Entendieron los controles sin explicación?
- ¿Comprendieron que la ratio consumía energía y que el alumnado no era el enemigo?
- ¿Pudieron nombrar al menos dos motivos de la huelga después de jugar?
- ¿Sintieron curiosidad por comprobar los datos o compartir el juego?
- ¿Alguna metáfora resultó culpabilizadora, confusa o partidista?

## Restricciones y decisiones dejadas a construcción

- La tecnología concreta del prototipo queda a criterio de quien lo construya, priorizando una web estática ligera y sin backend si no es necesario.
- El estilo gráfico exacto, nombre final y protagonista se decidirán durante el prototipo visual, respetando el tono y los antiobjetivos.
- El equilibrio numérico de energía, salto, ratio y obstáculos se ajustará mediante pruebas; no forma parte de este diseño conceptual.
- No se publicará ninguna cifra sin revisión editorial y enlace a su fuente.

## Fuentes iniciales

**Auditoría editorial:** consultadas y contrastadas el 6 de noviembre de 2026.

- **Ratio:** confirmado 11,7 alumnos por profesor en centros públicos madrileños frente a 9,8 en los centros públicos de España, curso 2023-2024. La cifra es una media alumno/profesor, no el tamaño de un aula concreta.
- **Gasto:** confirmado un gasto medio de 16.124 € por persona en Madrid durante 2025, segundo resultado autonómico más alto. Se presenta como gasto observado y no como índice de coste de vida.
- **Retribución:** confirmados 2.797,37 € brutos mensuales ordinarios para maestros con diez años de antigüedad en Madrid, tabla 4 de UGT 2026. No incluye pagas extraordinarias y no se generaliza a otros cuerpos o antigüedades.
- **Climatización:** confirmada la información de hasta veinte centros públicos con aulas por debajo de 17 °C, atribuida por Cadena SER a una detección de CCOO en invierno de 2026. No se presenta como censo regional.

- RTVE, “Huelga 14 octubre: qué piden los profesores y servicios mínimos”: https://www.rtve.es/noticias/20261014/docentes-madrid-inician-huelga-indefinida-para-exigir-mejoras-laborales-educacion-publica-calidad/17264967.shtml
- La Vanguardia, continuidad de las movilizaciones del 4 y 5 de noviembre: https://www.lavanguardia.com/local/madrid/20261102/11673865/profesores-retoman-huelga-suman-universidades-publicas-4-5-noviembre.html
- Consejo Escolar de la Comunidad de Madrid, *Informe 2025*, capítulo B (ficha estable de la publicación): https://www.comunidad.madrid/publicacion/ref/51717
- INE, Encuesta de Presupuestos Familiares 2025: https://www.ine.es/dyngs/Prensa/en/EPF2025.htm?print=1
- UGT, *Boletín de Enseñanza Pública. Retribuciones 2026*: https://ugt-sp.es/wp-content/uploads/boletin-retribuciones-profesorado-comparativa-europa-2026_web.pdf
- Comunidad de Madrid, recursos para necesidades específicas y nuevas aulas TEA: https://www.comunidad.madrid/noticias/2026/09/02/comunidad-madrid-aumenta-todos-recursos-publicos-necesidades-especificas-alumnos-e-incorpora-40-nuevas-aula-tea

