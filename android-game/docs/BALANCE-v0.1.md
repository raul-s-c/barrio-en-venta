# Ensayos y balance provisional

## Qué se ha ejecutado

6200 partidas de investigación en esta sesión: 400 de referencia inicial, 1320 del primer torneo, 800 espejo, 1920 para comparar cuatro tablas Barata y 1760 del torneo final. Las pruebas unitarias y de interfaz añaden partidas cortas aparte. Todos esos lotes finalizaron sin errores de ejecución reportados por el simulador. Esto no significa ausencia demostrada de errores o equilibrio definitivo.

Los informes antiguos conservan sus resultados en reports/tournament-baseline, reports/simulation-*.json y reports/balance-sweep.json. No corresponden todos a los mismos parámetros. Los archivos del torneo final incluyen el objeto parameters usado en cada lote.

## Cambios motivados por las pruebas

1. La IA no jugaba Firma en notaría porque solo valoraba puntos inmediatos. Se añadió valor al robo futuro. La carta no se eliminó por una debilidad del bot.
2. Nueva parada concedía un rasgo sin beneficio efectivo. Ahora añade +1 de barrio; tiene prueba de regresión.
3. Se detectó por revisión una interacción entre una reacción que roba y una mano llena: el robo podía descartar la carta de venta antes de consumirla. Se consume primero la carta y después se resuelve la reacción. La conservación del inventario está probada.
4. Se compararon cuatro progresiones Barata con las mismas semillas y adversarios. Se adopta 2, 4, 6, 8, 12: aumenta el incentivo por encadenar esa categoría sin hacer invencible a la política Volumen. Media y Lujosa mantienen su tabla.

En la comparación controlada, Volumen ganó a Lujo 72/160 con la tabla original y 74/160 con la elegida; su puntuación media pasó de 87,58 a 99,21. Frente a Bloqueo mejoró de 39/160 a 50/160. El beneficio es parcial: subir puntos no corrige por sí solo una mala respuesta a las reservas rivales. La variante más extrema también se probó y no se adoptó.

## Torneo final

| IA A | IA B | Partidas | Gana A | Gana B | Empates | Media A / B |
| --- | --- | --- | --- | --- | --- | --- |
| equilibrada | equilibrada | 160 | 75 | 84 | 1 | 105.5 / 106.3 |
| equilibrada | lujo | 160 | 93 | 64 | 3 | 108.8 / 101.3 |
| equilibrada | volumen | 160 | 94 | 64 | 2 | 104.8 / 98.9 |
| equilibrada | bloqueo | 160 | 54 | 103 | 3 | 96.2 / 105.8 |
| equilibrada | azar | 160 | 160 | 0 | 0 | 119.5 / 47.0 |
| lujo | volumen | 160 | 74 | 86 | 0 | 98.3 / 101.4 |
| lujo | bloqueo | 160 | 42 | 117 | 1 | 92.4 / 109.0 |
| lujo | azar | 160 | 160 | 0 | 0 | 125.2 / 46.0 |
| volumen | bloqueo | 160 | 44 | 114 | 2 | 91.3 / 105.8 |
| volumen | azar | 160 | 158 | 2 | 0 | 118.2 / 47.8 |
| bloqueo | azar | 160 | 160 | 0 | 0 | 117.4 / 33.4 |

Cierres por línea: Media 409, Lujosa 461, Barata 409. Final por ronda 15: 481/1760. Las medias de duración representan turnos, no minutos ni días de juego asíncrono.

Control espejo final: quien empezó ganó el 53.5% de las partidas no empatadas (160 partidas totales). El control anterior de 800 partidas y tabla antigua daba 54,6%. No mezclar esos resultados como si fueran el mismo experimento. Semillas compartidas por parejas: no usar un intervalo binomial ingenuo como garantía estadística de independencia.

## Riesgos abiertos

