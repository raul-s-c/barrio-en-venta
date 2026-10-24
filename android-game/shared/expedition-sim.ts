import { CATEGORIES, CLIENTS, property, type Category } from './catalog';
import {
  applyExpeditionCommand,
  createExpedition,
  expeditionIntegrity,
  saleOptions,
  type ExpeditionCommand,
  type ExpeditionDeal,
  type ExpeditionState,
} from './expedition';
import type { Seat } from './engine';

export type ExpeditionSimulation = {
  games: number;
  wins: [number, number];
  draws: number;
  firstSeatWins: number;
  meanMoves: number;
  meanZones: number;
  meanSales: number;
  meanBatch: number;
  exchanges: number;
  categorySales: Record<Category, number>;
  winByCategory: Record<Category, number>;
  estimatedMinutesAt45SecondsPerAction: number;
  maxMoves: number;
};

function chooseZone(s: ExpeditionState): ExpeditionCommand {
  const centers = s.tiles.flatMap((tile, index) => (tile.open ? [] : [{ tile, index }]));
  const candidates = centers.map(({ tile, index }) => {
    const nearest = s.tiles
      .map((candidate, i) => ({ candidate, i }))
      .filter(({ candidate }) => !candidate.open)
      .sort(
        (a, b) =>
          Math.max(
            Math.abs(a.candidate.q - tile.q),
            Math.abs(a.candidate.r - tile.r),
            Math.abs(a.candidate.q + a.candidate.r - tile.q - tile.r),
          ) -
          Math.max(
            Math.abs(b.candidate.q - tile.q),
            Math.abs(b.candidate.r - tile.r),
            Math.abs(b.candidate.q + b.candidate.r - tile.q - tile.r),
          ),
      )
      .slice(0, 10);
    return {
      index,
      value: nearest.filter(({ candidate }) => property(candidate.id).kind === 'home').length,
    };
  });
  candidates.sort((a, b) => b.value - a.value);
  return { type: 'zone', tile: candidates[0]?.index ?? 0 };
}

function batch(s: ExpeditionState, seat: Seat): ExpeditionDeal[] {
  const options = saleOptions(s, seat);
  let best: { deals: ExpeditionDeal[]; value: number } = { deals: [], value: -Infinity };
  for (const category of CATEGORIES) {
    const clientsUsed = new Set<number>();
    const candidates = options
      .filter((option) => option.category === category)
      .toSorted((a, b) => b.points - a.points);
    const deals: ExpeditionDeal[] = [];
    const tilesUsed = new Set<number>();
    for (const option of candidates) {
      if (tilesUsed.has(option.tile) || clientsUsed.has(option.client)) continue;
      deals.push({ tile: option.tile, client: option.client });
      tilesUsed.add(option.tile);
      clientsUsed.add(option.client);
      if (deals.length >= 5) break;
    }
    if (!deals.length) continue;
    const progress = s.players[seat].sales.filter((sale) => sale.category === category).length;
    const value =
      deals.reduce(
        (sum, deal) =>
          sum +
          (options.find((o) => o.tile === deal.tile && o.client === deal.client)?.points ?? 0),
        0,
      ) +
      progress * 20 +
      (progress >= 3 ? 80 : 0);
    if (value > best.value) best = { deals, value };
  }
  return best.deals;
}

function chooseExchange(s: ExpeditionState, seat: Seat): ExpeditionCommand {
  const own = s.players[seat].clients;
  const weak = own.toSorted((a, b) => CLIENTS[a].accepts.length - CLIENTS[b].accepts.length)[0];
  const replacement = s.market
    .filter((marketClient) => !own.includes(marketClient))
    .toSorted((a, b) => CLIENTS[b].accepts.length - CLIENTS[a].accepts.length)[0];
  if (weak !== undefined && replacement !== undefined)
    return { type: 'exchange', handClient: weak, marketClient: replacement };
  return { type: 'exchange', handClient: own[0], marketClient: s.market[0] };
}

function nextMove(s: ExpeditionState, seat: Seat): ExpeditionCommand {
  const deals = batch(s, seat);
  if (deals.length) return { type: 'sell', deals };
  return chooseExchange(s, seat);
}

