# Barrio en Venta digital

Android + React/Capacitor; servidor autoritativo Node 24/SQLite, FCM nativo y Web Push. Sin dependencia de un proveedor de base de datos. El mismo motor puro decide las acciones de la app, servidor y simulador.

## Direccion visual

Concepto: ciudad mediterranea de miniaturas isometricas. Fondo de mapa verde salvia frio #dfe6dc, superficies blancas #ffffff, texto #203438, terracota #ac493a y verde azulado #217878. Titulos Georgia; controles system-ui. Espaciado 4/8/12/16/24; controles 44px; bordes 8px. Tablero abierto, panel lateral en escritorio y hoja bajo mapa en movil. Sin dependencias visuales remotas.

Pantallas: partidas privadas, tablero, cartera, agencia, cronica, configuracion y laboratorio. La interfaz adapta datos reales del motor; el concepto no fija puntuaciones, nombres, ronda ni textos de ejemplo. Iconos Lucide. Assets bitmap de miniaturas generados; hexagonos, rutas, zonas seleccionadas y marcadores son geometria del tablero.

## Adaptacion asincrona 0.1

Mantiene 37 hexagonos, 24 clientes, 30 cartas de agencia, 12 objetivos y cierre por cinco. Dos acciones distintas; pasar consume las restantes. Hasta dos tacticas gratuitas por turno. Una carta de venta por operacion. Las reacciones se preparan en tu turno y reaccionan automaticamente una vez; nunca necesitan que ambos esten conectados. El crecimiento de ciudad es automatico y determinista. El objetivo se asigna al iniciar. Descartes por limite automaticos de la carta mas antigua, visibles en cronica. Las diferencias especificas de cartas se publican en el catalogo digital. Ningun resultado de las antiguas simulaciones se considera validacion de este motor.

## Verificacion prevista

Invariantes del motor, todos los efectos, reacciones, fin de partida, manos privadas, repeticion de solicitudes, carreras entre dispositivos, persistencia al reiniciar, flujo de dos cuentas, lab en worker, Android APK, tamanos 390/430 y escritorio.
