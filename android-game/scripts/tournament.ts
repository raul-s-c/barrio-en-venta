import { mkdirSync, writeFileSync } from 'node:fs';
import { PROFILES, emptySimulation, simulateOne, type Profile } from '../shared/ai';
const games = Number(process.argv[2] || 120);
const directory = process.argv[3] || 'reports/tournament-v02';
mkdirSync(directory, { recursive: true });
const pairs: [Profile, Profile][] = [['equilibrada', 'equilibrada']];
for (let a = 0; a < PROFILES.length; a++)
  for (let b = a + 1; b < PROFILES.length; b++) pairs.push([PROFILES[a], PROFILES[b]]);
const summary = [];
for (const profiles of pairs) {
  const options = { games, seed: 20260916, profiles };
  const r = emptySimulation(options);
  for (let i = 0; i < games; i++) simulateOne(options, i, r);
  writeFileSync(`${directory}/${profiles.join('-')}.json`, JSON.stringify(r, null, 2));
  const row = {
    profiles,
    games: r.games,
    wins: r.wins,
    draws: r.draws,
    first: r.firstWins / (r.firstWins + r.firstLosses),
    meanScore: r.meanScore,
    turns: r.meanTurns,
    closing: r.closures,
    roundLimit: r.roundLimit,
    errors: r.failures.length,
    categories: r.categories,
    retained: r.retainedClientDecisions,
    expired: r.expiredPriorities,
    extended: r.extendedPriorities,
  };
  summary.push(row);
  console.log(JSON.stringify(row));
}
writeFileSync(`${directory}/summary.json`, JSON.stringify(summary, null, 2));
if (summary.some((r) => r.errors)) process.exitCode = 1;
