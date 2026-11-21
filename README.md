# Una jornada decente

Runner horizontal en pixel art sobre la educación pública madrileña. El curso recorre tres trimestres: la energía docente disminuye, la ratio se representa con hasta nueve estudiantes que acompañan al profesorado y los obstáculos simbolizan burocracia, clima e infraestructura. El alumnado nunca tiene físicas ni funciona como obstáculo.

## Desarrollo

Requiere Node.js 24 o posterior.

```bash
npm install
npm run dev
```

Controles: toque o clic en el juego, `Espacio` o `Flecha arriba`. La interfaz incluye navegación por teclado, movimiento reducido, orientación vertical guiada, audio silenciable y alternativa sin JavaScript.

## Estructura

- `src/course/`: progresión, ratio, energía y cadencia determinista independientes del motor.
- `src/phaser/`: escenas, entidades, audio y configuración Phaser 3 a 640×360.
- `src/ui/`: controles HTML semánticos, motivación, fuentes y estado accesible.
- `art-source/panoramas/`: maestros PNG del recorrido madrileño y manifiesto con el orden de sus cinco tramos.
- `public/game/`: sprites, UI y panoramas WebP optimizados de producción.
- `public/audio/approved/`: música y efectos aprobados; el juego no depende de ellos.
- `tests/`: contratos puros, integración Phaser y recorridos Playwright.

## Verificación

```bash
npm run typecheck
npm test
npm run build
npm run budget
npm run test:e2e
```

`npm run ci` reúne todas las comprobaciones. El presupuesto comprime JavaScript, CSS, HTML y recursos visuales críticos y falla por encima de 3 MB; el audio queda excluido y se carga por separado.

## Panoramas estacionales

Cada trimestre reutiliza el mismo recorrido continuo de Madrid capital transformado por la estación. Los cinco maestros de 640×360 se ordenan en `art-source/panoramas/manifest.json` y se preparan como una tira de 3200×360; el descanso de primavera usa una imagen estática de 640×360.

```bash
npm run art:panoramas
```

El comando genera los WebP de `public/game/backgrounds/` sin alterar los maestros. Antes de sustituir el arte, revisa la hoja de contacto y los bucles de continuidad de `docs/art-direction/una-jornada-decente/panorama-review/`; el último tramo debe enlazar visualmente con el primero.

## Calibración

Los valores principales están en `src/course/calibration.ts`; la geometría de salto y los huecos seguros, en `src/course/cadence.ts`. Cada cambio debe mantener verdes `tests/course/` y `tests/gameplay/` y revisarse en 844×390 y 740×360.

## Contenido y fuentes

Las fichas están en `src/content/facts.ts`. Cada cifra conserva valor, unidad, periodo, ámbito, tipo de fuente y cautela editorial. Antes de cambiarla, hay que contrastar la fuente y actualizar su prueba.

## Alcance pendiente

La instalación PWA, el manifiesto y su icono se añadirán en una iteración posterior. Esta versión tampoco incluye backend, cuentas, analítica ni monetización. La comprensión del mensaje por público general requiere las pruebas descritas en `docs/validation-notes.md`.
