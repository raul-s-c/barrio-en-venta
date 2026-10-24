import { DEFAULTS, RULES_VERSION } from '../shared/catalog';
import { applyCommand, createGame, type Command, type Seat, type State } from '../shared/engine';

// Partidas por turnos entre dos móviles, sin servidor: cada enlace lleva la semilla y
// la lista completa de jugadas. El receptor reconstruye la partida con el motor, que
// rechaza cualquier jugada ilegal, así que el enlace no puede inventarse un estado.

export type TurnGame = {
  id: string;
  rules: string;
  seed: number;
  first: Seat;
  names: [string, string];
  self: Seat;
  commands: Command[];
  updatedAt: number;
};
type Payload = Omit<TurnGame, 'self' | 'updatedAt'> & { to: Seat };

export const TURN_PARAM = 'turno';
const PAYLOAD_VERSION = 1;

export function newTurnGame(names: [string, string]): TurnGame {
  const [seed, coin] = crypto.getRandomValues(new Uint32Array(2));
  return {
    id: crypto.randomUUID().slice(0, 8),
    rules: RULES_VERSION,
    seed,
    first: (coin % 2) as Seat,
    names,
    self: 0,
    commands: [],
    updatedAt: Date.now(),
  };
}

/** Rebuilds the state; throws if any command is illegal. */
export function replay(game: Pick<TurnGame, 'seed' | 'first' | 'names' | 'commands'>): State {
  let s = createGame(game.seed, game.names, game.first, DEFAULTS);
  for (const command of game.commands) s = applyCommand(s, s.active, command);
  return s;
}

export function playCommand(game: TurnGame, state: State, command: Command) {
  const next = applyCommand(state, game.self, command);
  return {
    game: { ...game, commands: [...game.commands, command], updatedAt: Date.now() },
    state: next,
  };
}

async function pipe(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
) {
  const output = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}
const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
const fromBase64Url = (text: string) =>
  Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.charCodeAt(0));

export async function encodeTurn(game: TurnGame, to: Seat) {
  const payload: Payload & { v: number } = {
    v: PAYLOAD_VERSION,
    id: game.id,
    rules: game.rules,
    seed: game.seed,
    first: game.first,
    names: game.names,
    commands: game.commands,
    to,
  };
  const json = new TextEncoder().encode(JSON.stringify(payload));
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
}

export async function decodeTurn(code: string): Promise<Payload> {
  let payload: Payload & { v?: number };
  try {
    const json = await pipe(fromBase64Url(code.trim()), new DecompressionStream('deflate-raw'));
    payload = JSON.parse(new TextDecoder().decode(json));
  } catch {
    throw new Error('El enlace del turno está incompleto o dañado. Pide que te lo reenvíen.');
  }
  if (payload.v !== PAYLOAD_VERSION || !Array.isArray(payload.commands))
    throw new Error(
      'Este enlace es de otra versión del juego. Actualiza la app y vuelve a abrirlo.',
    );
  if (payload.rules !== RULES_VERSION)
    throw new Error(
      'Este enlace usa otras reglas. Actualizad los dos la app (se actualiza sola al abrirla).',
    );
  return payload;
}

export type Received =
  | { kind: 'new'; game: TurnGame }
  | { kind: 'updated'; game: TurnGame; added: number }
  | { kind: 'stale'; game: TurnGame };

/** Merges an incoming link with the local copy, validating every command. */
export function receiveTurn(payload: Payload, local: TurnGame | undefined): Received {
  const incoming: TurnGame = {
    id: payload.id,
    rules: payload.rules,
    seed: payload.seed,
    first: payload.first,
    names: payload.names,
    self: local?.self ?? payload.to,
    commands: payload.commands,
    updatedAt: Date.now(),
  };
  try {
    replay(incoming);
  } catch {
    throw new Error('El enlace contiene una jugada que no es válida. No se ha aplicado.');
  }
  if (!local) return { kind: 'new', game: incoming };
  if (local.seed !== payload.seed)
    throw new Error('Este enlace pertenece a otra partida con el mismo código.');
  const same = (a: Command, b: Command) => JSON.stringify(a) === JSON.stringify(b);
  const prefix = local.commands.every(
    (c, i) => payload.commands[i] && same(c, payload.commands[i]),
  );
  if (prefix && payload.commands.length > local.commands.length)
    return {
      kind: 'updated',
      game: incoming,
      added: payload.commands.length - local.commands.length,
    };
  const behind = payload.commands.every((c, i) => same(c, local.commands[i]));
  if (behind) return { kind: 'stale', game: local };
  throw new Error('Este enlace no encaja con tu copia de la partida. Pide el último enlace.');
}

export function turnLink(code: string) {
  const base = `${location.origin}${import.meta.env.BASE_URL}`;
  return `${base}#${TURN_PARAM}=${code}`;
}

export function readTurnFromLocation() {
  const match = location.hash.match(new RegExp(`${TURN_PARAM}=([A-Za-z0-9_-]+)`));
  return match?.[1] ?? null;
}
