# Barrio en Venta - objetivos y balanceo v1

## Objetivos secretos

Cada jugador recibe 1 objetivo secreto al inicio. Para partidas mas tacticas, reparte 2 y cada jugador se queda 1.

### 1. Especialista en lujo

Al final: +8 puntos si vendiste 4 o mas Lujosas.

### 2. Venta relampago

Al final: +7 puntos si completaste la linea de Baratas.

### 3. Agencia familiar

Al final: +6 puntos si vendiste 3 o mas viviendas a clientes familiares.

### 4. Cartera equilibrada

Al final: +8 puntos si vendiste al menos 2 viviendas de cada categoria.

### 5. Rey del centro

Al final: +6 puntos si vendiste 4 o mas viviendas con rasgo Centrica o adyacentes a Metro/Ocio/Comercio.

### 6. Barrios tranquilos

Al final: +6 puntos si vendiste 3 o mas viviendas Tranquilas o adyacentes a Parque.

### 7. Inversor nato

Al final: +7 puntos si vendiste 3 o mas viviendas con rasgo Inversion o Reformable.

### 8. Urbanista

Al final: +6 puntos si usaste al menos 2 cartas de Urbanismo o acciones de Ayuntamiento.

### 9. Dominio de agenda

Al final: +6 puntos si tienes 3 o mas fichas de prioridad en el mapa.

### 10. Cierre perfecto

Al final: +8 puntos si activaste el final de partida y ganaste por 5 puntos o mas.

### 11. Contraataque

Al final: +8 puntos si no activaste el final, pero completaste una linea en tu ultimo turno.

### 12. Sin miedo al riesgo

Al final: +6 puntos si vendiste 3 o mas viviendas adyacentes a incidencias.

## Curva de puntuacion esperada

Una partida sana deberia terminar con puntuaciones aproximadas:

- Jugador bajo: 45-55 puntos.
- Jugador medio: 55-70 puntos.
- Jugador alto: 70-85 puntos.

Si las puntuaciones superan 90 con facilidad, hay demasiados bonus acumulables. Si apenas llegan a 45, el juego esta bloqueando demasiado las ventas.

## Valor esperado por categoria

### Baratas

Venta normal esperada:

```text
Base 1-2
+ linea personal 2-7
+ cliente 1-4
+ barrio 0-3
= 5-16 puntos
```

Fortaleza:

- Venden rapido.
- Encajan con muchos clientes.
- Permiten cerrar la partida.

Debilidad:

- Techo de puntos menor.
- Pueden quedarse cortas si el rival prepara lujo.

### Medias

Venta normal esperada:

```text
Base 3-4
+ linea personal 3-8
+ cliente 2-5
+ barrio 1-4
= 9-21 puntos
```

Fortaleza:

- Muy flexibles.
- Sirven para muchos objetivos.
- No bloquean demasiado prioridad.

Debilidad:

- Son disputadas por casi todos los clientes.
- Pueden no destacar si no se apoyan en objetivos.

### Lujosas

Venta normal esperada:

```text
Base 5-6
+ linea personal 5-10
+ cliente 3-7
+ barrio 1-5
= 14-28 puntos
```

Fortaleza:

- Ventas muy potentes.
- Grandes combos con clientes premium.
- Amenaza de cierre dramatico.

Debilidad:

- Solo hay 5.
- Necesitan clientes especificos.
- Bloquean prioridad un turno adicional.

## Sistema de cierre

Completar 5 de una categoria activa el final. Esto debe sentirse como:

- Una amenaza visible.
- Una decision activa.
- Una oportunidad de contraataque.

Regla recomendada:

Cuando un jugador coloca la quinta ficha en una linea:

1. Gana +5 puntos por activar el cierre.
2. Termina su turno.
3. El rival juega un ultimo turno completo.
4. Si el rival tambien completa una linea, gana +3 puntos.

Por que funciona:

- El jugador rapido tiene premio por tempo.
- El rival puede preparar una respuesta.
- No conviene cerrar sin mirar el tablero rival.

## Tabla de balance rapido

