import { CLIENTS, CATEGORIES, PROPERTIES, property, type Category } from './catalog';
import { adjacent, type Seat } from './engine';

export const EXPEDITION_VERSION = 'expedition-0.2';
export const EXPEDITION_RADIUS = 5;
export const EXPEDITION_TILES = 91;
export const EXPEDITION_ZONE_SIZE = 10;
export const EXPEDITION_MARKET_SIZE = 5;
export const EXPEDITION_HAND_SIZE = 5;
export const EXPEDITION_CARD_HAND_SIZE = 3;
export const EXPEDITION_WIN_SALES = 10;
export const EXPEDITION_MAX_BATCH = 5;

export type ExpeditionTile = {
  q: number;
  r: number;
  id: string;
  open: boolean;
  sold?: Seat;
};
export type ExpeditionDeal = { tile: number; client: number };
export type ExpeditionCommand =
  | { type: 'zone'; tile: number }
  | { type: 'exchange'; handClient: number; marketClient: number }
  | { type: 'sell'; deals: ExpeditionDeal[] }
  | { type: 'card'; card: number; tile?: number; handClient?: number; marketClient?: number };
export type ExpeditionPlayer = {
  name: string;
  clients: number[];
  cards: number[];
  sales: { tile: number; category: Category; client: number; points: number }[];
  score: number;
};
export type ExpeditionState = {
  version: string;
  seed: number;
  rng: number;
  revision: number;
  turn: number;
  round: number;
  active: Seat;
  phase: 'choose-zone' | 'play';
  chooser: Seat;
  resumeSeat: Seat;
  zone: number;
  tiles: ExpeditionTile[];
  players: [ExpeditionPlayer, ExpeditionPlayer];
  market: number[];
  clientDeck: number[];
  clientDiscard: number[];
  cardDeck: number[];
  cardDiscard: number[];
  bonus: [number, number];
  tactics: [number, number];
  moves: [number, number];
  finalTurn?: Seat;
  finished: boolean;
  result?: { winner: Seat | null; score: number[]; message: string };
  log: { turn: number; text: string }[];
};
export type ExpeditionSaleOption = {
  tile: number;
  client: number;
  points: number;
  category: Category;
};
export type ExpeditionView = {
  version: string;
  revision: number;
  turn: number;
  round: number;
  active: Seat;
  self: Seat;
  phase: ExpeditionState['phase'];
  chooser: Seat;
  resumeSeat: Seat;
  zone: number;
  tiles: ExpeditionTile[];
  players: { name: string; score: number; sales: number[]; categories: Category[] }[];
  you: ExpeditionPlayer;
  market: number[];
  saleOptions: ExpeditionSaleOption[];
  tacticsUsed: number;
  bonus: number;
  finalTurn?: Seat;
  finished: boolean;
  result?: ExpeditionState['result'];
  log: ExpeditionState['log'];
  clientCount: number;
  cardCount: number;
};

