# Juego inmobiliario - notas de diseno

## Premisa

Juego competitivo para 2 jugadores. Cada jugador representa a un vendedor de una inmobiliaria. El objetivo es vender propiedades a distintos clientes, aprovechando informacion del barrio, prioridad de visita, cartas sorpresa y mejoras urbanas.

Inspiraciones principales:

- Catan: tablero modular hexagonal, expansion territorial, importancia de adyacencias.
- Azul: tension por el momento de cierre, gestion de turnos y posibilidad de forzar el final de partida con una decision calculada.

## Tablero

- El tablero esta formado por losetas hexagonales boca abajo.
- En el centro esta el Ayuntamiento, que funciona como punto inicial y/o eje administrativo.
- Las losetas ocultas pueden revelar:
  - Viviendas.
  - Servicios del barrio: parque, hospital, colegio, transporte, comercio, zonas de ocio, etc.
  - Elementos negativos o restrictivos: obras, ruido, impuestos, okupacion, litigio, mala conexion, etc.

## Fantasia de juego

Los jugadores compiten por conocer mejor la ciudad, descubrir oportunidades y vender la propiedad adecuada al cliente adecuado antes que su rival.

La emocion central deberia venir de:

- Descubrir losetas con incertidumbre.
- Pelear por prioridad para ensenar viviendas.
- Elegir si vender pronto o preparar una venta mas valiosa.
- Cerrar la partida en un momento que beneficie al jugador que fuerza el final.

## Turno base candidato

En cada turno, un jugador podria elegir una accion principal:

1. Explorar: revelar una loseta adyacente a una zona ya conocida.
2. Reservar visita: ganar prioridad sobre una vivienda descubierta.
3. Ensenar vivienda: intentar vender una propiedad a un cliente disponible.
4. Jugar carta: usar una carta sorpresa, evento o ventaja comercial.
5. Captar cliente: robar o seleccionar un nuevo objetivo de cliente.

Hay que decidir si cada turno tiene una sola accion potente o varias acciones pequenas.

## Losetas de vivienda

Cada vivienda podria tener atributos como:

- Precio base.
- Tipo: piso, chalet, estudio, lujo, local reconvertido, vivienda familiar.
- Estado: reformado, a reformar, obra nueva.
- Preferencias: tranquilidad, servicios, transporte, colegios, zonas verdes, rentabilidad.

El valor final de venta podria depender de los bonus/malus de losetas adyacentes.

## Losetas de barrio

Ejemplos de losetas que dan bonus a viviendas cercanas:

- Parque: aumenta valor para familias, mascotas y compradores que buscan tranquilidad.
- Hospital: aumenta valor para mayores o seguridad, pero puede penalizar por ruido si se quiere.
- Colegio: muy valioso para familias.
- Metro/transporte: aumenta liquidez y valor para jovenes profesionales.
- Supermercado/comercio: bonus general pequeno.
- Zona de ocio: bonus para jovenes, penalizacion para clientes que quieren silencio.
- Obra publica: penaliza ahora, podria dar bonus futuro.

Decision pendiente: los bonus pueden afectar solo a adyacentes directas o tambien a radio 2.

## Clientes y objetivos

Los clientes funcionan como objetivos de venta. Cada cliente tendria preferencias y condiciones.

Ejemplos:

- Familia joven: quiere colegio, parque y vivienda amplia.
- Inversor: quiere precio bajo y potencial de revalorizacion.
- Jubilados: quieren hospital, tranquilidad y pocos riesgos.
- Pareja joven: quiere transporte, ocio y precio moderado.
- Cliente premium: quiere vivienda de lujo y varios servicios positivos cerca.
- Comprador urgente: da menos puntos, pero permite vender rapido.

Cada jugador podria tener clientes privados, clientes publicos o una mezcla de ambos.

## Prioridad y visitas

Mecanica candidata:

