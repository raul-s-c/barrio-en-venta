import { CARD_LIMIT, CLIENT_LIMIT } from '../shared/catalog';
import type { View } from '../shared/engine';
export const ACTION_NAMES: Record<string, string> = {
  explore: 'Explorar',
  reserve: 'Reservar / disputar',
  sell: 'Vender',
  capture: 'Buscar cliente',
  draw: 'Robar cartas',
  town: 'Ayuntamiento',
};
export function actionBlock(v: View, _action?: string): string | undefined {
  if (v.finished) return 'La partida ha terminado.';
  if (v.active !== v.self) return 'Es el turno de tu rival.';
  if (v.pending.length) return 'Primero elige el cliente referido pendiente.';
  if (v.you.clients.length > CLIENT_LIMIT || v.you.cards.length > CARD_LIMIT)
    return 'Elige qué descartar para ajustar tu mano.';
  if (v.used.length >= v.actions)
    return `Has gastado tus ${v.actions} ${v.actions === 1 ? 'acción' : 'acciones'}: ${v.used.map((a) => ACTION_NAMES[a]).join(' y ')}. Aún puedes jugar cartas; después termina el turno.`;
}
export function saleBlock(v: View, index: number, card?: number): string | undefined {
  const action = actionBlock(v);
  if (action) return action;
  if (!v.tiles[index].open) return 'Consultar el plano no es explorar: la loseta sigue oculta.';
  if (v.tiles[index].sold !== undefined) return 'Esta vivienda ya está vendida.';
  if (!v.you.clients.length)
    return 'No tienes clientes. Buscar cliente cuesta 1 acción; algunas cartas también permiten robarlos.';
  const offers = v.offers.filter((o) => o.command.tile === index && o.command.card === card);
  if (offers.some((o) => !o.blocked)) return;
  return offers[0]?.blocked || 'No hay una venta disponible para esta loseta.';
}