export const EXPEDITION_CARDS = [
  { effect: 'bonus', name: 'Impulso de venta', text: '+3 puntos por vivienda en tu próximo lote.' },
  {
    effect: 'exchange',
    name: 'Contacto directo',
    text: 'Cambia gratis el cliente de tu cartera y el del mercado que tengas seleccionados.',
  },
  {
    effect: 'scout',
    name: 'Inspección urbana',
    text: 'Elige una casilla oculta en el mapa: se revela junto con la oculta más cercana.',
  },
] as const;
const propertiesByCategory = Object.fromEntries(
  CATEGORIES.map((category) => [
    category,
    PROPERTIES.filter((p) => p.kind === 'home' && p.category === category),
  ]),
) as Record<Category, typeof PROPERTIES>;
const urban = PROPERTIES.filter((p) => p.kind === 'service' || p.kind === 'incident');
const axial = (radius: number) => {
  const result: { q: number; r: number }[] = [];
  for (let q = -radius; q <= radius; q++)
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++)
      result.push({ q, r });
  return result;
};
function random(s: Pick<ExpeditionState, 'rng'>) {
  let t = (s.rng += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  s.rng >>>= 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffle<T>(s: Pick<ExpeditionState, 'rng'>, values: T[]) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
function log(s: ExpeditionState, text: string) {
  s.log.push({ turn: s.turn, text });
}
function cardType(id: number) {
  return id % EXPEDITION_CARDS.length;
}
function makePropertyIds(): string[] {
  const houses = CATEGORIES.flatMap((category) =>
    Array.from(
      { length: 20 },
      (_, index) =>
        propertiesByCategory[category][index % propertiesByCategory[category].length].id,
    ),
  );
  return [
    ...houses,
    ...Array.from(
      { length: EXPEDITION_TILES - houses.length },
      (_, index) => urban[index % urban.length].id,
    ),
  ];
}
function take(s: ExpeditionState, kind: 'client' | 'card') {
  const deck = kind === 'client' ? s.clientDeck : s.cardDeck;
  const discard = kind === 'client' ? s.clientDiscard : s.cardDiscard;
  if (!deck.length && discard.length) deck.push(...shuffle(s, discard.splice(0)));
  return deck.shift();
}
function drawClients(s: ExpeditionState, seat: Seat, amount: number) {
  for (let n = 0; n < amount && s.players[seat].clients.length < EXPEDITION_HAND_SIZE; n++) {
    const id = take(s, 'client');
    if (id === undefined) break;
    s.players[seat].clients.push(id);
  }
}
function drawCard(s: ExpeditionState, seat: Seat) {
  if (s.players[seat].cards.length >= EXPEDITION_CARD_HAND_SIZE) return;
  const id = take(s, 'card');
  if (id !== undefined) s.players[seat].cards.push(id);
}
export function createExpedition(
  seed = 1,
  names: [string, string] = ['Jugador 1', 'Jugador 2'],
  first: Seat = 0,
): ExpeditionState {
  const s: ExpeditionState = {
    version: EXPEDITION_VERSION,
    seed,
    rng: seed >>> 0 || 1,
    revision: 0,
    turn: 1,
    round: 0,
    active: first,
    phase: 'choose-zone',
    chooser: first,
    resumeSeat: (1 - first) as Seat,
    zone: 0,
    tiles: [],
    players: [
      { name: names[0], clients: [], cards: [], sales: [], score: 0 },
      { name: names[1], clients: [], cards: [], sales: [], score: 0 },
    ],
    market: [],
    clientDeck: shuffle(
      { rng: seed >>> 0 || 1 },
      CLIENTS.map((client) => client.id),
    ),
    clientDiscard: [],
    cardDeck: [],
    cardDiscard: [],
    bonus: [0, 0],
    tactics: [0, 0],
    moves: [0, 0],
    finished: false,
    log: [],
  };
  s.tiles = shuffle(s, makePropertyIds()).map((id, index) => ({
    ...axial(EXPEDITION_RADIUS)[index],
    id,
    open: false,
  }));
  s.cardDeck = shuffle(
    s,
    Array.from({ length: 30 }, (_, id) => id),
  );
  for (const seat of [0, 1] as Seat[]) {
    drawClients(s, seat, EXPEDITION_HAND_SIZE);
    for (let i = 0; i < EXPEDITION_CARD_HAND_SIZE; i++) drawCard(s, seat);
  }
  for (let i = 0; i < EXPEDITION_MARKET_SIZE; i++) {
    const id = take(s, 'client');
    if (id !== undefined) s.market.push(id);
  }
  log(
    s,
    `${s.players[first].name} elige dónde abrir el primer barrio; ${s.players[1 - first].name} hará la primera acción.`,
  );
  return s;
}
const distance = (a: { q: number; r: number }, b: { q: number; r: number }) =>
  Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r));
