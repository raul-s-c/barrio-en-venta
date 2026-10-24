import {
  CARDS,
  CLIENTS,
  CATEGORIES,
  DEFAULTS,
  SPECIALTIES,
  CLIENT_LIMIT,
  CARD_LIMIT,
  PROPERTIES,
  RULES_VERSION,
  property,
  type Category,
  type Parameters,
} from './catalog';

export type Seat = 0 | 1;
export type Tile = {
  q: number;
  r: number;
  id: string;
  open: boolean;
  owner?: Seat;
  sold?: Seat;
  cleared?: boolean;
  renewed?: boolean;
  extra: string[];
  discount?: Seat;
  reservedUntil?: number;
};
export type Sale = {
  tile: number;
  category: Category;
  client: number;
  points: number;
  features: string[];
  incidents: number;
  services: number;
  reserved: boolean;
};
export type Player = {
  name: string;
  score: number;
  clients: number[];
  cards: number[];
  specialty: number;
  turns: number;
  sales: Sale[];
  known: number[];
  nextSaleBonus?: number;
  town: number;
  intel?: number[];
};
export type Command = {
  type:
    | 'explore'
    | 'reserve'
    | 'sell'
    | 'capture'
    | 'draw'
    | 'town'
    | 'card'
    | 'choose'
    | 'discard'
    | 'end';
  tile?: number;
  client?: number;
  card?: number;
  mode?: string;
};
export type Choice = {
  command: Command;
  label: string;
  detail?: string;
  points?: number;
  group: string;
  blocked?: string;
};
export type Metrics = {
  actions: Record<string, number>;
  cardsDrawn: number[];
  cardsUsed: number[];
  clientsUsed: number[];
  services: Record<string, { sales: number; points: number }>;
  disputes: number;
  comebacks: number;
  turns: number;
  expiredPriorities: number;
  extendedPriorities: number;
};
export type State = {
  version: string;
  seed: number;
  rng: number;
  revision: number;
  round: number;
  slot: number;
  starter: Seat;
  initialStarter: Seat;
  active: Seat;
  turn: number;
  used: string[];
  tactics: number;
  players: [Player, Player];
  tiles: Tile[];
  market: number[];
  clientDeck: number[];
  clientDiscard: number[];
  cardDeck: number[];
  cardDiscard: number[];
  pending: number[];
  rumor?: number;
  press?: { tile: number; owner: Seat; until: number };
  closing?: Seat;
  closingTurn?: number;
  responded?: Seat;
  finished: boolean;
  result?: { scores: number[]; breakdown: string[][]; winner: Seat | null };
  log: { turn: number; text: string }[];
  params: Parameters;
  metrics: Metrics;
};
export type View = {
  version: string;
  revision: number;
  round: number;
  active: Seat;
  self: Seat;
  turn: number;
  actions: number;
  used: string[];
  tactics: number;
  players: {
    name: string;
    score: number;
    sales: Sale[];
    clientsCount: number;
    cardsCount: number;
    priorities: number;
    specialty: number;
    turns: number;
    nextSaleBonus: number;
  }[];
  you: Player;
  tiles: (Omit<Tile, 'id'> & { id?: string; known?: boolean })[];
  market: number[];
  pending: number[];
  finished: boolean;
  closing?: Seat;
  result?: State['result'];
  log: State['log'];
  choices: Choice[];
  offers: Choice[];
  params: Parameters;
};
export const other = (s: Seat): Seat => (s === 0 ? 1 : 0);
export const adjacent = (a: { q: number; r: number }, b: { q: number; r: number }) =>
  Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r)) === 1;
const neighbors = (s: State, i: number) =>
  s.tiles.map((t, j) => ({ t, j })).filter(({ t }) => t.open && adjacent(s.tiles[i], t));
export const frontier = (s: State, i: number) =>
  !s.tiles[i].open && s.tiles.some((t) => t.open && adjacent(t, s.tiles[i]));
