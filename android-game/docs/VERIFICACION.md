# Verificación · 0.2.1

## Ejecutado en esta revisión

- TypeScript, Vite de producción, sincronización Capacitor y Gradle assembleDebug: correctos.
- 29 pruebas del motor, API y persistencia. Incluyen reparto 5/2, acciones repetibles, alternancia, robo por turno, caducidad y prórroga, consumo de clientes, descarte elegido, encaje, especialidades, información privada y rechazo de invitaciones antiguas sin modificar la partida.
- 8 recorridos Playwright en Edge: turno local, venta tras explorar, dos cuentas online, recuperación, tácticas con cero acciones, elección de clientes, archivo de partidas antiguas, cartas, laboratorio, límites móviles, mano permanente, carga de atlas y colores Hospital/Obras.
- Viewports 1440, 1280, 390 y 320 de ancho. Mano visible dentro del viewport y contenido dentro de sus tarjetas. Sin errores JavaScript en los recorridos instrumentados. Sin overlay de Vite.
- Browser plugin not available: se utilizó el flujo Playwright/Edge existente. Las capturas de revisión visual adicionales están fuera del repositorio, en la carpeta de visualizaciones de esta tarea.
- 2560 ejecuciones de simulación en tres lotes; 1280 en el final. No son muestras independientes: hay parejas y semillas repetidas entre comparaciones. Véase BALANCE.md.
- API local verificada con versión digital-0.2.1 y pushConfigured=false.
- APK de depuración: deliverables/Barrio-en-Venta-0.2.1-debug.apk, 10694593 bytes. SHA-256: 8b8652f2713f190839387703fb736de5bf020f808096f065d29738ff5387c346.

## No verificado en esta revisión

- No se ha vuelto a instalar este APK 0.2.1 en un teléfono o emulador. La prueba nativa histórica corresponde a 0.1 y está documentada en VERIFICACION-v0.1.md; no debe atribuirse a 0.2.1.
- Notificaciones FCM reales, dos teléfonos en redes distintas y despliegue público: siguen pendientes de alojamiento y credenciales del propietario.
- Firma/publicación de tienda, lector de pantalla y fabricantes distintos.
- Equilibrio con personas o frente a una estrategia óptima.

## Conservación y alcance

Las partidas antiguas no se migran a reglas incompatibles. El cliente archiva el estado local bajo archive-<versión> antes de iniciar una partida compatible. El servidor conserva las filas antiguas en SQLite y rechaza abrirlas o unirse a ellas como si fueran nuevas. No se han borrado cuentas ni partidas del usuario.

Servidor local: http://localhost:8788/api/health. Interfaz: http://localhost:5178. Las cuentas de pruebas de navegador son ficticias.
