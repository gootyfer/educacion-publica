# Diseño V3: claridad, ritmo y continuidad del curso

## Intención

Esta iteración conserva el runner móvil de tres trimestres y mejora cinco puntos que ahora distraen del mensaje: un copy menos descriptivo y más ácido, la representación confusa de la ratio, los lazos que se deslizan sobre la verja, unas vacaciones que avanzan solas y una progresión de velocidad poco perceptible.

El objetivo sigue siendo que la población general entienda las reivindicaciones del profesorado poniéndose por unos minutos en su lugar. La experiencia debe seguir siendo muy sencilla: correr automáticamente, saltar y decidir cuándo continuar después de cada trimestre.

## Objetivos

- Aplicar literalmente el nuevo tono y los textos aprobados.
- Hacer evidente que la ratio es el total del grupo y que las figuras dibujadas son una representación.
- Recuperar el salto conjunto del docente, el alumnado y el indicador `+x`.
- Fijar los lazos a la verja y aumentar su presencia a medida que avanza el curso.
- Dejar las transiciones vacacionales en manos del jugador.
- Hacer claramente perceptibles la aceleración del mundo y de la música sin volver injustos los saltos.
- Cambiar «Informarme y apoyar» para que lleve a `https://menoslectivas.org/`.

## No objetivos

- No se rediseñan los seis obstáculos ni sus cajas de colisión.
- No se cambia el sistema de energía, daño, ratio o puntuación.
- No se generan ni sustituyen audios.
- No se añade un selector de dificultad ni una explicación nueva antes de jugar.
- No se reestructura el motor del juego.

## Riesgos que deben evitarse

- Que el contador `+x` parezca una segunda ratio distinta de la mostrada en el HUD.
- Que el grupo se desplace con una trayectoria diferente a la del docente.
- Que un lazo flote o se deslice respecto al poste al que está atado.
- Que una espera o temporizador inicie el siguiente trimestre sin pulsar el botón.
- Que la nueva velocidad haga inevitable algún obstáculo cuando queda poca energía.
- Que acelerar la música cambie su tono o dificulte oír los efectos.

## Enfoques considerados

### 1. Ajuste focalizado — elegido

Se modifican únicamente el copy, las funciones visuales, los límites de velocidad, el control de audio y las transiciones existentes. Mantiene la arquitectura actual y permite probar cada corrección de forma aislada.

### 2. Ajuste conservador con un límite común

Aplicaría la misma aceleración máxima a los tres trimestres. Es más pequeño, pero hace que la progresión entre trimestres se note menos y contradice la intención de que cada uno resulte algo más exigente.

### 3. Sistema de niveles nuevo

Coordinaría ratio, velocidad, música, obstáculos y ambientación mediante una máquina de niveles nueva. Aporta flexibilidad futura, pero aumenta mucho el alcance sin mejorar esta versión de forma proporcional.

## Copy aprobado

### Portada

- Antetítulo: `Educación pública y de calidad`.
- Título: `Una jornada decente`.
- Introducción: `Un curso en tres trimestres para entender las reivindicaciones del profesorado: corre y salta mientras la ratio crece.`
- Acción textual: `Cómo funciona`.
- La descripción de la página y los textos de compartir usarán también `Una jornada decente` para evitar que sobreviva el título anterior fuera de la portada.

### Cómo funciona

- Antetítulo: `Cómo funciona`.
- Título: `Una jornada docente`.
- Explicación principal, dividida en frases breves: `Atender a más alumn@s consume más energía. El salto se hace más corto y los obstáculos siguen llegando. En vacaciones recuperas energía, pero los obstáculos siguen.`
- Las tres descripciones conservarán `Primer trimestre`, `Segundo trimestre` y `Tercer trimestre`, pero eliminarán los rangos de meses.
- Se mantienen la explicación de los seis obstáculos, los cuatro datos y el botón para volver.

### Resultado final

- Se elimina por completo el bloque `Lo que apareció durante el curso`.
- Se elimina la frase `Al aumentar la ratio, atender al grupo consumía más energía y tu salto se hacía más corto.`
- Permanecen el tiempo, la ratio máxima, el resultado por trimestre, los golpes por categoría, el mensaje final y los cuatro datos.
- `Informarme y apoyar` enlaza a `https://menoslectivas.org/` y se abre con las protecciones actuales para enlaces externos.

## Ratio y salto del grupo

Se dibujarán siempre seis figuras de alumnado. Son una representación estable del grupo, no seis alumnos adicionales ni una medida independiente. El indicador mostrará el resto hasta completar la ratio total:

- ratio 20: seis figuras y `+14`;
- ratio 24: seis figuras y `+18`;
- ratio 28: seis figuras y `+22`.

De este modo, `6 + x` siempre coincide con la ratio del HUD y el contador aumenta exactamente cuatro cuando la ratio aumenta cuatro.

