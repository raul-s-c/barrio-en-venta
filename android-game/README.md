# Barrio en Venta · Reglas 0.2.3

Actualización web: ventas sin encaje y mazo de cinco efectos. Reglas 0.2.3 (octubre de 2026): cierre con 4 ventas y bonus 6, regla de remontada, disputar cuenta como la carta del turno, cerrar termina el turno, preferencias de cliente corregidas y Campaña con turnos alternos estrictos. Verificado con `npm test` y `npm run test:e2e` (el e2e online necesita `npm run server`). El APK 0.2.1 corresponde a la edición anterior y no incluye estos cambios.

Primera edición digital jugable para dos personas. Ciudad ilustrada, partidas privadas por turnos, entrenamiento contra IA y laboratorio de simulación dentro de la app.

## Probar ahora

- Vista local: http://localhost:5178
- APK de prueba: `deliverables/Barrio-en-Venta-0.2.1-debug.apk`.
- Android 7.0 o posterior. El contenedor 0.1 fue verificado en emulador API 36; los cambios 0.2 se verifican también en navegador móvil.
- Al abrir, aparece un entrenamiento contra Clara. No necesita conexión.
- Para probar el online en el ordenador: abre dos perfiles/ventanas privadas, crea una cuenta en cada una, crea una partida y comparte su código. La app recupera la última partida online al volver a abrirse.

**No es todavía un servicio publicado en Internet.** El servidor online funciona y se ha probado con dos sesiones independientes, pero falta elegir alojamiento, dominio y proyecto Firebase del propietario. El APK entregado no contiene credenciales Firebase. Sus avisos remotos están desactivados explícitamente, no simulados.

## Qué contiene

- Tablero de 37 hexágonos: Ayuntamiento, 25 viviendas, 6 servicios y 5 incidencias.
- 24 clientes, 30 cartas de juego y 3 especialidades públicas por sorteo. Sin objetivos secretos.
- Reparto: 5 clientes privados y 2 cartas; desde tu segundo turno robas una carta de juego. Máximo 3 cartas de juego simultáneamente.
- Dos acciones repetibles en cualquier orden. Tácticas antes, entre o después de las acciones.
- Vender consume un cliente. Buscar otro cuesta acción o carta; no hay mercado público.
- Prioridades hasta el final de tu próximo turno, con una carta de prórroga.
- Mano de clientes siempre visible, ofertas comparables y motivos de incompatibilidad por cliente.
- Base distinta por categoría; solo 4 de 24 clientes aceptan lujo, sin encajes obligatorios. Hospital rosa, obras rojas y nuevos modelos identificables.
- Cuatro ventas de una categoría disparan el cierre (+6). El rival conserva un turno de respuesta.
- Remontada: quien empieza su turno 15 puntos o más por detrás roba 1 cliente.
- Quien abre la partida solo tiene 1 acción en su primer turno.
- Cinco efectos de carta: quitar prioridad, explorar gratis, robar 1 cliente, próxima venta +3 y reserva +1 turno. Sin reacciones.
- Servidor autoritativo, partidas en SQLite, comandos idempotentes y control de revisión.
- Cuentas privadas con contraseña derivada mediante scrypt; sesiones con caducidad de 90 días.
- Firebase Cloud Messaging preparado: registro de dispositivos, canal de turno, cola persistente, reintentos y apertura de partida desde la notificación.
- Seis políticas de IA; simulador en Web Worker, semilla reproducible, métricas de categoría, especialidades, prioridades, cartas y exportación JSON/CSV.
- Arte de ciudad generado específicamente para el juego, iconos propios de app y Lucide en la interfaz.

## Estructura

Reglas actuales: `docs/REGLAS.md`. Datos completos: `docs/CATALOGO.md`. Balance histórico de 0.2.1 con 2560 ejecuciones en tres lotes: `docs/BALANCE.md` (semillas compartidas y repetidas; no son muestras independientes). Las partidas locales anteriores se conservan bajo claves de archivo; las online permanecen en SQLite, pero no continúan con las reglas nuevas. La interfaz inicia una nueva partida compatible.

| Carpeta | Contenido |
|---|---|
| `shared/` | Catálogo, reglas puras, proyección privada y políticas de IA |
| `src/` | Interfaz React, tablero, laboratorio y cliente Android |
| `server/` | API, autenticación, SQLite y notificaciones |
| `android/` | Proyecto nativo Capacitor; abre esta carpeta con Android Studio |
| `public/art/` | Atlas de ilustraciones usado en el juego |
| `docs/` | Reglas, despliegue, diseño y límites de esta versión |
| `reports/` | Partidas simuladas, capturas y resultados reales de pruebas |
| `tests/`, `e2e/` | Pruebas automáticas del motor, servidor y navegador |

## Desarrollo

Requisitos: Node 24, Java 21, Android SDK 36.

```powershell
npm ci
npm run server
```

En otra terminal:

```powershell
npm run dev
```

```powershell
npm test
npm run test:e2e
npm run simulate -- 400 equilibrada lujo
npx tsx scripts/tournament.ts 160
npm run android:sync
```

Compilación Android, desde `android/`:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = 'C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot'
.\gradlew.bat assembleDebug --no-daemon
```

La configuración Playwright utiliza Microsoft Edge. Se eligió como alternativa local porque no estaba disponible la skill Browser y el Chromium de caché no arrancaba en esta máquina. Se probaron 1440, 390 y 320 píxeles de ancho. El APK se probó también dentro de Android, no solo como página web.

## Antes de compartirlo fuera de casa

Sigue `docs/DESPLIEGUE.md`. Para vosotros dos basta un servidor pequeño siempre encendido y un proyecto Firebase propio. No se ha contratado ni creado ningún recurso de pago ni se ha publicado la app en Google Play.

Este APK está firmado con una clave **de depuración**: sirve para probarlo, no es un lanzamiento de tienda. La versión pública requeriría firma estable, recuperación/eliminación de cuenta, pruebas en vuestros móviles reales, política de privacidad y revisión adicional de seguridad. No se han implementado compras, publicidad ni seguimiento comercial.

El balance es provisional. Consulta `docs/BALANCE.md`: las simulaciones descubren tendencias y errores; no sustituyen jugar juntos ni prueban que no existan estrategias mejores.
