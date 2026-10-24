import { DEFAULTS } from '../shared/catalog';
import { describe, expect, it } from 'vitest';
import { CLIENTS, property } from '../shared/catalog';
import { adjacent, applyCommand, choices, createGame, frontier, view } from '../shared/engine';
import { actionBlock, saleBlock } from '../src/game-help';
// Las pruebas de mecánicas usan dos acciones desde el primer turno.
const TWO_ACTIONS = { ...DEFAULTS, openingActions: 2 };

function fixture() {
  const s = createGame(2, undefined, 0, TWO_ACTIONS);
  s.tiles.forEach((t) => {
    t.open = true;
    t.cleared = true;
  });
  const offer = choices(s).find((c) => c.command.type === 'sell' && c.command.card === undefined)!;
  return { s, index: offer.command.tile!, offer };
}

describe('Explicaciones de reglas', () => {
  it('explorar y vender son dos acciones válidas, sin reserva adicional ni carta', () => {
    const s = createGame(2, undefined, 0, TWO_ACTIONS);
    const cards = [...s.players[0].cards];
    const candidates = s.tiles.flatMap((t, index) => {
      if (!frontier(s, index) || property(t.id).kind !== 'home') return [];
      const explored = applyCommand(s, 0, { type: 'explore', tile: index });
      const sale = choices(explored).find(
        (c) =>
          c.command.type === 'sell' && c.command.tile === index && c.command.card === undefined,
      );
      return sale ? [{ explored, sale, index }] : [];
    });
    expect(candidates.length).toBeGreaterThan(0);
    const { explored, sale, index } = candidates[0];
    expect(explored.used).toEqual(['explore']);
    expect(explored.tiles[index].owner).toBe(0);
    expect(explored.players[0].cards).toEqual(cards);
    expect(saleBlock(view(explored, 0), index)).toBeUndefined();
    const sold = applyCommand(explored, 0, sale.command);
    expect(sold.used).toEqual(['explore', 'sell']);
    expect(sold.tiles[index].sold).toBe(0);
  });

  it('distingue falta de acciones de falta de clientes', () => {
    const { s, index } = fixture();
    s.used = ['draw', 'explore'];
    expect(saleBlock(view(s, 0), index)).toContain(
      'Has gastado tus 2 acciones: Robar cartas y Explorar',
    );
    s.used = ['sell'];
    expect(saleBlock(view(s, 0), index)).toBeUndefined();
    s.used = [];
    const category = property(s.tiles[index].id).category!;
    s.players[0].clients = [];
    s.market = CLIENTS.filter((c) => !c.accepts.includes(category))
      .slice(0, 3)
      .map((c) => c.id);
    expect(saleBlock(view(s, 0), index)).toContain('No tienes clientes');
  });

  it('consultar un plano no explora ni reserva y no revela la identidad al rival', () => {
    let s = createGame(2, undefined, 0, TWO_ACTIONS);
    const index = s.tiles.findIndex((t) => !t.open && property(t.id).kind === 'home');
    s = applyCommand(s, 0, { type: 'town', mode: 'peek', tile: index });
    expect(view(s, 0).tiles[index].id).toBe(s.tiles[index].id);
    expect(view(s, 1).tiles[index].id).toBeUndefined();
    expect(s.tiles[index].open).toBe(false);
    expect(s.tiles[index].owner).toBeUndefined();
    expect(saleBlock(view(s, 0), index)).toContain('Consultar el plano no es explorar');
    expect(s.log.at(-1)?.text).not.toContain(property(s.tiles[index].id).name);
    expect(actionBlock(view(s, 0), 'town')).toBeUndefined();
  });

  it('explica prioridad rival y aceptación por categoría', () => {
    const { s, index } = fixture();
    s.tiles[index].owner = 1;
    expect(saleBlock(view(s, 0), index)).toContain('Prioridad rival');
    delete s.tiles[index].owner;
    const nonCheap = s.tiles.findIndex((t) => property(t.id).category === 'Lujosa');
    const luxuryBuyer = CLIENTS.find((c) => c.accepts.includes('Lujosa'))!.id;
    s.players[0].clients = [luxuryBuyer];
    expect(saleBlock(view(s, 0), nonCheap)).toBeUndefined();
  });

  it('explica Litigio y respeta el expediente del Ayuntamiento', () => {
    const { s } = fixture();
    const litigation = s.tiles.find((t) => property(t.id).name === 'Litigio')!;
    const index = s.tiles.findIndex(
      (t) => property(t.id).kind === 'home' && adjacent(t, litigation),
    );
    expect(index).toBeGreaterThanOrEqual(0);
    s.tiles[index].cleared = false;
    s.players[0].clients = [
      CLIENTS.find((c) => c.accepts.includes(property(s.tiles[index].id).category!))!.id,
    ];
    expect(saleBlock(view(s, 0), index)).toContain('Litigio');
    const cleared = applyCommand(s, 0, { type: 'town', mode: 'clear', tile: index });
    expect(saleBlock(view(cleared, 0), index)).toBeUndefined();
    expect(cleared.log.at(-1)?.text).toContain('ya no está bloqueada por Litigio');
  });

  it('las explicaciones no contradicen las ventas autorizadas', () => {
    const { s } = fixture();
    const v = view(s, 0);
    for (const c of v.choices.filter((c) => c.command.type === 'sell')) {
      expect(saleBlock(v, c.command.tile!, c.command.card)).toBeUndefined();
    }
  });
});