function random(s: { rng: number }) {
  let t = (s.rng += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  s.rng >>>= 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffle<T>(s: { rng: number }, a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function log(s: State, text: string) {
  s.log.push({ turn: s.turn, text });
  if (s.log.length > 120) s.log.shift();
}
function count(s: State, seat: Seat, cat: Category) {
  return s.players[seat].sales.filter((x) => x.category === cat).length;
}
const priorities = (s: State, seat: Seat) =>
  4 - s.tiles.filter((t) => t.owner === seat && t.sold === undefined).length;
function take(s: State, kind: 'client' | 'card'): number | undefined {
  const deck = kind === 'client' ? s.clientDeck : s.cardDeck;
  const discard = kind === 'client' ? s.clientDiscard : s.cardDiscard;
  if (!deck.length) deck.push(...shuffle(s, discard.splice(0)));
  return deck.shift();
}
function draw(s: State, seat: Seat, kind: 'client' | 'card', n = 1) {
  const p = s.players[seat],
    hand = kind === 'client' ? p.clients : p.cards;
  for (let i = 0; i < n; i++) {
    if (kind === 'card' && hand.length >= CARD_LIMIT) break;
    const id = take(s, kind);
    if (id !== undefined) {
      hand.push(id);
      if (kind === 'card') s.metrics.cardsDrawn[id]++;
    }
  }
}
/** Actions available this turn: the starter's very first turn may be shorter. */
export function actionLimit(s: Pick<State, 'turn' | 'params'>) {
  return s.turn === 1 ? (s.params.openingActions ?? 2) : 2;
}
export function createGame(
  seed = 1,
  names: [string, string] = ['Tú', 'Clara · IA'],
  first: Seat = 0,
  params: Parameters = DEFAULTS,
): State {
  const makePlayer = (name: string): Player => ({
    name,
    score: 0,
    clients: [],
    cards: [],
    specialty: 0,
    turns: 0,
    sales: [],
    known: [],
    town: 0,
  });
  const s: State = {
    version: RULES_VERSION,
    seed,
    rng: seed >>> 0,
    revision: 0,
    round: 1,
    slot: 0,
    starter: first,
    initialStarter: first,
    active: first,
    turn: 1,
    used: [],
    tactics: 0,
    players: [makePlayer(names[0]), makePlayer(names[1])],
    tiles: [],
    market: [],
    clientDeck: [],
    clientDiscard: [],
    cardDeck: [],
    cardDiscard: [],
    pending: [],
    finished: false,
    log: [],
    params: structuredClone(params),
    metrics: {
      actions: {},
      cardsDrawn: Array(30).fill(0),
      cardsUsed: Array(30).fill(0),
      clientsUsed: Array(24).fill(0),
      services: {},
      disputes: 0,
      comebacks: 0,
      turns: 1,
      expiredPriorities: 0,
      extendedPriorities: 0,
    },
  };
  const ids = shuffle(
    s,
    PROPERTIES.filter((p) => p.id !== 'town').map((p) => p.id),
  );
  for (let r = -3; r <= 3; r++)
    for (let q = -3; q <= 3; q++)
      if (Math.abs(q + r) <= 3)
        s.tiles.push({
          q,
          r,
          id: q === 0 && r === 0 ? 'town' : ids.pop()!,
          open: q === 0 && r === 0,
          extra: [],
        });
  s.clientDeck = shuffle(
    s,
    CLIENTS.map((c) => c.id),
  );
  s.cardDeck = shuffle(
    s,
    CARDS.map((c) => c.id),
  );
  const specialties = shuffle(
    s,
    SPECIALTIES.map((_, i) => i),
  );
  for (const seat of [0, 1] as Seat[]) {
    s.players[seat].specialty = specialties[seat];
    draw(s, seat, 'client', 5);
    draw(s, seat, 'card', 2);
  }
  s.players[first].turns = 1;
  log(s, `Abre la agencia ${names[first]}. La ciudad está por descubrir.`);
  return s;
}
export function context(s: State, i: number) {
  const t = s.tiles[i],
    p = property(t.id);
  const near = neighbors(s, i);
  const services = near
    .filter(({ t }) => property(t.id).kind === 'service' || t.renewed)
    .map(({ t }) => (t.renewed ? 'Reforma urbana' : property(t.id).name));
  const incidents = near
    .filter(({ t }) => property(t.id).kind === 'incident' && !t.renewed)
    .map(({ t }) => property(t.id).name);
  const features = [...p.traits, ...t.extra, ...services];
  if (s.rumor === i) features.push('Familiar');
  if (services.includes('Metro') || near.some(({ t }) => t.id === 'town'))
    features.push('Conexion');
  return {
    features,
    services,
    incidents,
    has: (x: string) => features.includes(x) || incidents.includes(x),
  };
}
function clientValue(id: number, c: ReturnType<typeof context>, cat: Category, reserved: boolean) {
  const h = (x: string) => Number(c.has(x));
  const srv = c.services.length;
  let plus = 0,
    minus = 0;
  switch (id) {
    case 0:
      plus = 2 * (h('Familiar') + h('Colegio') + h('Parque'));
      minus = c.has('Colegio') || c.has('Parque') ? 0 : 2;
      break;
    case 1:
      plus = 2 * h('Colegio') + h('Comercio') + h('Metro');
      minus = h('Obras');
      break;
    case 2:
      plus = 3 * h('Familiar') + 2 * h('Parque');
      minus = 2 * h('Ruido');
      break;
    case 3:
      plus = 2 * (h('Hospital') + h('Colegio'));
      minus = plus ? 0 : 2;
      break;
    case 4:
      plus = 2 * h('Metro') + 2 * h('Ocio') + h('Centrica');
      minus = h('Tranquila') && !h('Metro') ? 1 : 0;
      break;
    case 5:
      plus = 2 * h('Metro') + h('Comercio') + 2 * h('Reformada');
      minus = 2 * h('Mala conexion');
      break;
    case 6:
      plus = 2 * c.services.filter((x) => ['Metro', 'Ocio', 'Comercio'].includes(x)).length;
      minus = srv ? 0 : 1;
      break;
    case 7:
      plus = 1;
      break;
    case 8:
      plus = 3 * h('Inversion') + 2 * h('Metro');
      break;
    case 9:
      plus = 3 * h('Reformable') + 2 * h('Conexion');
      break;
    case 10:
      plus = 2 * (h('Inversion') + h('Comercio'));
      minus = 2 * h('Litigio');
      break;
    case 11:
      plus = c.incidents.length ? 4 : 0;
      minus = c.incidents.length ? 0 : 2;
      break;
    case 12:
      plus = 3 * h('Exclusiva') + 2 * h('Metro') + h('Comercio');
      minus = 2 * h('Obras');
      break;
    case 13:
      plus = 3 * h('Tranquila') + 2 * h('Parque') + 2 * h('Hospital');
      minus = h('Ruido') || h('Ocio') ? 3 : 0;
      break;
    case 14:
      plus = h('Exclusiva') && srv >= 2 ? 6 : 0;
      minus = plus ? 0 : 3;
      break;
    case 15:
      plus = 2 * (h('Exclusiva') + h('Reformada') + h('Centrica'));
      minus = 2 * h('Impuestos altos');
      break;
    case 16:
      plus = 2 * h('Hospital') + 2 * h('Parque') + h('Comercio');
      minus = h('Ruido') || h('Ocio') ? 2 : 0;
      break;
    case 17:
      plus = 3 * h('Tranquila') + 2 * h('Parque');
      minus = 3 * h('Ruido');
      break;
    case 18:
      plus = 2 * h('Tranquila') + 2 * h('Parque');
      minus = 2 * (h('Metro') + h('Ocio'));
      break;
    case 19:
      plus = 3 * h('Parque') + h('Comercio');
      minus = h('Parque') ? 0 : 1;
      break;
    case 20:
      plus = c.services.length ? 3 : 0;
      break;
    case 21:
      plus = reserved ? 3 : 0;
      break;
    case 22:
      plus = (cat === 'Barata' ? 3 : 0) + h('Comercio');
      minus = 2 * h('Impuestos altos');
      break;
    case 23:
      plus = Math.min(4, 2 * srv);
      minus = srv ? 0 : 2;
      break;
  }
  return { plus, minus };
}
export function saleValue(s: State, seat: Seat, i: number, client: number, _card?: number) {
  const t = s.tiles[i],
    p = property(t.id),
    c = context(s, i),
    cat = p.category!;
  const progress = s.params.progress[cat][Math.min(4, count(s, seat, cat))];
  const cv = clientValue(client, c, cat, t.owner === seat);
  const specialty = SPECIALTIES[s.players[seat].specialty];
  const specialtyBonus = specialty.category === cat ? specialty.bonus : 0;
  const minus = c.incidents
    .filter((x) => ['Obras', 'Ruido', 'Mala conexion', 'Impuestos altos'].includes(x))
    .reduce((total, x) => total + (x === 'Obras' ? 2 : 1), 0);
  const neighborhood = Math.min(3, c.services.length) - minus;
  const bonus = s.players[seat].nextSaleBonus ?? 0;
  return {
    points: Math.max(
      0,
      p.base + progress + cv.plus - cv.minus + neighborhood + bonus + specialtyBonus,
    ),
    category: cat,
    parts: `Base ${p.base} + línea ${progress} + cliente ${cv.plus - cv.minus} + barrio ${neighborhood}${bonus ? ` + próxima venta ${bonus}` : ''} + especialidad ${specialtyBonus}`,
    features: c.features,
    incidents: c.incidents.length,
    services: c.services.length,
  };
}
export function saleReason(
  s: State,
  seat: Seat,
  i: number,
  client: number,
  card?: number,
): string | undefined {
  const t = s.tiles[i],
    p = property(t.id);
  if (!t.open) return 'La loseta sigue sin explorar.';
  if (p.kind !== 'home') return 'No es una vivienda.';
  if (t.sold !== undefined) return 'Ya vendida.';
  if (t.owner === other(seat)) return 'Prioridad rival: libérala o espera a que caduque.';
  if (!s.players[seat].clients.includes(client)) return 'Este cliente no está en tu mano.';
  if (card !== undefined) return 'Juega la carta antes de vender, desde tus cartas de juego.';
  const cat = p.category!;
  if (!CLIENTS[client].accepts.includes(cat))
    return `Acepta ${CLIENTS[client].accepts.join(' / ')}, no ${cat}.`;
  if (count(s, seat, cat) >= 5) return 'Línea completa.';
  if (!t.cleared && context(s, i).has('Litigio'))
    return 'Litigio: abre un expediente en el Ayuntamiento (1 acción).';
}
function saleOptions(s: State, seat: Seat): Choice[] {
  const result: Choice[] = [];
  for (const client of s.players[seat].clients)
    s.tiles.forEach((t, tile) => {
      if (!t.open || property(t.id).kind !== 'home' || t.sold !== undefined) return;
      const value = saleValue(s, seat, tile, client);
      result.push({
        command: { type: 'sell', tile, client },
        label: `Vender a ${CLIENTS[client].name}`,
        group: 'Venta',
        detail: value.parts,
        points: value.points,
        blocked: saleReason(s, seat, tile, client),
      });
    });
  return result;
}
function cardTargets(s: State, seat: Seat, card: number): number[] {
  const effect = CARDS[card].effect;
  return s.tiles.flatMap((t, i) => {
    if (effect === 'explore') return frontier(s, i) ? [i] : [];
    if (!t.open || property(t.id).kind !== 'home' || t.sold !== undefined) return [];
    if (effect === 'removePriority') return t.owner === other(seat) ? [i] : [];
    if (effect === 'extendPriority') return t.owner === seat ? [i] : [];
    return [];
  });
}
export function choices(s: State, seat = s.active): Choice[] {
  if (s.finished || s.active !== seat) return [];
  const list: Choice[] = [],
    p = s.players[seat];
  const add = (command: Command, label: string, group: string, detail?: string, points?: number) =>
    list.push({ command, label, group, detail, points });
  if (s.pending.length) {
    for (const client of s.pending)
      add({ type: 'choose', client }, CLIENTS[client].name, 'Elegir cliente');
    return list;
  }
  if (p.clients.length > CLIENT_LIMIT || p.cards.length > CARD_LIMIT) {
    if (p.clients.length > CLIENT_LIMIT)
      for (const client of p.clients)
        add(
          { type: 'discard', client, mode: 'client' },
          `Descartar ${CLIENTS[client].name}`,
          'Límite de mano',
        );
    if (p.cards.length > CARD_LIMIT)
      for (const card of p.cards)
        add(
          { type: 'discard', card, mode: 'card' },
          `Descartar ${CARDS[card].name}`,
          'Límite de mano',
          CARDS[card].text,
        );
    return list;
  }
  const action = (_: string) => s.used.length < actionLimit(s);
  if (action('explore'))
    s.tiles.forEach((t, i) => {
      if (frontier(s, i))
        add(
          { type: 'explore', tile: i },
          'Explorar',
          'Ciudad',
          'Revela la loseta. Si es vivienda y queda ficha, prioridad gratis hasta el final de tu próximo turno.',
        );
    });
  if (action('reserve') && priorities(s, seat) > 0)
    s.tiles.forEach((t, i) => {
      if (t.open && property(t.id).kind === 'home' && t.sold === undefined && t.owner !== seat) {
        if (t.owner === undefined)
          add(
            { type: 'reserve', tile: i },
            'Reservar',
            'Ciudad',
            'Prioridad hasta el final de tu próximo turno. Máximo 4 reservas.',
          );
        else if (s.tactics < 1)
          for (const card of p.cards)
            add(
              { type: 'reserve', tile: i, card },
              `Disputar · ${CARDS[card].name}`,
              'Ciudad',
              '1 acción y tu carta del turno: descartas esta carta, robas reemplazo y la reserva pasa a ser tuya. El rival roba 1 carta.',
            );
      }
    });
  if (action('sell')) list.push(...saleOptions(s, seat).filter((c) => !c.blocked));
  if (
    action('capture') &&
    p.clients.length < CLIENT_LIMIT &&
    s.clientDeck.length + s.clientDiscard.length > 0
  )
    add(
      { type: 'capture' },
      'Buscar cliente',
      'Agenda',
      'Roba 1 cliente privado del mazo. Se consume al vender.',
    );
  if (action('draw') && p.cards.length < CARD_LIMIT && s.cardDeck.length + s.cardDiscard.length > 0)
    add(
      { type: 'draw' },
      'Preparar agencia',
      'Agencia',
      `Roba hasta ${Math.min(2, CARD_LIMIT - p.cards.length)} carta(s) de juego. Máximo ${CARD_LIMIT} en mano.`,
    );
  if (action('town')) {
    if (s.tiles.some((t) => t.owner === seat))
      add(
        { type: 'town', mode: 'release' },
        'Recuperar prioridades',
        'Ayuntamiento',
        'Libera todas tus reservas. Las viviendas quedan disponibles para ambos.',
      );
    for (let i = 0; i < s.tiles.length; i++) {
      const t = s.tiles[i];
      if (!t.open && !p.known.includes(i))
        add(
          { type: 'town', mode: 'peek', tile: i },
          'Consultar el plano',
          'Ayuntamiento',
          'Mira esta loseta en secreto. Sigue sin explorar y no se puede vender.',
        );
      if (
        t.open &&
        property(t.id).kind === 'home' &&
        t.sold === undefined &&
        !t.cleared &&
        context(s, i).has('Litigio')
      )
        add(
          { type: 'town', mode: 'clear', tile: i },
          'Abrir expediente',
          'Ayuntamiento',
          'Elimina el bloqueo de Litigio para esta vivienda.',
        );
    }
  }
  if (s.tactics < 1)
    for (const card of p.cards) {
      const c = CARDS[card];
      if (c.effect === 'saleBonus' && p.nextSaleBonus) continue;
      if (
        c.effect === 'client' &&
        (p.clients.length >= CLIENT_LIMIT || s.clientDeck.length + s.clientDiscard.length === 0)
      )
        continue;
      if (c.target)
        for (const tile of cardTargets(s, seat, card))
          add({ type: 'card', card, tile }, c.name, 'Táctica', c.text);
      else add({ type: 'card', card }, c.name, 'Táctica', c.text);
    }
  add(
    { type: 'end' },
    'Terminar turno',
    'Turno',
    s.used.length < actionLimit(s)
      ? `Renuncias a ${actionLimit(s) - s.used.length} acción(es).`
      : undefined,
  );
  return list;
}
const key = (c: Command) =>
  JSON.stringify(Object.fromEntries(Object.entries(c).sort(([a], [b]) => a.localeCompare(b))));
function discardCard(s: State, seat: Seat, id: number, used = true) {
  const p = s.players[seat];
  p.cards.splice(p.cards.indexOf(id), 1);
  s.cardDiscard.push(id);
  if (used) s.metrics.cardsUsed[id]++;
}
function reserve(s: State, seat: Seat, i: number) {
  const t = s.tiles[i];
  t.owner = seat;
  t.reservedUntil = s.players[seat].turns + 1;
}
function finish(s: State) {
  s.finished = true;
  const totals = s.players.map((p) => p.score),
    breakdown: string[][] = [[], []];
  for (const seat of [0, 1] as Seat[]) {
    const bonus = Math.min(...CATEGORIES.map((c) => count(s, seat, c))) * s.params.diversity;
    totals[seat] += bonus;
    breakdown[seat].push(`Diversidad: +${bonus}`);
    for (const [j, cat] of CATEGORIES.entries())
      if (count(s, seat, cat) > count(s, other(seat), cat)) {
        const b = [4, 3, 2][j];
        totals[seat] += b;
        breakdown[seat].push(`Mayoría ${cat}: +${b}`);
      }
    if (s.closing === seat) {
      totals[seat] += s.params.closeBonus;
      breakdown[seat].push(`Cierre: +${s.params.closeBonus}`);
    }
    if (s.responded === seat) {
      totals[seat] += 2;
      breakdown[seat].push('Respuesta: +2');
    }
  }
  for (const seat of [0, 1] as Seat[])
    breakdown[seat].unshift(`Ventas y especialidad: ${s.players[seat].score}`);
  s.result = {
    scores: totals,
    breakdown,
    winner: totals[0] === totals[1] ? null : totals[0] > totals[1] ? 0 : 1,
  };
  log(s, 'La agencia cierra. Se suman mayorías, diversidad y cierre.');
}
function end(s: State) {
  const old = s.active;
  s.rumor = undefined;
  for (const t of s.tiles) {
    if (t.owner === old && (t.reservedUntil ?? 0) <= s.players[old].turns) {
      delete t.owner;
      delete t.reservedUntil;
      s.metrics.expiredPriorities++;
      log(s, `Caduca la prioridad de ${s.players[old].name} sobre ${property(t.id).name}.`);
    }
  }
  if (s.closing !== undefined) {
    if (old !== s.closing) {
      finish(s);
      return;
    }
    s.active = other(old);
  } else if (s.slot === 0) {
    s.slot = 1;
    s.active = other(s.starter);
  } else {
    if (s.round >= s.params.maxRounds) {
      finish(s);
      return;
    }
    s.round++;
    s.slot = 0;
    s.active = s.starter;
  }
  s.turn++;
  s.metrics.turns++;
  s.used = [];
  s.tactics = 0;
  s.players[s.active].turns++;
  if (s.players[s.active].turns > 1) {
    draw(s, s.active, 'card');
    log(s, `${s.players[s.active].name} roba 1 carta al comenzar su turno.`);
  }
  const behind = s.players[other(s.active)].score - s.players[s.active].score;
  if (behind >= s.params.comebackGap && s.players[s.active].clients.length < CLIENT_LIMIT) {
    const before = s.players[s.active].clients.length;
    draw(s, s.active, 'client');
    if (s.players[s.active].clients.length > before) {
      s.metrics.comebacks++;
      log(
        s,
        `Remontada: ${s.players[s.active].name} va ${behind} puntos por detrás y roba 1 cliente.`,
      );
    }
  }
  if (s.press && s.press.owner === s.active) delete s.press;
  log(s, `Turno de ${s.players[s.active].name}.`);
}
export function applyCommand(state: State, seat: Seat, command: Command): State {
  if (state.version !== RULES_VERSION)
    throw new Error(
      'Esta partida usa reglas antiguas. Crea una partida con el nuevo mazo simplificado.',
    );
  const legal = choices(state, seat).find((c) => key(c.command) === key(command));
  if (!legal) throw new Error('Acción no válida o turno desactualizado.');
  const s = structuredClone(state),
    p = s.players[seat],
    enemy = other(seat),
    i = command.tile!,
    card = command.card!,
    client = command.client!;
  s.revision++;
  s.metrics.actions[command.type] = (s.metrics.actions[command.type] || 0) + 1;
  if (['explore', 'reserve', 'sell', 'capture', 'draw', 'town'].includes(command.type))
    s.used.push(command.type);
  switch (command.type) {
    case 'explore':
      s.tiles[i].open = true;
      log(
        s,
        `${p.name} descubre ${property(s.tiles[i].id).name} (1 acción).${property(s.tiles[i].id).kind === 'home' ? (priorities(s, seat) > 0 ? ' Prioridad automática gratis; no gasta otra acción.' : ' Sin fichas de prioridad: la vivienda queda libre.') : ''}`,
      );
      if (property(s.tiles[i].id).kind === 'home' && priorities(s, seat) > 0) reserve(s, seat, i);
      break;
    case 'reserve':
      if (s.tiles[i].owner === enemy) {
        s.tactics++;
        discardCard(s, seat, card, false);
        draw(s, seat, 'card');
        draw(s, enemy, 'card');
        s.metrics.disputes++;
      }
      reserve(s, seat, i);
      log(s, `${p.name} reserva ${property(s.tiles[i].id).name}.`);
      break;
    case 'sell': {
      const v = saleValue(s, seat, i, client, command.card);
      const points = v.points;
      delete p.nextSaleBonus;
      p.score += points;
      p.sales.push({
        tile: i,
        category: v.category,
        client,
        points,
        features: v.features,
        incidents: v.incidents,
        services: v.services,
        reserved: s.tiles[i].owner === seat,
      });
      s.tiles[i].sold = seat;
      delete s.tiles[i].owner;
      delete s.tiles[i].reservedUntil;
      p.clients.splice(p.clients.indexOf(client), 1);
      s.clientDiscard.push(client);
      s.metrics.clientsUsed[client]++;
      if (client === 7) draw(s, seat, 'card');
      if (client === 20) draw(s, enemy, 'card');
      for (const f of context(s, i).services) {
        const m = (s.metrics.services[f] ??= { sales: 0, points: 0 });
        m.sales++;
        m.points += points;
      }
      log(
        s,
        `${p.name} vende ${property(s.tiles[i].id).name} a ${CLIENTS[client].name}: +${points}.`,
      );
      if (count(s, seat, v.category) === s.params.closeAt) {
        if (s.closing === undefined) {
          s.closing = seat;
          s.closingTurn = s.turn;
          log(
            s,
            `${p.name} completa ${s.params.closeAt} ventas de ${v.category.toLowerCase()} y termina su turno. El rival tendrá un último turno.`,
          );
          end(s);
        } else if (s.closing !== seat) s.responded = seat;
      }
      break;
    }
    case 'capture':
      draw(s, seat, 'client');
      log(s, `${p.name} roba 1 cliente privado (1 acción).`);
      break;
    case 'discard':
      if (command.mode === 'card') discardCard(s, seat, card, false);
      else {
        p.clients.splice(p.clients.indexOf(client), 1);
        s.clientDiscard.push(client);
      }
      log(s, `${p.name} ajusta su mano al límite; no gasta acción.`);
      break;
    case 'draw':
      draw(s, seat, 'card', Math.min(2, CARD_LIMIT - p.cards.length));
      log(s, `${p.name} roba cartas de agencia hasta el límite de mano (1 acción).`);
      break;
    case 'town':
      p.town++;
      if (command.mode === 'release') {
        s.tiles.forEach((t) => {
          if (t.owner === seat) {
            delete t.owner;
            delete t.reservedUntil;
          }
        });
        log(s, `${p.name} recupera todas sus prioridades; sus reservas quedan libres (1 acción).`);
      }
      if (command.mode === 'peek') {
        p.known.push(i);
        log(s, `${p.name} consulta un plano en secreto (1 acción). La loseta sigue sin explorar.`);
      }
      if (command.mode === 'clear') {
        s.tiles[i].cleared = true;
        log(
          s,
          `${p.name} abre un expediente: ${property(s.tiles[i].id).name} ya no está bloqueada por Litigio (1 acción).`,
        );
      }
      break;
    case 'choose':
      p.clients.push(client);
      s.clientDiscard.push(...s.pending.filter((x) => x !== client));
      s.pending = [];
      break;
    case 'card': {
      s.tactics++;
      discardCard(s, seat, card);
      draw(s, seat, 'card');
      log(s, `${p.name} juega ${CARDS[card].name} sin gastar acción y roba un reemplazo.`);
      switch (CARDS[card].effect) {
        case 'removePriority':
          delete s.tiles[i].owner;
          delete s.tiles[i].reservedUntil;
          s.metrics.disputes++;
          log(s, `${property(s.tiles[i].id).name} queda libre para ambos.`);
          break;
        case 'explore':
          s.tiles[i].open = true;
          if (property(s.tiles[i].id).kind === 'home' && priorities(s, seat) > 0)
            reserve(s, seat, i);
          log(s, `${p.name} descubre ${property(s.tiles[i].id).name} con una carta.`);
          break;
        case 'client':
          draw(s, seat, 'client');
          break;
        case 'saleBonus':
          p.nextSaleBonus = 3;
          break;
        case 'extendPriority':
          s.tiles[i].reservedUntil = (s.tiles[i].reservedUntil ?? p.turns) + 1;
          s.metrics.extendedPriorities++;
          log(s, `La reserva de ${property(s.tiles[i].id).name} dura un turno más de ${p.name}.`);
          break;
      }
      break;
    }
    case 'end':
      end(s);
      break;
  }
  return s;
}
export function view(s: State, seat: Seat): View {
  return {
    version: s.version,
    revision: s.revision,
    round: s.round,
    active: s.active,
    self: seat,
    turn: s.turn,
    actions: actionLimit(s),
    used: [...s.used],
    tactics: s.tactics,
    players: s.players.map((p, i) => ({
      name: p.name,
      score: p.score,
      sales: structuredClone(p.sales),
      clientsCount: p.clients.length,
      cardsCount: p.cards.length,
      priorities: priorities(s, i as Seat),
      specialty: p.specialty,
      turns: p.turns,
      nextSaleBonus: p.nextSaleBonus ?? 0,
    })),
    you: structuredClone(s.players[seat]),
    tiles: s.tiles.map((t, i) => {
      const visible = t.open || s.players[seat].known.includes(i);
      return { ...structuredClone(t), id: visible ? t.id : undefined, known: !t.open && visible };
    }),
    market: [...s.market],
    pending: s.active === seat ? [...s.pending] : [],
    finished: s.finished,
    closing: s.closing,
    result: structuredClone(s.result),
    log: structuredClone(s.log),
    choices: choices(s, seat),
    offers: saleOptions(s, seat),
    params: structuredClone(s.params),
  };
}
