# Activación de audio en la PWA de iPhone

## Intención

La música del menú inicial debe sonar en la PWA instalada en un iPhone sin obligar a alternar el botón de sonido. iOS exige una interacción táctil real antes de reproducir Web Audio; girar el teléfono solo genera un cambio de orientación y no activa el audio.

## Comportamiento

- Si la aplicación se ejecuta como PWA instalada en un iPhone, el sonido no está silenciado y Phaser informa de que el audio está bloqueado, se muestra una pantalla breve con el botón **«Toca para continuar»**.
- El toque desbloquea el contexto de audio. La pantalla desaparece y se muestra el menú inicial con su música.
- Si el audio ya está desbloqueado, el dispositivo no es un iPhone instalado o el usuario guardó la preferencia de silencio, no aparece ninguna pantalla adicional.
- Un fallo de audio nunca bloquea el acceso al juego: después del toque se continúa aunque el desbloqueo o la carga de la pista fallen.

## Enfoques considerados

1. **Usar el giro del teléfono.** Descartado: `orientationchange` no es una activación de usuario válida para Web Audio.
2. **Usar «Empezar» como primer toque.** Evita otra pantalla, pero la música del menú no llega a disfrutarse porque el juego cambia de escena inmediatamente.
3. **Puerta táctil solo en la PWA instalada en iPhone.** Elegido: cumple la política de iOS, conserva la música de introducción y no altera la experiencia en otros dispositivos.

## Arquitectura

La detección de iPhone instalado se mantiene separada de la interfaz. `GameShell` presenta una capa accesible previa al menú, y `main.ts` coordina el toque con el estado real de `game.sound.locked`. `GameAudio` solo reanuda la música seleccionada después de que Phaser emita `Phaser.Sound.Events.UNLOCKED`, evitando la carrera que actualmente deja una pista marcada como iniciada sobre un contexto todavía suspendido.

## Límites

- No se cambia ninguna pista ni volumen.
- No se intenta eludir la política de reproducción automática de iOS.
- No se muestra la puerta en Safari normal, Android, escritorio ni cuando el sonido está silenciado.
- No se bloquea el juego esperando indefinidamente al audio.