- Al revelar o reservar una vivienda, un jugador puede poner una ficha de prioridad.
- La prioridad da derecho preferente a ensenar esa vivienda a un cliente.
- El rival puede competir por la vivienda gastando una carta, pagando una comision, usando una accion de contraoferta o esperando a que expire la prioridad.

Esto crea tension sin bloquear por completo el tablero.

## Cartas sorpresa

Tipos posibles:

- Evento de mercado: subida/bajada de tipos, boom inmobiliario, regulacion, reforma urbana.
- Tactica comercial: jornada de puertas abiertas, contacto bancario, home staging, rebaja agresiva.
- Interaccion con rival: contraoferta, cliente indeciso, retraso de documentacion, exclusiva compartida.
- Informacion: mirar una loseta boca abajo, cambiar una loseta revelada, reservar sin revelar publicamente.

Tono recomendado: competitivo y divertido, no demasiado destructivo.

## Final de partida estilo Azul

La partida deberia poder terminar por una accion consciente de un jugador.

Opciones candidatas:

1. Cierre por ventas: cuando un jugador completa cierto numero de ventas, puede declarar cierre de trimestre.
2. Cierre por contrato estrella: vender una propiedad premium permite activar el final.
3. Cierre por agenda: cada venta avanza un marcador; al llegar al final, el jugador activo decide si cerrar o prolongar.
4. Cierre por Ayuntamiento: al desbloquear suficientes distritos alrededor del Ayuntamiento, se abre la posibilidad de cerrar.

Objetivo de diseno: que cerrar temprano sea viable si vas por delante, pero arriesgado si el rival tiene ventas grandes preparadas.

## Puntuacion candidata

Puntos por:

- Valor final de venta.
- Encaje con las preferencias del cliente.
- Bonus por barrios bien conectados.
- Bonus por vender varios tipos de propiedad.
- Objetivos secretos.
- Penalizaciones por clientes no atendidos, viviendas reservadas sin vender o cartas negativas pendientes.

## Preguntas abiertas

- El juego debe durar cuanto: 20, 30, 45 o 60 minutos?
- Debe ser solo para 2 jugadores o ampliable a 3-4?
- Queremos un tono mas familiar, estrategico, humoristico o romantico/personalizado?
- La informacion oculta debe ser alta, media o baja?
- Las cartas sorpresa deben ser suaves o pueden fastidiar de verdad?
- La venta debe resolverse con calculo directo o con algo de azar?
- Que importancia debe tener el dinero frente a los puntos de prestigio/comision?

## Proxima decision recomendada

Definir el bucle basico:

1. Que hace exactamente un jugador en su turno.
2. Como se vende una vivienda.
3. Que condicion permite cerrar la partida.

Cuando esas tres cosas funcionen, se podran disenar losetas, cartas, clientes y prototipos.

## Estado v1

La primera version completa ya esta desarrollada en estos archivos:

- `reglamento-v1.md`: reglas completas, turno, venta, prioridad y final de partida.
- `componentes-v1.md`: inventario de losetas, viviendas, servicios, incidencias y tablero personal.
- `tarjetas-clientes-v1.md`: 24 clientes listos para convertir en tarjetas.
- `tarjetas-agencia-v1.md`: 30 cartas de agencia, con un mazo recomendado de 20 para primera partida.
- `objetivos-y-balanceo-v1.md`: objetivos secretos, curva de puntos y palancas de balanceo.
- `prototipo-rapido-v1.md`: version simplificada para imprimir, cortar y probar.

Decision de diseno fijada:

- Juego competitivo para 2 jugadores.
- Cada jugador tiene tres lineas de ventas: Lujosas, Medias y Baratas.
- Completar 5 viviendas de una linea activa el final.
- El rival tiene un ultimo turno completo.
- El jugador que activa el final gana +5, pero el rival puede contraatacar.

Hipotesis principal de balance:

- Baratas deben ser el plan rapido.
- Medias deben ser el plan flexible.
- Lujosas deben ser el plan de alto valor, con mayor riesgo y bloqueo de prioridades.
