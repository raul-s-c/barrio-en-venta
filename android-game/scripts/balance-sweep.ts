import { writeFileSync, mkdirSync } from 'node:fs';
import { DEFAULTS } from '../shared/catalog';
import { emptySimulation, simulateOne, type Profile } from '../shared/ai';
const variants = [
  [0, 1, 2, 3, 5],
  [1, 2, 4, 6, 9],
  [2, 4, 6, 8, 12],
  [3, 5, 7, 9, 13],
];
const pairs: [Profile, Profile][] = [
  ['equilibrada', 'volumen'],
  ['lujo', 'volumen'],
  ['bloqueo', 'volumen'],
];
const rows = [];
for (const cheap of variants)
  for (const profiles of pairs) {
    const o = {
        games: 160,
        seed: 4117,
        profiles,
        params: { ...DEFAULTS, progress: { ...DEFAULTS.progress, Barata: cheap } },
      },
      r = emptySimulation(o);
    for (let i = 0; i < o.games; i++) simulateOne(o, i, r);
    const row = {
      cheap,
      profiles,
      wins: r.wins,
      draws: r.draws,
      mean: r.meanScore,
      errors: r.failures,
    };
    rows.push(row);
    console.log(JSON.stringify(row));
  }
mkdirSync('reports', { recursive: true });
writeFileSync('reports/balance-sweep.json', JSON.stringify(rows, null, 2));
