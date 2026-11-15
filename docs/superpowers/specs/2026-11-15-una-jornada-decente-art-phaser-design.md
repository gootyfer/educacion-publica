# Una jornada decente: dirección artística y evaluación de Phaser

**Estado:** dirección artística validada y enfoque Phaser elegido el 15 de noviembre de 2026.  
**Alcance:** diseño visual, comportamiento de presentación, inventario de assets y arquitectura objetivo. Este documento debe aprobarse antes de implementar.

## 1. Objetivo

Rediseñar por completo la presentación del prototipo sin heredar su arte actual. El juego debe conservar el humor, el optimismo y la metáfora de un curso dividido en tres trimestres: la ratio crece, la energía docente disminuye y los descansos permiten recuperarla.

El alumnado acompaña al personaje docente y representa la ratio. Nunca se presenta como una carga, un obstáculo ni una causa de las colisiones. Los obstáculos representan burocracia, clima e infraestructura.

## 2. Dirección artística aprobada

- Pixel art de arcade moderno de 16 bits, nítido y colorido.
- Formato móvil horizontal con resolución lógica de referencia de **640 × 360 px**.
- Tono optimista, humorístico y cercano; el slapstick de las colisiones es suave.
- Ambientación cotidiana en un centro público de Madrid capital, evitando una postal turística.
- El mismo centro cambia con las estaciones para mostrar que las dificultades también cambian.
- Contornos verde oscuro, paneles crema, verdes luminosos, mostaza para luces y coral únicamente para alertas de energía.
- Sin rayas decorativas de énfasis alrededor de títulos, alumnado o barra de energía.

Los mockups son referencias de composición. El texto definitivo debe renderizarse como texto de interfaz, no quedar rasterizado dentro de las imágenes; esto evita erratas generativas y mantiene accesibilidad y adaptabilidad.

## 3. Personaje docente

El personaje es una caricatura pixel art deliberadamente andrógina y representativa:

- pelo medio, ondulado y ladeado;
- gafas finas con los ojos visibles;
- nariz legible a escala de juego;
- sin pendientes;
- camiseta verde con el lema blanco **«educación pública de tod@s para tod@s»**;
- en el sprite pequeño, el lema se sugiere mediante varias líneas blancas: nunca se sustituye por una `@` aislada.

Tamaño objetivo aproximado: caja de **70 × 64 px** dentro del mundo lógico de 640 × 360. Estados aprobados:

1. carrera de seis fotogramas;
2. salto;
3. choque suave;
4. cansancio.

Referencias: [carrera](../../art-direction/una-jornada-decente/teacher-run-cycle.png), [salto](../../art-direction/una-jornada-decente/teacher-jump-cycle.png), [choque](../../art-direction/una-jornada-decente/teacher-soft-collision.png) y [cansancio](../../art-direction/una-jornada-decente/teacher-tired-cycle.png).

## 4. Alumnado y representación de la ratio

Hay nueve acompañantes diseñados, con diversidad de edad, género, raza y orientación. El reparto cubre simbólicamente desde escuela infantil hasta etapas posteriores.

- La ratio se expresa por el número de acompañantes visibles, de forma gradual hasta un máximo de nueve.
- No aparece una cifra de ratio durante la partida.
- Corren agrupados inmediatamente detrás del personaje docente, con un ligero escalonamiento para conservar la lectura individual.
- No saltan y no tienen cuerpos de colisión propios.
- No bloquean, empujan ni penalizan al personaje.
- Su animación mantiene los pies a ras de suelo incluso cuando el docente salta.

Referencias: [reparto principal](../../art-direction/una-jornada-decente/student-cast-eight.png), [infantil](../../art-direction/una-jornada-decente/student-infant.png) y [composición de partida](../../art-direction/una-jornada-decente/gameplay-composition.png).

## 5. Obstáculos

Todos son objetos literales, no personajes antropomorfizados:

1. pila de formularios y papeleo;
2. carro archivador;
3. radiador averiado y termómetro de frío;
4. ventilador ineficaz;
5. gotera con cubo;
6. pared agrietada con barrera de mantenimiento.

Una colisión resta energía y activa un gag visual breve, pero no termina inmediatamente la partida. Solo el personaje docente interactúa físicamente con los obstáculos.

Referencia: [set de obstáculos](../../art-direction/una-jornada-decente/obstacle-set.png).

## 6. Centro y estaciones

Las tres variantes conservan la misma arquitectura y una franja inferior despejada para la acción:

- **Primer trimestre / septiembre:** luz cálida y sensación de calor; un lazo verde.
- **Segundo trimestre / invierno:** lluvia, humedad, frío y goteras; cuatro lazos verdes.
- **Tercer trimestre / junio:** calor intenso y final de curso; siete lazos verdes.

