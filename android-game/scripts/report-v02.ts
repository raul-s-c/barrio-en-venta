import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { CARDS, SPECIALTIES } from '../shared/catalog';
import type { Simulation } from '../shared/ai';
const dir = 'reports/tournament-v02-final';
const batches = readdirSync(dir)
  .filter((f) => f.endsWith('.json') && f !== 'summary.json')
  .map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as Simulation);
const games = batches.reduce((n, r) => n + r.games, 0);
const failures = batches.flatMap((r) => r.failures);
const rounds = batches.reduce((n, r) => n + r.roundLimit, 0);
const categories: Record<string, { sales: number; points: number }> = {};
const cards = CARDS.map((c) => ({ ...c, drawn: 0, used: 0 }));
const specialties = SPECIALTIES.map((s) => ({ ...s, games: 0, wins: 0 }));
for (const r of batches) {
  for (const [category, value] of Object.entries(r.categories)) {
    const b = (categories[category] ??= { sales: 0, points: 0 });
    b.sales += value.sales;
    b.points += value.points;
  }
  for (const c of r.cards) {
    cards[c.id].drawn += c.drawn;
    cards[c.id].used += c.used;
  }
  r.specialtyResults.forEach((s, i) => {
    specialties[i].games += s.games;
    specialties[i].wins += s.wins;
  });
}
const mirror = batches.find((r) => r.profiles.every((p) => p === 'equilibrada'))!;
const greedy = batches.find((r) => r.profiles.join('-') === 'equilibrada-codiciosa')!;
const first = JSON.parse(
  readFileSync('reports/tournament-v02-first/equilibrada-equilibrada.json', 'utf8'),
) as Simulation;
const adjusted = JSON.parse(
  readFileSync('reports/tournament-v02-adjusted/equilibrada-equilibrada.json', 'utf8'),
) as Simulation;
const table = (head: string[], rows: unknown[][]) =>
  [head, head.map(() => '---'), ...rows].map((r) => '| ' + r.join(' | ') + ' |').join('\n');
