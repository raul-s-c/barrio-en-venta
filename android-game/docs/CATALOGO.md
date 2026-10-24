# Catálogo · digital-0.2.3

## Losetas

| ID | Nombre | Tipo | Base | Rasgos |
| --- | --- | --- | --- | --- |
| town | Ayuntamiento | town | 0 |  |
| h0 | Ático con terraza | Lujosa | 11 | Exclusiva, Centrica |
| h1 | Chalet con jardín | Lujosa | 11 | Familiar, Tranquila |
| h2 | Dúplex reformado | Lujosa | 10 | Exclusiva, Reformada |
| h3 | Piso señorial | Lujosa | 10 | Exclusiva, Centrica |
| h4 | Villa discreta | Lujosa | 11 | Tranquila, Exclusiva |
| h5 | Loft de autor | Lujosa | 10 | Centrica, Reformada |
| h6 | Casa modernista | Lujosa | 10 | Exclusiva, Familiar |
| h7 | Piso familiar | Media | 7 | Familiar, Tranquila |
| h8 | Piso junto al metro | Media | 7 | Centrica, Conexion |
| h9 | Apartamento luminoso | Media | 7 | Centrica, Reformada |
| h10 | Casa adosada | Media | 7 | Familiar, Tranquila |
| h11 | Piso con balcón | Media | 6 | Centrica, Tranquila |
| h12 | Vivienda reformada | Media | 7 | Reformada, Familiar |
| h13 | Piso de barrio | Media | 6 | Familiar, Conexion |
| h14 | Estudio céntrico | Barata | 4 | Centrica, Inversion |
| h15 | Piso a reformar | Barata | 4 | Reformable, Inversion |
| h16 | Bajo interior | Barata | 3 | Barata, Inversion |
| h17 | Apartamento pequeño | Barata | 4 | Centrica, Barata |
| h18 | Piso de oportunidad | Barata | 4 | Inversion, Reformable |
| h19 | Vivienda heredada | Barata | 4 | Barata, Familiar |
| h20 | Local reconvertido | Barata | 3 | Inversion, Reformable |
| h21 | Residencia panorámica | Lujosa | 11 | Exclusiva, Tranquila |
| h22 | Apartamento familiar | Media | 7 | Familiar, Reformada |
| h23 | Estudio de oportunidad | Barata | 4 | Barata, Reformable |
| h24 | Casa compacta | Barata | 4 | Familiar, Tranquila |
| u0 | Parque | service | 0 |  |
| u1 | Colegio | service | 0 |  |
| u2 | Metro | service | 0 |  |
| u3 | Hospital | service | 0 |  |
| u4 | Comercio | service | 0 |  |
| u5 | Ocio | service | 0 |  |
| u6 | Obras | incident | 0 |  |
| u7 | Ruido | incident | 0 |  |
| u8 | Impuestos altos | incident | 0 |  |
| u9 | Litigio | incident | 0 |  |
| u10 | Mala conexion | incident | 0 |  |

## Clientes

