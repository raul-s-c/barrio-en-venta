import { useState } from 'react';
import { ArrowRight, Clock, KeyRound, Map, Plus, Sparkles, UserPlus } from 'lucide-react';
import { CARDS, CARD_EFFECTS, CARD_LIMIT, CLIENT_LIMIT, type CardEffect } from '../shared/catalog';
import type { Command, View } from '../shared/engine';
import { displayProperty } from './Board';

const symbols = {
  removePriority: KeyRound,
  explore: Map,
  client: UserPlus,
  saleBonus: Sparkles,
  extendPriority: Clock,
};
const unavailable: Record<CardEffect, string> = {
  removePriority: 'El rival no tiene ninguna reserva.',
  explore: 'No quedan casillas conectadas por descubrir.',
  client: 'El mazo de clientes está agotado.',
  saleBonus: 'Ya tienes +3 preparados para tu próxima venta.',
  extendPriority: 'No tienes ninguna reserva propia.',
};

export function GameCards({
  v,
  selected,
  busy,
  execute,
  onProperty,
}: {
  v: View;
  selected: number;
  busy: boolean;
  execute: (c: Command) => void;
  onProperty: (tile: number) => void;
}) {
  const [targets, setTargets] = useState<Partial<Record<CardEffect, number>>>({});
  const turnBlock = v.finished
    ? 'Partida terminada.'
    : v.active !== v.self
      ? 'Disponible en tu turno.'
      : v.you.cards.length > CARD_LIMIT || v.you.clients.length > CLIENT_LIMIT
        ? 'Descarta el exceso de cartas para continuar.'
        : v.tactics >= 1
          ? 'Ya jugaste una carta este turno. Al gastarla robas otra.'
          : '';
  return (
    <main className="page">
      <header className="section-heading">
        <div>
          <span className="eyebrow">
            {v.you.cards.length} / {CARD_LIMIT} CARTAS
          </span>
          <h1>Cartas de juego</h1>
        </div>
        <button
          disabled={busy || !v.choices.some((c) => c.command.type === 'draw')}
          onClick={() => execute({ type: 'draw' })}
        >
          <Plus size={17} /> Completar mano · 1 acción
        </button>
      </header>
      {v.you.nextSaleBonus ? (
        <p className="armed">
          <Sparkles size={18} /> Próxima venta: +{v.you.nextSaleBonus} puntos preparados
        </p>
      ) : null}
      {turnBlock ? (
        <p role="status" className="rule-note">
          {turnBlock}
        </p>
      ) : null}
      <p className="rule-note">
        Una carta por turno · no consume acción · al jugarla robas un reemplazo.
      </p>
      <div className="agency-grid">
        {CARD_EFFECTS.map((effect) => {
          const copies = v.you.cards.filter((id) => CARDS[id].effect === effect.effect);
          if (!copies.length) return null;
          const id = copies[0];
          const options = v.choices.filter(
            (c) => c.command.type === 'card' && c.command.card === id,
          );
          const preferred = targets[effect.effect] ?? selected;
          const target = options.find((c) => c.command.tile === preferred);
          const command = effect.target ? target?.command : options[0]?.command;
          const Icon = symbols[effect.effect];
          const reason =
            turnBlock ||
            (!options.length
              ? effect.effect === 'client' && v.you.clients.length >= CLIENT_LIMIT
                ? 'Tu mano ya tiene 8 clientes.'
                : unavailable[effect.effect]
              : effect.target && !target
                ? 'Elige una casilla.'
                : '');
          return (
            <article className={`agency-card tactic effect-${effect.effect}`} key={effect.effect}>
              <span className="eyebrow">
                SIN GASTAR ACCIONES · {copies.length} {copies.length === 1 ? 'COPIA' : 'COPIAS'}
              </span>
              <div className="card-symbol">
                <Icon size={28} />
              </div>
              <h2>{effect.name}</h2>
              <p>{effect.text}</p>
              {effect.target ? (
                <label className="card-target">
                  {effect.effect === 'explore'
                    ? 'Casilla por descubrir'
                    : effect.effect === 'removePriority'
                      ? 'Reserva rival'
                      : 'Tu reserva'}
                  <select
                    aria-label={`Destino de ${effect.name}`}
                    value={target?.command.tile ?? ''}
                    disabled={busy || !options.length}
                    onChange={(e) =>
                      setTargets((previous) => ({
                        ...previous,
                        [effect.effect]: Number(e.target.value),
                      }))
                    }
                  >
                    <option value="" disabled>
                      Selecciona una casilla
                    </option>
                    {options.map(({ command: c }) => {
                      const tile = v.tiles[c.tile!];
                      return (
                        <option key={c.tile} value={c.tile}>
                          {tile.open ? displayProperty(tile)?.name : 'Por descubrir'} · ({tile.q},{' '}
                          {tile.r}){c.tile === selected ? ' · seleccionada' : ''}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
              {reason ? <small className="card-status">{reason}</small> : null}
              <button
                className="primary"
                disabled={busy || !command}
                title={reason || effect.text}
                onClick={() => {
                  if (!command) return;
                  execute(command);
                  if (command.tile !== undefined) onProperty(command.tile);
                }}
              >
                <Icon size={16} /> {effect.name} <ArrowRight size={15} />
              </button>
            </article>
          );
        })}
      </div>
      {!v.you.cards.length ? <p className="muted">No tienes cartas de juego.</p> : null}
    </main>
  );
}
