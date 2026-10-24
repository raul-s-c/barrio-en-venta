# Verificación de la entrega

## Ejecutado

- Compilación TypeScript y Vite de producción.
- Compilación Gradle `assembleDebug`, aplicación `es.barrioenventa.app`, Android SDK 36, mínimo API 24.
- 14 pruebas automáticas: motor, determinismo, información privada, ilegalidades, inventario, las 30 cartas, reacción con mano llena, cierre con respuesta, API de dos usuarios, duplicados, revisiones obsoletas y persistencia SQLite tras volver a abrirla.
- 2 recorridos Playwright en Edge: tablero/agenda/cartas/laboratorio/móvil; dos cuentas con invitación, turnos y recuperación después de recargar.
- Capturas y comprobación de desbordamiento en anchos 1440, 390 y 320.
- Instalación y arranque reales del APK en emulador Android API 36, de solo lectura, independiente de los datos del emulador guardado.
- Prueba mediante WebView Android: turno local, IA rival, 4 simulaciones dentro de la app y persistencia tras recargar. Resultado en `reports/android-smoke.json`.
- 6200 partidas en los lotes de investigación descritos en `BALANCE.md`; 1760 en el torneo final con los parámetros de entrega.

## No verificado

- Entrega de notificaciones FCM reales: faltan proyecto, JSON Android y credencial de servidor.
- Partida entre dos teléfonos físicos en redes distintas: requiere alojamiento público HTTPS.
- Despliegue Docker/Caddy en un servidor público y dominio real.
- Firma de producción, publicación de tienda, accesibilidad con lector de pantalla y variedad de dispositivos/fabricantes.
- Equilibrio con jugadores humanos y resistencia frente a estrategias óptimas.

## Detalles de las pruebas

Playwright usó Edge porque el ejecutable Chromium de caché no arrancaba. El emulador sí ejecutó la aplicación nativa. Su registro mostró avisos gráficos del emulador (MESA/ashmem), no errores JavaScript en el recorrido validado. Las capturas completas de WebView no son fiables en este emulador, por lo que la captura nativa se obtiene con `adb screencap` y el laboratorio con captura de viewport.

Los servicios de desarrollo quedan en http://localhost:5178 (interfaz) y http://localhost:8788/api/health (API). Los usuarios y partidas de pruebas son ficticios y están en `data/`, separado del código y excluido del empaquetado de producción.
