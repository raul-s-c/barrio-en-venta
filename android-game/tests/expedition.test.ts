import { describe, expect, it } from 'vitest';
import { CLIENTS, PROPERTIES } from '../shared/catalog';
import {
  applyExpeditionCommand,
  createExpedition,
  expeditionIntegrity,
  saleOptions,
  EXPEDITION_CARDS,
  EXPEDITION_TILES,
} from '../shared/expedition';

describe('Modo campaña', () => {
  it('prepara un mapa de 91 casillas, cartera de 5, mercado de 5 y 3 cartas', () => {
    const game = createExpedition(77);
    expect(game.tiles).toHaveLength(EXPEDITION_TILES);
    expect(game.players[0].clients).toHaveLength(5);
    expect(game.players[0].cards).toHaveLength(3);
    expect(game.market).toHaveLength(5);
  });

  it('abre diez casillas y la primera acción es del rival de quien eligió', () => {
    let game = createExpedition(77, ['A', 'B'], 0);
    game = applyExpeditionCommand(game, 0, { type: 'zone', tile: 45 });
    expect(game.tiles.filter((tile) => tile.open)).toHaveLength(10);
    expect(game.phase).toBe('play');
    expect(game.active).toBe(1);
  });

  it('los turnos alternan siempre, también al abrir un barrio nuevo', () => {
    for (let seed = 1; seed <= 60; seed++) {
      let game = createExpedition(seed, ['A', 'B'], (seed % 2) as 0 | 1);
      let last: number | undefined;
      for (let step = 0; step < 400 && !game.finished; step++) {
        if (game.phase === 'choose-zone') {
          expect(game.chooser).toBe(last ?? game.chooser);
          const tile = game.tiles.findIndex((candidate) => !candidate.open);
          game = applyExpeditionCommand(game, game.active, { type: 'zone', tile });
          continue;
        }
        if (last !== undefined) expect(game.active).not.toBe(last);
        last = game.active;
        const option = saleOptions(game, game.active)[0];
        game = applyExpeditionCommand(
          game,
          game.active,
          option
            ? { type: 'sell', deals: [{ tile: option.tile, client: option.client }] }
            : {
                type: 'exchange',
                handClient: game.players[game.active].clients[0],
                marketClient: game.market[0],
              },
        );
        expect(expeditionIntegrity(game)).toBe(true);
      }
      expect(game.finished).toBe(true);
    }
  });

  it('si llega a 10 quien abrió, el rival tiene un último turno y deciden los puntos', () => {
    let game = createExpedition(5, ['A', 'B'], 0);
    game = applyExpeditionCommand(game, 0, { type: 'zone', tile: 45 });
    const first = game.active;
    const second = (1 - first) as 0 | 1;
    const option = saleOptions(game, first)[0];
    const category = option.category;
    game.players[first].sales = Array.from({ length: 9 }, () => ({
      tile: -1,
      category,
      client: -1,
      points: 0,
    }));
    game.players[second].sales = structuredClone(game.players[first].sales);
    game = applyExpeditionCommand(game, first, {
      type: 'sell',
      deals: [{ tile: option.tile, client: option.client }],
    });
    expect(game.finished).toBe(false);
    expect(game.finalTurn).toBe(second);
    expect(game.active).toBe(second);
    const answer = saleOptions(game, second).find((o) => o.category === category)!;
    expect(answer).toBeDefined();
    game = applyExpeditionCommand(game, second, {
      type: 'sell',
      deals: [{ tile: answer.tile, client: answer.client }],
    });
    expect(game.finished).toBe(true);
    const [a, b] = game.players.map((p) => p.score);
    expect(game.result?.winner).toBe(a === b ? null : a > b ? 0 : 1);
    expect(game.result?.message).toContain('Las dos agencias');
  });

  it('jugar una carta no consume el turno; roba reemplazo y limita a una', () => {
    let game = createExpedition(84, ['A', 'B'], 0);
    game = applyExpeditionCommand(game, 0, { type: 'zone', tile: 45 });
    const seat = game.active;
    const card = game.players[seat].cards[0];
    const effect = EXPEDITION_CARDS[card % EXPEDITION_CARDS.length].effect;
    const command =
      effect === 'bonus'
        ? { type: 'card' as const, card }
        : effect === 'exchange'
          ? {
              type: 'card' as const,
              card,
              handClient: game.players[seat].clients[0],
              marketClient: game.market[0],
            }
          : { type: 'card' as const, card, tile: game.tiles.findIndex((tile) => !tile.open) };
    game = applyExpeditionCommand(game, seat, command);
    expect(game.active).toBe(seat);
    expect(game.players[seat].cards).toHaveLength(3);
    expect(game.tactics[seat]).toBe(1);
    expect(() =>
      applyExpeditionCommand(game, seat, { type: 'card', card: game.players[seat].cards[0] }),
    ).toThrow();
  });

  it('Inspección urbana revela la casilla elegida y la oculta más cercana', () => {
    let game = createExpedition(84, ['A', 'B'], 0);
    game = applyExpeditionCommand(game, 0, { type: 'zone', tile: 45 });
    const seat = game.active;
    const scout = EXPEDITION_CARDS.findIndex((card) => card.effect === 'scout');
    const deckIndex = game.cardDeck.findIndex((id) => id % EXPEDITION_CARDS.length === scout);
    [game.players[seat].cards[0], game.cardDeck[deckIndex]] = [
      game.cardDeck[deckIndex],
      game.players[seat].cards[0],
    ];
    const card = game.players[seat].cards[0];
    expect(game.tiles[0].open).toBe(false);
    expect(() => applyExpeditionCommand(game, seat, { type: 'card', card, tile: 45 })).toThrow(
      'casilla oculta',
    );
    const before = game.tiles.filter((tile) => tile.open).length;
    game = applyExpeditionCommand(game, seat, { type: 'card', card, tile: 0 });
    expect(game.tiles[0].open).toBe(true);
    expect(game.tiles.filter((tile) => tile.open)).toHaveLength(before + 2);
    expect(game.active).toBe(seat);
  });

  it('vende con un cliente compatible y repone la cartera desde el mazo', () => {
    let game = createExpedition(99, ['A', 'B'], 0);
    game = applyExpeditionCommand(game, 0, { type: 'zone', tile: 45 });
    const seat = game.active;
    const option = saleOptions(game, seat)[0];
    expect(option).toBeDefined();
    const marketSize = game.market.length;
    game = applyExpeditionCommand(game, seat, {
      type: 'sell',
      deals: [{ tile: option.tile, client: option.client }],
    });
    expect(game.tiles[option.tile].sold).toBe(seat);
    expect(game.players[seat].sales).toHaveLength(1);
    expect(game.players[seat].clients).toHaveLength(5);
    expect(game.market).toHaveLength(marketSize);
    expect(expeditionIntegrity(game)).toBe(true);
  });

  it('los clientes flexibles pueden comprar casas lujosas en campaña', () => {
    const game = createExpedition(17);
    game.phase = 'play';
    const tile = game.tiles.find((candidate) => !candidate.open)!;
    tile.id = PROPERTIES.find(
      (candidate) => candidate.kind === 'home' && candidate.category === 'Lujosa',
    )!.id;
    tile.open = true;
    const flexible = CLIENTS.find((client) => client.family === 'Flexible')!;
    game.players[0].clients = [flexible.id];
    expect(saleOptions(game, 0).some((option) => option.category === 'Lujosa')).toBe(true);
  });
});