Referencias: [septiembre](../../art-direction/una-jornada-decente/background-term-1-september.png), [invierno](../../art-direction/una-jornada-decente/background-term-2-winter.png) y [junio](../../art-direction/una-jornada-decente/background-term-3-june.png).

## 7. HUD de energía

Durante la partida se muestra solamente la energía:

- barra de diez bloques;
- bloques rellenos de izquierda a derecha;
- estado normal verde;
- estado crítico coral;
- todos los bloques rellenos, incluidos los corales, llevan un brillo mostaza en la esquina superior izquierda;
- los huecos consumidos permanecen vacíos;
- sin trimestre, ratio, puntuación ni texto adicional persistente.

Referencias: [estado normal](../../art-direction/una-jornada-decente/hud-energy-normal.png) y [estado crítico](../../art-direction/una-jornada-decente/hud-energy-critical.png).

## 8. Pantallas y transiciones

Todas las pantallas principales reutilizan un cartel centrado sobre el fondo del trimestre correspondiente.

### Inicio

- Fondo de septiembre.
- Título: **UNA JORNADA DECENTE**.
- Lema superior: **EDUCACIÓN PÚBLICA Y DE CALIDAD**.
- Acciones: **EMPEZAR** y **CÓMO FUNCIONA**.
- Ayuda: **UN TOQUE PARA SALTAR**.

Referencia: [inicio](../../art-direction/una-jornada-decente/screen-title.png).

### Final del primer y segundo trimestre

Comparten plantilla, cambiando texto, color de acento y fondo:

- **PRIMER TRIMESTRE COMPLETADO / VACACIONES DE NAVIDAD**;
- **SEGUNDO TRIMESTRE COMPLETADO / VACACIONES DE SEMANA SANTA**;
- mensaje **ENERGÍA RECUPERADA**;
- acción **CONTINUAR EL CURSO**.

La barra empieza vacía y recupera sus diez bloques de izquierda a derecha en aproximadamente un segundo. El botón de continuar se activa al terminar. Con movimiento reducido, la barra aparece completa inmediatamente.

Referencias: [Navidad](../../art-direction/una-jornada-decente/screen-term-1-complete.png) y [Semana Santa](../../art-direction/una-jornada-decente/screen-term-2-complete.png).

### Fin de curso

- Fondo de junio.
- Resultados principales.
- Acciones: **VOLVER A INTENTAR**, **POR QUÉ ESTE JUEGO** y **COMPARTIR**.
- No hay animación de recarga.

Referencia: [fin de curso](../../art-direction/una-jornada-decente/screen-course-complete.png).

### Por qué este juego

Explica tres ideas:

1. **LA RATIO CRECE:** más alumnado necesita más tiempo, apoyos y recursos.
2. **LA ENERGÍA BAJA:** el cansancio limita, pero el alumnado no es el problema.
3. **LOS OBSTÁCULOS SIGUEN:** representan burocracia, clima e infraestructura.

Incluye **DATOS Y FUENTES** y **VOLVER**. La pantalla de fuentes debe conservar cifras, periodos, ámbitos y cautelas editoriales de la versión actual.

Referencia: [por qué este juego](../../art-direction/una-jornada-decente/screen-why-this-game.png).

## 9. Inventario de producción pendiente

Las referencias aprobadas definen diseño y composición, pero todavía deben convertirse en assets técnicos consistentes:

- atlas transparente del docente con cajas, pivotes y tamaños uniformes;
- ciclos de carrera a ras de suelo para los nueve acompañantes;
- atlas transparente de obstáculos con cajas de colisión separadas de su dibujo;
- fondos en capas o tiras preparadas para desplazamiento y, si se desea, parallax;
- HUD de energía en elementos independientes;
- paneles, bordes y botones como nine-slice o elementos de interfaz;
- fuente pixel legible con soporte completo para castellano;
- tabla de escalas, anclas, duración de fotogramas y nombres de animación.

No deben recortarse automáticamente los mockups como sprites finales: hay que reconstruir los assets limpios a partir de ellos.

La creación de esos assets de producción forma parte de este mismo proyecto. Se realizarán y validarán por tandas —docente, alumnado, obstáculos, fondos e interfaz— antes de integrarlos definitivamente. Esta secuencia evita que la implementación consolide pivotes, cajas o escalas basados en arte provisional.

## 10. Evaluación de Phaser

### Situación actual

El prototipo usa TypeScript, Vite y Canvas 2D propio. La lógica de estado, física y contenido ya está razonablemente separada del renderer y cuenta con pruebas unitarias y recorridos Playwright. Esa separación permite cambiar la capa visual sin tirar la mecánica validada.

### Ventajas de Phaser para este rediseño

