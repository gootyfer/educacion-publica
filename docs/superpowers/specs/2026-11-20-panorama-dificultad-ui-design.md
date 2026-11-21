# Una jornada decente: panorama continuo, pantallas fieles y nueva dificultad

## Intención

La reimplementación Phaser funciona, pero todavía no transmite el diseño aprobado ni suficiente sensación de carrera. Esta iteración debe acercar las pantallas principales a las referencias validadas, hacer legible el grupo de estudiantes, convertir el centro madrileño en un recorrido continuo que cambia con las estaciones y aumentar la presión del juego progresivamente sin introducir secuencias imposibles.

El tono permanece optimista y humorístico. El alumnado acompaña al profesorado y representa la ratio; nunca es un obstáculo ni recibe físicas o colisiones.

## Objetivos

- Reproducir la composición de portada, Navidad, Semana Santa y fin de curso con las proporciones, jerarquía, color y botones de las referencias aprobadas.
- Mostrar el mismo recorrido escolar madrileño en septiembre, invierno, una pausa primaveral y junio.
- Dar movimiento continuo al escenario mediante un panorama de cinco pantallas que se repite sin salto visible.
- Distribuir hasta nueve acompañantes en varias filas legibles, manteniéndolos agrupados detrás del profesorado.
- Reiniciar cada trimestre con pocos acompañantes y volver a crecer progresivamente hasta nueve.
- Aumentar variedad, frecuencia y presión de los obstáculos a lo largo de cada trimestre.
- Acelerar gradualmente la música de acuerdo con la velocidad real del recorrido.

## No objetivos

- No añadir nuevos tipos de obstáculo, vidas, monedas, ataques ni controles.
- No convertir el juego en un runner con plataformas o movimiento lateral libre.
- No añadir todavía manifiesto PWA ni icono de instalación.
- No sustituir el pixel art aprobado ni rediseñar al personaje principal.

## Antiobjetivos

- No usar capturas completas con texto horneado como interfaz: los textos y resultados deben seguir siendo dinámicos y accesibles.
- No crear tres centros distintos; debe reconocerse el mismo recorrido bajo estaciones diferentes.
- No usar estudiantes como peligros ni asociar su aparición con daño directo.
- No aumentar dificultad mediante combinaciones inevitables o obstáculos sin tiempo de lectura.

## Enfoques considerados

### 1. Panorama ilustrado de cinco tramos — elegido

Un recorrido de 3200×360 compuesto por cinco secciones de 640×360. Se crea primero la versión base de septiembre y después dos transformaciones estacionales que conservan exactamente arquitectura, perspectiva, suelo, ventanas y línea de horizonte. El final encaja con el principio para formar un bucle.

Ventajas: recorrido reconocible, dirección artística controlada y sensación clara de avance. Coste: mayor trabajo de asset y validación de costuras.

### 2. Fondo modular con parallax

Paredes, ventanas, patio y barrio separados en capas repetibles. Tiene menor peso y más profundidad, pero el espacio se percibiría procedural y se alejaría de las referencias.

### 3. Repetición del fondo actual con objetos móviles

Es la solución más pequeña, pero la repetición sería evidente y no resolvería el problema visual de base.

## Panorama continuo

### Geometría

- Tres tiras finales de 3200×360: septiembre, invierno y junio.
- Cada tira se produce como cinco tramos de 640×360 con continuidad de perspectiva y color.
- La franja final recupera los elementos estructurales necesarios para enlazar con el inicio: suelo, zócalo, tuberías, techo y horizonte exterior.
- La costura se valida comparando una franja mínima de 32 píxeles de ambos extremos y observando el bucle en movimiento.
- No habrá texto ni personajes horneados en el escenario.

### Mismo recorrido, tres estaciones y una pausa primaveral

- **Septiembre:** luz cálida, árboles verdes, persianas y sensación de calor de comienzo de curso.
- **Invierno:** misma arquitectura con luz fría, lluvia, humedad, ramas desnudas y señales de goteras.
- **Semana Santa:** una variante estática de 640×360 del mismo lugar en primavera, con luz cálida y vegetación florecida, fiel a `screen-term-2-complete.png`. No necesita panorama largo porque no se desplaza durante la pausa.
- **Junio:** misma arquitectura con luz intensa, vegetación de verano, persianas y sensación de calor acumulado.

Los lazos verdes se mantienen como elemento ambiental, pero sin competir con el HUD ni convertirse en contador.

### Movimiento

El panorama se desplaza horizontalmente según la velocidad del mundo mientras el personaje permanece en su zona de pantalla. Al llegar a 3200 píxeles, continúa desde el comienzo sin pausa ni salto. El desplazamiento usa coordenadas enteras para conservar pixel snapping.

Cada trimestre empieza al inicio del recorrido correspondiente. La transformación estacional ocurre durante la pantalla de descanso, nunca en mitad de una carrera.

## Pantallas principales

Las referencias `screen-title.png`, `screen-term-1-complete.png`, `screen-term-2-complete.png` y `screen-course-complete.png` son la autoridad visual.

### Sistema común

- Cartel crema grande, borde verde oscuro escalonado y sombra pixelada.
- Tipografía pixel gruesa, con tamaños claramente distintos para antetítulo, título y acciones.
- Divisores mostaza y acentos verdes.
- Botón principal verde relleno; secundario crema con borde verde.
- Un único módulo de layout define tanto la geometría pintada como los botones HTML semánticos para impedir desalineaciones.
- Todos los textos permanecen vivos; tiempo, ratio y estados de energía no se hornean en imágenes.

### Portada

