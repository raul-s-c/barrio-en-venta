import { describe, expect, it } from 'vitest';
import { choose } from '../shared/ai';
import { view } from '../shared/engine';
import {
  decodeTurn,
  encodeTurn,
  newTurnGame,
  playCommand,
  receiveTurn,
  replay,
  type TurnGame,
} from '../src/turns';

/** Plays the active seat's whole turn with the AI, as that seat's phone would. */
function playTurn(game: TurnGame) {
  let state = replay(game);
  const seat = state.active;
  game = { ...game, self: seat };
  let guard = 0;
  while (state.active === seat && !state.finished && guard++ < 40) {
    const command = choose(view(state, seat), 'equilibrada', game.seed + guard).command;
    ({ game, state } = playCommand(game, state, command));
  }
  return game;
}

describe('Partidas por turnos con enlaces', () => {
  it('el enlace viaja comprimido y el receptor reconstruye la misma partida', async () => {
    let raul = newTurnGame(['Raúl', 'Ana']);
    raul = playTurn(raul);
    const code = await encodeTurn(raul, 1);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    const received = receiveTurn(await decodeTurn(code), undefined);
    expect(received.kind).toBe('new');
    expect(received.game.self).toBe(1);
    expect(replay(received.game)).toEqual(replay(raul));
  });

  it('alterna turnos varias veces, detecta enlaces antiguos y crece poco', async () => {
    let raul = newTurnGame(['Raúl', 'Ana']);
    // La invitación inicial viaja sin jugadas; empiece quien empiece, Ana ya tiene la partida.
    let ana: TurnGame | undefined = receiveTurn(
      await decodeTurn(await encodeTurn(raul, 1)),
      undefined,
    ).game;
    expect(ana.self).toBe(1);
    let longest = 0;
    for (let round = 0; round < 12 && !replay(raul).finished; round++) {
      // Juega quien tenga el turno y envía el enlace al otro móvil.
      const active = replay(raul).active;
      const sender = active === raul.self ? raul : ana!;
      const played = playTurn(sender);
      const code = await encodeTurn(played, (1 - played.self) as 0 | 1);
      longest = Math.max(longest, code.length);
      const target = played.self === raul.self ? ana : raul;
      const result = receiveTurn(await decodeTurn(code), target);
      if (played.self === raul.self) {
        raul = played;
        ana = result.game;
      } else {
        ana = played;
        raul = result.game;
      }
      expect(['new', 'updated']).toContain(result.kind);
      const stale = receiveTurn(await decodeTurn(code), result.game);
      expect(stale.kind).toBe('stale');
    }
    expect(replay(raul)).toEqual(replay(ana!));
    expect(longest).toBeLessThan(4000);
  });

  it('rechaza enlaces con jugadas ilegales o dañados', async () => {
    const raul = playTurn(newTurnGame(['Raúl', 'Ana']));
    const tampered = {
      ...raul,
      commands: [...raul.commands, { type: 'sell', tile: 0, client: 0 } as const],
    };
    await expect(
      decodeTurn(await encodeTurn(tampered, 1)).then((p) => receiveTurn(p, undefined)),
    ).rejects.toThrow('no es válida');
    await expect(decodeTurn('esto-no-es-un-turno')).rejects.toThrow('dañado');
  });
});
