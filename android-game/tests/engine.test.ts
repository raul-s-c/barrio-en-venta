import { DEFAULTS } from '../shared/catalog';
import { describe, it, expect } from 'vitest';
import {
  createGame,
  applyCommand,
  choices,
  view,
  frontier,
  saleValue,
  type State,
} from '../shared/engine';
import { choose, emptySimulation, simulateOne } from '../shared/ai';
import { CARDS, CLIENTS, property } from '../shared/catalog';
// Las pruebas de mecánicas usan dos acciones desde el primer turno.
const TWO_ACTIONS = { ...DEFAULTS, openingActions: 2 };
function integrity(s: State) {
  expect(s.tiles).toHaveLength(37);
  expect(new Set(s.tiles.map((t) => t.id)).size).toBe(37);
  for (const seat of [0, 1] as const) {
    expect(s.players[seat].cards.length).toBeLessThanOrEqual(CARDS.length);
    expect(s.players[seat].clients.length).toBeLessThanOrEqual(CLIENTS.length);
    if (
      seat === s.active &&
      !s.pending.length &&
      !s.finished &&
      (s.players[seat].cards.length > 7 || s.players[seat].clients.length > 8)
    )
      expect(choices(s).every((c) => c.command.type === 'discard')).toBe(true);
    expect(s.tiles.filter((t) => t.owner === seat).length).toBeLessThanOrEqual(4);
    expect(s.players[seat].score).toBe(s.players[seat].sales.reduce((a, b) => a + b.points, 0));
  }
  const cards = [...s.cardDeck, ...s.cardDiscard, ...s.players.flatMap((p) => p.cards)];
  expect(cards.toSorted((a, b) => a - b)).toEqual(CARDS.map((c) => c.id));
  const clients = [
    ...s.clientDeck,
    ...s.clientDiscard,
    ...s.market,
    ...s.pending,
    ...s.players.flatMap((p) => p.clients),
  ];
  expect(clients.toSorted((a, b) => a - b)).toEqual(CLIENTS.map((c) => c.id));
  expect(s.used.length).toBeLessThanOrEqual(2);
}
function giveCard(s: State, card: number, seat = 0) {
  s.cardDeck = s.cardDeck.filter((x) => x !== card);
  s.cardDiscard = s.cardDiscard.filter((x) => x !== card);
  s.players.forEach((p) => (p.cards = p.cards.filter((x) => x !== card)));
  s.players[seat].cards.push(card);
}
function openState(seed = 123) {
  const s = createGame(seed, undefined, 0, TWO_ACTIONS);
  s.tiles.forEach((t) => {
    t.open = true;
    t.cleared = true;
  });
  return s;
}
describe('Motor autoritativo', () => {
  it('es determinista y conserva el reparto al cambiar la iniciativa', () => {
    const a = createGame(123, undefined, 0),
      b = createGame(123, undefined, 1);
    expect(a.tiles).toEqual(b.tiles);
    expect(a.players.map(({ turns, ...p }) => p)).toEqual(b.players.map(({ turns, ...p }) => p));
    expect(createGame(123)).toEqual(a);
    integrity(a);
  });
  it('oculta mazos, identidad de losetas y objetivos/manos del rival', () => {
    const s = createGame(4, undefined, 0, TWO_ACTIONS),
      v = view(s, 0);
    expect(v).not.toHaveProperty('cardDeck');
    expect(v).not.toHaveProperty('rng');
    expect(v.players[1]).not.toHaveProperty('cards');
    expect(v.players[1]).not.toHaveProperty('objective');
    for (const t of v.tiles.filter((t) => !t.open)) expect(t.id).toBeUndefined();
    expect(view(s, 1).choices).toEqual([]);
  });
  it('permite acciones repetidas, impide tercera acción, acciones ajenas y ventas inventadas', () => {
    let s = createGame(1, undefined, 0, TWO_ACTIONS);
    expect(() => applyCommand(s, 1, { type: 'draw' })).toThrow();
    expect(() => applyCommand(s, 0, { type: 'sell', tile: 18, client: 1 })).toThrow();
    s = applyCommand(s, 0, { type: 'draw' });
    expect(s.players[0].cards).toHaveLength(3);
    expect(s.used).toEqual(['draw']);
    expect(() => applyCommand(s, 0, { type: 'draw' })).toThrow();
  });
  it('explora solo frontera y reserva automáticamente', () => {
    let s = createGame(2, undefined, 0, TWO_ACTIONS);
    const i = s.tiles.findIndex((t, i) => frontier(s, i) && property(t.id).kind === 'home');
    s = applyCommand(s, 0, { type: 'explore', tile: i });
    expect(s.tiles[i].open).toBe(true);
    expect(s.tiles[i].owner).toBe(0);
    integrity(s);
  });
  it('no muta el estado de origen', () => {
    const s = createGame(1, undefined, 0, TWO_ACTIONS),
      before = JSON.stringify(s);
    applyCommand(s, 0, { type: 'draw' });
    expect(JSON.stringify(s)).toBe(before);
  });
  it('el bonus de venta persiste hasta vender y se aplica una sola vez', () => {
    let s = openState();
    const id = CARDS.find((c) => c.effect === 'saleBonus')!.id;
    giveCard(s, id);
    s.used = ['explore', 'explore'];
    s = applyCommand(s, 0, { type: 'card', card: id });
    expect(s.players[0].nextSaleBonus).toBe(3);
    s.used = ['explore'];
    const sale = choices(s).find((c) => c.command.type === 'sell')!;
    const preview = sale.points!;
    s = applyCommand(s, 0, sale.command);
    expect(s.players[0].score).toBe(preview);
    expect(s.players[0].nextSaleBonus).toBeUndefined();
    expect(s.metrics.cardsUsed[id]).toBe(1);
    integrity(s);
  });
  it('Robar 1 cliente no consume acción y mantiene el inventario íntegro', () => {
    let s = openState();
    const id = CARDS.find((c) => c.effect === 'client')!.id;
    giveCard(s, id);
    s.used = ['explore', 'explore'];
    const hand = s.players[0].clients.length;
    s = applyCommand(s, 0, { type: 'card', card: id });
    expect(s.players[0].clients).toHaveLength(hand + 1);
    expect(s.used).toEqual(['explore', 'explore']);
    expect(s.active).toBe(0);
    expect(s.tactics).toBe(1);
    expect(s.players[0].cards).toHaveLength(3);
    expect(choices(s).some((choice) => choice.command.type === 'card')).toBe(false);
    expect(s.metrics.cardsUsed[id]).toBe(1);
    integrity(s);
  });
  it('cierra con 4 ventas de una categoría y concede una respuesta completa', () => {
    let s = openState();
    expect(s.params.closeAt).toBe(4);
    const sale = choices(s).find((c) => c.command.type === 'sell' && c.command.card === undefined)!;
    const cat = property(s.tiles[sale.command.tile!].id).category!;
    s.players[0].sales = Array.from({ length: 3 }, () => ({
      tile: 0,
      category: cat,
      client: 0,
      points: 0,
      features: [],
      incidents: 0,
      services: 0,
      reserved: false,
    }));
    s = applyCommand(s, 0, sale.command);
    expect(s.closing).toBe(0);
    expect(s.finished).toBe(false);
    expect(s.active).toBe(1);
    expect(s.used).toEqual([]);
    s = applyCommand(s, 1, { type: 'draw' });
    s = applyCommand(s, 1, { type: 'end' });
    expect(s.finished).toBe(true);
    expect(s.result).toBeDefined();
  });
  it('quien empieza solo tiene 1 acción en su primer turno; después, 2', () => {
    let s = createGame(5, undefined, 0);
    const actions = () =>
      choices(s).filter((c) => !['card', 'end', 'discard', 'choose'].includes(c.command.type));
    expect(view(s, 0).actions).toBe(1);
    s = applyCommand(s, 0, actions()[0].command);
    expect(actions()).toHaveLength(0);
    s = applyCommand(s, 0, { type: 'end' });
    expect(view(s, 1).actions).toBe(2);
  });
  it('remontada: quien empieza su turno 15 puntos por detrás roba 1 cliente', () => {
    let s = createGame(321, undefined, 0);
    s.players[0].score = 15;
    const clients = s.players[1].clients.length;
    s = applyCommand(s, 0, { type: 'end' });
    expect(s.active).toBe(1);
    expect(s.players[1].clients).toHaveLength(clients + 1);
    expect(s.metrics.comebacks).toBe(1);
    expect(s.log.some((entry) => entry.text.includes('Remontada'))).toBe(true);
    s.players[1].score = 15;
    s.players[0].score = 1;
    const leaderClients = s.players[0].clients.length;
    s = applyCommand(s, 1, { type: 'end' });
    expect(s.players[0].clients).toHaveLength(leaderClients);
  });
  it('disputar ocupa la carta del turno y repone la mano', () => {
    let s = openState();
    const home = s.tiles.findIndex((t) => property(t.id).kind === 'home');
    s.tiles[home].owner = 1;
    s.tiles[home].reservedUntil = 2;
    const disputes = () =>
      choices(s).filter((c) => c.command.type === 'reserve' && c.command.card !== undefined);
    const hand = s.players[0].cards.length;
    const rivalHand = s.players[1].cards.length;
    s = applyCommand(s, 0, disputes()[0].command);
    expect(s.tiles[home].owner).toBe(0);
    expect(s.tactics).toBe(1);
    expect(s.players[0].cards).toHaveLength(hand);
    expect(s.players[1].cards.length).toBe(Math.min(3, rivalHand + 1));
    expect(choices(s).some((c) => c.command.type === 'card')).toBe(false);
    const second = s.tiles.findIndex((t, i) => i !== home && property(t.id).kind === 'home');
    s.tiles[second].owner = 1;
    s.tiles[second].reservedUntil = 2;
    expect(disputes()).toHaveLength(0);
    integrity(s);
  });
  it('las 30 cartas tienen ejecución legal en escenarios preparados', () => {
    for (const card of CARDS) {
      let s = openState(5);
      giveCard(s, card.id);
      while (s.players[0].cards.length > 5) s.cardDiscard.push(s.players[0].cards.shift()!);
      const home = s.tiles.findIndex((t) => property(t.id).kind === 'home');
      if (card.effect === 'removePriority') s.tiles[home].owner = 1;
      if (card.effect === 'extendPriority') {
        s.tiles[home].owner = 0;
        s.tiles[home].reservedUntil = 2;
      }
      if (card.effect === 'explore') s.tiles[0].open = false;
      const options = choices(s).filter(
        (c) => c.command.card === card.id && c.command.type === 'card',
      );
      expect(options.length, card.name).toBeGreaterThan(0);
      s = applyCommand(s, 0, options[0].command);
      expect(s.metrics.cardsUsed[card.id], card.name).toBe(1);
      integrity(s);
    }
  });
  it('la política lujo sacrifica puntos inmediatos para avanzar su categoría', () => {
    const s = openState(5);
    s.players[0].clients = [15];
    s.players[0].cards = [];
    const v = view(s, 0);
    const sales = v.choices.filter((c) => c.command.type === 'sell' && c.command.client === 15);
    const luxury = sales
      .filter((c) => property(v.tiles[c.command.tile!].id!).category === 'Lujosa')
      .toSorted((a, b) => a.points! - b.points!)[0];
    const medium = sales
      .filter((c) => property(v.tiles[c.command.tile!].id!).category === 'Media')
      .toSorted((a, b) => b.points! - a.points!)[0];
    expect(luxury.points).toBeLessThan(medium.points!);
    const options = { ...v, choices: [luxury, medium], offers: [luxury, medium] };
    expect(choose(options, 'equilibrada').command).toEqual(medium.command);
    expect(choose(options, 'lujo').command).toEqual(luxury.command);
  });
  it('mantiene inventario y reglas durante partidas completas', () => {
    for (let seed = 1; seed <= 12; seed++) {
      let s = createGame(seed, undefined, 0, TWO_ACTIONS);
      for (let n = 0; n < 350 && !s.finished; n++) {
        s = applyCommand(
          s,
          s.active,
          choose(view(s, s.active), seed % 2 ? 'equilibrada' : 'azar', seed * 100 + n).command,
        );
        integrity(s);
      }
      expect(s.finished).toBe(true);
    }
  }, 30000);
  it('el simulador devuelve métricas reproducibles', () => {
    const o = { games: 2, seed: 42, profiles: ['equilibrada', 'lujo'] as ['equilibrada', 'lujo'] };
    const a = emptySimulation(o),
      b = emptySimulation(o);
    simulateOne(o, 0, a);
    simulateOne(o, 0, b);
    const opening = createGame(o.seed, ['IA A', 'IA B'], 0);
    const luxuryHands = opening.players.map(
      (p) => p.clients.filter((id) => CLIENTS[id].accepts.includes('Lujosa')).length,
    );
    expect(a.scores).toEqual(b.scores);
    expect(a.actions).toEqual(b.actions);
    expect(a.openingLuxuryAccess).toEqual({
      playerHands: 2,
      handsWithBuyer: luxuryHands.filter((n) => n > 0).length,
      buyersDealt: luxuryHands.reduce((sum, n) => sum + n, 0),
    });
    expect(a.openingLuxuryAccess).toEqual(b.openingLuxuryAccess);
    expect(a.failures).toEqual([]);
  });
});