- carga y gestión de atlas y spritesheets;
- animaciones declarativas y cambios de estado más claros;
- cámara, escalado y pixel-art rendering ya resueltos;
- composición por capas para fondos estacionales;
- pools de obstáculos y acompañantes;
- colisiones, temporizadores y transiciones visuales con menos código artesanal;
- mejor encaje si el número de sprites y animaciones sigue creciendo.

### Costes y riesgos

- nueva dependencia y mayor tamaño de descarga;
- migración del bucle, entrada y renderer ya probados;
- riesgo de mezclar lógica de juego con escenas de Phaser;
- las pantallas informativas, enlaces y accesibilidad siguen encajando mejor en DOM;
- una reescritura total perdería pruebas útiles sin aportar valor a las reglas del juego.

### Enfoques considerados

1. **Reescritura total dentro de Phaser.** Base conceptualmente uniforme, pero volvería a resolver reglas, contenido y comportamientos ya probados y tendería a acoplarlos al motor.
2. **Sustituir únicamente el renderer.** Menor riesgo, pero conservaría demasiadas decisiones visuales y estructurales del prototipo.
3. **Nueva aplicación Phaser con reaprovechamiento selectivo.** Reconstruye escenas y presentación, conservando únicamente piezas independientes del motor que sigan aportando valor.

### Decisión

Se elige el tercer enfoque: **reescritura visual y estructural sobre Phaser con reaprovechamiento selectivo de TypeScript puro**.

La parte visual se rehace por completo. No se portarán los dibujos del renderer Canvas, su composición ni los estilos visuales actuales. Las referencias aprobadas en este documento serán la única fuente visual del nuevo juego.

Se podrán reaprovechar, después de revisarlas una a una:

- fórmulas y reglas puras de energía, ratio, salto, progresión y cadencia;
- tipos y contratos de resultados que no dependan del renderer;
- contenido editorial, datos, fuentes y cautelas;
- almacenamiento local y compartir, si sus contratos siguen encajando;
- archivos de música aprobados y aquellos efectos ya aprobados que armonicen con el nuevo arte;
- pruebas que expresen comportamiento deseado, aunque haya que cambiar su montaje.

No se reaprovecharán por defecto:

- renderer Canvas ni sus primitivas gráficas;
- bucle `requestAnimationFrame` actual;
- runtime de entrada y colisiones actual;
- composición y CSS visuales del prototipo;
- código cuya única ventaja sea evitar reescribir unas pocas líneas sencillas.

## 11. Arquitectura objetivo

### Responsabilidades de Phaser

Phaser gestionará:

- precarga de atlas, fondos y audio;
- escena de partida y reloj del juego;
- sprites, animaciones y profundidad de capas;
- entrada táctil y de teclado;
- cámara, escalado y pixel snapping;
- aparición y reciclaje de obstáculos;
- colisiones del docente;
- acompañantes visuales de la ratio;
- HUD de energía y efectos de transición.

### Escenas

- **Boot / Preload:** configuración, fuentes, atlas y audio.
- **Title:** cartel de inicio sobre el fondo del primer trimestre.
- **Game:** carrera, salto, obstáculos, acompañantes y energía.
- **TermBreak:** plantilla común para Navidad y Semana Santa, incluida la recarga animada.
- **Results:** fin de curso, resultados y acciones finales.

La explicación **Por qué este juego**, los datos y las fuentes podrán abrirse como paneles DOM superpuestos. Visualmente seguirán el sistema pixel art aprobado, pero conservarán HTML semántico, enlaces reales, foco de teclado y lectura por tecnologías de asistencia.

### Núcleo independiente del motor

Las reglas que merezca conservar permanecerán en módulos TypeScript sin importar Phaser. Recibirán datos simples y devolverán estados o decisiones simples. No tendrán referencias a escenas, sprites, relojes ni físicas del motor.

La escena `Game` adaptará ese núcleo al tiempo y a la presentación de Phaser. Este límite permite probar las reglas sin renderizar y evita que una futura calibración requiera manipular objetos gráficos.

Las cifras del prototipo actual no son contratos de compatibilidad. La nueva versión recalibrará duración de los trimestres, velocidad, aceleración, impulso de salto, drenaje y daño de energía, crecimiento de acompañantes y cadencia de obstáculos alrededor de los assets de producción. Se conservarán las metáforas y el flujo de tres trimestres, no necesariamente sus valores actuales.

La calibración se hará cuando las cajas, pivotes y animaciones reales estén disponibles. Primero se buscarán lectura y justicia a escala móvil; después se ajustará la dificultad. Las pruebas existentes servirán como documentación histórica y solo se portarán aquellas expectativas que sigan expresando el comportamiento deseado.

### Flujo de partida

