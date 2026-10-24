import { useState } from 'react';
import { ArrowRight, Hourglass, Send, Trash2, Users } from 'lucide-react';
import type { View } from '../shared/engine';
import { encodeTurn, replay, turnLink, type TurnGame } from './turns';

const rivalOf = (game: TurnGame) => game.names[1 - game.self];

function status(game: TurnGame) {
  try {
    const s = replay(game);
    if (s.finished) return { text: 'Terminada', mine: false };
    return s.active === game.self
      ? { text: 'Te toca', mine: true }
      : { text: `Esperando a ${rivalOf(game)}`, mine: false };
  } catch {
    return { text: 'Partida dañada', mine: false };
  }
}

/** Lobby section: create a turn-based game and list the saved ones. */
export function TurnsPanel({
  games,
  activeId,
  onCreate,
  onOpen,
  onDelete,
}: {
  games: TurnGame[];
  activeId: string | null;
  onCreate: (me: string, rival: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [me, setMe] = useState(() => games[0]?.names[games[0].self] ?? '');
  const [rival, setRival] = useState('');
  return (
    <section className="turns-panel">
      <div className="turns-intro">
        <Users size={20} />
        <div>
          <b>Por turnos, cada uno a su ritmo</b>
          <small>
            Juegas tu turno y le envías un enlace por WhatsApp. Responde cuando pueda: la partida se
            guarda en cada móvil. Sin cuentas ni servidor.
          </small>
        </div>
      </div>
      <form
        className="turns-new"
        onSubmit={(e) => {
          e.preventDefault();
          onCreate(me.trim(), rival.trim());
          setRival('');
        }}
      >
        <label>
          Tu nombre
          <input required maxLength={18} value={me} onChange={(e) => setMe(e.target.value)} />
        </label>
        <label>
          Con quién juegas
          <input required maxLength={18} value={rival} onChange={(e) => setRival(e.target.value)} />
        </label>
        <button className="primary" disabled={!me.trim() || !rival.trim()}>
          Nueva partida por turnos <ArrowRight size={16} />
        </button>
      </form>
      {games.length ? (
        <div className="turns-list">
          {games
            .toSorted((a, b) => b.updatedAt - a.updatedAt)
            .map((game) => {
              const state = status(game);
              return (
                <div
                  key={game.id}
                  className={`turn-row ${state.mine ? 'mine' : ''} ${game.id === activeId ? 'open' : ''}`}
                >
                  <button className="turn-open" onClick={() => onOpen(game.id)}>
                    <span>
                      <b>Con {rivalOf(game)}</b>
                      <small>{state.text}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Borrar la partida con ${rivalOf(game)}`}
                    title="Borrar de este móvil"
                    onClick={() => {
                      if (window.confirm(`¿Borrar de este móvil la partida con ${rivalOf(game)}?`))
                        onDelete(game.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
        </div>
      ) : null}
    </section>
  );
}

/** Shown while it is the rival's turn: sends the link that hands the turn over. */
export function TurnShareBar({
  game,
  v,
  onNotice,
}: {
  game: TurnGame;
  v: View;
  onNotice: (text: string) => void;
}) {
  const [sending, setSending] = useState(false);
  const rival = rivalOf(game);
  const waiting = !v.finished && v.active !== v.self;
  if (!waiting && !v.finished) return null;
  async function send() {
    setSending(true);
    try {
      const url = turnLink(await encodeTurn(game, (1 - game.self) as 0 | 1));
      const text = v.finished
        ? `La partida de Barrio en Venta ha terminado. Mira el resultado:`
        : game.commands.length
          ? `${game.names[game.self]} ha jugado su turno en Barrio en Venta. Te toca:`
          : `${game.names[game.self]} te reta a Barrio en Venta. Empieza la partida:`;
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Barrio en Venta', text, url });
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
        }
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      onNotice(`Enlace copiado. Pégalo en vuestro chat para que ${rival} juegue.`);
    } catch {
      onNotice('No se pudo preparar el enlace. Inténtalo otra vez.');
    } finally {
      setSending(false);
    }
  }
  return (
    <div className={`turn-share ${v.finished ? 'done' : ''}`} role="status">
      <Hourglass size={18} />
      <span>
        <b>{v.finished ? 'Partida terminada' : `Turno de ${rival}`}</b>
        <small>
          {v.finished
            ? `Envía el resultado a ${rival}.`
            : `Envíale el enlace; podrá responder cuando quiera.`}
        </small>
      </span>
      <button className="primary" disabled={sending} onClick={() => void send()}>
        <Send size={16} /> {v.finished ? 'Enviar resultado' : `Enviar a ${rival}`}
      </button>
    </div>
  );
}
