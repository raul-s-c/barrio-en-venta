# Barrio en Venta - resultados de simulacion v1.0

## Alcance

Durante el ajuste se ejecutaron cinco tandas y mas de 50.000 partidas estructurales. Cada tanda enfrento cuatro heuristicas: lujo, equilibrio, volumen y bloqueo. Los experimentos intermedios sirvieron para cambiar distribucion de viviendas, reloj, mercado publico, progreso y restricciones de prioridad.

La muestra final guardada contiene 8.000 partidas, 500 por cada enfrentamiento ordenado entre las cuatro heuristicas. Semilla base: 20260831.

## Resultado final guardado

- Victoria del asiento 1: 49,4 %.
- Victoria del asiento 2: 50,3 %.
- Empates: 0,3 %.
- Rondas medias: 12,4 de un maximo de 15.
- Ventas totales medias: 16,7.
- Puntuacion media por jugador: 91,1.
- Margen medio: 27,9 puntos.
- Final por Lujosa: 26,8 %.
- Final por Media: 29,0 %.
- Final por Barata: 15,7 %.
- Final por reloj: 28,5 %.

## Lectura

La iniciativa alterna elimina practicamente la ventaja de asiento. El 71,5 % de las partidas termina por completar una linea, por lo que el cierre deliberado es el final principal.

La alerta es el margen: 27,9 puntos resulta alto para la experiencia buscada. Tambien la heuristica de lujo queda en 40,2 % de victorias, frente a 55,3 % de equilibrio, 52,9 % de volumen y 51,1 % de bloqueo. Esto no prueba que lujo este roto: la heuristica se compromete con una categoria aunque el mapa recomiende cambiar de plan. Si personas reales tambien perciben lujo como trampa, el primer ajuste a probar es +1 en las casillas tercera, cuarta y quinta de Lujosas, sin tocar base ni clientes.

## Cambios provocados por la simulacion

- Las viviendas pasaron de 5/8/7 a 7/7/7 por categoria.
- Las prioridades bajaron de 6 a 4 por jugador.
- Se elimino la prioridad obligatoria para vender Lujosas.
- El mercado publico de tres clientes se incorporo al modelo.
- El reloj paso a 15 rondas.
- El bonus de Cierre quedo en +5 y Diversificacion en +2.
- Se elimino la doble puntuacion generica de servicios ya valorados por el cliente.

## Limitaciones

El agente no interpreta texto de forma completa, no farolea, no recuerda patrones del rival y usa estimaciones para cartas y clientes. Los resultados sirven para encontrar desequilibrios gruesos, no para declarar que una estrategia humana tiene una probabilidad exacta de ganar.

Para reproducir la muestra:

```text
python simulador_balance.py --games-per-pair 500 --seed 20260831
```