Despues de cada partida, ajustar segun lo observado.

### Si Baratas ganan demasiado

Aplicar uno:

- La quinta casilla de Baratas baja de 7 a 6.
- Vender Barata no roba carta de agencia.
- Los clientes de Barata dan -1 punto menos de bonus.
- Para cerrar por Baratas necesitas 5 ventas y al menos 1 Media.

### Si Lujosas ganan demasiado

Aplicar uno:

- Exclusiva premium da +3 en vez de +4.
- Impuestos altos penaliza -3 en vez de -2.
- Las Lujosas requieren siempre prioridad propia para vender.
- La quinta casilla de Lujosas baja de 10 a 9.

### Si Medias son aburridas

Aplicar uno:

- La tercera Media vendida permite robar 1 cliente.
- La linea de Medias pasa a 3 / 4 / 5 / 7 / 8.
- Algunas cartas de agencia dan +1 adicional a Medias.

### Si hay poca interaccion

Aplicar uno:

- Revela solo 4 losetas iniciales en vez de 6.
- Cada jugador empieza con 4 fichas de prioridad en vez de 6.
- Robar carta de agencia permite quedarse 1 de 3 en vez de 1 de 2.
- Incluye Llamada del propietario y Cliente se lo piensa.

### Si hay demasiada agresion

Aplicar uno:

- Contraoferta resta -2 en vez de -3.
- Disputar prioridad cuesta 2 cartas en vez de 1.
- No se pueden jugar reacciones contra la primera venta de cada jugador.
- Cada jugador solo puede jugar 1 carta de rivalidad por ronda.

### Si el juego dura demasiado

Aplicar uno:

- Cada venta avanza el marcador de trimestre.
- Al final de cada ronda, revela una loseta aleatoria adyacente a zona revelada.
- Cada jugador puede vender una vez por partida sin cliente compatible, con -4 puntos.
- El limite de clientes privados sube a 5.

### Si el juego termina demasiado pronto

Aplicar uno:

- La partida solo puede cerrar a partir de la ronda 7.
- Para cerrar una linea necesitas 5 ventas y al menos 35 puntos.
- El rival tiene dos turnos de respuesta si el cierre ocurre antes de la ronda 8.

## Orden recomendado de playtest

### Partida 1: esqueleto

Usar:

- Sin objetivos secretos.
- 20 cartas de agencia recomendadas.
- 18 clientes, quitando los mas raros.
- Sin marcador de trimestre.

Medir:

- Duracion.
- Numero de ventas por jugador.
- Categoria que cierra la partida.
- Diferencia final de puntos.

### Partida 2: presion

Anadir:

- Objetivos secretos.
- Todas las incidencias.
- Todas las cartas de rivalidad suaves.

Medir:

- Si las prioridades importan.
- Si algun jugador se siente bloqueado.
- Si las cartas generan emocion o frustracion.

### Partida 3: juego completo

Anadir:

- Todas las cartas.
- Marcador de trimestre.
- Bonus final completo.

Medir:

- Si el cierre se ve venir.
- Si el ultimo turno rival importa.
- Si hay varias estrategias viables.

## Hoja de anotacion

Copiar despues de cada partida:

```text
Fecha:
Duracion:

Jugador A:
Ventas L/M/B:
Puntos de ventas:
Bonus final:
Total:
Objetivo:

Jugador B:
Ventas L/M/B:
Puntos de ventas:
Bonus final:
Total:
Objetivo:

Categoria que activo el final:
Ronda del cierre:

Momento mas divertido:
Momento mas confuso:
Carta mas fuerte:
Carta mas floja:
Loseta mas importante:

Cambio para la proxima partida:
```

## Diagnostico ideal

La v1 va por buen camino si:

- Los dos jugadores quieren mirar el tablero del rival.
- Las prioridades provocan al menos 3 disputas por partida.
- El jugador que va perdiendo siente que puede preparar una venta grande.
- El cierre por quinta vivienda da tension, no solo termina de golpe.
- Al final ambos jugadores pueden explicar que plan intentaron seguir.