- Cartel ocupa aproximadamente el 45 % central del ancho y el 74 % de la altura.
- Antetítulo, divisor, título en dos líneas, botón verde `EMPEZAR`, botón secundario `CÓMO FUNCIONA` y ayuda inferior.

### Descansos

- Cartel más ancho que el de portada.
- Título de trimestre completado, banda verde oscura con la fiesta, barra de energía central, texto `ENERGÍA RECUPERADA` y botón verde ancho.
- La recarga mantiene diez pasos de izquierda a derecha y no se solapa con el botón.
- Navidad usa invierno; Semana Santa usa la variante primaveral estática del mismo recorrido.

### Fin de curso

- Título grande, frase de cierre, dos cajas separadas para tiempo y ratio máxima, botón principal verde y acciones secundarias.
- No hay recarga de energía.

## Acompañantes y ratio

- Los nueve sprites existentes se conservan.
- Se distribuyen en hasta tres filas escalonadas detrás del profesorado.
- Las filas posteriores aparecen entre 8 y 14 píxeles más arriba, con ligera reducción de escala y profundidad correcta; ningún sprite flota sobre el suelo visual.
- La separación horizontal aumenta para que caras, ropa y edades sean reconocibles, aunque el grupo ocupe más espacio.
- Los acompañantes continúan corriendo en el suelo cuando el profesorado salta o choca.

Cada trimestre vuelve a empezar con **dos acompañantes**. Tanto el valor interno de ratio como su representación visual vuelven a su línea base al comenzar la etapa y crecen juntos hasta nueve acompañantes. El resultado conserva la mayor ratio numérica alcanzada en cualquiera de los tres trimestres.

En una partida normal, incluso con uno o dos choques, el grupo debe alcanzar nueve antes de agotar la energía. La curva de incorporaciones se calibra para llegar a nueve aproximadamente en el 65–75 % de la duración esperada del trimestre. Una partida excepcionalmente corta por muchos choques puede terminar antes; no se retrasa artificialmente el descanso.

El reinicio es una simplificación simbólica del tramo escolar, no una afirmación de que la ratio real disminuya en vacaciones; la explicación accesible indicará que cada trimestre vuelve a representar desde el principio cómo aumenta la presión dentro de esa etapa.

## Obstáculos y dificultad

### Pool y simultaneidad

- El pool admite hasta cuatro obstáculos activos.
- La selección conserva los seis tipos y sus reglas estacionales.
- Cada aparición calcula el siguiente hueco en distancia, no mediante temporizadores independientes, para que la dificultad responda a la velocidad real.

### Variación de huecos

Se alternan tres bandas seguras:

- hueco largo: respiro y lectura del escenario;
- hueco medio: ritmo normal;
- hueco corto: presión puntual, siempre saltables según la geometría actual.

No se repite indefinidamente una banda corta ni se encadenan obstáculos altos de forma inevitable. Una semilla determinista permite probar todos los patrones.

### Curva

- Al inicio de cada trimestre hay una gracia breve y huecos principalmente largos o medios.
- La frecuencia aumenta de forma continua con el tiempo del trimestre.
- Segundo y tercer trimestre empiezan algo más rápidos que el primero, pero vuelven a presentar el control antes de alcanzar su presión máxima.
- El final del tercer trimestre alcanza aproximadamente entre 1,7× y 2× la frecuencia inicial, sujeto a la calibración de seguridad.
- Los impactos siguen restando energía y concediendo invulnerabilidad; nunca terminan toda la partida.

## Velocidad y música

La velocidad del panorama, los obstáculos y la intensidad musical comparten una única función de progreso. `GameScene` emite una presión normalizada y `GameAudio` transforma ese valor en una velocidad de reproducción gradual entre 1,00× y un máximo prudente de 1,24×, conservando el tono cuando el navegador lo permita.

La tasa solo se actualiza cuando cambia al menos una centésima para evitar escrituras por frame. Vacaciones y final de curso detienen el tema y usan sus cues aprobadas sin aceleración.

## Accesibilidad

- Energía, incorporaciones, trimestre y resultado siguen teniendo equivalentes HTML.
- Los botones semánticos consumen las mismas constantes geométricas que Phaser.
- La explicación de la ratio evita presentar al alumnado como carga.
- Teclado, toque, movimiento reducido, silencio, orientación vertical y fallbacks permanecen operativos.

## Producción de assets

1. Crear un recorrido base de cinco tramos usando las referencias actuales como estilo y geometría.
2. Ensamblar y validar el bucle de septiembre.
3. Transformar los mismos cinco tramos a invierno y junio, preservando estructura y costuras.
4. Crear una transformación primaveral estática de 640×360 para Semana Santa, basada en el mismo punto del recorrido.
5. Reducir cada tira a 3200×360 con píxel duro y sin semitransparencias residuales.
6. Generar una hoja de contacto de los quince tramos, tres bucles completos y la pausa primaveral para aprobación visual.

## Verificación

- Pruebas de layout comparan las constantes de Phaser y DOM.
- Pruebas de progresión confirman 2→9 acompañantes en cada trimestre y reinicio visual en los descansos.
- Pruebas de cadencia cubren miles de decisiones, las tres bandas y la frecuencia creciente sin secuencias inevitables.
- Playwright comprueba desplazamiento y bucle del panorama, alineación de botones, filas de acompañantes, varios obstáculos activos y aumento gradual de música.
- Revisión visual en 844×390 y 740×360 de las cuatro pantallas, las tres estaciones móviles, la pausa primaveral y la costura del bucle.
- El presupuesto comprimido de 3 MB se vuelve a evaluar; si las tres tiras lo superan, se optimizan antes de elevar el límite.
