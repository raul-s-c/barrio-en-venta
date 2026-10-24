import { mkdirSync, writeFileSync } from 'node:fs';
import { emptySimulation, simulateOne, type Profile } from '../shared/ai';
const games = Number(process.argv[2] || 100);
const profiles: [Profile, Profile] = [
  (process.argv[3] || 'equilibrada') as Profile,
  (process.argv[4] || 'lujo') as Profile,
];
const options = { games, seed: 20260916, profiles },
  result = emptySimulation(options);
for (let i = 0; i < games; i++) {
  simulateOne(options, i, result);
  if (i % 20 === 19) console.log(`${i + 1}/${games}`);
}
mkdirSync('reports', { recursive: true });
writeFileSync(`reports/simulation-${profiles.join('-')}.json`, JSON.stringify(result, null, 2));
console.log(
  JSON.stringify(
    {
      ...result,
      scores: undefined,
      clients: undefined,
      cards: result.cards.filter((c) => c.used === 0),
    },
    null,
    2,
  ),
);
if (result.failures.length) process.exitCode = 1;
