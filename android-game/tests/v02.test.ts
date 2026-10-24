import { DEFAULTS } from '../shared/catalog';
import { expect, it } from 'vitest';
import {
  applyCommand,
  choices,
  createGame,
  frontier,
  saleReason,
  saleValue,
  view,
  type State,
} from '../shared/engine';
import { CARDS, CLIENTS, SPECIALTIES, property } from '../shared/catalog';
// Las pruebas de mecánicas usan dos acciones desde el primer turno.
const TWO_ACTIONS = { ...DEFAULTS, openingActions: 2 };

function ownCard(s: State, id: number) {
  s.cardDeck = s.cardDeck.filter((x) => x !== id);
  s.cardDiscard = s.cardDiscard.filter((x) => x !== id);
  for (const p of s.players) p.cards = p.cards.filter((x) => x !== id);
  s.players[0].cards.push(id);
}
function open() {
  const s = createGame(2, undefined, 0, TWO_ACTIONS);
  s.tiles.forEach((t) => {
    t.open = true;
    t.cleared = true;
  });
  return s;
}
function end(s: State) {
  while (choices(s).some((c) => c.command.type === 'discard'))
    s = applyCommand(s, s.active, choices(s)[0].command);
  return applyCommand(s, s.active, { type: 'end' });
}

it('reparte 5 clientes y 2 cartas, con solo el ayuntamiento abierto y especialidades públicas', () => {
  const s = createGame(9, undefined, 0, TWO_ACTIONS);
  expect(s.players.map((p) => p.clients.length)).toEqual([5, 5]);
  expect(s.players.map((p) => p.cards.length)).toEqual([2, 2]);
  expect(s.tiles.filter((t) => t.open).map((t) => t.id)).toEqual(['town']);
  expect(s.market).toEqual([]);
  expect(s.players[0]).not.toHaveProperty('objective');
  expect(view(s, 0).players[1].specialty).toBe(s.players[1].specialty);
});
it('alterna estrictamente y roba una carta en cada turno posterior al reparto', () => {
  let s = createGame(7, undefined, 0, TWO_ACTIONS);
  s = end(s);
  expect(s.active).toBe(1);
  expect(s.players[1].cards).toHaveLength(2);
  s = end(s);
  expect(s.active).toBe(0);
  expect(s.players[0].cards).toHaveLength(3);
  s = end(s);
  expect(s.active).toBe(1);
  expect(s.players[1].cards).toHaveLength(3);
});
it('la reserva protege todo el siguiente turno propio y caduca solo al terminarlo', () => {
  let s = createGame(2, undefined, 0, TWO_ACTIONS);
  const index = s.tiles.findIndex((t, i) => frontier(s, i) && property(t.id).kind === 'home');
  s = applyCommand(s, 0, { type: 'explore', tile: index });
  expect(s.tiles[index].reservedUntil).toBe(2);
  s = end(s);
  expect(s.tiles[index].owner).toBe(0);
  s = end(s);
  expect(s.tiles[index].owner).toBe(0);
  expect(s.players[0].turns).toBe(2);
  s = end(s);
  expect(s.tiles[index].owner).toBeUndefined();
  expect(s.metrics.expiredPriorities).toBe(1);
});
it('Prórroga de exclusiva funciona con cero acciones y añade un turno propio', () => {
  let s = createGame(2, undefined, 0, TWO_ACTIONS);
  ownCard(s, 29);
  const index = s.tiles.findIndex((t, i) => frontier(s, i) && property(t.id).kind === 'home');
  s = applyCommand(s, 0, { type: 'explore', tile: index });
  s = applyCommand(s, 0, choices(s).find((c) => c.command.type === 'explore')!.command);
  expect(s.used).toEqual(['explore', 'explore']);
  s = applyCommand(s, 0, { type: 'card', card: 29, tile: index });
  expect(s.used).toEqual(['explore', 'explore']);
  expect(s.tiles[index].reservedUntil).toBe(3);
  s = end(end(end(s)));
  expect(s.tiles[index].owner).toBe(0);
  s = end(end(s));
  expect(s.tiles[index].owner).toBeUndefined();
});
it('vender consume un cliente privado sin reponerlo; buscarlo cuesta una acción', () => {
  let s = open();
  const sale = choices(s).find((c) => c.command.type === 'sell' && c.command.card === undefined)!;
  const client = sale.command.client!;
  s = applyCommand(s, 0, sale.command);
  expect(s.players[0].clients).toHaveLength(4);
  expect(s.players[0].clients).not.toContain(client);
  expect(s.clientDiscard).toContain(client);
  s = applyCommand(s, 0, { type: 'capture' });
  expect(s.players[0].clients).toHaveLength(5);
  expect(s.used).toEqual(['sell', 'capture']);
});
it('permite vender dos veces y conserva las cartas opcionales hasta la venta', () => {
  let s = open();
  for (let i = 0; i < 2; i++)
    s = applyCommand(
      s,
      0,
      choices(s).find((c) => c.command.type === 'sell' && c.command.card === undefined)!.command,
    );
  expect(s.used).toEqual(['sell', 'sell']);
  expect(s.players[0].sales).toHaveLength(2);
  expect(s.players[0].clients).toHaveLength(3);
});
it('la venta de lujo no exige encajes; es más escasa y conserva el bonus de especialidad', () => {
  const s = open();
  const index = s.tiles.findIndex((t) => property(t.id).category === 'Lujosa');
  const client = CLIENTS.find((c) => c.accepts.includes('Lujosa'))!.id;
  s.players[0].clients = [client];
  s.tiles.forEach((t, i) => {
    t.open = i === index;
  });
  expect(CLIENTS.filter((c) => c.accepts.includes('Lujosa'))).toHaveLength(4);
  expect(saleReason(s, 0, index, client)).toBeUndefined();
  expect(choices(s).some((c) => c.command.type === 'sell' && c.command.tile === index)).toBe(true);
  s.players[0].specialty = 1;
  const base = saleValue(s, 0, index, client).points;
  s.players[0].specialty = 0;
  expect(saleValue(s, 0, index, client).points).toBe(base + SPECIALTIES[0].bonus);
});
it('no descarta cartas automáticamente: el jugador elige antes de continuar', () => {
  let s = createGame(3, undefined, 0, TWO_ACTIONS);
  s.players[0].cards = CARDS.slice(0, 8).map((c) => c.id);
  const options = choices(s);
  expect(options).toHaveLength(8);
  expect(options.every((c) => c.command.type === 'discard')).toBe(true);
  expect(() => applyCommand(s, 0, { type: 'end' })).toThrow();
  s = applyCommand(s, 0, { type: 'discard', card: 7, mode: 'card' });
  expect(s.players[0].cards).not.toContain(7);
  expect(s.used).toEqual([]);
});
it('las ofertas privadas no filtran losetas ocultas ni clientes rivales', () => {
  const s = createGame(3, undefined, 0, TWO_ACTIONS);
  expect(view(s, 0).offers).toEqual([]);
  const tile = choices(s).find((c) => c.command.type === 'explore')!.command;
  const next = applyCommand(s, 0, tile);
  expect(
    view(next, 1).offers.every((c) => next.players[1].clients.includes(c.command.client!)),
  ).toBe(true);
});