| ID | Cliente | Categorías | Preferencias | Puntos |
| --- | --- | --- | --- | --- |
| 0 | Familia con dos niños | Media | Familiar, Colegio, Parque | +2 por Familiar, Colegio y Parque. -2 sin Colegio ni Parque. |
| 1 | Madre práctica | Barata, Media | Colegio, Comercio, Metro | +2 Colegio, +1 Comercio, +1 Metro. -1 con Obras. |
| 2 | Familia que crece | Media | Familiar, Parque | +3 Familiar, +2 Parque. -2 con Ruido. |
| 3 | Padres primerizos | Media | Hospital, Colegio | +2 Hospital, +2 Colegio. -2 sin ninguno. |
| 4 | Pareja joven | Barata, Media | Metro, Ocio, Centrica | +2 Metro, +2 Ocio, +1 Céntrica. -1 Tranquila sin Metro. |
| 5 | Profesional sin tiempo | Media | Metro, Comercio, Reformada | +2 Metro, +1 Comercio, +2 Reformada. -2 Mala conexión. |
| 6 | Amantes del centro | Barata, Media | Metro, Ocio, Comercio | +2 por cada Metro, Ocio y Comercio. -1 sin servicios. |
| 7 | Reubicación exprés | Barata, Media |  | +1 y roba una carta de agencia al vender. |
| 8 | Inversor de alquiler | Barata, Media | Inversion, Metro | +3 Inversión, +2 Metro. |
| 9 | Cazador de gangas | Barata | Reformable, Conexion | +3 Reformable, +2 Conexión. |
| 10 | Fondo discreto | Media | Inversion, Comercio | +2 Inversión, +2 Comercio. -2 con Litigio. |
| 11 | Comprador oportunista | Barata, Media |  | +4 con cualquier incidencia adyacente; -2 sin incidencias. |
| 12 | Directiva internacional | Lujosa | Exclusiva, Metro, Comercio | +3 Exclusiva, +2 Metro, +1 Comercio. -2 con Obras. |
| 13 | Matrimonio reservado | Lujosa | Tranquila, Parque, Hospital | +3 Tranquila, +2 Parque, +2 Hospital. -3 con Ruido u Ocio. |
| 14 | Cliente de capricho | Lujosa | Exclusiva | +6 si es Exclusiva y tiene 2 servicios. -3 si falta alguna condición. |
| 15 | Comprador de prestigio | Media, Lujosa | Exclusiva, Reformada, Centrica | +2 Exclusiva, +2 Reformada, +2 Céntrica. -2 Impuestos. |
| 16 | Jubilados activos | Media | Hospital, Parque, Comercio | +2 Hospital, +2 Parque, +1 Comercio. -2 Ruido u Ocio. |
| 17 | Teletrabajador | Barata, Media | Tranquila, Parque | +3 Tranquila, +2 Parque. -3 Ruido. |
| 18 | Escritora | Barata, Media | Tranquila, Parque | +2 Tranquila, +2 Parque. -2 por Metro y por Ocio. |
| 19 | Pareja con perro | Barata, Media | Parque, Comercio | +3 Parque, +1 Comercio. -1 sin Parque. |
| 20 | Cliente indeciso | Barata, Media |  | +3 con al menos 1 servicio vecino. El rival roba una carta. |
| 21 | Cliente recomendado | Barata, Media |  | +3 si tienes prioridad en la vivienda. |
| 22 | Hipoteca justa | Barata, Media | Comercio | +3 Barata, +1 Comercio. -2 Impuestos. |
| 23 | Cliente emocional | Barata, Media |  | +2 por servicio, máximo +4. -2 sin servicios. |

## Cartas de juego

| ID | Carta | Tipo | Efecto |
| --- | --- | --- | --- |
| 0 | Quitar prioridad | tactic | Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti. |
| 1 | Explorar gratis | tactic | Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual. |
| 2 | Robar 1 cliente | tactic | Añade a tu mano 1 cliente al azar del mazo. |
| 3 | Próxima venta +3 | tactic | Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual. |
| 4 | Reserva +1 turno | tactic | Alarga una de tus reservas hasta el final de un turno tuyo más. |
| 5 | Quitar prioridad | tactic | Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti. |
| 6 | Explorar gratis | tactic | Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual. |
| 7 | Robar 1 cliente | tactic | Añade a tu mano 1 cliente al azar del mazo. |
| 8 | Próxima venta +3 | tactic | Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual. |
| 9 | Reserva +1 turno | tactic | Alarga una de tus reservas hasta el final de un turno tuyo más. |
| 10 | Quitar prioridad | tactic | Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti. |
| 11 | Explorar gratis | tactic | Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual. |
| 12 | Robar 1 cliente | tactic | Añade a tu mano 1 cliente al azar del mazo. |
| 13 | Próxima venta +3 | tactic | Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual. |
| 14 | Reserva +1 turno | tactic | Alarga una de tus reservas hasta el final de un turno tuyo más. |
| 15 | Quitar prioridad | tactic | Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti. |
| 16 | Explorar gratis | tactic | Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual. |
| 17 | Robar 1 cliente | tactic | Añade a tu mano 1 cliente al azar del mazo. |
| 18 | Próxima venta +3 | tactic | Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual. |
| 19 | Reserva +1 turno | tactic | Alarga una de tus reservas hasta el final de un turno tuyo más. |
| 20 | Quitar prioridad | tactic | Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti. |
| 21 | Explorar gratis | tactic | Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual. |
| 22 | Robar 1 cliente | tactic | Añade a tu mano 1 cliente al azar del mazo. |
| 23 | Próxima venta +3 | tactic | Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual. |
| 24 | Reserva +1 turno | tactic | Alarga una de tus reservas hasta el final de un turno tuyo más. |
| 25 | Quitar prioridad | tactic | Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti. |
| 26 | Explorar gratis | tactic | Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual. |
| 27 | Robar 1 cliente | tactic | Añade a tu mano 1 cliente al azar del mazo. |
| 28 | Próxima venta +3 | tactic | Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual. |
| 29 | Reserva +1 turno | tactic | Alarga una de tus reservas hasta el final de un turno tuyo más. |

## Especialidades públicas

| Ficha | Efecto |
| --- | --- |
| Especialista en lujo | +2 puntos por cada lujosa que vendas. |
| Agencia residencial | +2 puntos por cada vivienda media que vendas. |
| Ventas de proximidad | +2 puntos por cada barata que vendas. |