- Bloqueo domina a las otras políticas heurísticas en el torneo final. No es prueba de estrategia imbatible: ninguna política aprende a responder ni busca varios turnos. Hay que comprobar con jugadores humanos si disputar prioridades resulta costoso o frustrante.
- Demasiadas partidas competitivas llegan al límite de rondas. Puede ser defensa deliberada del cierre o un cierre poco accesible; medir sensación de tensión, no solo frecuencia.
- Las políticas consultan solo su proyección privada, pero valoran débilmente información a largo plazo, objetivos secretos y maniobras urbanísticas. Una carta poco usada puede ser buena en manos humanas.
- Mapa, reparto y mazos tienen azar. El laboratorio controla semillas, no elimina toda varianza.
- No se han realizado pruebas con jugadores humanos ni entrenado una IA óptima. No se ha demostrado un equilibrio de Nash ni resuelto el juego.

## Cartas: uso observado

| Carta | Robos | Usos | Uso / robo |
| --- | --- | --- | --- |
| Contacto bancario | 853 | 165 | 19.3% |
| Operación retorno | 827 | 165 | 20.0% |
| Reportaje fotográfico | 830 | 184 | 22.2% |
| Reforma exprés | 799 | 314 | 39.3% |
| Convenio municipal | 814 | 348 | 42.8% |
| Exclusiva premium | 942 | 420 | 44.6% |
| Bajada de tipos | 761 | 345 | 45.3% |
| Licencia aprobada | 853 | 387 | 45.4% |
| Puertas abiertas | 823 | 403 | 49.0% |
| Oferta final | 752 | 385 | 51.2% |
| Boom del alquiler | 850 | 446 | 52.5% |
| Barrio de moda | 940 | 495 | 52.7% |
| Guerra de comisiones | 756 | 407 | 53.8% |
| Visita sorpresa | 911 | 497 | 54.6% |
| Llamada del propietario | 858 | 499 | 58.2% |
| Nueva parada | 906 | 543 | 59.9% |
| Firma en notaría | 896 | 579 | 64.6% |
| Home staging | 911 | 617 | 67.7% |
| Estudio de mercado | 786 | 536 | 68.2% |
| Contacto en urbanismo | 829 | 579 | 69.8% |
| Cliente se lo piensa | 876 | 703 | 80.3% |
| Rumor de barrio | 964 | 786 | 81.5% |
| Agenda completa | 790 | 648 | 82.0% |
| Contraoferta | 962 | 793 | 82.4% |
| Subida de tipos | 824 | 683 | 82.9% |
| Fin de obras | 785 | 654 | 83.3% |
| Cliente referido | 797 | 687 | 86.2% |
| CRM impecable | 883 | 762 | 86.3% |
| Tasación independiente | 801 | 694 | 86.6% |
| Mala prensa | 787 | 699 | 88.8% |

Los usos de reacciones cuentan al prepararse, no necesariamente al activarse. Descartar una carta para disputar no cuenta como jugar su efecto. Los robos iniciales cuentan y cada reciclado aporta otra exposición. No es una medida causal de potencia. Las preferencias de clientes y los servicios se incluyen en los JSON y en el laboratorio; los puntos junto a un servicio son correlación, no puntos causados por él.

## Reproducir

Node 24, dependencias de package-lock.json y código de esta entrega. Ejecutar npx tsx scripts/tournament.ts 160. Semilla base 20260916; cada par comparte ciudad y reparto, cambia iniciativa, y las parejas alternan asignación de perfiles a asientos. La política Azar es un control débil. Se pueden lanzar lotes de 2 a 2000 partidas dentro de la app y cambiar el bonus de cierre sin afectar las partidas online.

## Próxima prueba humana

Jugar 6 partidas alternando quién empieza. Registrar: quién cierra y si gana; turnos hasta primera venta; veces que una reserva impidió jugar lo deseado; cartas guardadas toda la partida; acciones del Ayuntamiento; momento en que se decide no cerrar. Preguntar si cada uno vio al menos dos decisiones interesantes en su turno. No cambiar más de una familia de parámetros por iteración.
