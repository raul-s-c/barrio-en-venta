// Compara variantes de reglas de Partida con IA equilibrada contra sí misma.
// Uso: npx tsx scripts/rule-variants.ts 1000
import { createGame, applyCommand, view } from '../shared/engine';
import { choose } from '../shared/ai';
import { DEFAULTS } from '../shared/catalog';
const variants: Record<string, typeof DEFAULTS & { extraClient?: boolean }> = {
  'reglas 0.2.2 (5 ventas, +10, sin remontada, 2 acciones al abrir)': {
    ...DEFAULTS,
    closeAt: 5,
    closeBonus: 10,
    comebackGap: 999,
    openingActions: 2,
  },
  'reglas 0.2.3 (actuales)': DEFAULTS,
  'actuales con 2 acciones al abrir': { ...DEFAULTS, openingActions: 2 },
};
const N = Number(process.argv[2] ?? 600);
for (const [name, params] of Object.entries(variants)) {
  let margin = 0,
    close = 0,
    blow = 0,
    turns = 0,
    roundLimit = 0,
    firstWins = 0,
    decided = 0,
    leader9 = 0,
    leader9n = 0,
    closerWins = 0,
    closings = 0,
    comebacks = 0,
    leadChanges = 0,
    noChange = 0;
  for (let g = 0; g < N; g++) {
    const first = (g % 2) as 0 | 1;
    let s = createGame(20261023 + Math.floor(g / 2) * 104729, ['A', 'B'], first, params);
    if (params.extraClient) s.players[1 - first].clients.push(s.clientDeck.shift()!);
    let steps = 0,
      lead9: number | null = null,
      lastLeader = -1,
      changes = 0;
    while (!s.finished && steps++ < 900) {
      const lead =
        s.players[0].score === s.players[1].score
          ? -1
          : s.players[0].score > s.players[1].score
            ? 0
            : 1;
      if (lead !== -1) {
        if (lastLeader !== -1 && lead !== lastLeader) changes++;
        lastLeader = lead;
      }
      if (s.round >= 9 && lead9 === null) lead9 = lead;
      const c = choose(view(s, s.active), 'equilibrada', g * 997 + steps * 31);
      s = applyCommand(s, s.active, c.command);
    }
    const [a, b] = s.result!.scores;
    const m = Math.abs(a - b);
    margin += m;
    if (m <= 5) close++;
    if (m >= 20) blow++;
    turns += s.metrics.turns;
    comebacks += s.metrics.comebacks;
    leadChanges += changes;
    if (!changes) noChange++;
    if (s.closing === undefined) roundLimit++;
    else {
      closings++;
      if (s.result!.winner === s.closing) closerWins++;
    }
    if (s.result!.winner !== null) {
      decided++;
      if (s.result!.winner === first) firstWins++;
      if (lead9 !== null && lead9 !== -1) {
        leader9n++;
        if (lead9 === s.result!.winner) leader9++;
      }
    }
  }
  const pct = (x: number, d = N) => ((100 * x) / d).toFixed(1) + '%';
  console.log(
    `${name}: margen ${(margin / N).toFixed(1)} | ajustadas ${pct(close)} | palizas ${pct(blow)} | turnos ${(turns / N).toFixed(1)} | límite rondas ${pct(roundLimit)} | 1.º gana ${pct(firstWins, decided)} | líder r9 gana ${pct(leader9, leader9n)} | cierra y gana ${pct(closerWins, closings)} | cambios líder ${(leadChanges / N).toFixed(2)} | sin cambios ${pct(noChange)} | remontadas/partida ${(comebacks / N).toFixed(2)}`,
  );
}