function playTactic(s: ExpeditionState, seat: Seat) {
  if (s.tactics[seat]) return;
  const candidate = s.players[seat].cards.find((id) => id % 3 === 0);
  if (candidate !== undefined && batch(s, seat).length) {
    const next = applyExpeditionCommand(s, seat, { type: 'card', card: candidate });
    Object.assign(s, next);
  }
}

export function simulateExpedition(seed: number, maxMoves = 250, first: Seat = (seed % 2) as Seat) {
  let state = createExpedition(seed, ['IA A', 'IA B'], first);
  let moves = 0;
  while (!state.finished && moves < maxMoves) {
    if (state.phase === 'choose-zone') {
      state = applyExpeditionCommand(state, state.active, chooseZone(state));
      continue;
    }
    const actor = state.active;
    playTactic(state, actor);
    const command = nextMove(state, actor);
    state = applyExpeditionCommand(state, actor, command);
    expeditionIntegrity(state);
    moves++;
  }
  if (!state.finished)
    throw new Error(
      JSON.stringify({
        moves,
        phase: state.phase,
        round: state.round,
        zone: state.zone,
        active: state.active,
        market: state.market.length,
        homes: state.tiles.filter(
          (tile) => tile.open && tile.sold === undefined && property(tile.id).kind === 'home',
        ).length,
        sales: state.players.map((player) => player.sales.length),
        categorySales: state.players.map((player) =>
          player.sales.reduce(
            (counts, sale) => ({ ...counts, [sale.category]: (counts[sale.category] || 0) + 1 }),
            {} as Record<string, number>,
          ),
        ),
        saleOptions: [saleOptions(state, 0).length, saleOptions(state, 1).length],
      }),
    );
  return { state, moves };
}

function mixSeed(value: number) {
  let mixed = value | 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}
export function simulateExpeditionBatch(games = 200, seed = 20260923): ExpeditionSimulation {
  const result: ExpeditionSimulation = {
    games,
    wins: [0, 0],
    draws: 0,
    firstSeatWins: 0,
    meanMoves: 0,
    meanZones: 0,
    meanSales: 0,
    meanBatch: 0,
    exchanges: 0,
    categorySales: { Lujosa: 0, Media: 0, Barata: 0 },
    winByCategory: { Lujosa: 0, Media: 0, Barata: 0 },
    estimatedMinutesAt45SecondsPerAction: 0,
    maxMoves: 0,
  };
  let totalMoves = 0,
    totalZones = 0,
    totalSales = 0,
    saleTurns = 0;
  for (let i = 0; i < games; i++) {
    const { state, moves } = simulateExpedition(mixSeed(seed + i), 250, (i % 2) as Seat);
    totalMoves += moves;
    totalZones += state.zone;
    totalSales += state.players[0].sales.length + state.players[1].sales.length;
    result.maxMoves = Math.max(result.maxMoves, moves);
    if (state.result!.winner !== null) result.wins[state.result!.winner]++;
    if (state.result!.winner === null) result.draws++;
    if (state.result!.winner === i % 2) result.firstSeatWins++;
    result.exchanges += state.log.filter((entry) =>
      entry.text.includes('cambia un cliente por una opción'),
    ).length;
    saleTurns += state.log.filter(
      (entry) => entry.text.includes(' roba ') && entry.text.includes('cliente(s) del mazo'),
    ).length;
    for (const player of state.players)
      for (const sale of player.sales) result.categorySales[sale.category]++;
    if (state.result!.winner !== null) {
      const sales = state.players[state.result!.winner].sales;
      const winningCategory = CATEGORIES.find(
        (category) => sales.filter((sale) => sale.category === category).length >= 10,
      );
      if (winningCategory) result.winByCategory[winningCategory]++;
    }
  }
  result.meanMoves = totalMoves / games;
  result.meanZones = totalZones / games;
  result.meanSales = totalSales / games;
  result.meanBatch = saleTurns ? totalSales / saleTurns : 0;
  result.estimatedMinutesAt45SecondsPerAction = (result.meanMoves * 45) / 60;

  return result;
}