1. `Title` inicia un curso nuevo.
2. `Game` comienza el trimestre con energía completa y el fondo correspondiente.
3. La ratio crece y añade hasta nueve acompañantes agrupados.
4. Solo el docente salta y colisiona; los acompañantes continúan corriendo a ras de suelo.
5. Los choques restan energía y activan slapstick suave.
6. Al agotarse la energía en los dos primeros trimestres, se abre `TermBreak`.
7. La barra se recarga visualmente y comienza el trimestre siguiente.
8. Tras el tercero, `Results` muestra el fin de curso y permite reiniciar, compartir o abrir la motivación.

### Interfaz y accesibilidad

- Resolución lógica: 640 × 360, escalada con enteros cuando el dispositivo lo permita.
- Orientación principal: móvil horizontal.
- En móvil vertical se mostrará una pantalla ligera que invite a girar el dispositivo; desde ella seguirán disponibles la motivación, los datos y las fuentes en formato accesible. La partida no intentará recomponerse como runner vertical.
- Un toque dentro del área de juego solicita el salto; teclado conserva `Espacio` y `Flecha arriba`.
- El estado accesible de energía, trimestre, incorporaciones y transiciones se reflejará en una región DOM discreta aunque no aparezca como texto permanente en el HUD.
- Los botones de menús y paneles tendrán equivalentes HTML enfocables o una capa accesible sincronizada.
- `prefers-reduced-motion` elimina o acorta transiciones no esenciales y completa inmediatamente la recarga.
- La partida seguirá teniendo una alternativa textual y fuentes accesibles si Canvas/WebGL o JavaScript fallan.

### Audio

Se conservan los archivos musicales aprobados. Phaser podrá encargarse de su reproducción y mezcla, sin portar necesariamente el controlador actual. Los efectos se revisarán contra la nueva animación antes de decidir si se mantienen o sustituyen. La partida nunca dependerá del audio y conservará silencio persistente y degradación segura.

### Estrategia de pruebas

- Pruebas unitarias para el núcleo TypeScript independiente.
- Pruebas de escenas con adaptadores o seams mínimos, evitando comprobar píxeles internos de Phaser.
- Playwright para inicio, controles, tres trimestres, pausas, resultados, responsive, teclado y accesibilidad.
- Pruebas visuales de los estados principales a 640 × 360 y en dispositivos móviles representativos.
- Comprobación manual de fluidez y memoria con los nueve acompañantes visibles.

### Presupuesto técnico inicial

Estas cifras son límites de trabajo y podrán endurecerse tras medir el corte vertical:

- navegadores objetivo: versiones actuales y anterior de Safari móvil y Chrome para Android;
- objetivo de 60 FPS durante la partida en un móvil de gama media de los últimos cinco años, sin caídas sostenidas por debajo de 50 FPS;
- WebGL como renderer preferido y Canvas como fallback cuando Phaser pueda mantener la experiencia;
- JavaScript y assets visuales críticos iniciales con un presupuesto comprimido de 3 MB, sin contar el audio cargado bajo demanda;
- ausencia de crecimiento continuado de memoria después de varios reinicios y de recorrer los tres trimestres.

### Sustitución del prototipo

La nueva versión se construirá dentro del repositorio, pero el juego actual seguirá ejecutable hasta que el corte vertical y después el flujo completo superen los criterios acordados. La retirada del renderer anterior será el último paso, no el primero; así la comparación y la reversión siguen siendo posibles durante el desarrollo.

### PWA e icono de instalación

El icono instalable y la conversión efectiva en PWA quedan aplazados a una fase posterior y no bloquean la reescritura Phaser. El repositorio actual no contiene todavía web manifest ni service worker; por tanto, esa fase deberá incluir la infraestructura PWA además del diseño del icono.

## 12. Criterios para pasar a implementación

La fase artística puede darse por validada. Antes de modificar el juego aún corresponde:

1. convertir las referencias en sprites y atlas de producción;
2. fijar medidas y temporización de cada animación;
3. definir el corte vertical inicial de Phaser;
4. acordar umbrales de aceptación de rendimiento y peso;
5. preparar un plan de implementación que preserve las metáforas, el contenido, el audio y la accesibilidad, y que trate la mecánica como una nueva calibración.

El corte vertical incluirá un fondo, docente corriendo y saltando, tres acompañantes agrupados que no saltan, un obstáculo, una colisión, el HUD de energía y escalado móvil horizontal. Su finalidad es validar la integración técnica del arte; la elección de Phaser ya está tomada.

Durante el corte vertical se definirán los primeros valores jugables. La calibración definitiva se realizará con el conjunto completo de obstáculos y los nueve acompañantes, mediante pruebas automatizadas de seguridad de cadencia y sesiones manuales en móvil.
