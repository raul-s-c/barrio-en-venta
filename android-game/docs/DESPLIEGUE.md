# Activar partidas asíncronas y avisos Android

## Estado de la entrega

El cliente, API autoritativa, base persistente y la integración FCM están implementados. No hay servidor público ni proyecto Firebase configurado. No se ha verificado una notificación remota real entre dos móviles. El modo entrenamiento y el laboratorio son utilizables sin esta configuración.

## 1. Firebase del propietario

1. Crea o selecciona tu proyecto en la consola Firebase.
2. Registra la aplicación Android con paquete exacto `es.barrioenventa.app`.
3. Descarga `google-services.json` y colócalo en `android/app/google-services.json`.
4. Habilita la API de Firebase Cloud Messaging si no estuviera habilitada.
5. Genera una cuenta de servicio con permiso para enviar mensajes FCM. Guarda el JSON privado solamente en el servidor, por ejemplo `secrets/firebase-service-account.json`.

El JSON Android identifica el proyecto y va dentro del APK. **La clave de la cuenta de servicio nunca debe incorporarse al APK, `public/`, Git ni una captura.** Las rutas habituales de secretos están ignoradas por Git/Docker.

Fuente oficial: [configuración Android de Capacitor Push](https://capacitorjs.com/docs/apis/push-notifications) y [configuración del cliente FCM](https://firebase.google.com/docs/cloud-messaging/android/get-started).

## 2. Servidor siempre disponible

La API necesita Node 24 y almacenamiento persistente. SQLite implica una sola instancia escritora; no escales horizontalmente este prototipo sin migrar el almacenamiento.

Se incluyen `Dockerfile`, `compose.yaml` y `Caddyfile` como receta de despliegue. No se ha ejecutado Docker ni se ha validado un dominio público en esta entrega.

En un servidor propio con Docker, DNS apuntando a él y puertos 80/443 accesibles:

1. Configura `DOMAIN` en un archivo `.env`, tomando `.env.example` como referencia.
2. Coloca la cuenta de servicio en `secrets/firebase-service-account.json`.
3. Ejecuta `docker compose up -d --build`.
4. Comprueba `https://TU-DOMINIO/api/health`.

Caddy actúa como único punto de entrada HTTPS. No publiques directamente el puerto 8788 del contenedor. El servidor confía en un único proxy de entrada y rechaza HTTP en producción. [Referencia de HTTPS automático de Caddy](https://caddyserver.com/docs/automatic-https).

Para ejecutar sin Docker, define `NODE_ENV=production`, `DB_PATH`, `ALLOWED_ORIGINS` y `GOOGLE_APPLICATION_CREDENTIALS`, y usa un proxy HTTPS delante. El directorio de la base debe sobrevivir a cada reinicio/despliegue.

## 3. Compilar de nuevo el APK

Tras añadir el JSON Android:

```powershell
npx tsx scripts/check-production.ts https://TU-DOMINIO
npm run android:sync
```

Compila `assembleDebug` desde `android/` o usa Android Studio. Vite incorpora una señal de configuración: si falta `google-services.json`, la app no intentará registrar FCM y mostrará un mensaje claro. Por eso no basta con configurar solo el servidor: hay que reconstruir el APK.

Para una versión final, genera y custodia una clave de firma privada propia y compila `assembleRelease`. No uses la clave de depuración como identidad definitiva del proyecto.

## 4. Dos móviles

1. Instala el mismo APK en los dos móviles.
2. Abre Partidas y conexión; guarda la misma dirección HTTPS del servidor.
3. Crea una cuenta distinta en cada móvil. No reutilices contraseñas personales en esta versión de pruebas.
4. Crea una partida en uno y usa su código en el otro.
5. Activa los avisos de turno en ambos y acepta el permiso de Android.
6. Completa un turno y termina explícitamente el turno; comprueba la notificación con el otro móvil bloqueado.
7. Pulsa la notificación: debe abrir la partida correcta.

La app no realiza jugadas online sin conexión. Si el envío queda incierto, ofrece reintentarlo con el mismo identificador para no duplicar acciones. La partida continúa almacenada en el servidor aunque ambos móviles estén apagados.

## Cómo funcionan los avisos

Un cambio de turno al rival crea una fila de `outbox` en la misma transacción que guarda la jugada. Un trabajador revisa la cola cada 5 segundos; los intentos fallidos se reprograman, hasta ocho intentos. Los mensajes cuyo turno ya pasó se descartan. El mensaje incluye `notification` y datos de partida, no solamente un mensaje silencioso. Se usa prioridad alta, canal `turnos`, etiqueta por partida y TTL de 24 horas.

No se envían notificaciones por cada acción intermedia ni durante dos turnos consecutivos del mismo jugador. El estado de turno permanece visible y al abrir la app se actualiza. Los avisos de cierre final no están implementados en esta versión.

Con la aplicación cerrada, Android/FCM gestiona el aviso visible; el toque abre la partida. Android, permisos, batería, conectividad y espacios privados pueden retrasar o impedir la entrega. No se promete entrega instantánea o exactamente una vez. La cola evita duplicar trabajos, pero un fallo de red tras aceptar FCM puede provocar un reintento; la etiqueta de notificación reduce avisos duplicados visibles. [Recepción de mensajes FCM](https://firebase.google.com/docs/cloud-messaging/android/receive-messages).

## Operación y límites

- Haz copias de SQLite con una herramienta de copia consistente o detén la API antes de copiarla. No copies solo el archivo principal mientras WAL está activo.
- Revisa `outbox.last_error`, `attempts` y el registro de servidor si no llegan avisos. `/api/health` indica presencia de configuración, no prueba la entrega ni la validez de una credencial.
- Sesiones de 90 días, invitaciones privadas aleatorias, contraseñas scrypt y límites de peticiones. No hay recuperación de contraseña, borrado autónomo de cuenta, moderación ni control de acceso comercial.
- Sesión guardada en preferencias privadas de Android; no hay almacenamiento de tokens respaldado por hardware. Se ha desactivado la copia de seguridad Android.
- El cliente web no implementa Web Push. Los avisos nativos se han preparado para Android.
- Para distribución pública, faltan revisión de seguridad, firma de producción y validación en varios dispositivos reales. La prueba actual de Android usa un emulador API 36.
