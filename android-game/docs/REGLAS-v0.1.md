# Reglamento digital 0.1.0

## Objetivo

Gana el mayor prestigio total. Vender la quinta vivienda de una categoría dispara el final, pero no otorga automáticamente la victoria. Se juega sin temporizador; una persona puede tardar horas o días en completar su turno.

## Preparación

Ciudad hexagonal de radio 3: 37 casillas, con Ayuntamiento central. Se barajan las otras 36 losetas y se revelan las seis adyacentes al centro. Hay 7 viviendas de cada categoría, 9 servicios y 6 incidencias.

Cada jugador recibe 2 clientes privados, 2 cartas de agencia, 1 objetivo secreto y capacidad para mantener 4 prioridades. Tres clientes públicos forman el escaparate. La persona inicial se sortea en online. Los mazos se reciclan al agotarse.

## Turno

Hasta **dos acciones principales distintas**. Se puede terminar antes. Además, hasta **dos cartas tácticas o reacciones preparadas**, sin gastar acción. Una carta de venta se añade a una venta y no gasta uno de esos dos usos tácticos. No puede haber más de una reacción propia preparada.

| Acción | Efecto |
|---|---|
| Explorar | Revela una loseta oculta adyacente a cualquier descubierta. Si es vivienda, recibe prioridad propia gratuita si queda capacidad. |
| Reservar/disputar | Pon una prioridad en una vivienda libre descubierta. Si tenía prioridad rival, descarta una carta de agencia y el rival roba otra. No se puede reservar sin capacidad libre. |
| Vender | Elige vivienda y cliente compatible de tu agenda o del escaparate. Puede ir acompañada de una carta de venta. No hace falta tener prioridad; la prioridad rival sí bloquea. |
| Captar | Toma un cliente del escaparate y repón el hueco. |
| Preparar agencia | Roba dos cartas de agencia. |
| Ayuntamiento | Una opción: mirar una loseta en secreto; reemplazar el escaparate; liberar todas tus prioridades; tramitar expediente para una vivienda bloqueada por Litigio. |

Las prioridades se mantienen hasta la venta, una liberación o una disputa. No caducan por tiempo ni por rondas. Las reservas recuperan capacidad al retirarse. Las viviendas vendidas no vuelven al mercado.

**Límites de mano:** 4 clientes y 5 cartas de agencia. Si un robo supera el límite, se descarta primero lo más antiguo. En Cliente referido se elige uno de los tres antes de continuar; los otros se descartan. No hay decisiones pendientes del rival dentro de tu turno.

## Puntuación de una venta

Base impresa + progreso de la categoría + preferencias del cliente + barrio + carta - reacción rival. El total no baja de cero. Los puntos de una venta nunca cambian después: se guardan sus rasgos y entorno en ese momento.

| Venta de la línea | 1.ª | 2.ª | 3.ª | 4.ª | 5.ª |
|---|---:|---:|---:|---:|---:|
| Lujosa | 3 | 4 | 5 | 6 | 8 |
| Media | 1 | 2 | 3 | 4 | 6 |
| Barata | 2 | 4 | 6 | 8 | 12 |

La fila Barata se ha reforzado respecto al prototipo físico. Las bases siguen siendo menores, pero encadenar ventas de esta categoría tiene ahora un incentivo real.

Cada loseta de servicio adyacente descubierta añade +1 de barrio, hasta +3. Cada Obras resta 2; cada Ruido, Impuestos altos o Mala conexión resta 1. Litigio bloquea la venta salvo expediente propio de esa vivienda, Licencia aprobada o Visita sorpresa. El expediente no pertenece a un jugador: queda aplicado a la vivienda.

La presencia de un rasgo o servicio exigido por un cliente suele contarse una sola vez; los textos que indican "por cada servicio" cuentan losetas. Las preferencias son acumulativas, incluidos sus inconvenientes. El desglose antes de vender no resta una reacción enemiga secreta: la puntuación efectiva puede ser menor.

Nueva parada añade permanentemente Conexión a una vivienda elegible y +1 adicional a su barrio. Ese punto es independiente del límite de +3 por servicios. Los servicios ocultos aún no producen efectos. Las viviendas vecinas no cuentan como servicios.

Operación retorno convierte la categoría de una Barata a Media para esa venta: compatibilidad del cliente, progreso de fila, cierre, mayorías y objetivos usan Media; la base de la loseta se conserva. Nunca puede ampliarse una línea por encima de cinco.

## Rondas y cierre

Una ronda tiene un turno de cada jugador. Se alterna quién abre la siguiente ronda; por tanto, el último de una ronda es también el primero de la siguiente. No es un turno extra. Al comenzar cada ronda siguiente, Urbanismo revela una frontera aleatoria sin prioridad.

Al completar cinco ventas de una categoría, el jugador termina su turno normalmente y su rival recibe **un último turno completo**, aunque se hubiera alcanzado la ronda 15. Si el rival también completa una línea, recibe el bonus de respuesta. Si nadie completa una línea, se termina tras el segundo turno de la ronda 15.

## Cuentas finales

- Quien dispara el cierre: +5.
- Quien completa una línea en la respuesta final: +2.
- Mayoría exclusiva en Lujosa: +4; Media: +3; Barata: +2. Empates sin premio.
- Cada conjunto de una vivienda de cada categoría: +2. Se cuenta el mínimo de las tres filas.
- Objetivo secreto cumplido: puntuación indicada. Cierre perfecto compara el total después de los demás bonus y objetivos, pero antes de añadir su propio premio; no hay cálculo circular.
- Empate de puntuación: victoria compartida. No hay desempate arbitrario.

## Adaptación a asíncrono

Las reacciones se preparan en secreto y se disparan automáticamente ante la próxima acción compatible. Contraoferta resta 3 a la próxima venta; Cliente se lo piensa resta 2 a una pública; Subida de tipos resta 3 a una Lujosa y permite robar al afectado; Agenda completa impide vender durante ese turno la siguiente vivienda reservada. No roban ni cancelan ventas ya terminadas.

El catálogo digital es la fuente de reglas de esta edición. Algunos textos físicos se han concretado o cambiado para eliminar interrupciones en tiempo real. No se deben mezclar cartas o tablas del PDF físico con las de la app.

## Ejemplo

Una vivienda Media de base 4, tu segunda Media (+2), se vende a un cliente con preferencia neta +3, junto a un Parque (+1), sin incidencia y con Home staging (+3): **13 puntos**. Una Contraoferta preparada lo reduce a 10; el rival no tiene que conectarse para resolverla.

## Información

Son públicos: ciudad descubierta, reservas, ventas, puntos, cantidades de cartas/clientes y existencia de reacción preparada. Son privados: identidades de la mano, objetivo, reacción concreta y planos consultados. El servidor no envía al rival los mazos ni la identidad de las losetas ocultas.

Consulta `CATALOGO.md` para todas las cartas, clientes y viviendas.
