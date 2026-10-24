import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FlaskConical, RotateCcw, Sparkles } from 'lucide-react';
import { CLIENTS, CATEGORIES, property } from '../shared/catalog';
import {
  applyExpeditionCommand,
  createExpedition,
  expeditionIntegrity,
  saleOptions,
  EXPEDITION_CARDS,
  EXPEDITION_VERSION,
  type ExpeditionDeal,
  type ExpeditionState,
} from '../shared/expedition';
import { simulateExpeditionBatch } from '../shared/expedition-sim';
import { Art } from './Board';
import { AnimatedScore, TurnBanner, useNewlyTrue } from './fx';

function createFreshExpedition() {
  const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  return createExpedition(seed, ['Jugador 1', 'Jugador 2'], (seed % 2) as 0 | 1);
}

export default function ExpeditionMode() {
  const [game, setGame] = useState<ExpeditionState>(() => {
    try {
      const saved = localStorage.getItem('expedition-game');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.version === EXPEDITION_VERSION) return parsed;
    } catch {
      /* Start a fresh campaign when saved data is unreadable. */
    }
    const seed = Date.now() >>> 0;
    return createExpedition(seed, ['Jugador 1', 'Jugador 2'], (seed % 2) as 0 | 1);
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [clients, setClients] = useState<Record<number, number>>({});
  const [tradeClient, setTradeClient] = useState(0);
  const [marketClient, setMarketClient] = useState(0);
  const [scoutCard, setScoutCard] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [metrics, setMetrics] = useState<ReturnType<typeof simulateExpeditionBatch> | null>(null);
  const [simBusy, setSimBusy] = useState(false);
  const act = (command: Parameters<typeof applyExpeditionCommand>[2]) => {
    try {
      const next = applyExpeditionCommand(game, game.active, command);
      expeditionIntegrity(next);
      setGame(next);
      setSelected([]);
      setClients({});
      setScoutCard(null);
      setMessage(next.log.at(-1)?.text ?? '');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Jugada no válida.');
    }
  };
  const player = game.players[game.active];
  const options = useMemo(() => saleOptions(game, game.active), [game]);
  const revealed = useNewlyTrue(game.tiles.map((tile) => tile.open));
  const soldNow = useNewlyTrue(game.tiles.map((tile) => tile.sold !== undefined));
  const hidden = game.tiles.map((tile, index) => ({ tile, index })).filter((x) => !x.tile.open);
  const radius = 5,
    size = 43,
    width = 900,
    height = 760;
  useEffect(() => {
    localStorage.setItem('expedition-game', JSON.stringify(game));
  }, [game]);
  const coords = (q: number, r: number) => ({
    x: width / 2 + Math.sqrt(3) * (size + 1) * (q + r / 2),
    y: height / 2 + (size + 1) * 1.5 * r,
  });
  const assigned = new Map<number, number>();
  const usedClients = new Set<number>();
  for (const tile of selected) {
    const available = options.filter((o) => o.tile === tile && !usedClients.has(o.client));
    const chosen = available.find((o) => o.client === clients[tile]) ?? available[0];
    if (chosen) {
      assigned.set(tile, chosen.client);
      usedClients.add(chosen.client);
    }
  }
  const chosenDeals: ExpeditionDeal[] = selected.map((tile) => ({
    tile,
    client: assigned.get(tile) ?? -1,
  }));
  const selectedTradeClient = player.clients.includes(tradeClient)
    ? tradeClient
    : (player.clients[0] ?? -1);
  const selectedMarketClient = game.market.includes(marketClient)
    ? marketClient
    : (game.market[0] ?? -1);
  const sim = async () => {
    setSimBusy(true);
    setMetrics(null);
    await new Promise((r) => setTimeout(r, 20));
    try {
      setMetrics(simulateExpeditionBatch(100, 20260923));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'La simulación encontró una partida bloqueada.');
    } finally {
      setSimBusy(false);
    }
  };
  const scouting = scoutCard !== null && game.phase === 'play' && !game.finished;
  const pickTile = (i: number) => {
    const tile = game.tiles[i];
    const prop = tile.open ? property(tile.id) : null;
    if (game.phase === 'choose-zone' && !tile.open) act({ type: 'zone', tile: i });
    else if (scouting && !tile.open) act({ type: 'card', card: scoutCard, tile: i });
    else if (game.phase === 'play' && prop?.kind === 'home' && tile.sold === undefined)
      setSelected((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 5 ? [...prev, i] : prev,
      );
  };
  const reset = () => {
    setGame(createFreshExpedition());
    setSelected([]);
    setScoutCard(null);
    setMessage('Partida nueva: elige una zona para descubrir.');
  };
  return (
    <main className="expedition-page">
      <TurnBanner
        turnKey={`${game.turn}-${game.phase}-${game.active}-${game.finished}`}
        text={
          game.finished
            ? (game.result?.message ?? 'Partida terminada')
            : game.phase === 'choose-zone'
              ? `${game.players[game.chooser].name} elige barrio`
              : game.finalTurn !== undefined
                ? `Último turno de ${game.players[game.active].name}`
                : `Turno de ${game.players[game.active].name}`
        }
        tone={game.active === 0 ? 'mine' : 'rival'}
      />
      <header className="expedition-head">
        <div>
          <span className="expedition-kicker">CAMPAÑA · 2 JUGADORES · ESTE DISPOSITIVO</span>
          <h1>La ciudad por conquistar</h1>
          <p>
            Explorad barrios, renovad vuestra cartera y sed los primeros en cerrar 10 ventas de una
            categoría.
          </p>
        </div>
        <button onClick={reset} title="Nueva partida">
          <RotateCcw size={17} /> Nueva partida
        </button>
      </header>
      <section className="expedition-score" aria-label="Marcador de ventas">
        {game.players.map((p, seat) => (
          <div key={seat} className={game.active === seat ? 'is-active' : ''}>
            <i className={`expedition-seat seat-${seat}`} />
            <b>{p.name}</b>
            <span>
              <AnimatedScore value={p.score} /> pt
            </span>
            {game.bonus[seat] > 0 && <em className="expedition-bonus">+3 preparado</em>}
            <div>
              {CATEGORIES.map((c) => (
                <span key={c}>
                  <small>{c}</small>
                  <strong>{p.sales.filter((s) => s.category === c).length}/10</strong>
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="expedition-turn">
          <small>
            {game.phase === 'choose-zone'
              ? 'NUEVO BARRIO'
              : game.finalTurn !== undefined && !game.finished
                ? 'ÚLTIMO TURNO'
                : 'ACCIÓN'}
          </small>
          <b>
            {game.finished
              ? 'Partida finalizada'
              : game.phase === 'choose-zone'
                ? `${game.players[game.chooser].name} elige barrio`
                : `Turno de ${player.name}`}
          </b>
          <span>
            Zona {game.zone} · {game.tiles.filter((t) => t.open).length}/91 casillas
          </span>
        </div>
      </section>
      <div className="expedition-layout">
        <section className="expedition-map-panel">
          <div className="expedition-panel-title">
            <div>
              <b>Mapa de campaña</b>
              <span>
                {game.phase === 'choose-zone'
                  ? 'Selecciona una casilla oculta; se revelan las 10 más cercanas.'
                  : scouting
                    ? 'Inspección urbana: toca una casilla oculta.'
                    : 'Toca viviendas sin vender para preparar tu lote.'}
              </span>
            </div>
            <span className="expedition-legend">
              <i />
              Oculta <i />
              {game.players[0].name} <i />
              {game.players[1].name}
            </span>
          </div>
          <div className="expedition-map-scroll">
            <svg
              className="expedition-map"
              viewBox={`0 0 ${width} ${height}`}
              role="group"
              aria-label="Mapa hexagonal de 91 casillas"
            >
              <defs>
                <pattern id="expedition-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#afc4bd" />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#expedition-dots)" />
              {game.tiles.map((tile, i) => {
                const { x, y } = coords(tile.q, tile.r),
                  open = tile.open,
                  prop = open ? property(tile.id) : null,
                  revealPick = game.phase === 'choose-zone' && !open,
                  chosen = selected.includes(i),
                  ownerColor =
                    tile.sold === undefined ? '#d6e1dc' : tile.sold === 0 ? '#167b78' : '#bd6251',
                  face = !open
                    ? '#d2e1dc'
                    : tile.sold !== undefined
                      ? ownerColor
                      : prop?.category === 'Lujosa'
                        ? '#f2ddd8'
                        : prop?.category === 'Media'
                          ? '#dcebe1'
                          : prop?.category === 'Barata'
                            ? '#f0e8ce'
                            : prop?.kind === 'incident'
                              ? '#f4d8d2'
                              : prop?.kind === 'town'
                                ? '#d8e9ed'
                                : '#e2edf1',
                  edge = chosen
                    ? '#183b3b'
                    : prop?.category === 'Lujosa'
                      ? '#bd796b'
                      : prop?.category === 'Media'
                        ? '#688f7b'
                        : prop?.category === 'Barata'
                          ? '#ad9255'
                          : prop?.kind === 'incident'
                            ? '#bf685b'
                            : '#718f98';
                const points = Array.from({ length: 6 }, (_, n) => {
                  const a = ((60 * n - 30) * Math.PI) / 180;
                  return `${Math.cos(a) * size},${Math.sin(a) * size}`;
                }).join(' ');
                return (
                  <g
                    key={i}
                    transform={`translate(${x},${y})`}
                    onClick={() => pickTile(i)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        pickTile(i);
                      }
                    }}
                    className={
                      scouting && !open
                        ? 'expedition-clickable expedition-scout-target'
                        : revealPick || (prop?.kind === 'home' && tile.sold === undefined)
                          ? 'expedition-clickable'
                          : ''
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={
                      open
                        ? `${prop?.name}${tile.sold === undefined ? '' : ' vendida'}`
                        : 'Casilla oculta'
                    }
                  >
                    <g
                      className={`${revealed.has(i) ? 'fx-reveal' : ''} ${soldNow.has(i) ? 'fx-sold' : ''}`}
                    >
                      <polygon
                        points={points}
                        fill={face}
                        stroke={tile.sold === undefined ? edge : ownerColor}
                        strokeWidth={chosen ? 4 : 1.7}
                      />
                      {open && prop ? (
                        <>
                          <foreignObject x="-40" y="-38" width="80" height="74">
                            <Art index={prop.art} className="expedition-art" />
                          </foreignObject>
                          <text y="37" textAnchor="middle" className="expedition-tile-label">
                            {prop.category === 'Lujosa'
                              ? 'LUJOSA'
                              : prop.category === 'Media'
                                ? 'MEDIA'
                                : prop.category === 'Barata'
                                  ? 'BARATA'
                                  : prop.name.toUpperCase().slice(0, 10)}
                          </text>
                        </>
                      ) : (
                        <text textAnchor="middle" y="7" className="expedition-hidden">
                          +
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="expedition-feedback" role="status">
            {scouting
              ? 'Inspección urbana: toca una casilla oculta (+). Se revela esa casilla y la oculta más cercana. No consume acción.'
              : message ||
                (game.phase === 'choose-zone'
                  ? `${game.players[game.chooser].name}: elige el centro del próximo barrio. ${game.players[game.resumeSeat].name} hará la primera acción en él, así que evita dejarle un lote fácil.`
                  : 'Una venta puede incluir hasta 5 viviendas: del mismo tipo o adyacentes.')}
          </div>
        </section>
        <aside className="expedition-side">
          <section>
            <h2>
              Cartera de {player.name} <small>{player.clients.length}/5</small>
            </h2>
            <div className="expedition-client-list">
              {player.clients.map((id) => (
                <div key={id}>
                  <b>{CLIENTS[id].name}</b>
                  <small>
                    Acepta:{' '}
                    {[
                      ...CLIENTS[id].accepts,
                      ...(['Flexible', 'Tranquilo'].includes(CLIENTS[id].family) ? ['Lujosa'] : []),
                    ].join(' · ')}
                  </small>
                </div>
              ))}
            </div>
          </section>
          {!game.finished && (
            <section>
              <h2>
                Mercado común <small>{game.market.length}/5</small>
              </h2>
              <p className="expedition-trade-help">
                {game.phase === 'play'
                  ? 'Elige una carta del mercado y una de tu cartera. Recibes la primera y entregas la segunda; consume tu acción.'
                  : 'Así queda el mercado para el próximo barrio. Se podrá intercambiar al empezar las acciones.'}
              </p>
              <div className="expedition-market">
                {game.market.map((id) => (
                  <button
                    key={id}
                    className={selectedMarketClient === id ? 'selected' : ''}
                    onClick={() => setMarketClient(id)}
                  >
                    <b>{CLIENTS[id].name}</b>
                    <small>
                      {[
                        ...CLIENTS[id].accepts,
                        ...(['Flexible', 'Tranquilo'].includes(CLIENTS[id].family)
                          ? ['Lujosa']
                          : []),
                      ].join(' · ')}
                    </small>
                  </button>
                ))}
              </div>
              {game.phase === 'play' && (
                <>
                  <label className="expedition-label">
                    Cliente de tu mano
                    <select
                      value={selectedTradeClient}
                      onChange={(e) => setTradeClient(Number(e.target.value))}
                    >
                      {player.clients.map((id) => (
                        <option key={id} value={id}>
                          {CLIENTS[id].name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="expedition-trade-preview" aria-live="polite">
                    <div>
                      <small>RECIBES</small>
                      <b>{CLIENTS[selectedMarketClient]?.name ?? 'Elige del mercado'}</b>
                    </div>
                    <ArrowRight size={17} />
                    <div>
                      <small>ENTREGAS</small>
                      <b>{CLIENTS[selectedTradeClient]?.name ?? 'Elige de tu cartera'}</b>
                    </div>
                  </div>
                  <button
                    className="expedition-action"
                    disabled={!game.market.length || !player.clients.length}
                    onClick={() =>
                      act({
                        type: 'exchange',
                        handClient: selectedTradeClient,
                        marketClient: selectedMarketClient,
                      })
                    }
                  >
                    Intercambiar seleccionados · 1 acción <ArrowRight size={15} />
                  </button>
                </>
              )}
            </section>
          )}
          {game.phase === 'play' && !game.finished && (
            <>
              <section>
                <h2>
                  Cartas de {player.name} <small>{player.cards.length}/3 · una por turno</small>
                </h2>
                <div className="expedition-cards">
                  {player.cards.map((id) => {
                    const card = EXPEDITION_CARDS[id % EXPEDITION_CARDS.length];
                    const aiming = scoutCard === id;
                    return (
                      <article key={id} className={aiming ? 'is-aiming' : ''}>
                        <b>{card.name}</b>
                        <small>{card.text}</small>
                        {card.effect === 'exchange' && (
                          <small className="expedition-card-preview">
                            Con tu selección: recibes{' '}
                            <b>{CLIENTS[selectedMarketClient]?.name ?? '—'}</b> · entregas{' '}
                            <b>{CLIENTS[selectedTradeClient]?.name ?? '—'}</b>
                          </small>
                        )}
                        <button
                          disabled={
                            game.tactics[game.active] > 0 ||
                            (card.effect === 'bonus' && !!game.bonus[game.active]) ||
                            (card.effect === 'exchange' &&
                              (!player.clients.length || !game.market.length)) ||
                            (card.effect === 'scout' && !hidden.length)
                          }
                          onClick={() => {
                            if (card.effect === 'scout') {
                              setScoutCard(aiming ? null : id);
                              return;
                            }
                            act({
                              type: 'card',
                              card: id,
                              ...(card.effect === 'exchange'
                                ? {
                                    handClient: selectedTradeClient,
                                    marketClient: selectedMarketClient,
                                  }
                                : {}),
                            });
                          }}
                        >
                          {card.effect === 'scout'
                            ? aiming
                              ? 'Cancelar'
                              : 'Elegir casilla · gratis'
                            : 'Jugar · gratis'}
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
              <section>
                <h2>
                  Preparar lote <small>{selected.length}/5</small>
                </h2>
                <p className="expedition-hint">
                  Selecciona viviendas en el mapa. El cliente compatible se asigna automáticamente;
                  cámbialo aquí.
                </p>
                {selected.map((tile) => {
                  const usedElsewhere = new Set(
                    chosenDeals.filter((d) => d.tile !== tile).map((d) => d.client),
                  );
                  const allowed = options.filter(
                    (o) =>
                      o.tile === tile &&
                      (!usedElsewhere.has(o.client) || o.client === clients[tile]),
                  );
                  return (
                    <label key={tile} className="expedition-label">
                      {property(game.tiles[tile].id).name}
                      <select
                        value={assigned.get(tile) ?? -1}
                        onChange={(e) =>
                          setClients((prev) => ({ ...prev, [tile]: Number(e.target.value) }))
                        }
                      >
                        {!allowed.length && (
                          <option value={-1}>Ningún cliente libre de tu cartera la acepta</option>
                        )}
                        {allowed.map((o) => (
                          <option key={o.client} value={o.client}>
                            {CLIENTS[o.client].name} · {o.points} pt
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
                <button
                  className="expedition-sell"
                  disabled={!selected.length || chosenDeals.some((d) => d.client < 0)}
                  onClick={() => act({ type: 'sell', deals: chosenDeals })}
                >
                  Vender lote · {selected.length} <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}
          {game.finished && (
            <section className="expedition-result">
              <h2>{game.result?.message}</h2>
              <button onClick={reset}>Jugar otra vez</button>
            </section>
          )}
        </aside>
      </div>
      <section className="expedition-lab">
        <div>
          <FlaskConical size={20} />
          <div>
            <h2>Laboratorio de balance</h2>
            <p>
              Partidas simuladas sin servicios externos. La duración usa 45 segundos por decisión,
              como hipótesis ajustable.
            </p>
          </div>
          <button disabled={simBusy} onClick={() => void sim()}>
            {simBusy ? 'Simulando…' : 'Simular 100 partidas'}
          </button>
        </div>
        {metrics && (
          <div className="expedition-metrics">
            <span>
              <b>{metrics.meanMoves.toFixed(1)}</b>acciones medias
            </span>
            <span>
              <b>{metrics.meanZones.toFixed(1)}</b>barrios por partida
            </span>
            <span>
              <b>{metrics.meanBatch.toFixed(1)}</b>ventas por lote
            </span>
            <span>
              <b>{metrics.estimatedMinutesAt45SecondsPerAction.toFixed(1)} min</b>duración estimada
            </span>
            <span>
              <b>
                {metrics.wins[0]} / {metrics.wins[1]}
              </b>
              victorias por asiento
            </span>
            <span>
              <b>{metrics.exchanges}</b>intercambios
            </span>
            {CATEGORIES.map((c) => (
              <span key={c}>
                <b>{metrics.categorySales[c]}</b>ventas {c.toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </section>
      <details className="expedition-rules">
        <summary>
          <Sparkles size={16} /> Reglas de este modo
        </summary>
        <p>
          Los turnos se alternan siempre. Una agencia elige la casilla oculta del primer barrio (se
          revelan las diez más cercanas) y la otra hace la primera acción. En cada turno haces una
          acción: vender un lote de hasta cinco casas o cambiar un cliente de tu cartera por uno del
          mercado común. Cada casa vendida consume un cliente; después robas del mazo hasta volver a
          tener cinco. Las casas de un lote deben ser de la misma categoría o estar conectadas por
          adyacencia. Las cartas no consumen la acción; solo se juega una por turno y se repone al
          instante. Cuando ninguna agencia puede vender, quien hizo la última acción elige el centro
          del siguiente barrio y su rival actúa primero en él; el mercado se renueva. Al llegar a
          diez ventas de una categoría, si el rival ha jugado un turno menos, tiene un último turno
          para igualar: si también llega, gana quien tenga más puntos. Si el mapa se descubre entero
          y nadie puede vender, gana quien tenga más puntos.
        </p>
      </details>
    </main>
  );
}
