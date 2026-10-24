# Balance provisional · v0.2.1

## Qué se ha probado

2560 ejecuciones de partidas: 640 con la primera mezcla, 640 con la mezcla ajustada y 1280 en el torneo final. Las semillas se comparten entre políticas y variantes; el torneo final repite las primeras 40 partidas de cada emparejamiento y añade otras 40. No son 2560 muestras independientes. Cero fallos de ejecución en el torneo final: 0 reportados.

Cada pareja mantiene ciudad, reparto y especialidades, cambiando quién empieza. Los perfiles cambian de asiento entre parejas. El resultado refleja políticas heurísticas, no jugadores óptimos ni un equilibrio de Nash demostrado. Los archivos JSON guardan la versión y los parámetros de cada lote.

## Cambios tras el primer ensayo

- El primer mapa tenía 7 viviendas de cada categoría, 9 servicios y 6 incidencias. El espejo cerró línea en 12/40 partidas y la política de volumen perdió claramente frente a la equilibrada.
- El ajuste mantiene 37 hexágonos, con 8 lujosas, 8 medias y 9 baratas, 6 servicios y 5 incidencias. Se eliminan duplicados urbanos y la Reforma urbana inicial (se consigue con Fin de obras).
- La progresión barata pasa de 0/1/2/3/4 a 0/1/2/4/6. Su base sigue siendo mucho menor que la de lujo. El espejo ajustado cerró línea en 24/40 con las mismas semillas.
- En el espejo final ampliado: 55/80 cierres. Quien empezó ganó 39 veces y perdió 39, con 2 empates. Es un control pequeño, no una garantía de igualdad.

## Categorías en el torneo final

| Categoría | Ventas | Puntos medios por venta |
| --- | --- | --- |
| Barata | 7951 | 8.60 |
| Media | 6733 | 11.25 |
| Lujosa | 4011 | 15.55 |

Las frecuencias dependen del mapa, del encaje exigido y de las políticas. No son probabilidades puras de éxito. Barata exige encaje 0, Media 1 y Lujosa 2. Los puntos incluyen cartas, barrio y especialidades.

## ¿Sigue funcionando aceptar la mejor oferta?

Equilibrada contra Codiciosa: 40-40, con 0 empates, en 80 partidas. Por tanto, estas pruebas NO demuestran que conservar clientes sea superior en general. Sí existe un coste de oportunidad real: el cliente desaparece de tu mano y conseguir otro cuesta acción o carta. La política codiciosa maximiza la valoración inmediata de ventas sin la penalización de conservar clientes; comparte el resto de heurísticas, así que no es un agente de búsqueda óptima.

| Políticas A / B | Victorias A / B | Empates | Cierre de línea | Turnos medios |
| --- | --- | --- | --- | --- |
| bloqueo / azar | 79 / 1 | 0 | 34 | 33.0 |
| bloqueo / codiciosa | 22 / 58 | 0 | 40 | 32.5 |
| codiciosa / azar | 79 / 1 | 0 | 68 | 29.5 |
| equilibrada / azar | 79 / 1 | 0 | 71 | 29.6 |
| equilibrada / bloqueo | 52 / 28 | 0 | 35 | 33.6 |
| equilibrada / codiciosa | 40 / 40 | 0 | 59 | 31.7 |
| equilibrada / equilibrada | 40 / 38 | 2 | 55 | 31.8 |
| equilibrada / lujo | 39 / 38 | 3 | 55 | 31.8 |
| equilibrada / volumen | 47 / 32 | 1 | 56 | 31.3 |
| lujo / azar | 79 / 1 | 0 | 69 | 29.7 |
| lujo / bloqueo | 52 / 28 | 0 | 35 | 33.7 |
| lujo / codiciosa | 38 / 42 | 0 | 59 | 31.8 |
| lujo / volumen | 51 / 28 | 1 | 55 | 31.0 |
| volumen / azar | 80 / 0 | 0 | 70 | 28.9 |
| volumen / bloqueo | 36 / 43 | 1 | 33 | 32.9 |
| volumen / codiciosa | 40 / 40 | 0 | 54 | 31.7 |

Total: 848/1280 cierres por línea. Reservas caducadas: 11977; prórrogas usadas: 1047.

## Especialidades

| Ficha | Participaciones | Victorias |
| --- | --- | --- |
| Especialista en lujo | 896 | 398 |
| Agencia residencial | 992 | 504 |
| Ventas de proximidad | 672 | 370 |

No interpretar esta tabla como efecto causal del bonus: cada ficha está mezclada con reparto, jugador y política.

## Cartas menos utilizadas

| Carta | Robos | Usos | Usos / robos |
| --- | --- | --- | --- |
| Reportaje fotográfico | 1473 | 87 | 5.9% |
| Operación retorno | 1548 | 263 | 17.0% |
| Contacto bancario | 1623 | 442 | 27.2% |
| Licencia aprobada | 1619 | 443 | 27.4% |
| Visita sorpresa | 1653 | 489 | 29.6% |
| Exclusiva premium | 1627 | 504 | 31.0% |
| Reforma exprés | 1756 | 676 | 38.5% |
| Barrio de moda | 1779 | 690 | 38.8% |
| Fin de obras | 1884 | 773 | 41.0% |
| Bajada de tipos | 1749 | 754 | 43.1% |

Una carta poco utilizada puede indicar una heurística insuficiente. Robar otra vez la misma carta cuenta como nueva exposición; las reacciones cuentan cuando se preparan.

## Pendiente de probar con personas

- Lujo puntúa más, pero completar cinco lujosas es mucho menos frecuente. La categoría sirve a menudo para ganar puntos sin cerrar esa línea.
- Aún hay 432 finales por límite de rondas; conviene comprobar si el final se siente largo o si se está retrasando deliberadamente el cierre.
- La defensa permanente ya no existe: las reservas caducan. El perfil Bloqueo conserva hábitos que pueden ser malos bajo las nuevas reglas.
- El robo aleatorio de clientes y sus requisitos necesita partidas humanas. No hay reposición automática al vender, pero Buscar cliente evita depender de una carta concreta.
- No se ha demostrado una estrategia invencible, ni se ha entrenado una IA por aprendizaje.
