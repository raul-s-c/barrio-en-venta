import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Copy,
  Compass,
  FlaskConical,
  Flag,
  Globe2,
  HelpCircle,
  House,
  KeyRound,
  Landmark,
  Map,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WifiOff,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CARDS,
  CLIENTS,
  CATEGORIES,
  SPECIALTIES,
  RULES_VERSION,
  property,
} from '../shared/catalog';
import {
  applyCommand,
  createGame,
  view,
  type Command,
  type State,
  type View,
  type Choice,
} from '../shared/engine';
import { choose } from '../shared/ai';
import { Board, Art, displayProperty } from './Board';
import { ACTION_NAMES, actionBlock } from './game-help';
import { ClientHand, SalePanel, ClientAgenda } from './ClientHand';
import { GameCards } from './GameCards';
import { TacticHand } from './TacticHand';
import ExpeditionMode from './ExpeditionMode';
import { Rulebook } from './Rulebook';
import { tileTheme } from './tile-theme';
import { AnimatedScore, TurnBanner } from './fx';
import {
  decodeTurn,
  newTurnGame,
  playCommand,
  readTurnFromLocation,
  receiveTurn,
  replay,
  type TurnGame,
} from './turns';
import { TurnShareBar, TurnsPanel } from './TurnsPanel';
import {
  request,
  storage,
  native,
  enablePush,
  clearPushSession,
  type Session,
  type OnlineGame,
  type GameSummary,
  type Pending,
} from './api';
const Lab = lazy(() => import('./Lab'));
type Tab = 'partida' | 'clientes' | 'agencia' | 'expedicion' | 'laboratorio';
const icons = {
  partida: Map,
  clientes: Users,
  agencia: KeyRound,
  expedicion: Compass,
  laboratorio: FlaskConical,
};
export default function App() {
  const [local, setLocal] = useState<State>(() => createGame(217, ['Tú', 'Clara · IA']));
  const [boot, setBoot] = useState(false),
    [online, setOnline] = useState<OnlineGame | null>(null),
    [session, setSession] = useState<Session | null>(null),
    [server, setServer] = useState(''),
    [tab, setTab] = useState<Tab>('partida'),
    [selected, setSelected] = useState(18),
    [zoom, setZoom] = useState(false),
    [lobby, setLobby] = useState(false),
    [rules, setRules] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [games, setGames] = useState<GameSummary[]>([]),
    [authMode, setAuthMode] = useState<'login' | 'register'>('register'),
    [name, setName] = useState(''),
    [password, setPassword] = useState(''),
    [code, setCode] = useState(''),
    [notice, setNotice] = useState(''),
    [turnGames, setTurnGames] = useState<TurnGame[]>([]),
    [turnId, setTurnId] = useState<string | null>(null),
    [dockOpen, setDockOpen] = useState(false);
  const turnGamesRef = useRef(turnGames);
  turnGamesRef.current = turnGames;
  const pending = useRef<Pending | null>(null),
    lastOnline = useRef<OnlineGame | null>(null);
  lastOnline.current = online;
  const turn = turnGames.find((g) => g.id === turnId) ?? null;
  const turnState = useMemo(() => {
    if (!turn) return null;
    try {
      return replay(turn);
    } catch {
      return null;
    }
  }, [turn]);
  const v = useMemo(
    () =>
      turn && turnState
        ? view(turnState, turn.self)
        : online?.view.version === RULES_VERSION
          ? online.view
          : view(local.version === RULES_VERSION ? local : createGame(217), 0),
    [online, local, turn, turnState],
  );
  const mine = v.active === v.self && !v.finished && !online?.waiting;
  const tile = v.tiles[selected],
    p = displayProperty(tile);
  const specific = v.choices.filter(
    (c) => c.command.tile === selected && c.command.type !== 'sell' && c.command.type !== 'card',
  );
  useEffect(() => {
    const town = v.tiles.findIndex((t) => t.open && t.id === 'town');
    if (
      selected === town &&
      town >= 0 &&
      v.tiles.filter((t) => t.open).length === 1 &&
      v.used.length === 0 &&
      !v.finished
    ) {
      const firstExplore = v.choices.find((c) => c.command.type === 'explore')?.command.tile;
      if (firstExplore !== undefined) setSelected(firstExplore);
    }
  }, [v, selected]);
  useEffect(() => {
    Promise.all([
      storage.get('local-game'),
      storage.get('session'),
      storage.get('server'),
      storage.get('online-game'),
      storage.get('turn-games'),
      storage.get('turn-open'),
    ]).then(async ([saved, auth, url, gameId, savedTurns, openTurn]) => {
      try {
        if (savedTurns) {
          const list = JSON.parse(savedTurns) as TurnGame[];
          setTurnGames(list);
          if (openTurn && list.some((g) => g.id === openTurn)) setTurnId(openTurn);
        }
        if (saved) {
          const s = JSON.parse(saved);
          if (s.version === RULES_VERSION) setLocal(s);
          else {
            await storage.set(`archive-${s.version}`, saved);
            setNotice(
              'Nuevo mazo: 5 efectos sencillos y ventas sin encaje. Tu partida anterior está archivada localmente.',
            );
          }
        }
        const account = auth ? (JSON.parse(auth) as Session) : null;
        if (account) setSession(account);
        if (url) setServer(url);
        if (gameId && account) {
          try {
            setOnline(await request<OnlineGame>(url || '', `/games/${gameId}`, account));
          } catch {
            setNotice(
              'No se ha podido recuperar la partida online. Sigue guardada en el servidor.',
            );
          }
        }
      } catch {
        setNotice('Se ha iniciado una partida nueva.');
      }
      setBoot(true);
    });
  }, []);
  useEffect(() => {
    if (boot && local.version === RULES_VERSION)
      void storage.set('local-game', JSON.stringify(local));
  }, [local, boot]);
  useEffect(() => {
    if (!boot) return;
    void storage.set('turn-games', JSON.stringify(turnGames));
  }, [turnGames, boot]);
  useEffect(() => {
    if (!boot) return;
    if (turnId) void storage.set('turn-open', turnId);
    else void storage.remove('turn-open');
  }, [turnId, boot]);
  // Un enlace de turno abre o actualiza su partida, ya sea al arrancar o con la app abierta.
  useEffect(() => {
    if (!boot) return;
    const receive = async () => {
      const code = readTurnFromLocation();
      if (!code) return;
      history.replaceState(null, '', location.pathname + location.search);
      try {
        const payload = await decodeTurn(code);
        const list = turnGamesRef.current;
        const result = receiveTurn(
          payload,
          list.find((g) => g.id === payload.id),
        );
        setTurnGames([result.game, ...list.filter((g) => g.id !== result.game.id)]);
        const game = result.game;
        const rival = game.names[1 - game.self];
        setTurnId(game.id);
        setOnline(null);
        setLobby(false);
        setTab('partida');
        setNotice(
          result.kind === 'new'
            ? `Partida por turnos con ${rival}. Ya está guardada en este móvil.`
            : result.kind === 'updated'
              ? `${rival} ha jugado. ${replay(game).active === game.self ? '¡Te toca!' : ''}`
              : 'Ese enlace ya estaba aplicado: tienes la partida al día.',
        );
      } catch (e) {
        setNotice((e as Error).message);
      }
    };
    void receive();
    window.addEventListener('hashchange', receive);
    return () => window.removeEventListener('hashchange', receive);
  }, [boot]);
  useEffect(() => {
    if (
      !boot ||
      online ||
      turnId ||
      local.version !== RULES_VERSION ||
      local.finished ||
      local.active === 0
    )
      return;
    const timer = setTimeout(() => {
      setLocal((s) => {
        if (s.finished || s.active === 0) return s;
        return applyCommand(
          s,
          s.active,
          choose(view(s, s.active), 'equilibrada', s.seed + s.revision * 37).command,
        );
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [boot, online, local, turnId]);
  const openGame = useCallback(
    async (id: string) => {
      try {
        const game = await request<OnlineGame>(server, `/games/${id}`, session);
        setOnline(game);
        setTurnId(null);
        setLobby(false);
        setTab('partida');
        pending.current = null;
        setError('');
      } catch (e) {
        setError(String((e as Error).message));
      }
    },
    [server, session],
  );
  useEffect(() => {
    if (online) void storage.set('online-game', online.id);
  }, [online?.id]);
  useEffect(() => {
    if (boot && native && session && server)
      void enablePush(server, session, openGame, false).catch(() => {});
  }, [boot, session, server, openGame]);
  useEffect(() => {
    if (!native) return;
    let remove: (() => void) | undefined;
    let cancelled = false;
    void import('@capacitor/app').then(async ({ App }) => {
      const listener = await App.addListener('backButton', () => {
        if (lobby) setLobby(false);
        else if (rules) setRules(false);
        else if (tab !== 'partida') setTab('partida');
        else void App.minimizeApp();
      });
      if (cancelled) void listener.remove();
      else
        remove = () => {
          void listener.remove();
        };
    });
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [lobby, rules, tab]);
  useEffect(() => {
    if (local.version !== RULES_VERSION) {
      void storage.set(`archive-${local.version}`, JSON.stringify(local));
      setLocal(createGame(217));
      setNotice(
        'Nuevo mazo: 5 efectos sencillos y ventas sin encaje. Hemos archivado tu partida anterior.',
      );
    }
    if (online && online.view.version !== RULES_VERSION) {
      setOnline(null);
      setNotice('La partida online anterior está conservada. Crea otra para usar las reglas 0.2.');
    }
  }, [local.version, online?.view.version]);
  function training(reset = false) {
    void storage.remove('online-game');
    if (reset) setLocal(createGame(crypto.getRandomValues(new Uint32Array(1))[0]));
    setOnline(null);
    setTurnId(null);
    setLobby(false);
    setTab('partida');
    setSelected(18);
  }
  useEffect(() => {
    if (!lobby && !rules) return;
    const previous = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>('.modal');
    const focusable = () =>
      Array.from(
        modal?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, summary, [tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLobby(false);
        setRules(false);
      }
      if (e.key === 'Tab') {
        const elements = focusable(),
          first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('keydown', handle);
      previous?.focus();
    };
  }, [lobby, rules]);
  useEffect(() => {
    if (!online || !session) return;
    let disposed = false,
      inFlight = false;
    const refresh = async () => {
      if (inFlight || document.hidden || busy) return;
      inFlight = true;
      try {
        const game = await request<OnlineGame>(server, `/games/${online.id}`, session);
        if (!disposed)
          setOnline((prev) => (prev && game.view.revision >= prev.view.revision ? game : prev));
      } catch (e) {
        if (!disposed) setError(`Sin conexión: ${(e as Error).message}`);
      } finally {
        inFlight = false;
      }
    };
    const timer = setInterval(refresh, 5000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [online?.id, server, session, busy]);
  useEffect(() => {
    if (!lobby || !session) return;
    let dead = false;
    request<GameSummary[]>(server, '/games', session)
      .then((g) => {
        if (!dead) setGames(g);
      })
      .catch((e) => setError(e.message));
    return () => {
      dead = true;
    };
  }, [lobby, session, server, online?.id]);
  function openTurnGame(id: string) {
    void storage.remove('online-game');
    setOnline(null);
    setTurnId(id);
    setLobby(false);
    setTab('partida');
    setSelected(18);
  }
  function createTurnGame(me: string, rival: string) {
    const game = newTurnGame([me, rival]);
    setTurnGames((list) => [game, ...list]);
    openTurnGame(game.id);
    setNotice(
      game.first === game.self
        ? `Empiezas tú. Al terminar tu turno, envía el enlace a ${rival}.`
        : `Empieza ${rival}: envíale la invitación con el botón «Enviar a ${rival}».`,
    );
  }
  async function execute(command: Command, retry = false) {
    if (busy) return;
    if (turn && turnState) {
      try {
        const next = playCommand(turn, turnState, command).game;
        setTurnGames((list) => list.map((g) => (g.id === next.id ? next : g)));
        setError('');
      } catch (e) {
        setError((e as Error).message);
      }
      return;
    }
    if (online) {
      if (pending.current && !retry) {
        setError('Hay un envío pendiente. Reinténtalo antes de otra jugada.');
        return;
      }
      setBusy(true);
      setError('');
      pending.current ??= {
        commandId: crypto.randomUUID(),
        revision: online.view.revision,
        command,
      };
      try {
        const next = await request<OnlineGame>(
          server,
          `/games/${online.id}/commands`,
          session,
          pending.current,
        );
        setOnline(next);
        pending.current = null;
      } catch (e) {
        setError((e as Error).message);
        if ((e as { status?: number }).status) {
          pending.current = null;
          void openGame(online.id);
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      setLocal((s) => applyCommand(s, 0, command));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function authenticate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const auth = await request<Session>(server, `/auth/${authMode}`, null, { name, password });
      setSession(auth);
      await storage.set('session', JSON.stringify(auth));
      setPassword('');
      setNotice(`Hola, ${auth.user.name}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function createOnline(join = false) {
    setBusy(true);
    setError('');
    try {
      const game = await request<OnlineGame>(
        server,
        join ? '/join' : '/games',
        session,
        join ? { code: code.replaceAll(' ', '').trim() } : {},
      );
      setOnline(game);
      setTurnId(null);
      setLobby(false);
      setTab('partida');
      pending.current = null;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function notifications() {
    if (!session) return;
    setBusy(true);
    try {
      const health = await request<{ pushConfigured: boolean }>(server, '/health', null);
      if (!health.pushConfigured)
        throw new Error('El servidor todavía no tiene configurado Firebase para enviar avisos.');
      await enablePush(server, session, openGame);
      setNotice('Permiso concedido. Registrando este dispositivo para avisos de turno.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    const deviceToken = await storage.get('device-token');
    try {
      await request(server, '/logout', session, { deviceToken });
    } catch {}
    await storage.remove('session');
    await storage.remove('online-game');
    clearPushSession();
    setSession(null);
    setOnline(null);
    pending.current = null;
  }
  function endTurn() {
    if (
      v.used.length < v.actions &&
      !window.confirm(`Quedan ${v.actions - v.used.length} acciones. ¿Terminar el turno?`)
    )
      return;
    void execute({ type: 'end' });
  }
  const actionButton = (choice: Choice) => {
    const Icon =
      choice.command.type === 'explore'
        ? Plus
        : choice.command.type === 'reserve'
          ? KeyRound
          : Landmark;
    return (
      <button
        key={JSON.stringify(choice.command)}
        className="action-choice"
        aria-label={choice.label}
        disabled={busy}
        onClick={() => execute(choice.command)}
      >
        <Icon size={16} />
        <span>
          <b>{choice.label} · 1 acción</b>
          <small>{choice.detail}</small>
        </span>
      </button>
    );
  };
  if (!boot)
    return (
      <div className="boot">
        <Building2 size={40} />
        <h1>Barrio en Venta</h1>
        <span>Abriendo la agencia…</span>
      </div>
    );
  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            <House size={23} />
          </span>
          <div>
            <strong>
              Barrio <em>en Venta</em>
            </strong>
            <button className="mode-link" onClick={() => setLobby(true)}>
              {online ? <Globe2 size={11} /> : <Sparkles size={11} />}{' '}
              {tab === 'expedicion'
                ? 'Campaña en este dispositivo'
                : turn
                  ? `Por turnos con ${turn.names[1 - turn.self]}`
                  : online
                    ? 'Partida privada online'
                    : 'Entrenamiento con Clara'}
            </button>
          </div>
        </div>
        <div className="header-tools">
          <button
            className="icon-button"
            title="Reglamento"
            aria-label="Reglamento"
            onClick={() => setRules(true)}
          >
            <HelpCircle size={20} />
          </button>
          <button
            className="icon-button"
            title="Partidas y conexión"
            aria-label="Partidas y conexión"
            onClick={() => setLobby(true)}
          >
            <Globe2 size={20} />
          </button>
        </div>
      </header>
      {error ? (
        <div className="alert" role="alert">
          <WifiOff size={16} />
          <span>{error}</span>
          {pending.current ? (
            <button onClick={() => execute(pending.current!.command, true)}>
              Reintentar envío
            </button>
          ) : null}
          <button className="icon-button" aria-label="Cerrar error" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      ) : null}
      {notice ? (
        <div className="notice" role="status">
          {notice}
          <button aria-label="Cerrar aviso" className="icon-button" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      ) : null}
      {tab === 'expedicion' ? (
        <ExpeditionMode />
      ) : tab === 'laboratorio' ? (
        <Suspense fallback={<div className="page">Abriendo laboratorio…</div>}>
          <Lab />
        </Suspense>
      ) : (
        <>
          <TurnBanner
            turnKey={`${v.turn}-${v.active}-${v.finished}`}
            text={
              v.finished
                ? 'Partida terminada'
                : mine
                  ? `Tu turno · ${v.actions} ${v.actions === 1 ? 'acción' : 'acciones'}`
                  : turn
                    ? `Turno de ${v.players[v.active].name}: envíale el enlace`
                    : `Turno de ${v.players[v.active].name}`
            }
            tone={v.finished ? 'neutral' : mine ? 'mine' : 'rival'}
          />
          <section className="scoreboard">
            <PlayerScore v={v} seat={v.self} />
            <div className="round">
              <span>RONDA</span>
              <b>
                {v.round}
                <small>/{v.params.maxRounds}</small>
              </b>
              <span className={mine ? 'turn mine' : 'turn'}>
                {v.finished
                  ? 'Finalizada'
                  : online?.waiting
                    ? 'Invitación abierta'
                    : mine
                      ? 'Tu turno'
                      : online || turn
                        ? 'Turno rival'
                        : 'Clara piensa…'}
              </span>
            </div>
            <PlayerScore v={v} seat={1 - v.self} />
          </section>
          {turn ? <TurnShareBar game={turn} v={v} onNotice={setNotice} /> : null}
          {online?.waiting ? (
            <div className="invite-banner">
              <KeyRound size={20} />
              <div>
                <b>Invita a tu rival</b>
                <span className="invite-code">{online.invite}</span>
              </div>
              <button
                className="icon-button"
                aria-label="Copiar invitación"
                onClick={() => {
                  void navigator.clipboard.writeText(online.invite!);
                  setNotice('Código copiado.');
                }}
              >
                <Copy size={18} />
              </button>
            </div>
          ) : null}
          {v.closing !== undefined && !v.finished ? (
            <div className="closing">
              <Flag size={17} />
              {v.closing === v.self
                ? 'Has cerrado una línea. Tu rival tendrá su último turno.'
                : 'Tu rival ha cerrado una línea. Esta es tu última oportunidad.'}
            </div>
          ) : null}
          {v.finished && v.result ? (
            <section className="result">
              <span className="eyebrow">CIERRE DE AGENCIA</span>
              <h1>
                {v.result.winner === null
                  ? 'Una rivalidad muy igualada'
                  : v.result.winner === v.self
                    ? 'La ciudad es tuya'
                    : 'Esta vez, el barrio tiene otro nombre'}
              </h1>
              <strong>
                {v.result.scores[v.self]} <span>—</span> {v.result.scores[1 - v.self]}
              </strong>
              <div className="result-details">
                {v.result.breakdown.map((lines, i) => (
                  <div key={i}>
                    <b>{v.players[i].name}</b>
                    {lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={() => setLobby(true)}>
                <Plus size={16} />
                Nueva partida
              </button>
            </section>
          ) : null}
          {v.choices.some((c) => c.command.type === 'discard') && mine ? (
            <section className="pending page">
              <h2>Ajusta tu mano</h2>
              <p>Máximo 8 clientes y 3 cartas de juego. Elige qué descartar; no gasta acción.</p>
              <div className="discard-choices">
                {v.choices
                  .filter((c) => c.command.type === 'discard')
                  .map((c) => (
                    <button
                      key={JSON.stringify(c.command)}
                      disabled={busy}
                      onClick={() => execute(c.command)}
                    >
                      <span>
                        {c.label}
                        {c.detail ? <small>{c.detail}</small> : null}
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          ) : null}
          {v.pending.length && mine ? (
            <section className="pending page">
              <h2>Elige un cliente referido</h2>
              <div className="client-grid">
                {v.pending.map((id) => (
                  <ClientCard
                    key={id}
                    id={id}
                    footer={
                      <button
                        className="primary"
                        onClick={() => execute({ type: 'choose', client: id })}
                      >
                        Elegir <Check size={15} />
                      </button>
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}
          {tab === 'partida' ? (
            <main className="play-layout">
              <section className="city">
                <div className="city-heading">
                  <div>
                    <span className="eyebrow">EL BARRIO</span>
                    <span className="legend">
                      <i /> Tus prioridades <i className="rival-dot" /> Rival
                    </span>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={zoom ? 'Alejar tablero' : 'Ampliar tablero'}
                    title={zoom ? 'Alejar' : 'Ampliar'}
                    onClick={() => setZoom(!zoom)}
                  >
                    {zoom ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
                  </button>
                </div>
                <Board v={v} selected={selected} onSelect={setSelected} zoom={zoom} />
                <div className="map-footer">
                  <span>
                    <House size={15} /> {v.tiles.filter((t) => t.sold !== undefined).length} / 25
                    vendidas
                  </span>
                  <span>
                    <KeyRound size={15} /> {v.players[v.self].priorities} prioridades libres
                  </span>
                </div>
                <div className="ticker" aria-live="polite">
                  {v.used.length === 0 && v.tiles.filter((t) => t.open).length === 1 && mine
                    ? 'Primer paso: explora una casilla contigua. Si aparece una vivienda y tienes una prioridad libre, queda reservada gratis.'
                    : v.log.at(-1)?.text}
                </div>
              </section>
              <aside
                className="property-panel"
                style={{ borderTop: `4px solid ${tileTheme(p).color}` }}
              >
                <div className="selected-property">
                  <div>
                    <span className="eyebrow">
                      {tile?.known
                        ? 'PLANO PRIVADO'
                        : tile && !tile.open
                          ? 'CASILLA OCULTA'
                          : p?.category
                            ? 'VIVIENDA'
                            : p?.kind === 'town'
                              ? 'AYUNTAMIENTO'
                              : p?.kind === 'service'
                                ? 'SERVICIO'
                                : p?.kind === 'incident'
                                  ? 'INCIDENCIA'
                                  : 'POR DESCUBRIR'}
                    </span>
                    <h2>
                      {p?.name ||
                        (tile?.known
                          ? 'Plano consultado'
                          : tile && !tile.open
                            ? 'Elige qué descubrir'
                            : 'El siguiente barrio')}
                    </h2>
                    {p?.category ? (
                      <span className={`category cat-${p.category}`}>
                        {p.category} · Base {p.base} puntos
                      </span>
                    ) : null}
                  </div>
                  {p ? <Art index={p.art} /> : <House size={72} color="#6d9385" />}
                </div>
                {p?.traits.length ? (
                  <div className="traits">
                    {p.traits.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                    {tile.extra.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                ) : null}
                {tile.sold !== undefined ? (
                  <p className="muted">Vendida por {v.players[tile.sold].name}.</p>
                ) : tile.owner !== undefined ? (
                  <p className="reservation">
                    <ShieldCheck size={16} /> Prioridad de {v.players[tile.owner].name} ·{' '}
                    {(tile.reservedUntil ?? 0) <= v.players[tile.owner].turns
                      ? 'caduca al terminar su turno actual'
                      : (tile.reservedUntil ?? 0) - v.players[tile.owner].turns === 1
                        ? 'caduca al terminar su próximo turno'
                        : `dura ${(tile.reservedUntil ?? 0) - v.players[tile.owner].turns} turnos suyos más`}
                  </p>
                ) : null}
                {p?.category && tile.sold === undefined ? (
                  <SalePanel
                    v={v}
                    selected={selected}
                    execute={execute}
                    busy={busy || !!online?.waiting}
                  />
                ) : null}
                <div className="property-actions">{specific.slice(0, 8).map(actionButton)}</div>
                {mine && p?.kind === 'town' ? (
                  <section className="town-actions">
                    <p className="rule-note">
                      Un trámite = 1 acción. Puedes repetir trámite si te quedan acciones. El
                      Ayuntamiento no da cartas de agencia.
                    </p>
                    {actionBlock(v, 'town') ? (
                      <p className="sale-block" role="status">
                        {actionBlock(v, 'town')}
                      </p>
                    ) : null}
                    <div className="property-actions">
                      {v.choices
                        .filter((c) => c.command.type === 'town' && c.command.tile === undefined)
                        .map(actionButton)}
                      {(['peek', 'clear'] as const).map((mode) => {
                        const target = v.choices.find(
                          (c) => c.command.type === 'town' && c.command.mode === mode,
                        );
                        return (
                          <button
                            className="action-choice"
                            key={mode}
                            disabled={!target}
                            onClick={() => target && setSelected(target.command.tile!)}
                          >
                            {mode === 'peek' ? <Map size={16} /> : <Landmark size={16} />}
                            <span>
                              <b>
                                {mode === 'peek'
                                  ? 'Elegir plano para consultar'
                                  : 'Elegir vivienda con litigio'}
                              </b>
                              <small>
                                {mode === 'peek'
                                  ? 'Ver una loseta en secreto. No la explora ni la reserva. El trámite cuesta 1 acción.'
                                  : 'Abrir expediente desbloquea solo esa vivienda. Cuesta 1 acción.'}
                              </small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <details className="context-help">
                      <summary>Los tres trámites</summary>
                      <ul>
                        <li>
                          <b>Recuperar prioridades:</b> libera todas tus reservas; esas viviendas
                          vuelven a quedar disponibles para ambos.
                        </li>
                        <li>
                          <b>Consultar plano:</b> revela una loseta solo para ti. Sigue sin
                          explorar.
                        </li>
                        <li>
                          <b>Abrir expediente:</b> elimina el bloqueo de Litigio de una vivienda
                          para ambos jugadores.
                        </li>
                      </ul>
                    </details>
                  </section>
                ) : null}
                {mine && !tile.open ? (
                  <p className="rule-note">
                    {actionBlock(v, 'explore') ||
                      (v.choices.some(
                        (c) => c.command.type === 'explore' && c.command.tile === selected,
                      )
                        ? 'Explorar cuesta 1 acción. Si aparece una vivienda y te quedan prioridades, la reservas gratis. Puedes venderla o explorar otra loseta con la segunda acción.'
                        : 'Esta loseta todavía no conecta con una zona descubierta. Consultar su plano no la conecta.')}
                  </p>
                ) : null}
                {p && p.kind !== 'home' ? (
                  <p className="tile-effect">
                    <b>{tileTheme(p).label}</b> · {tileTheme(p).effect}
                  </p>
                ) : null}
                <div className="objective">
                  <Flag size={18} />
                  <div>
                    <span>Tu especialidad pública · por sorteo</span>
                    <b>{SPECIALTIES[v.you.specialty].name}</b>
                    <small>{SPECIALTIES[v.you.specialty].text}</small>
                  </div>
                </div>
              </aside>
            </main>
          ) : tab === 'clientes' ? (
            <ClientAgenda
              v={v}
              execute={execute}
              busy={busy}
              onProperty={(i) => {
                setSelected(i);
                setTab('partida');
              }}
            />
          ) : (
            <GameCards
              v={v}
              selected={selected}
              busy={busy || !!online?.waiting}
              execute={execute}
              onProperty={(i) => {
                setSelected(i);
                setTab('partida');
              }}
            />
          )}
          <div className={`decision-dock ${dockOpen ? 'open' : ''}`}>
            {/* Móvil en vertical: la mano siempre a la vista en una tira; al tocarla se despliega. */}
            <div className="dock-mini" aria-label="Tu mano y tus cartas">
              {v.you.clients.map((id) => (
                <button key={`c${id}`} className="mini-chip" onClick={() => setDockOpen(true)}>
                  {CLIENTS[id].accepts.map((cat) => (
                    <i key={cat} className={`mini-dot cat-${cat}`} title={cat} />
                  ))}
                  {CLIENTS[id].name}
                </button>
              ))}
              {v.you.cards.map((id) => (
                <button
                  key={`k${id}`}
                  className="mini-chip mini-card"
                  onClick={() => setDockOpen(true)}
                >
                  <Sparkles size={11} />
                  {CARDS[id].name}
                </button>
              ))}
            </div>
            <ClientHand
              v={v}
              selected={selected}
              execute={execute}
              busy={busy || !!online?.waiting}
              onAgenda={() => setTab('clientes')}
            />
            {tab === 'partida' && (
              <TacticHand
                v={v}
                selected={selected}
                busy={busy || !!online?.waiting}
                execute={execute}
                onMore={() => setTab('agencia')}
              />
            )}
            <section className="turn-bar">
              <div
                className="action-pips"
                aria-label={`${v.used.length} de ${v.actions} acciones utilizadas`}
              >
                {Array.from({ length: v.actions }, (_, n) => (
                  <i key={n} className={v.used.length > n ? 'used' : ''}>
                    {v.used.length > n ? <Check size={13} /> : String(n + 1)}
                  </i>
                ))}
                <span>
                  {v.finished
                    ? 'Partida terminada'
                    : mine
                      ? `${v.actions - v.used.length} ${v.actions - v.used.length === 1 ? 'acción restante' : 'acciones restantes'}`
                      : 'Esperando tu próximo turno'}
                  {mine ? (
                    <small>
                      {v.used.length
                        ? `Usadas: ${v.used.map((a) => ACTION_NAMES[a]).join(' + ')}`
                        : 'Puedes repetir acción'}
                    </small>
                  ) : null}
                </span>
              </div>
              <button
                className={`dock-toggle ${v.offers.some((o) => !o.blocked) && mine ? 'has-sales' : ''}`}
                aria-expanded={dockOpen}
                onClick={() => setDockOpen((open) => !open)}
              >
                {dockOpen ? <ChevronDown size={16} /> : <Users size={16} />}
                <span>
                  {dockOpen ? 'Ocultar' : 'Mano y cartas'}
                  <small>
                    {v.you.clients.length} clientes · {v.you.cards.length} cartas
                  </small>
                </span>
              </button>
              <button
                className="primary end-turn"
                disabled={!mine || busy || !v.choices.some((c) => c.command.type === 'end')}
                onClick={endTurn}
              >
                {busy ? 'Enviando…' : 'Terminar turno'}
                <ArrowRight size={17} />
              </button>
            </section>
          </div>
          <details className="chronicle page">
            <summary>
              Diario de la agencia <ChevronDown size={15} />
            </summary>
            <ol>
              {v.log
                .slice(-20)
                .toReversed()
                .map((entry, i) => (
                  <li key={`${entry.turn}-${i}`}>
                    <span>T{entry.turn}</span>
                    {entry.text}
                  </li>
                ))}
            </ol>
          </details>
        </>
      )}
      <nav className="bottom-nav" aria-label="Secciones">
        {(['partida', 'clientes', 'agencia', 'expedicion', 'laboratorio'] as Tab[]).map((t) => {
          const Icon = icons[t];
          return (
            <button
              key={t}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
              aria-current={tab === t ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>
                {t === 'partida'
                  ? 'Partida'
                  : t === 'clientes'
                    ? 'Clientes'
                    : t === 'agencia'
                      ? 'Agencia'
                      : t === 'expedicion'
                        ? 'Campaña'
                        : 'Laboratorio'}
              </span>
            </button>
          );
        })}
      </nav>
      {lobby ? (
        <div className="modal-backdrop">
          <section
            className="modal lobby"
            role="dialog"
            aria-modal="true"
            aria-label="Partidas y conexión"
          >
            <header>
              <div>
                <span className="eyebrow">VUESTRA AGENCIA</span>
                <h2>Partidas y conexión</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Cerrar partidas"
                onClick={() => setLobby(false)}
              >
                <X />
              </button>
            </header>
            <TurnsPanel
              games={turnGames}
              activeId={turnId}
              onCreate={createTurnGame}
              onOpen={openTurnGame}
              onDelete={(id) => {
                setTurnGames((list) => list.filter((g) => g.id !== id));
                if (id === turnId) training();
              }}
            />
            <div className="local-start">
              <Art index={0} />
              <div>
                <b>Entrenamiento sin conexión</b>
                <small>Contra Clara, IA equilibrada</small>
              </div>
              <button onClick={() => training()}>Continuar</button>
              <button
                className="icon-button"
                title="Nuevo entrenamiento"
                aria-label="Nuevo entrenamiento"
                onClick={() => {
                  if (window.confirm('¿Sustituir tu entrenamiento actual?')) training(true);
                }}
              >
                <RefreshCw size={18} />
              </button>
            </div>
            <details
              className="online-advanced"
              open={import.meta.env.DEV || !!server || !!session}
            >
              <summary>
                <Globe2 size={15} /> Online con servidor propio (avanzado)
              </summary>
              <details className="connection" open={native && !server}>
                <summary>
                  <Settings2 size={15} />
                  Conexión al servidor
                </summary>
                <label>
                  URL HTTPS
                  <input
                    type="url"
                    placeholder="https://vuestro-servidor.example"
                    value={server}
                    onChange={(e) => setServer(e.target.value.trim())}
                  />
                </label>
                <button
                  onClick={() => {
                    void storage.set('server', server);
                    setNotice('Dirección guardada.');
                  }}
                >
                  Guardar dirección <Check size={15} />
                </button>
                <small>
                  {!native && !server
                    ? 'Vista web: servidor de esta misma dirección.'
                    : 'Una misma dirección en ambos móviles.'}
                </small>
              </details>
              {!session ? (
                <form onSubmit={authenticate}>
                  <div className="segmented">
                    <button
                      type="button"
                      className={authMode === 'register' ? 'selected' : ''}
                      onClick={() => setAuthMode('register')}
                    >
                      Crear cuenta
                    </button>
                    <button
                      type="button"
                      className={authMode === 'login' ? 'selected' : ''}
                      onClick={() => setAuthMode('login')}
                    >
                      Entrar
                    </button>
                  </div>
                  <label>
                    Nombre
                    <input
                      autoComplete="username"
                      required
                      minLength={2}
                      maxLength={24}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label>
                    Contraseña
                    <input
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <button className="primary" disabled={busy}>
                    {authMode === 'login' ? 'Entrar' : 'Crear cuenta'}
                    <ArrowRight size={17} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="account">
                    <b>{session.user.name}</b>
                    <button onClick={logout}>Salir</button>
                  </div>
                  <button className="primary wide" disabled={busy} onClick={() => createOnline()}>
                    <Plus size={17} /> Crear partida privada
                  </button>
                  <form
                    className="join"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void createOnline(true);
                    }}
                  >
                    <label>
                      Código de invitación
                      <input
                        placeholder="12 caracteres"
                        maxLength={12}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                      />
                    </label>
                    <button type="submit" disabled={busy || code.length !== 12}>
                      Unirme <ArrowRight size={15} />
                    </button>
                  </form>
                  <button className="wide" disabled={busy} onClick={notifications}>
                    <Bell size={17} /> Activar avisos de turno
                  </button>
                  <h3>Tus partidas</h3>
                  {games.length ? (
                    games.map((g) => (
                      <button
                        className="game-row"
                        key={g.id}
                        disabled={g.archived}
                        onClick={() => openGame(g.id)}
                      >
                        <span>
                          <b>{g.opponent}</b>
                          <small>
                            {g.archived
                              ? 'Archivo de reglas anteriores'
                              : g.waiting
                                ? 'Invitación abierta'
                                : g.finished
                                  ? 'Terminada'
                                  : g.yourTurn
                                    ? 'Tu turno'
                                    : 'Turno rival'}{' '}
                            · Ronda {g.round}
                          </small>
                        </span>
                        <strong>{g.scores.join(' : ')}</strong>
                        <ArrowRight size={16} />
                      </button>
                    ))
                  ) : (
                    <p className="muted">Aún no hay partidas online.</p>
                  )}
                </>
              )}
            </details>
            {error ? (
              <p className="modal-error" role="alert">
                {error}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
      {rules ? (
        <div className="modal-backdrop">
          <section className="modal rules" role="dialog" aria-modal="true" aria-label="Reglamento">
            <header>
              <h2>Así se gana el barrio</h2>
              <button
                className="icon-button"
                aria-label="Cerrar reglamento"
                onClick={() => setRules(false)}
              >
                <X />
              </button>
            </header>
            <Rulebook />
          </section>
        </div>
      ) : null}
    </>
  );
}
function PlayerScore({ v, seat }: { v: View; seat: number }) {
  const p = v.players[seat],
    self = seat === v.self,
    closeAt = v.params.closeAt,
    behind = v.players[1 - seat].score - p.score,
    comeback = !v.finished && behind >= v.params.comebackGap,
    threat = CATEGORIES.find(
      (cat) => p.sales.filter((s) => s.category === cat).length === closeAt - 1,
    );
  return (
    <div
      className={`player-score ${self ? 'self' : 'opponent'} ${v.active === seat && !v.finished ? 'is-active' : ''}`}
    >
      <div className="player-title">
        <span className="avatar">{p.name[0]}</span>
        <b>{p.name}</b>
        <strong>
          <AnimatedScore value={v.result?.scores[seat] ?? p.score} />
          <small>PT</small>
        </strong>
      </div>
      <small className="player-specialty">
        Especialidad: +2 por {SPECIALTIES[p.specialty].category.toLowerCase()}
      </small>
      <div className="score-chips">
        {threat && v.closing === undefined && !v.finished ? (
          <span
            className="score-chip chip-threat"
            title={`Con 1 venta más de ${threat.toLowerCase()} cierra la partida.`}
          >
            <Flag size={11} /> A 1 del cierre
          </span>
        ) : null}
        {comeback ? (
          <span
            className="score-chip chip-comeback"
            title={`Va ${behind} puntos por detrás: robará 1 cliente gratis al empezar su turno.`}
          >
            <TrendingUp size={11} /> Remontada
          </span>
        ) : null}
      </div>
      <div className="sales-lines">
        {CATEGORIES.map((cat) => {
          const n = p.sales.filter((s) => s.category === cat).length;
          const boxes = Math.max(closeAt, Math.min(n, 5));
          return (
            <div key={cat}>
              <span>{cat === 'Lujosa' ? 'Lujo' : cat === 'Media' ? 'Media' : 'Barata'}</span>
              <div className="boxes" title={`${n} de ${closeAt} para cerrar`}>
                {Array.from({ length: boxes }, (_, i) => (
                  <i
                    key={i}
                    className={`${i < n ? 'filled' : ''} ${i === closeAt - 1 ? 'close-box' : ''}`}
                  >
                    {i < n ? <House size={9} /> : i === closeAt - 1 ? <Flag size={8} /> : null}
                  </i>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ClientCard({ id, footer }: { id: number; footer: React.ReactNode }) {
  const c = CLIENTS[id];
  return (
    <article className="client-card">
      <div className="client-head">
        <span className="client-avatar large">
          {c.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')}
        </span>
        <span className="eyebrow">{c.family}</span>
      </div>
      <h2>{c.name}</h2>
      <div className="categories">
        {c.accepts.map((cat) => (
          <span className={`category cat-${cat}`} key={cat}>
            {cat}
          </span>
        ))}
      </div>
      <p>{c.text}</p>
      {footer}
    </article>
  );
}
