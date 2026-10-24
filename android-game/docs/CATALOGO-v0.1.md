# Catálogo digital 0.1.0

Generado desde shared/catalog.ts.

## Viviendas y ciudad

| ID | Nombre | Categoría / tipo | Base | Rasgos |
| --- | --- | --- | --- | --- |
| town | Ayuntamiento | town | 0 |  |
| h0 | Ático con terraza | Lujosa | 6 | Exclusiva, Centrica |
| h1 | Chalet con jardín | Lujosa | 6 | Familiar, Tranquila |
| h2 | Dúplex reformado | Lujosa | 5 | Exclusiva, Reformada |
| h3 | Piso señorial | Lujosa | 5 | Exclusiva, Centrica |
| h4 | Villa discreta | Lujosa | 6 | Tranquila, Exclusiva |
| h5 | Loft de autor | Lujosa | 5 | Centrica, Reformada |
| h6 | Casa modernista | Lujosa | 5 | Exclusiva, Familiar |
| h7 | Piso familiar | Media | 4 | Familiar, Tranquila |
| h8 | Piso junto al metro | Media | 4 | Centrica, Conexion |
| h9 | Apartamento luminoso | Media | 4 | Centrica, Reformada |
| h10 | Casa adosada | Media | 4 | Familiar, Tranquila |
| h11 | Piso con balcón | Media | 3 | Centrica, Tranquila |
| h12 | Vivienda reformada | Media | 4 | Reformada, Familiar |
| h13 | Piso de barrio | Media | 3 | Familiar, Conexion |
| h14 | Estudio céntrico | Barata | 2 | Centrica, Inversion |
| h15 | Piso a reformar | Barata | 2 | Reformable, Inversion |
| h16 | Bajo interior | Barata | 1 | Barata, Inversion |
| h17 | Apartamento pequeño | Barata | 2 | Centrica, Barata |
| h18 | Piso de oportunidad | Barata | 2 | Inversion, Reformable |
| h19 | Vivienda heredada | Barata | 2 | Barata, Familiar |
| h20 | Local reconvertido | Barata | 1 | Inversion, Reformable |
| u0 | Parque | service | 0 |  |
| u1 | Parque | service | 0 |  |
| u2 | Colegio | service | 0 |  |
| u3 | Metro | service | 0 |  |
| u4 | Metro | service | 0 |  |
| u5 | Hospital | service | 0 |  |
| u6 | Comercio | service | 0 |  |
| u7 | Ocio | service | 0 |  |
| u8 | Reforma urbana | service | 0 |  |
| u9 | Obras | incident | 0 |  |
| u10 | Obras | incident | 0 |  |
| u11 | Ruido | incident | 0 |  |
| u12 | Impuestos altos | incident | 0 |  |
| u13 | Litigio | incident | 0 |  |
| u14 | Mala conexion | incident | 0 |  |

## Clientes

| ID | Cliente | Acepta | Familia | Preferencias |
| --- | --- | --- | --- | --- |
| 0 | Familia con dos niños | Media, Lujosa | Familiar | +2 por Familiar, Colegio y Parque. -2 sin Colegio ni Parque. |
| 1 | Madre práctica | Barata, Media | Familiar | +2 Colegio, +1 Comercio, +1 Metro. -1 con Obras. |
| 2 | Familia que crece | Media, Lujosa | Familiar | +3 Familiar, +2 Parque. -2 con Ruido. |
| 3 | Padres primerizos | Media | Familiar | +2 Hospital, +2 Colegio. -2 sin ninguno. |
| 4 | Pareja joven | Barata, Media | Urbano | +2 Metro, +2 Ocio, +1 Céntrica. -1 Tranquila sin Metro. |
| 5 | Profesional sin tiempo | Media, Lujosa | Urbano | +2 Metro, +1 Comercio, +2 Reformada. -2 Mala conexión. |
| 6 | Amantes del centro | Barata, Media, Lujosa | Urbano | +2 por cada Metro, Ocio y Comercio. -1 sin servicios. |
| 7 | Reubicación exprés | Barata, Media, Lujosa | Flexible | +1 y roba una carta de agencia al vender. |
| 8 | Inversor de alquiler | Barata, Media | Inversor | +3 Inversión, +2 Metro. |
| 9 | Cazador de gangas | Barata | Inversor | +3 Reformable, +2 Reforma urbana. |
| 10 | Fondo discreto | Media, Lujosa | Inversor | +2 Inversión, +2 Comercio. -2 con Litigio. |
| 11 | Comprador oportunista | Barata, Media | Inversor | +4 con cualquier incidencia adyacente; -2 sin incidencias. |
| 12 | Directiva internacional | Lujosa | Premium | +3 Exclusiva, +2 Metro, +1 Comercio. -2 con Obras. |
| 13 | Matrimonio reservado | Lujosa | Premium | +3 Tranquila, +2 Parque, +2 Hospital. -3 con Ruido u Ocio. |
| 14 | Cliente de capricho | Lujosa | Premium | +6 si es Exclusiva y tiene 2 servicios. -3 si falta alguna condición. |
| 15 | Comprador de prestigio | Media, Lujosa | Premium | +2 Exclusiva, +2 Reforma urbana, +2 Céntrica. -2 Impuestos. |
| 16 | Jubilados activos | Media | Tranquilo | +2 Hospital, +2 Parque, +1 Comercio. -2 Ruido u Ocio. |
| 17 | Teletrabajador | Barata, Media | Tranquilo | +3 Tranquila, +2 Parque. -3 Ruido. |
| 18 | Escritora | Barata, Media, Lujosa | Tranquilo | +2 Tranquila, +2 Parque. -2 por Metro y por Ocio. |
| 19 | Pareja con perro | Barata, Media | Tranquilo | +3 Parque, +1 Comercio. -1 sin Parque. |
| 20 | Cliente indeciso | Barata, Media, Lujosa | Flexible | +3 con al menos 2 rasgos o servicios. El rival roba una carta. |
| 21 | Cliente recomendado | Barata, Media, Lujosa | Flexible | +3 si tienes prioridad en la vivienda. |
| 22 | Hipoteca justa | Barata, Media | Flexible | +3 Barata, +1 Comercio. -2 Impuestos. |
| 23 | Cliente emocional | Barata, Media, Lujosa | Flexible | +2 por servicio, máximo +4. -2 sin servicios. |

