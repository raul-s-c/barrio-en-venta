# Barrio en Venta - fundamentos de diseno v1.0

## Experiencia objetivo

La partida debe producir cuatro sensaciones, en este orden:

1. Descubrimiento: revelar una loseta debe abrir posibilidades, no resolver el turno por azar.
2. Competencia: cada vivienda interesante debe poder atraer a ambos jugadores.
3. Preparacion: reservar, captar y hacer papeleo deben construir una venta futura visible.
4. Cierre: completar una linea de cinco debe ser una decision, no un final automatico sin contexto.

## Principios aplicados

### Mecanica, dinamica y experiencia

El marco MDA separa las reglas escritas, el comportamiento que aparece al jugar y la experiencia emocional buscada. En este juego:

- Mecanicas: mapa oculto, prioridades, clientes, dos acciones y lineas de cinco.
- Dinamicas: carreras por una vivienda, amenazas visibles, faroles con clientes privados y bloqueo de categorias.
- Experiencia: tension competitiva, satisfaccion al encajar cliente y vivienda, y control sobre el momento final.

La consecuencia practica es que una carta o regla solo permanece si alimenta al menos una dinamica buscada. Mas contenido no implica mas juego.

Fuente: Hunicke, LeBlanc y Zubek, "MDA: A Formal Approach to Game Design and Game Research".
https://www.cs.northwestern.edu/~hunicke/MDA.pdf

### Decisiones significativas

Una opcion es significativa cuando cambia el espacio de posibilidades y tiene un coste de oportunidad comprensible. Por eso cada turno concede dos acciones, pero una venta normalmente exige haber preparado cliente, informacion o prioridad. Reservar una vivienda impide usar esa ficha en otra; cerrar pronto concede tempo al rival; robar una carta consume una accion que podria descubrir el mapa.

Fuente: Iain Simons, "Meaningful Choice, Decision, Agency?".
https://ualresearchonline.arts.ac.uk/id/eprint/26132/

### Incertidumbre controlable

La incertidumbre puede venir del azar externo, de la informacion oculta o de no saber cual es la mejor decision. El mapa boca abajo aporta descubrimiento, pero las acciones de Ayuntamiento permiten mirar y planificar. Los clientes publicos crean informacion compartida; los privados permiten sorpresa. Las cartas alteran una operacion, pero no deben decidir por si solas una partida.

Fuente: Power et al., "Lost at the Edge of Uncertainty".
https://doi.org/10.1080/10447318.2018.1507161

### Tension hasta el final

Los juegos a dos pierden interes cuando una ventaja temprana se vuelve irreversible. Barrio en Venta no aplica una bonificacion arbitraria al jugador rezagado: utiliza una ultima respuesta garantizada, alterna la iniciativa entre rondas y limita las prioridades disponibles. El objetivo es mantener la puntuacion y las amenazas cercanas sin invalidar las buenas decisiones previas.

Referencia comparativa: Isaksen, Ismail, Brams y Nealen, "Catch-Up: A Game in Which the Lead Alternates".
https://kclpure.kcl.ac.uk/portal/en/publications/catch-up-a-game-in-which-the-lead-alternates/

### Estrategias no dominadas

La teoria de juegos resulta util aqui como lente, no como promesa de resolver el juego. Si una estrategia ofrece sistematicamente mas puntos y mas velocidad en los mismos estados, domina a las demas y elimina decisiones. Las simulaciones enfrentan perfiles de lujo, volumen, equilibrio y bloqueo para detectar esa senal. Una estrategia sana puede ser mejor contra unas rivales y peor contra otras.

Referencia: MIT OpenCourseWare, "Game Theory with Engineering Applications - Lecture 9".
https://ocw.mit.edu/courses/6-254-game-theory-with-engineering-applications-spring-2010/resources/lecture-9-computation-of-ne-in-finite-games/

## Decisiones de v1.0

- Distribucion de viviendas: 7 Lujosas, 7 Medias y 7 Baratas. Hay escasez suficiente para competir y margen suficiente para que cualquier linea pueda cerrarse.
- Cuatro prioridades por jugador. Cada reserva importa y el mapa no queda repartido en dos mitades privadas.
- Los servicios puntuan principalmente a traves del cliente. Se elimina la doble recompensa por el mismo Parque, Metro o Colegio.
- Progreso moderado: las casillas de linea aumentan, pero no duplican el valor de la categoria.
- Limite de una carta propia que modifique cada venta y una reaccion rival. La vivienda y el cliente siguen siendo el centro.
- Quince rondas como reloj de seguridad. La forma principal de terminar sigue siendo completar una linea.
- Iniciativa alterna por ronda. Se reduce la ventaja estructural de empezar sin introducir compensaciones dificiles de recordar.
- Crecimiento municipal: al final de cada ronda se revela una loseta de frontera. Evita bloqueos y hace que la ciudad cobre vida.

## Hipotesis que requieren personas

Una simulacion puede contar puntuaciones, turnos, cierres y ventajas. No puede medir bien:

- si revelar una vivienda produce emocion;
- si una contraoferta se siente divertida o injusta;
- si las cartas contienen demasiado texto;
- si el calculo de una venta interrumpe el ritmo;
- si la amenaza de cierre es facil de leer desde el otro lado de la mesa.

Por eso la version se considera completa para prototipar, no terminada para fabricar. El siguiente filtro obligatorio son partidas observadas.
