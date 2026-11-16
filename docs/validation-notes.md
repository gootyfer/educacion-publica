# Validación de la reimplementación Phaser

**Revisión interna:** 16 de noviembre de 2026  
**Motor y formato:** Phaser 3, 640×360, móvil horizontal

## Comprobado automáticamente

- El profesorado salta mientras los acompañantes permanecen agrupados y apoyados en el suelo.
- La ratio crece simbólicamente hasta nueve identidades diversas y nunca crea colisiones del alumnado.
- Septiembre, invierno y junio usan fondos propios; frío y goteras aparecen en invierno y calor en junio.
- Los seis obstáculos pueden aparecer y sus huecos respetan la geometría mínima de salto.
- Un choque reduce energía sin terminar inmediatamente el trimestre.
- Navidad y Semana Santa esperan una activación manual y rellenan diez bloques en aproximadamente un segundo; movimiento reducido completa la barra sin espera visual.
- La portada, las pausas y el resultado usan cartel central y no recuperan los adornos rojos descartados.
- La navegación por teclado, la restauración del foco, el modo vertical, las fuentes reales y la alternativa sin JavaScript tienen cobertura de navegador.
- Axe no detecta incidencias serias o críticas en la portada.
- El audio no comienza antes de interactuar, el silencio persiste y los MP3 ausentes no bloquean el juego.
- El build aplica un presupuesto comprimido de 3 MB a código y arte crítico, con audio excluido.

## Revisión visual interna

- 844×390: portada, HUD, docente, grupo y obstáculo legibles.
- 640×360 lógico: pixel snapping y composición sin texto persistente de trimestre o ratio.
- La camiseta conserva el verde y su lema blanco se sugiere como varias marcas horizontales; no aparece una `@` aislada.
- Gafas, ojos y nariz se mantienen visibles; no hay pendiente.
- El grupo queda detrás del profesorado y no salta.

## Validación pendiente con público general

1. Confirmar con al menos cinco personas ajenas a la comunidad educativa que interpretan al alumnado como una responsabilidad que necesita apoyos, no como una carga.
2. Medir si recuerdan dos reivindicaciones y relacionan clima, burocracia e infraestructura con los objetos.
3. Ajustar una sola variable por iteración después de observar partidas reales.
4. Comprobar tacto y rendimiento en un móvil físico de gama media o antigua.
5. Revisar el texto de compartir con organizaciones convocantes antes de una difusión amplia.

La PWA y su icono de instalación quedan expresamente aplazados.