## Agencia

| ID | Carta | Tipo | Efecto |
| --- | --- | --- | --- |
| 0 | Home staging | sale | +3 en Media o Lujosa; +1 en Barata. |
| 1 | Reportaje fotográfico | sale | Ignora una penalización de barrio por Obras, Ruido o Mala conexión. |
| 2 | Puertas abiertas | sale | +2 al vender a un cliente público. |
| 3 | Oferta final | sale | +2. Otros +2 si completa una línea. |
| 4 | Reforma exprés | sale | +4 en una vivienda Reformable. |
| 5 | Firma en notaría | sale | Roba una carta de agencia al vender. |
| 6 | Contacto bancario | sale | Barata o Media: ignora la penalización del cliente y +1. |
| 7 | Exclusiva premium | sale | +4 en Lujosa con prioridad propia. |
| 8 | Contraoferta | trap | Preparada: resta 3 a la próxima venta rival. |
| 9 | Cliente se lo piensa | trap | Preparada: resta 2 a la próxima venta pública rival. |
| 10 | Agenda completa | trap | Preparada: la próxima reserva rival no podrá venderse ese turno. |
| 11 | Llamada del propietario | tactic | Libera una prioridad rival. Su dueño roba una carta. |
| 12 | Guerra de comisiones | tactic | Disputa una prioridad rival gratis. Esa vivienda vale -1 para ti. |
| 13 | Visita sorpresa | sale | Ignora las penalizaciones impresas de las incidencias. Permite vender junto a Litigio. |
| 14 | Estudio de mercado | tactic | Mira en privado esta loseta y las dos siguientes por coordenadas. |
| 15 | Contacto en urbanismo | tactic | Revela esta frontera sin prioridad. No consume Explorar. |
| 16 | Cliente referido | tactic | Roba 3 clientes y elige 1. |
| 17 | CRM impecable | tactic | Roba 2 clientes privados. |
| 18 | Tasación independiente | tactic | Consulta cuántos clientes rivales aceptan cada categoría. |
| 19 | Rumor de barrio | tactic | Añade Familiar a esta vivienda durante tu turno. |
| 20 | Bajada de tipos | sale | +2 en Media o Lujosa. |
| 21 | Subida de tipos | trap | Preparada: resta 3 a la próxima Lujosa rival; el rival roba una carta. |
| 22 | Boom del alquiler | sale | +3 en Barata o con rasgo Inversión. |
| 23 | Barrio de moda | sale | +2 si tiene algún servicio adyacente. |
| 24 | Mala prensa | tactic | Las viviendas junto a esta incidencia valen -2 hasta tu próximo turno. |
| 25 | Operación retorno | sale | Vende una Barata como Media, conservando su base. |
| 26 | Licencia aprobada | sale | Permite vender junto a Litigio sin Expediente. |
| 27 | Fin de obras | tactic | Convierte Obras en Reforma urbana para el resto de la partida. |
| 28 | Nueva parada | tactic | Junto a Metro o Ayuntamiento: añade Conexión y +1 al barrio permanentemente. |
| 29 | Convenio municipal | tactic | Roba una carta y recupera todas tus prioridades. |

## Objetivos

| ID | Objetivo | Condición | Puntos |
| --- | --- | --- | --- |
| 0 | Especialista en lujo | 4 Lujosas | 8 |
| 1 | Venta relámpago | 5 Baratas | 7 |
| 2 | Agencia familiar | 3 clientes Familiares | 6 |
| 3 | Cartera equilibrada | 2 ventas de cada categoría | 8 |
| 4 | Rey del centro | 4 viviendas Céntricas o junto a Metro/Ocio/Comercio | 6 |
| 5 | Barrios tranquilos | 3 viviendas Tranquilas o junto a Parque | 6 |
| 6 | Inversor nato | 3 viviendas Inversión o Reformables | 7 |
| 7 | Urbanista | 2 acciones Ayuntamiento o tácticas urbanas | 6 |
| 8 | Dominio de agenda | 3 prioridades al final | 6 |
| 9 | Cierre perfecto | Cerrar y superar en 5 al rival antes de este objetivo | 8 |
| 10 | Contraataque | Completar línea en respuesta final | 8 |
| 11 | Sin miedo al riesgo | 3 ventas junto a incidencias | 6 |
