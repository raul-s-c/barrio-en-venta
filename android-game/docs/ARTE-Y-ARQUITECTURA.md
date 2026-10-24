# Dirección visual y arquitectura

## Dirección visual

### Actualización 0.2

El atlas actual es `public/art/city-atlas-v2.png`, generado con la herramienta integrada ImageGen, no con la API/CLI. Prompt de producción: atlas cuadrado 4 x 4 de miniaturas isométricas nítidas; en orden, ayuntamiento de tejado turquesa, villa moderna de lujo, bloque coral de vivienda media, casa pequeña menta, parque, colegio amarillo, metro turquesa, hospital rosa con cruz blanca, comercio naranja, teatro violeta, reforma verde, obras rojas con excavadora, altavoces de ruido, juzgado con balanza, oficina fiscal con monedas y carretera rota con autobús. Siluetas distintas, sin rótulos, con márgenes para uso a tamaño pequeño. El archivo tiene 1254 x 1254 píxeles y transparencia.

El render usa recortes SVG del bitmap, fondos semánticos y etiquetas de texto. No se depende solo del color: Hospital, Obras, Litigio, etc. aparecen escritos. Las casas también se diferencian por silueta, color y categoría. Los clientes permanecen en una banda fija desplazable horizontalmente; las ofertas y bloqueos proceden del motor autoritativo. Las especialidades son públicas y su bonus se incluye en cada venta.

Los párrafos siguientes documentan la base visual 0.1, conservada como antecedente; su atlas no es el tablero actual.

Ciudad mediterránea en miniatura, fondo verde salvia, papel blanco, dos agentes identificados por verde petróleo y terracota. La categoría también se muestra con texto: lujo, media, barata. No depende únicamente del color.

El concepto visual se generó con ImageGen antes de construir la interfaz. El resultado está en `docs/art/concept.png`. Se adaptó a información real y tamaños pequeños, en lugar de usar la maqueta como una imagen de fondo.

El atlas de producción `public/art/city-atlas.png` contiene 16 ilustraciones originales generadas en una cuadrícula 4 x 4: Ayuntamiento, villa, bloque familiar, casa pequeña, parque, colegio, metro, hospital, comercio, café, reforma urbana, obras, apartamento moderno, mansión, oficina y plano sin descubrir. No se utilizaron recursos visuales de Catan ni Azul.

Modo de generación: imagen nueva, no edición de fotografías ajenas. Resumen del encargo: miniaturas arquitectónicas mediterráneas isométricas, materiales táctiles, iluminación consistente, fondo blanco, sin textos y celdas de igual tamaño para recorte. El atlas se referencia directamente con ventanas SVG y CSS; los edificios no están dibujados con SVG. Se corrigió el recorte de celdas después de revisar capturas.

Se intentó generar una lámina adicional de retratos pero la herramienta rechazó esa generación. No forma parte de la entrega. Los clientes usan iniciales legibles. Los iconos de interfaz proceden de Lucide; el emblema de vivienda se adapta también a lanzador, splash y notificación Android.

## Decisiones técnicas

React + TypeScript + Capacitor, no Godot: el juego es un tablero 2D asíncrono, sin física 3D; compartir el mismo motor entre Android, servidor y laboratorio reduce discrepancias y facilita auditar las reglas. No se necesita Blender para ejecutar esta edición.

`shared/engine.ts` contiene la única implementación de efectos, turnos, puntuación y final. Toda acción se contrasta con las opciones legales. Es inmutable desde el punto de vista del llamador. El RNG con semilla permite repetir partidas.

El servidor guarda estado completo. `view()` expone exclusivamente la información del jugador autenticado. El cliente no envía puntos, ganadores, manos ni estados de partida; solo comandos. El identificador de comando y la revisión evitan dobles ventas y jugadas sobre un estado antiguo. La operación queda dentro de una transacción SQLite.

Las IA reciben `View`, nunca el estado privado del rival. Las reglas sí conocen las losetas para resolver efectos, pero las elecciones y sus textos no revelan identidades ocultas. La semilla no se envía al cliente online.

El laboratorio usa Web Worker para no congelar la interfaz. El botón Detener termina el trabajador. Cambiar el bonus de cierre no cambia las reglas de una partida online ya creada. No hay modelo remoto de IA, coste por token ni envío de partidas a un proveedor de modelos.

## Dependencias

React, Vite, TypeScript, Capacitor, Express, Lucide, Firebase Admin y sus dependencias permanecen declarados y fijados en `package-lock.json`. Sus avisos/licencias se conservan en los paquetes instalados. SQLite lo proporciona Node 24. No se han incorporado recursos comerciales comprados ni contratado APIs de pago.

Fuentes técnicas de referencia: [Capacitor](https://capacitorjs.com/docs), [FCM Android](https://firebase.google.com/docs/cloud-messaging/android/get-started), [SQLite en Node](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html).