const totalRuns = ['first', 'adjusted', 'final'].reduce(
  (total, name) =>
    total +
    (
      JSON.parse(readFileSync(`reports/tournament-v02-${name}/summary.json`, 'utf8')) as {
        games: number;
      }[]
    ).reduce((n, r) => n + r.games, 0),
  0,
);
const data = {
  totalRuns,
  finalGames: games,
  failures,
  categories,
  lineClosures: games - rounds,
  roundLimit: rounds,
  mirrorFirstWins: mirror.firstWins,
  mirrorFirstLosses: mirror.firstLosses,
  mirrorTies: mirror.firstTies,
  greedyWins: greedy.wins,
  expired: batches.reduce((n, r) => n + r.expiredPriorities, 0),
  extensions: batches.reduce((n, r) => n + r.extendedPriorities, 0),
};
writeFileSync('reports/balance-v02.json', JSON.stringify(data, null, 2));
writeFileSync(
  'docs/BALANCE.md',
  `# Balance provisional · v0.2.1

## Qué se ha probado

${totalRuns} ejecuciones de partidas: 640 con la primera mezcla, 640 con la mezcla ajustada y ${games} en el torneo final. Las semillas se comparten entre políticas y variantes; el torneo final repite las primeras 40 partidas de cada emparejamiento y añade otras 40. No son ${totalRuns} muestras independientes. Cero fallos de ejecución en el torneo final: ${failures.length} reportados.

Cada pareja mantiene ciudad, reparto y especialidades, cambiando quién empieza. Los perfiles cambian de asiento entre parejas. El resultado refleja políticas heurísticas, no jugadores óptimos ni un equilibrio de Nash demostrado. Los archivos JSON guardan la versión y los parámetros de cada lote.

## Cambios tras el primer ensayo

- El primer mapa tenía 7 viviendas de cada categoría, 9 servicios y 6 incidencias. El espejo cerró línea en ${first.games - first.roundLimit}/${first.games} partidas y la política de volumen perdió claramente frente a la equilibrada.
- El ajuste mantiene 37 hexágonos, con 8 lujosas, 8 medias y 9 baratas, 6 servicios y 5 incidencias. Se eliminan duplicados urbanos y la Reforma urbana inicial (se consigue con Fin de obras).
- La progresión barata pasa de 0/1/2/3/4 a 0/1/2/4/6. Su base sigue siendo mucho menor que la de lujo. El espejo ajustado cerró línea en ${adjusted.games - adjusted.roundLimit}/${adjusted.games} con las mismas semillas.
- En el espejo final ampliado: ${mirror.games - mirror.roundLimit}/${mirror.games} cierres. Quien empezó ganó ${mirror.firstWins} veces y perdió ${mirror.firstLosses}, con ${mirror.firstTies} empates. Es un control pequeño, no una garantía de igualdad.

## Categorías en el torneo final

${table(
  ['Categoría', 'Ventas', 'Puntos medios por venta'],
  Object.entries(categories).map(([cat, n]) => [cat, n.sales, (n.points / n.sales).toFixed(2)]),
)}

Las frecuencias dependen del mapa, del encaje exigido y de las políticas. No son probabilidades puras de éxito. Barata exige encaje 0, Media 1 y Lujosa 2. Los puntos incluyen cartas, barrio y especialidades.

## ¿Sigue funcionando aceptar la mejor oferta?

Equilibrada contra Codiciosa: ${greedy.wins[0]}-${greedy.wins[1]}, con ${greedy.draws} empates, en ${greedy.games} partidas. Por tanto, estas pruebas NO demuestran que conservar clientes sea superior en general. Sí existe un coste de oportunidad real: el cliente desaparece de tu mano y conseguir otro cuesta acción o carta. La política codiciosa maximiza la valoración inmediata de ventas sin la penalización de conservar clientes; comparte el resto de heurísticas, así que no es un agente de búsqueda óptima.

${table(
  ['Políticas A / B', 'Victorias A / B', 'Empates', 'Cierre de línea', 'Turnos medios'],
  batches.map((r) => [
    r.profiles.join(' / '),
    r.wins.join(' / '),
    r.draws,
    r.games - r.roundLimit,
    r.meanTurns.toFixed(1),
  ]),
)}

Total: ${games - rounds}/${games} cierres por línea. Reservas caducadas: ${data.expired}; prórrogas usadas: ${data.extensions}.

## Especialidades

${table(
  ['Ficha', 'Participaciones', 'Victorias'],
  specialties.map((s) => [s.name, s.games, s.wins]),
)}

No interpretar esta tabla como efecto causal del bonus: cada ficha está mezclada con reparto, jugador y política.

## Cartas menos utilizadas

${table(
  ['Carta', 'Robos', 'Usos', 'Usos / robos'],
  cards
    .toSorted((a, b) => a.used / Math.max(1, a.drawn) - b.used / Math.max(1, b.drawn))
    .slice(0, 10)
    .map((c) => [
      c.name,
      c.drawn,
      c.used,
      ((100 * c.used) / Math.max(1, c.drawn)).toFixed(1) + '%',
    ]),
)}

Una carta poco utilizada puede indicar una heurística insuficiente. Robar otra vez la misma carta cuenta como nueva exposición; las reacciones cuentan cuando se preparan.

## Pendiente de probar con personas

- Lujo puntúa más, pero completar cinco lujosas es mucho menos frecuente. La categoría sirve a menudo para ganar puntos sin cerrar esa línea.
- Aún hay ${rounds} finales por límite de rondas; conviene comprobar si el final se siente largo o si se está retrasando deliberadamente el cierre.
- La defensa permanente ya no existe: las reservas caducan. El perfil Bloqueo conserva hábitos que pueden ser malos bajo las nuevas reglas.
- El robo aleatorio de clientes y sus requisitos necesita partidas humanas. No hay reposición automática al vender, pero Buscar cliente evita depender de una carta concreta.
- No se ha demostrado una estrategia invencible, ni se ha entrenado una IA por aprendizaje.
`,
);
console.log(JSON.stringify(data, null, 2));
