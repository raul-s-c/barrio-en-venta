import { ArrowRight, LockKeyhole, Plus, Sparkles, Users } from 'lucide-react';
import { CARDS, CLIENTS } from '../shared/catalog';
import { type Command, type View } from '../shared/engine';
import { actionBlock, saleBlock } from './game-help';
import { displayProperty } from './Board';

type Props = {
  v: View;
  selected: number;
  busy: boolean;
  execute: (c: Command) => void;
};
export function ClientHand({
  v,
  selected,
  busy,
  execute,
  onAgenda,
}: Props & { onAgenda: () => void }) {
  const p = displayProperty(v.tiles[selected]);
  const block = actionBlock(v);
  return (
    <section className="client-hand" aria-label="Tu mano de clientes">
      <header>
        <button className="hand-title" onClick={onAgenda}>
          <Users size={16} /> Tu mano · {v.you.clients.length}/8
        </button>
        <span>
          {p?.category && v.tiles[selected].open ? p.name : 'Cada venta consume un cliente'}
        </span>
        <button
          title="Buscar cliente · 1 acción"
          aria-label="Buscar cliente"
          disabled={busy || !v.choices.some((c) => c.command.type === 'capture')}
          onClick={() => execute({ type: 'capture' })}
        >
          <Plus size={15} />
          <span>Cliente · 1 acción</span>
        </button>
      </header>
      <div className="hand-scroll">
        {v.you.clients.map((id) => {
          const client = CLIENTS[id];
          const offer = v.offers.find(
            (c) => c.command.tile === selected && c.command.client === id,
          );
          const alternative = v.offers
            .filter(
              (c) =>
                c.command.client === id &&
                c.command.tile !== selected &&
                c.command.card === undefined &&
                !c.blocked,
            )
            .toSorted((a, b) => b.points! - a.points!)[0];
          return (
            <article className="hand-client" key={id}>
              <b>{client.name}</b>
              <span className="hand-categories">{client.accepts.join(' / ')}</span>
              <small title={client.text}>
                {offer ? offer.blocked || offer.detail : client.text}
              </small>
              {offer && !offer.blocked ? (
                <button
                  disabled={busy || !!block}
                  title={block || 'Consume este cliente. No se repone automáticamente.'}
                  onClick={() => execute(offer.command)}
                >
                  Vender · +{offer.points} <ArrowRight size={13} />
                </button>
              ) : (
                <span className="hand-unavailable" title={offer?.blocked}>
                  {offer?.blocked ? (
                    <>
                      <LockKeyhole size={12} /> {offer.blocked}
                    </>
                  ) : offer ? (
                    <>
                      <LockKeyhole size={12} /> No disponible
                    </>
                  ) : (
                    'Sin vivienda seleccionada'
                  )}
                </span>
              )}
              {alternative ? (
                <span
                  className="alternative"
                  title={displayProperty(v.tiles[alternative.command.tile!])?.name}
                >
                  Otra vivienda: +{alternative.points} pts
                </span>
              ) : null}
            </article>
          );
        })}
        {!v.you.clients.length ? (
          <p className="muted">
            Sin clientes en mano. Puedes buscar uno o usar una carta de captación.
          </p>
        ) : null}
      </div>
    </section>
  );
}
export function SalePanel({ v, selected, busy, execute }: Props) {
  const offers = v.offers
    .filter((c) => c.command.tile === selected)
    .toSorted((a, b) => Number(!!a.blocked) - Number(!!b.blocked) || b.points! - a.points!);
  const block = actionBlock(v),
    reason = saleBlock(v, selected),
    bonusCard = v.you.cards.find((id) => CARDS[id].effect === 'saleBonus'),
    bonusCommand = v.choices.find(
      (choice) => choice.command.type === 'card' && choice.command.card === bonusCard,
    )?.command;
  return (
    <div className="sale-controls">
      <h3>Cerrar venta · 1 acción · consume 1 cliente</h3>
      {v.you.nextSaleBonus ? (
        <p className="armed">Próxima venta +{v.you.nextSaleBonus} · ya incluido en los puntos</p>
      ) : bonusCard !== undefined ? (
        <button
          className="sale-card-play"
          disabled={busy || !bonusCommand}
          onClick={() => bonusCommand && execute(bonusCommand)}
        >
          <Sparkles size={16} />
          <span>Preparar +3 para la próxima venta<small>{v.tactics >= 1 ? 'Ya jugaste tu carta este turno' : 'Gratis · robas reemplazo'}</small></span>
        </button>
      ) : null}
      {reason ? (
        <p className="sale-block" role="status">
          {reason}
        </p>
      ) : null}
      {offers.map((c) => (
        <div className={`sale-option ${c.blocked ? 'unavailable' : ''}`} key={c.command.client}>
          <button
            className="offer"
            disabled={busy || !!block || !!c.blocked}
            aria-label={`Vender a ${CLIENTS[c.command.client!].name} por ${c.points} puntos`}
            onClick={() => execute(c.command)}
          >
            <span className="client-avatar">{CLIENTS[c.command.client!].name[0]}</span>
            <span>
              <b>{CLIENTS[c.command.client!].name}</b>
              <small>{c.blocked || c.detail}</small>
            </span>
            <strong>
              {c.blocked ? (
                <LockKeyhole size={17} />
              ) : (
                <span>
                  +{c.points}
                  <small>puntos</small>
                </span>
              )}
            </strong>
          </button>
        </div>
      ))}
      <details className="context-help">
        <summary>¿Por qué conservar un cliente?</summary>
        <p>
          Este cliente sale de tu mano cuando vendes. No hay escaparate público ni reposición
          gratuita. Un cliente de lujo es escaso; otro especialista puede puntuar más en otra
          vivienda. Buscar un sustituto cuesta una acción y el robo es aleatorio.
        </p>
        <p>
          Basta con que el cliente acepte la categoría. Sus preferencias solo cambian los puntos:
          nunca bloquean una venta. Solo 4 de los 24 clientes aceptan lujosas.
        </p>
      </details>
    </div>
  );
}
export function ClientAgenda({
  v,
  busy,
  execute,
  onProperty,
}: {
  v: View;
  busy: boolean;
  execute: (c: Command) => void;
  onProperty: (tile: number) => void;
}) {
  return (
    <main className="page">
      <header className="section-heading">
        <div>
          <span className="eyebrow">CARTAS PRIVADAS · SE CONSUMEN AL VENDER</span>
          <h1>Tu cartera de clientes</h1>
        </div>
        <button
          disabled={busy || !v.choices.some((c) => c.command.type === 'capture')}
          onClick={() => execute({ type: 'capture' })}
        >
          <Plus size={16} /> Buscar cliente · 1 acción
        </button>
      </header>
      <p className="rule-note">
        Reparto: 5 clientes. No se reponen al vender. Buscar cliente cuesta 1 acción; la carta Robar
        1 cliente no gasta acciones.
      </p>
      <div className="client-grid">
        {v.you.clients.map((id) => (
          <article className="client-card" key={id}>
            <span className="eyebrow">{CLIENTS[id].family}</span>
            <h2>{CLIENTS[id].name}</h2>
            <div className="categories">
              {CLIENTS[id].accepts.map((cat) => (
                <span key={cat} className={`category cat-${cat}`}>
                  {cat}
                </span>
              ))}
            </div>
            <p>{CLIENTS[id].text}</p>
            <h3>Viviendas descubiertas</h3>
            {v.offers
              .filter((o) => o.command.client === id && o.command.card === undefined)
              .toSorted(
                (a, b) => Number(!!a.blocked) - Number(!!b.blocked) || b.points! - a.points!,
              )
              .map((o) => (
                <button
                  className="client-property"
                  key={o.command.tile}
                  onClick={() => onProperty(o.command.tile!)}
                >
                  <span>
                    {displayProperty(v.tiles[o.command.tile!])?.name}
                    <small>{o.blocked || `+${o.points} puntos`}</small>
                  </span>
                  <ArrowRight size={14} />
                </button>
              ))}
          </article>
        ))}
      </div>
    </main>
  );
}
