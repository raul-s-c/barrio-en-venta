import { useState } from 'react';
import { Clock, KeyRound, Map, Sparkles, UserRoundPlus } from 'lucide-react';
import { CARDS, CARD_LIMIT } from '../shared/catalog';
import type { Command, View } from '../shared/engine';
import { displayProperty } from './Board';

const symbols = {
  removePriority: KeyRound,
  explore: Map,
  client: UserRoundPlus,
  saleBonus: Sparkles,
  extendPriority: Clock,
} as const;

export function TacticHand({
  v,
  selected,
  busy,
  execute,
  onMore,
}: {
  v: View;
  selected: number;
  busy: boolean;
  execute: (command: Command) => void;
  onMore: () => void;
}) {
  const [targets, setTargets] = useState<Record<number, number>>({});
  return (
    <section className="tactic-hand" aria-label="Cartas de juego en tu mano">
      <header>
        <b>
          <Sparkles size={14} /> Cartas de juego · {v.you.cards.length}/{CARD_LIMIT}
        </b>
        <span>Gratis · una por turno · robas reemplazo</span>
        <button onClick={onMore}>Ver mazo</button>
      </header>
      {v.tactics > 0 && (
        <p className="tactic-played" role="status">
          Carta jugada gratis. No consume acciones: {v.actions - v.used.length} de {v.actions}{' '}
          disponibles.
        </p>
      )}
      <div className="tactic-mini-cards">
        {v.you.cards.map((id) => {
          const card = CARDS[id];
          const options = v.choices.filter(
            (choice) => choice.command.type === 'card' && choice.command.card === id,
          );
          const preferred = targets[id] ?? selected;
          const chosen = options.find((choice) => choice.command.tile === preferred);
          const command = card.target ? chosen?.command : options[0]?.command;
          const Icon = symbols[card.effect];
          return (
            <article className={`tactic-mini-card effect-${card.effect}`} key={id}>
              <div className="tactic-mini-title">
                <Icon size={15} />
                <b>{card.name}</b>
              </div>
              <small>{card.text}</small>
              {card.target && (
                <select
                  aria-label={`Objetivo: ${card.name}`}
                  value={chosen?.command.tile ?? ''}
                  disabled={busy || !options.length}
                  onChange={(event) =>
                    setTargets((old) => ({ ...old, [id]: Number(event.target.value) }))
                  }
                >
                  <option value="" disabled>
                    Elige objetivo
                  </option>
                  {options.map(({ command: option }) => {
                    const tile = v.tiles[option.tile!];
                    return (
                      <option key={option.tile} value={option.tile}>
                        {tile.open ? displayProperty(tile)?.name : 'Casilla por explorar'}
                      </option>
                    );
                  })}
                </select>
              )}
              <button
                disabled={busy || !command}
                title={
                  v.tactics
                    ? 'Ya jugaste una carta este turno.'
                    : 'No consume acción. Robas una carta de reemplazo.'
                }
                onClick={() => command && execute(command)}
              >
                Jugar gratis
              </button>
            </article>
          );
        })}
        {!v.you.cards.length && (
          <p className="tactic-empty">Sin cartas. Robar en Agencia cuesta 1 acción.</p>
        )}
      </div>
    </section>
  );
}