El docente, las seis figuras y el indicador `+x` compartirán el mismo desplazamiento vertical basado en `playerY`. Las diferencias de fila se conservarán como separación local dentro del grupo. El salto conjunto es una decisión visual explícita de esta versión y sustituye la indicación anterior de dejar al alumnado en el suelo.

La alternativa accesible seguirá anunciando el total —por ejemplo, `Ratio 24`— y no obligará a interpretar la suma visual.

## Lazos anclados y progresivos

La verja y los lazos usarán un único desplazamiento horizontal. Cada lazo se dibujará en la coordenada de uno de los postes; nunca aplicará un multiplicador de paralaje independiente.

La presencia aumentará sin aleatoriedad y con un máximo que no tape el escenario:

- primer trimestre: empieza con 1 y llega hasta 3;
- segundo trimestre: empieza con 3 y llega hasta 5;
- tercer trimestre: empieza con 5 y llega hasta 7.

En cada trimestre se añade un lazo al superar 20 segundos y otro al superar 40 segundos. Al cambiar de trimestre no disminuye la cantidad de lazos. Los lazos que entren o salgan por los bordes permanecerán unidos al mismo patrón de postes.

## Vacaciones bajo control del jugador

Al terminar el primer o segundo trimestre:

1. se detienen el mundo y el tema principal;
2. suena la firma de fin de trimestre;
3. aparece la pantalla de vacaciones con `Continuar el curso` habilitado;
4. el acento de Navidad o Semana Santa comienza en el momento ya previsto si la pantalla sigue abierta;
5. el siguiente trimestre empieza únicamente al activar el botón.

No habrá avance automático, ni siquiera después de que terminen los audios. Una única activación empieza el siguiente trimestre; pulsaciones repetidas no pueden saltarse un trimestre. Si se continúa mientras suena un efecto de transición, el inicio del nuevo trimestre detiene ese efecto y comienza su música.

## Dificultad y música

Se conservan las velocidades iniciales actuales para respetar el arranque ya validado:

- trimestre 1: `1,00 ×` la velocidad base;
- trimestre 2: `1,09 ×`;
- trimestre 3: `1,18 ×`.

El límite de aceleración dentro de cada trimestre deja de ser el mismo `+15 %` y pasa a:

- trimestre 1: hasta `+20 %` sobre su inicio;
- trimestre 2: hasta `+25 %`;
- trimestre 3: hasta `+30 %`.

La rampa continúa ocupando 60 segundos. Los huecos espaciales entre obstáculos no se reducen: al desplazarse el mundo más deprisa, los obstáculos llegan con mayor frecuencia temporal sin crear obstáculos dobles.

La música deja los tres escalones actuales de `1,00`, `1,075` y `1,15`. Su velocidad se calculará de forma continua a partir de la velocidad real del mundo, entre `1,00 ×` al comienzo del curso y `1,24 ×` en el límite del tercer trimestre. Se actualizará solo cuando cambie al menos una centésima para evitar escrituras innecesarias. Se conservará `preservesPitch` siempre que el navegador lo permita.

El aumento del límite queda condicionado a que las pruebas de saltabilidad confirmen que los seis obstáculos se pueden superar con la energía mínima y la velocidad máxima del tercer trimestre. Si no fuera así, se reducirá únicamente el límite necesario; no se cambiarán en esta iteración ni el salto mínimo ni las cajas de colisión.

## Accesibilidad y comportamiento sin JavaScript

- Los cambios de copy se reflejarán también en metadatos, pruebas accesibles y contenido alternativo sin JavaScript cuando corresponda.
- El botón de continuación conservará foco visible, nombre accesible y activación por teclado.
- El estado vivo anunciará cada nuevo trimestre solamente después de pulsar `Continuar el curso`.
- La ratio se comunicará numéricamente en el HUD y en los anuncios, no solo mediante figuras o colores.
- La aceleración musical seguirá siendo opcional: el juego funciona silenciado, con reproducción bloqueada o sin archivos de audio.

## Validación

- Pruebas unitarias para la suma `seis figuras + indicador = ratio` y para el desplazamiento vertical común.
- Pruebas unitarias para el número progresivo de lazos y su coordenada compartida con los postes.
- Pruebas de mecánica para las velocidades iniciales y los tres nuevos límites.
- Pruebas de saltabilidad de las seis variantes con energía mínima y velocidad máxima del tercer trimestre.
- Pruebas de audio para los límites `1,00` y `1,24`, la relación con la velocidad del mundo, la conservación de tono y el silencio.
- Prueba con reloj controlado que demuestre que la pantalla de vacaciones permanece indefinidamente hasta activar el botón.
- Pruebas de interfaz para el copy exacto, la desaparición del resumen eliminado y el enlace a `https://menoslectivas.org/`.
- Recorrido manual en móvil y escritorio para valorar que la aceleración se percibe, pero deja tiempo razonable de reacción.