function reveal(s: ExpeditionState, center: number, amount: number) {
  const picked = s.tiles
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => !tile.open)
    .sort(
      (a, b) =>
        distance(a.tile, s.tiles[center]) - distance(b.tile, s.tiles[center]) || a.index - b.index,
    )
    .slice(0, amount);
  for (const { tile } of picked) tile.open = true;
  return picked.map(({ index }) => index);
}
function refillMarket(s: ExpeditionState) {
  s.clientDeck.push(...s.market.splice(0));
  shuffle(s, s.clientDeck);
  while (s.market.length < EXPEDITION_MARKET_SIZE) {
    const id = take(s, 'client');
    if (id === undefined) break;
    s.market.push(id);
  }
}
function reachedGoal(s: ExpeditionState, seat: Seat) {
  return CATEGORIES.some((category) => categorySales(s, seat, category) >= EXPEDITION_WIN_SALES);
}
function finish(s: ExpeditionState, winner: Seat | null, message: string) {
  s.finished = true;
  s.result = { winner, score: s.players.map((p) => p.score), message };
  log(s, message);
}
function finishByGoal(s: ExpeditionState) {
  const reached = ([0, 1] as Seat[]).filter((seat) => reachedGoal(s, seat));
  if (reached.length === 1)
    return finish(
      s,
      reached[0],
      `${s.players[reached[0]].name} llega a ${EXPEDITION_WIN_SALES} ventas de una categoría.`,
    );
  const [a, b] = s.players.map((p) => p.score);
  const winner = a === b ? null : a > b ? 0 : 1;
  finish(
    s,
    winner,
    winner === null
      ? `Las dos agencias llegan a ${EXPEDITION_WIN_SALES} ventas con los mismos puntos: empate.`
      : `Las dos agencias llegan a ${EXPEDITION_WIN_SALES} ventas; gana ${s.players[winner].name} por puntos.`,
  );
}
function finishByPoints(s: ExpeditionState) {
  const [a, b] = s.players.map((p) => p.score);
  finish(
    s,
    a === b ? null : a > b ? 0 : 1,
    'Mapa explorado y sin ventas posibles: gana la agencia con más puntos.',
  );
}
function nextPhase(s: ExpeditionState, lastActor: Seat) {
  s.phase = 'choose-zone';
  s.chooser = lastActor;
  s.resumeSeat = (1 - lastActor) as Seat;
  s.active = s.chooser;
  s.round++;
  refillMarket(s);
  log(
    s,
    `${s.players[s.chooser].name} elige el siguiente barrio; ${s.players[s.resumeSeat].name} hará la primera acción en él.`,
  );
}
function categorySales(s: ExpeditionState, seat: Seat, category: Category) {
  return s.players[seat].sales.filter((sale) => sale.category === category).length;
}
export function salePoints(s: ExpeditionState, tileIndex: number, clientId: number) {
  const home = property(s.tiles[tileIndex].id);
  const client = CLIENTS[clientId];
  const traits = new Set(home.traits);
  return home.base + client.wants.reduce((bonus, want) => bonus + Number(traits.has(want)), 0);
}
function acceptsExpedition(clientId: number, category: Category) {
  return (
    CLIENTS[clientId].accepts.includes(category) ||
    (category === 'Lujosa' && ['Flexible', 'Tranquilo'].includes(CLIENTS[clientId].family))
  );
}
export function saleOptions(s: ExpeditionState, seat = s.active): ExpeditionSaleOption[] {
  if (s.finished || s.phase !== 'play') return [];
  return s.tiles.flatMap((tile, index) => {
    if (!tile.open || tile.sold !== undefined || property(tile.id).kind !== 'home') return [];
    const category = property(tile.id).category!;
    return s.players[seat].clients.flatMap((client) =>
      acceptsExpedition(client, category)
        ? [{ tile: index, client, points: salePoints(s, index, client) + s.bonus[seat], category }]
        : [],
    );
  });
}
function batchConnected(s: ExpeditionState, deals: ExpeditionDeal[]) {
  if (deals.length <= 1) return true;
  const categories = new Set(deals.map(({ tile }) => property(s.tiles[tile].id).category));
  if (categories.size === 1) return true;
  const pending = [deals[0].tile],
    visited = new Set(pending),
    selected = new Set(deals.map((deal) => deal.tile));
  while (pending.length) {
    const current = pending.pop()!;
    for (const other of selected)
      if (!visited.has(other) && adjacent(s.tiles[current], s.tiles[other])) {
        visited.add(other);
        pending.push(other);
      }
  }
  return visited.size === deals.length;
}
export function validateExpeditionCommand(
  s: ExpeditionState,
  seat: Seat,
  command: ExpeditionCommand,
) {
  if (s.finished || s.active !== seat) throw new Error('No es tu turno.');
  if (s.phase === 'choose-zone') {
    if (
      command.type !== 'zone' ||
      s.chooser !== seat ||
      !s.tiles[command.tile] ||
      s.tiles[command.tile].open
    )
      throw new Error('Elige una casilla oculta para abrir la zona.');
    return;
  }
  if (command.type === 'zone') throw new Error('La zona ya está abierta.');
  if (command.type === 'exchange') {
    if (
      !s.players[seat].clients.includes(command.handClient) ||
      !s.market.includes(command.marketClient)
    )
      throw new Error('Elige un cliente de tu mano y uno del mercado.');
    return;
  }
  if (command.type === 'sell') {
    const { deals } = command;
    if (
      !deals.length ||
      deals.length > Math.min(EXPEDITION_MAX_BATCH, s.players[seat].clients.length)
    )
      throw new Error('Selecciona entre una y cinco viviendas.');
    if (
      new Set(deals.map((deal) => deal.tile)).size !== deals.length ||
      new Set(deals.map((deal) => deal.client)).size !== deals.length
    )
      throw new Error('Cada vivienda y cliente solo puede aparecer una vez en el lote.');
    for (const deal of deals)
      if (
        !saleOptions(s, seat).some(
          (option) => option.tile === deal.tile && option.client === deal.client,
        )
      )
        throw new Error('Uno de los clientes no puede comprar esa vivienda.');
    if (!batchConnected(s, deals))
      throw new Error('Las viviendas deben ser del mismo tipo o formar un grupo adyacente.');
    return;
  }
  if (command.type === 'card') {
    if (s.tactics[seat] >= 1) throw new Error('Solo puedes jugar una carta por turno.');
    if (!s.players[seat].cards.includes(command.card))
      throw new Error('Esa carta no está en tu mano.');
    const effect = EXPEDITION_CARDS[cardType(command.card)];
    if (effect.effect === 'bonus' && s.bonus[seat])
      throw new Error('El bonus de venta ya está preparado.');
    if (
      effect.effect === 'exchange' &&
      (!s.market.includes(command.marketClient!) ||
        !s.players[seat].clients.includes(command.handClient!))
    )
      throw new Error('Elige un comprador de tu mano y otro del mercado.');
    if (
      effect.effect === 'scout' &&
      (!Number.isInteger(command.tile) || !s.tiles[command.tile!] || s.tiles[command.tile!].open)
    )
      throw new Error('Elige una casilla oculta para inspeccionar.');
    return;
  }
  throw new Error('Jugada no válida.');
}
function transitionAfterMove(s: ExpeditionState, actor: Seat) {
  const other = (1 - actor) as Seat;
  s.moves[actor]++;
  s.tactics[actor] = 0;
  if (s.finalTurn === actor) return finishByGoal(s);
  if (reachedGoal(s, actor)) {
    if (s.moves[other] >= s.moves[actor] || !saleOptions(s, other).length) return finishByGoal(s);
    s.finalTurn = other;
    s.turn++;
    s.active = other;
    log(
      s,
      `${s.players[actor].name} llega a ${EXPEDITION_WIN_SALES} ventas. ${s.players[other].name} tiene un último turno para igualar; si lo logra, deciden los puntos.`,
    );
    return;
  }
  s.turn++;
  const nobodySells = !saleOptions(s, 0).length && !saleOptions(s, 1).length;
  if (nobodySells && !s.tiles.some((tile) => !tile.open)) return finishByPoints(s);
  if (nobodySells || s.market.length === 0) nextPhase(s, actor);
  else s.active = other;
}
export function applyExpeditionCommand(
  state: ExpeditionState,
  seat: Seat,
  command: ExpeditionCommand,
) {
  validateExpeditionCommand(state, seat, command);
  const s = structuredClone(state);
  s.revision++;
  if (s.phase === 'choose-zone' && command.type === 'zone') {
    const opened = reveal(s, command.tile, EXPEDITION_ZONE_SIZE);
    s.zone++;
    s.phase = 'play';
    s.active = s.resumeSeat;
    log(
      s,
      `${s.players[seat].name} abre la zona ${s.zone}: ${opened.length} casillas descubiertas.`,
    );
    return s;
  }
  const actor = seat;
  if (command.type === 'exchange') {
    const own = s.players[seat].clients;
    own[own.indexOf(command.handClient)] = command.marketClient;
    s.market[s.market.indexOf(command.marketClient)] = command.handClient;
    log(s, `${s.players[seat].name} cambia un cliente por una opción del mercado.`);
  } else if (command.type === 'sell') {
    const player = s.players[seat];
    const deals = command.deals;
    for (const deal of deals) {
      const points = salePoints(s, deal.tile, deal.client) + s.bonus[seat];
      const category = property(s.tiles[deal.tile].id).category!;
      s.tiles[deal.tile].sold = seat;
      player.clients.splice(player.clients.indexOf(deal.client), 1);
      s.clientDiscard.push(deal.client);
      player.sales.push({ tile: deal.tile, category, client: deal.client, points });
      player.score += points;
      log(
        s,
        `${player.name} vende ${property(s.tiles[deal.tile].id).name} a ${CLIENTS[deal.client].name}: +${points}.`,
      );
    }
    s.bonus[seat] = 0;
    const before = player.clients.length;
    drawClients(s, seat, deals.length);
    log(s, `${player.name} roba ${player.clients.length - before} cliente(s) del mazo.`);
  } else if (command.type === 'card') {
    const player = s.players[seat];
    const index = player.cards.indexOf(command.card);
    player.cards.splice(index, 1);
    s.cardDiscard.push(command.card);
    s.tactics[seat]++;
    const effect = EXPEDITION_CARDS[cardType(command.card)];
    if (effect.effect === 'bonus') {
      s.bonus[seat] = 3;
      log(s, `${player.name} prepara +3 por vivienda para su próximo lote.`);
    } else if (effect.effect === 'exchange') {
      const own = player.clients;
      own[own.indexOf(command.handClient!)] = command.marketClient!;
      s.market[s.market.indexOf(command.marketClient!)] = command.handClient!;
      log(s, `${player.name} usa Contacto directo para cambiar un cliente gratis.`);
    } else {
      const opened = reveal(s, command.tile!, 2);
      log(s, `${player.name} inspecciona ${opened.length} casillas adicionales.`);
    }
    drawCard(s, seat);
    return s;
  }
  transitionAfterMove(s, actor);
  return s;
}
export function expeditionView(s: ExpeditionState, seat: Seat): ExpeditionView {
  const own = s.players[seat];
  return {
    version: s.version,
    revision: s.revision,
    turn: s.turn,
    round: s.round,
    active: s.active,
    self: seat,
    phase: s.phase,
    chooser: s.chooser,
    resumeSeat: s.resumeSeat,
    zone: s.zone,
    tiles: s.tiles.map((tile) => ({ ...tile, id: tile.open ? tile.id : '' })),
    players: s.players.map((player) => ({
      name: player.name,
      score: player.score,
      sales: CATEGORIES.map(
        (category) => player.sales.filter((sale) => sale.category === category).length,
      ),
      categories: player.sales.map((sale) => sale.category),
    })),
    you: structuredClone(own),
    market: [...s.market],
    saleOptions: saleOptions(s, seat),
    tacticsUsed: s.tactics[seat],
    bonus: s.bonus[seat],
    finalTurn: s.finalTurn,
    finished: s.finished,
    result: structuredClone(s.result),
    log: structuredClone(s.log),
    clientCount: s.clientDeck.length + s.clientDiscard.length,
    cardCount: s.cardDeck.length + s.cardDiscard.length,
  };
}
export function expeditionIntegrity(s: ExpeditionState) {
  if (s.tiles.length !== EXPEDITION_TILES) throw new Error('El mapa debe contener 91 casillas.');
  if (s.market.length > EXPEDITION_MARKET_SIZE)
    throw new Error('El mercado supera cinco clientes.');
  if (
    s.players.some(
      (player) =>
        player.clients.length > EXPEDITION_HAND_SIZE ||
        player.cards.length > EXPEDITION_CARD_HAND_SIZE,
    )
  )
    throw new Error('Se excedió un límite de mano.');
  const clients = [
    ...s.players.flatMap((player) => player.clients),
    ...s.market,
    ...s.clientDeck,
    ...s.clientDiscard,
  ];
  if (clients.length !== CLIENTS.length || new Set(clients).size !== CLIENTS.length)
    throw new Error('Se perdió o duplicó un cliente.');
  const sold = s.tiles.filter((tile) => tile.sold !== undefined).length;
  if (sold !== s.players[0].sales.length + s.players[1].sales.length)
    throw new Error('Las ventas no coinciden con las viviendas marcadas.');
  return true;
}
