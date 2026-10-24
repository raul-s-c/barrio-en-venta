import {
  CARDS,
  CLIENTS,
  CATEGORIES,
  DEFAULTS,
  RULES_VERSION,
  property,
  type Parameters,
} from './catalog';
import { applyCommand, createGame, view, type Choice, type Seat, type View } from './engine';

export const PROFILES = ['equilibrada', 'lujo', 'volumen', 'bloqueo', 'codiciosa', 'azar'] as const;
export type Profile = (typeof PROFILES)[number];
function noise(seed: number) {
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 4294967296;
}
// Policies receive exactly the same private projection as a human player.
export function choose(v: View, profile: Profile = 'equilibrada', seed = 1): Choice {
  const own = v.players[v.self],
    rival = v.players[1 - v.self];
  const ranks = v.choices.map((choice, index) => {
    const c = choice.command,
      t = c.tile === undefined ? undefined : v.tiles[c.tile],
      p = t?.id ? property(t.id) : undefined;
    let score = noise(seed + index * 7919) * 0.4;
    if (profile === 'azar')
      return {
        choice,
        score:
          noise(seed + index * 7919) * 100 -
          (c.type === 'end' && v.used.length < v.actions ? 80 : 0),
      };
    switch (c.type) {
      case 'sell': {
        const cat = p!.category!;
        const n = own.sales.filter((s) => s.category === cat).length;
        score += 12 + (choice.points ?? 0) * 0.75 + n * 0.8;
        if (profile !== 'codiciosa') {
          const client = CLIENTS[c.client!];
          const alternatives = v.offers.filter(
            (o) =>
              !o.blocked &&
              o.command.client === c.client &&
              o.command.tile !== c.tile &&
              o.command.card === undefined,
          );
          const bestOther = Math.max(0, ...alternatives.map((o) => o.points!));
          score -= Math.max(0, bestOther - (choice.points ?? 0)) * 0.65;
          if (
            cat !== 'Lujosa' &&
            client.accepts.includes('Lujosa') &&
            v.you.clients.filter((id) => CLIENTS[id].accepts.includes('Lujosa')).length <= 2
          )
            score -= profile === 'lujo' ? 10 : 3;
        }
        if (profile === 'lujo') score += cat === 'Lujosa' ? 22 : 0;
        if (profile === 'volumen') score += cat === 'Barata' ? 12 : cat === 'Media' ? 4 : 0;
        if (n === v.params.closeAt - 1) {
          const projected = own.score + (choice.points ?? 0) + v.params.closeBonus - rival.score;
          score += projected >= 0 ? 20 : -18;
        }
        break;
      }
      case 'explore':
        score += profile === 'volumen' ? 8 : 6;
        if (t?.known && p?.category) score += p.category === 'Lujosa' && profile === 'lujo' ? 6 : 3;
        break;
      case 'reserve':
        score += 3;
        if (p?.category) {
          const n = rival.sales.filter((x) => x.category === p.category).length;
          score += n >= 3 ? 10 : 0;
          if (profile === 'bloqueo') score += t?.owner === 1 - v.self ? 10 : 7;
          score += own.sales.filter((x) => x.category === p.category).length;
        }
        if (c.card !== undefined) score -= 2;
        break;
      case 'capture': {
        score += own.clientsCount < 2 ? 13 : own.clientsCount < 4 ? 7 : 1;
        if (
          !v.choices.some((o) => o.command.type === 'sell') &&
          v.offers.length &&
          own.clientsCount < 7
        )
          score += 5;
        break;
      }
      case 'draw':
        score += own.cardsCount < 3 ? 5 : own.cardsCount < 5 ? 2 : -2;
        break;
      case 'town':
        score += c.mode === 'clear' ? 4 : c.mode === 'refresh' ? 1 : 0;
        break;
      case 'choose':
        score += CLIENTS[c.client!].accepts.length * 2;
        break;
      case 'discard':
        if (c.client !== undefined) {
          const options = v.offers.filter((o) => o.command.client === c.client && !o.blocked);
          score -= Math.max(0, ...options.map((o) => o.points!)) + CLIENTS[c.client].accepts.length;
        } else score -= ['client', 'explore', 'saleBonus'].includes(CARDS[c.card!].effect) ? 7 : 2;
        break;
      case 'card': {
        const card = CARDS[c.card!];
        switch (card.effect) {
          case 'saleBonus':
            score += v.choices.some((o) => o.command.type === 'sell') ? 60 : -2;
            break;
          case 'client':
            score += own.clientsCount < 4 ? 12 : 2;
            break;
          case 'explore':
            score += 9;
            break;
          case 'removePriority':
            score += profile === 'bloqueo' ? 12 : 5;
            if (
              v.offers.some(
                (o) =>
                  o.command.tile === c.tile &&
                  CLIENTS[o.command.client!].accepts.includes(p!.category!),
              )
            )
              score += 8;
            break;
          case 'extendPriority':
            score += t?.reservedUntil === own.turns ? 8 : -6;
            break;
        }
        break;
      }
      case 'end':
        score += v.used.length >= 2 ? 0 : -8;
        break;
    }
    return { choice, score };
  });
  ranks.sort((a, b) => b.score - a.score);
  return ranks[0].choice;
}
export type BatchOptions = {
  games: number;
  seed: number;
  profiles: [Profile, Profile];
  params?: Parameters;
};
export type Simulation = {
  version: string;
  parameters: Parameters;
  games: number;
  seed: number;
  profiles: [Profile, Profile];
  wins: number[];
  draws: number;
  firstWins: number;
  firstLosses: number;
  firstTies: number;
  meanScore: number[];
  meanTurns: number;
  closures: Record<string, number>;
  actions: Record<string, number>;
  cards: { id: number; drawn: number; used: number; rate: number }[];
  clients: number[];
  services: Record<string, { sales: number; points: number }>;
  roundLimit: number;
  failures: string[];
  scores: number[][];
  durationMs: number;
  notes: string[];
  categories: Record<string, { sales: number; points: number }>;
  expiredPriorities: number;
  extendedPriorities: number;
  retainedClientDecisions: number;
  openingLuxuryAccess: { playerHands: number; handsWithBuyer: number; buyersDealt: number };
  specialtyResults: { games: number; wins: number; sales: number }[];
};
export function emptySimulation(o: BatchOptions): Simulation {
  return {
    version: RULES_VERSION,
    parameters: structuredClone(o.params || DEFAULTS),
    games: 0,
    seed: o.seed,
    profiles: o.profiles,
    wins: [0, 0],
    draws: 0,
    firstWins: 0,
    firstLosses: 0,
    firstTies: 0,
    meanScore: [0, 0],
    meanTurns: 0,
    closures: {},
    actions: {},
    cards: CARDS.map((c) => ({ id: c.id, drawn: 0, used: 0, rate: 0 })),
    clients: Array(24).fill(0),
    services: {},
    roundLimit: 0,
    failures: [],
    scores: [],
    durationMs: 0,
    notes: [
      'Políticas heurísticas, sin búsqueda exhaustiva ni aprendizaje. No prueba equilibrio humano.',
      'Semillas emparejadas: misma ciudad y reparto, iniciativa intercambiada. Los perfiles cambian de asiento cada pareja.',
      'Uso/exposición de cartas: cada robo cuenta otra exposición; no es una estimación causal. La carta de próxima venta cuenta al activarla.',
      'Ventaja del primer jugador: victorias excluyendo empates; incluye decisiones de las políticas.',
      'Semillas repetidas dentro de parejas: no tratar todas las observaciones como muestras independientes.',
    ],
    categories: {},
    expiredPriorities: 0,
    extendedPriorities: 0,
    retainedClientDecisions: 0,
    openingLuxuryAccess: { playerHands: 0, handsWithBuyer: 0, buyersDealt: 0 },
    specialtyResults: Array.from({ length: 3 }, () => ({ games: 0, wins: 0, sales: 0 })),
  };
}
export function simulateOne(o: BatchOptions, index: number, result: Simulation) {
  const started = performance.now(),
    pair = Math.floor(index / 2),
    swapped = pair % 2 === 1;
  const profiles = swapped ? [o.profiles[1], o.profiles[0]] : o.profiles;
  let s = createGame(o.seed + pair * 104729, ['IA A', 'IA B'], (index % 2) as Seat, o.params);
  const openingLuxuryBuyerCounts = s.players.map(
    (player) => player.clients.filter((id) => CLIENTS[id].accepts.includes('Lujosa')).length,
  );
  let steps = 0;
  try {
    while (!s.finished && steps < 700) {
      const v = view(s, s.active),
        action = choose(v, profiles[s.active], o.seed + pair * 997 + steps * 31);
      if (action.command.type === 'sell') {
        const best = Math.max(
          0,
          ...v.choices
            .filter(
              (c) =>
                c.command.type === 'sell' &&
                c.command.tile === action.command.tile &&
                c.command.card === action.command.card,
            )
            .map((c) => c.points!),
        );
        if (action.points! < best) result.retainedClientDecisions++;
      }
      s = applyCommand(s, s.active, action.command);
      steps++;
    }
    if (!s.finished) throw new Error('Límite de 700 decisiones');
    for (const luxuryBuyers of openingLuxuryBuyerCounts) {
      result.openingLuxuryAccess.playerHands++;
      result.openingLuxuryAccess.handsWithBuyer += Number(luxuryBuyers > 0);
      result.openingLuxuryAccess.buyersDealt += luxuryBuyers;
    }
    const scores = swapped ? [s.result!.scores[1], s.result!.scores[0]] : s.result!.scores;
    const winner = s.result!.winner;
    if (winner === null) {
      result.draws++;
      result.firstTies++;
    } else {
      result.wins[swapped ? 1 - winner : winner]++;
      if (winner === s.initialStarter) result.firstWins++;
      else result.firstLosses++;
    }
    const n = result.games + 1;
    result.meanScore = result.meanScore.map((a, i) => (a * result.games + scores[i]) / n);
    result.meanTurns = (result.meanTurns * result.games + s.metrics.turns) / n;
    result.scores.push(scores);
    result.games = n;
    result.expiredPriorities += s.metrics.expiredPriorities;
    result.extendedPriorities += s.metrics.extendedPriorities;
    s.players.forEach((p, seat) => {
      const specialty = result.specialtyResults[p.specialty];
      specialty.games++;
      specialty.wins += Number(winner === seat);
      specialty.sales += p.sales.length;
      for (const sale of p.sales) {
        const bucket = (result.categories[sale.category] ??= { sales: 0, points: 0 });
        bucket.sales++;
        bucket.points += sale.points;
      }
    });
    if (s.closing === undefined) result.roundLimit++;
    else {
      const p = s.players[s.closing];
      const category =
        CATEGORIES.find(
          (cat) => p.sales.filter((x) => x.category === cat).length >= s.params.closeAt,
        ) ?? 'Desconocida';
      result.closures[category] = (result.closures[category] || 0) + 1;
    }
    for (const [key, n] of Object.entries(s.metrics.actions))
      result.actions[key] = (result.actions[key] || 0) + n;
    for (const card of result.cards) {
      card.drawn += s.metrics.cardsDrawn[card.id];
      card.used += s.metrics.cardsUsed[card.id];
      card.rate = card.drawn ? card.used / card.drawn : 0;
    }
    s.metrics.clientsUsed.forEach((n, i) => (result.clients[i] += n));
    for (const [f, v] of Object.entries(s.metrics.services)) {
      const current = (result.services[f] ??= { sales: 0, points: 0 });
      current.sales += v.sales;
      current.points += v.points;
    }
  } catch (error) {
    result.failures.push(
      `Partida ${index}, semilla ${s.seed}, revisión ${s.revision}: ${String(error)}`,
    );
  }
  result.durationMs += performance.now() - started;
  return result;
}
