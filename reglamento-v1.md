# Barrio en Venta - reglamento v1

## Resumen

Barrio en Venta es un juego competitivo para 2 jugadores. Cada jugador es un agente inmobiliario que explora un barrio nuevo, descubre viviendas, aprovecha servicios urbanos y compite por vender antes que su rival.

La partida termina cuando un jugador completa un lote de 5 ventas en una misma categoria de vivienda:

- Lujosas
- Medias
- Baratas

Completar un lote no garantiza ganar. Activa el cierre de partida, como en Azul: el jugador que lo provoca fuerza el ritmo, pero el rival tiene una ultima oportunidad de responder.

Duracion objetivo: 35-45 minutos.

## Componentes

- 1 loseta central de Ayuntamiento.
- 36 losetas hexagonales de barrio.
- 2 tableros personales de agencia.
- 30 fichas de propiedad vendida: 10 lujosas, 10 medias, 10 baratas.
- 12 fichas de prioridad: 6 por jugador.
- 24 cartas de cliente.
- 30 cartas de agencia.
- 12 cartas de objetivo secreto.
- 1 marcador de trimestre.
- Fichas de comision o puntos.

## Preparacion

1. Coloca el Ayuntamiento en el centro.
2. Mezcla las 36 losetas de barrio boca abajo.
3. Forma alrededor del Ayuntamiento un mapa hexagonal de 3 anillos:
   - El Ayuntamiento ocupa el centro.
   - El primer anillo tiene 6 losetas.
   - El segundo anillo tiene 12 losetas.
   - El tercer anillo tiene 18 losetas.
4. Revela las 6 losetas adyacentes al Ayuntamiento.
5. Cada jugador recibe:
   - 1 tablero personal.
   - 6 fichas de prioridad de su color.
   - 2 cartas de agencia.
   - 2 cartas de cliente.
   - 1 objetivo secreto.
6. Revela 3 clientes publicos en el mercado.
7. El jugador inicial recibe la ficha de "Primera visita".

## Tablero personal

Cada jugador tiene tres lineas de lote:

```text
Lujosas: [] [] [] [] []
Medias:  [] [] [] [] []
Baratas: [] [] [] [] []
```

Cuando vendes una vivienda, colocas una ficha en la linea correspondiente. En cada linea, las casillas tienen valores crecientes:

```text
Lujosas:  5 / 6 / 7 / 8 / 10
Medias:   3 / 4 / 5 / 6 / 8
Baratas:  2 / 3 / 4 / 5 / 7
```

Esto crea una carrera distinta para cada estrategia:

- Lujosas: pocas ventas, mucho valor, mas dificil encajar clientes.
- Medias: linea flexible y estable.
- Baratas: ventas rapidas, menos puntos por unidad, mas capacidad de cerrar la partida.

## Tipos de loseta

Hay tres familias de losetas.

### Viviendas

Cada vivienda tiene categoria y rasgos.

Categorias:

- Lujosa
- Media
- Barata

Rasgos:

- Familiar
- Inversion
- Tranquila
- Centrica
- Reformable
- Exclusiva

### Servicios positivos

Estas losetas dan bonus a viviendas adyacentes.

- Parque: +2 si el cliente quiere tranquilidad, familia o mascotas.
- Colegio: +2 si el cliente es familiar.
- Metro: +2 si el cliente quiere conexion o vida urbana.
- Hospital: +2 si el cliente quiere seguridad o accesibilidad.
- Comercio: +1 a cualquier venta adyacente.
- Ocio: +2 para clientes jovenes o vida urbana, -1 para clientes de tranquilidad.

### Incidencias

Estas losetas dan tension al barrio.

- Obras: -2 a ventas adyacentes, pero una carta puede convertirlas en "Reforma urbana".
- Ruido: -2 para clientes de tranquilidad.
- Impuestos: vender una vivienda lujosa adyacente da -2.
- Litigio: la primera venta adyacente necesita gastar una accion extra de papeleo.

## Anatomia de una vivienda

Ejemplo:

```text
Atico con terraza
Categoria: Lujosa
Rasgos: Exclusiva, Centrica
Base: 6
```

La puntuacion de una venta se calcula asi:

```text
Base de vivienda
+ valor de la casilla libre mas a la izquierda en tu linea personal
+ bonus de servicios adyacentes
+ bonus de cliente
+ cartas jugadas
- incidencias aplicables
```

## Clientes

Los clientes son la condicion de venta. No puedes vender una vivienda sin asignarla a un cliente.

Hay dos tipos:

- Clientes privados: solo los ve su jugador.
- Clientes publicos: disponibles para ambos jugadores.

Al vender, el cliente se descarta y el jugador roba o elige un nuevo cliente segun la accion usada.

Cada cliente tiene:

- Categoria aceptada.
- Preferencias.
- Bonus si queda satisfecho.
- Penalizacion si se le vende algo parcialmente incompatible.

Ejemplo:

```text
Familia con dos ninos
Acepta: Media o Lujosa
Quiere: Colegio, Parque, Familiar
Bonus: +2 por cada condicion cumplida
Penalizacion: -2 si no hay Colegio ni Parque adyacente
```

## Turno

En tu turno haces 2 acciones distintas o 1 accion doble.

Acciones disponibles:

1. Explorar.
2. Reservar.
3. Ensenar y vender.
4. Captar cliente.
5. Robar carta de agencia.
6. Papeleo.
7. Acción de Ayuntamiento.

No puedes repetir la misma accion en el mismo turno, salvo que gastes una carta que lo permita.

## Acciones

### 1. Explorar

Revela una loseta boca abajo adyacente a:

- El Ayuntamiento.
- Una loseta ya revelada.
- Una vivienda donde tengas prioridad.

Si revelas una vivienda, puedes colocar inmediatamente una ficha de prioridad sobre ella sin gastar accion adicional.

### 2. Reservar

Coloca una ficha de prioridad sobre una vivienda revelada sin prioridad.

Si la vivienda ya tiene prioridad rival, puedes disputar:

- Descarta 1 carta de agencia.
- Coloca tu ficha encima de la rival.
- La vivienda queda "en disputa".

Una vivienda en disputa solo puede venderse por el jugador cuya ficha este arriba, pero el rival recupera su ficha y roba 1 carta de agencia como compensacion.

### 3. Ensenar y vender

Elige:

- Una vivienda revelada.
- Un cliente privado o publico compatible.
- Prioridad propia sobre esa vivienda, si la vivienda tiene prioridad.

Puedes vender una vivienda sin prioridad solo si no tiene ficha de ningun jugador.

Despues:

1. Calcula puntos.
2. Coloca la ficha de venta en tu tablero personal.
3. Retira la loseta de vivienda del mapa y deja un solar vendido boca arriba.
4. Descarta el cliente usado.
5. Roba 1 carta de agencia.

### 4. Captar cliente

Elige una opcion:

- Roba 2 clientes y quedate 1.
- Toma 1 cliente publico y repón el mercado.
- Descarta los 3 clientes publicos y revela 3 nuevos.

Limite de mano: 4 clientes privados.

### 5. Robar carta de agencia

Roba 2 cartas de agencia y quedate 1. Descarta la otra.

Limite de mano: 5 cartas de agencia.

### 6. Papeleo

Retira una condicion negativa de una vivienda o zona:

- Resolver Litigio.
- Reducir Impuestos.
- Certificar reforma.
- Ignorar una penalizacion de Obras en tu proxima venta.

Tambien puedes usar Papeleo para recuperar 2 fichas de prioridad de viviendas que ya no te interesan.

### 7. Accion de Ayuntamiento

Disponible si estas adyacente al Ayuntamiento o si tienes al menos 2 viviendas vendidas.

Elige:

- Mirar 2 losetas boca abajo y devolverlas en el mismo sitio.
- Cambiar 1 cliente publico.
- Convertir una ficha de prioridad en "exclusiva": no puede ser disputada salvo con carta especial.
- Avanzar el marcador de trimestre 1 casilla.

## Prioridad

La prioridad es la parte mas agresiva del juego.

Reglas:

- Tener prioridad te da derecho preferente a vender esa vivienda.
- Puedes tener maximo 6 prioridades en el mapa.
- Si todas tus fichas estan en el mapa, no puedes reservar nuevas viviendas hasta recuperar alguna.
- Una prioridad sobre vivienda barata se recupera tras vender.
- Una prioridad sobre vivienda media se recupera tras vender.
- Una prioridad sobre vivienda lujosa queda bloqueada hasta el final del siguiente turno propio, representando tramites largos.

Intencion de diseno: las lujosas valen mas, pero inmovilizan recursos.

## Cartas de agencia

Las cartas de agencia son tacticas, eventos y pequenas trampas comerciales.

Tipos:

- Venta: mejoran una venta concreta.
- Mercado: modifican precios durante un turno.
- Rivalidad: disputan prioridad o retrasan una operacion.
- Informacion: permiten mirar losetas o clientes.
- Urbanismo: transforman incidencias o servicios.

Se pueden jugar maximo 2 cartas por venta, salvo que una carta diga lo contrario.

## Objetivos secretos

Cada jugador empieza con 1 objetivo secreto. Al final suma puntos si lo cumple.

Ejemplos:

- Especialista en lujo: +8 si tienes 4 o mas lujosas.
- Barrios familiares: +6 si vendiste 3 viviendas adyacentes a Colegio o Parque.
- Venta rapida: +7 si tienes 5 baratas.
- Cartera equilibrada: +8 si vendiste al menos 2 de cada categoria.

## Final de partida

El final se activa de una de estas formas:

1. Un jugador completa las 5 casillas de una linea: Lujosas, Medias o Baratas.
2. El marcador de trimestre llega a la ultima casilla.
3. Se revelan todas las viviendas del mapa.

Cuando se activa el final:

- El jugador que lo activa termina su turno.
- El rival juega un ultimo turno completo.
- Si el rival tambien completa una linea, recibe +3 puntos de "contraoferta final".

Luego se puntua.

## Puntuacion final

Suma:

- Puntos de ventas realizadas.
- Objetivo secreto cumplido.
- +5 si activaste el final de partida.
- +3 por cada linea con al menos 3 ventas.
- +4 si tienes al menos una venta de cada categoria.
- +2 por cada prioridad propia aun colocada sobre vivienda no vendida.

Resta:

- -2 por cada cliente privado no atendido por encima de 2.
- -1 por cada ficha de prioridad bloqueada en vivienda con Litigio u Obras.

Gana quien tenga mas puntos.

Desempates:

1. Mas viviendas vendidas.
2. Mas puntos en una sola venta.
3. Quien no activo el final.

## Modo recomendado para primera partida

Para la primera prueba:

- Jugar sin objetivos secretos.
- Usar solo 20 cartas de agencia.
- Usar 18 clientes.
- Terminar solo por completar una linea de 5 ventas.

Despues de una partida, anotar:

- Si las baratas cierran demasiado rapido.
- Si las lujosas compensan el esfuerzo.
- Si hay suficientes disputas entre jugadores.
- Si explorar es siempre mejor o peor que reservar.
