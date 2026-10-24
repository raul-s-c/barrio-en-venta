export const CATEGORIES = ['Lujosa', 'Media', 'Barata'] as const;
export type Category = (typeof CATEGORIES)[number];
export type Feature = string;
export type Property = {
  id: string;
  name: string;
  kind: 'home' | 'service' | 'incident' | 'town';
  category?: Category;
  base: number;
  traits: string[];
  art: number;
};
export const RULES_VERSION = 'digital-0.2.3';
export const CLIENT_LIMIT = 8;
export const CARD_LIMIT = 3;
export type Parameters = {
  maxRounds: number;
  closeAt: number;
  closeBonus: number;
  comebackGap: number;
  openingActions: number;
  diversity: number;
  progress: Record<Category, number[]>;
};
export const DEFAULTS: Parameters = {
  maxRounds: 18,
  closeAt: 4,
  closeBonus: 6,
  comebackGap: 15,
  openingActions: 1,
  diversity: 2,
  progress: { Lujosa: [0, 1, 2, 3, 4], Media: [0, 1, 2, 3, 4], Barata: [0, 1, 2, 4, 6] },
};
const houses: [string, Category, number, string[], number][] = [
  ['Ático con terraza', 'Lujosa', 6, ['Exclusiva', 'Centrica'], 12],
  ['Chalet con jardín', 'Lujosa', 6, ['Familiar', 'Tranquila'], 1],
  ['Dúplex reformado', 'Lujosa', 5, ['Exclusiva', 'Reformada'], 12],
  ['Piso señorial', 'Lujosa', 5, ['Exclusiva', 'Centrica'], 13],
  ['Villa discreta', 'Lujosa', 6, ['Tranquila', 'Exclusiva'], 1],
  ['Loft de autor', 'Lujosa', 5, ['Centrica', 'Reformada'], 14],
  ['Casa modernista', 'Lujosa', 5, ['Exclusiva', 'Familiar'], 13],
  ['Piso familiar', 'Media', 4, ['Familiar', 'Tranquila'], 2],
  ['Piso junto al metro', 'Media', 4, ['Centrica', 'Conexion'], 2],
  ['Apartamento luminoso', 'Media', 4, ['Centrica', 'Reformada'], 12],
  ['Casa adosada', 'Media', 4, ['Familiar', 'Tranquila'], 3],
  ['Piso con balcón', 'Media', 3, ['Centrica', 'Tranquila'], 2],
  ['Vivienda reformada', 'Media', 4, ['Reformada', 'Familiar'], 12],
  ['Piso de barrio', 'Media', 3, ['Familiar', 'Conexion'], 2],
  ['Estudio céntrico', 'Barata', 2, ['Centrica', 'Inversion'], 3],
  ['Piso a reformar', 'Barata', 2, ['Reformable', 'Inversion'], 3],
  ['Bajo interior', 'Barata', 1, ['Barata', 'Inversion'], 3],
  ['Apartamento pequeño', 'Barata', 2, ['Centrica', 'Barata'], 3],
  ['Piso de oportunidad', 'Barata', 2, ['Inversion', 'Reformable'], 3],
  ['Vivienda heredada', 'Barata', 2, ['Barata', 'Familiar'], 3],
  ['Local reconvertido', 'Barata', 1, ['Inversion', 'Reformable'], 8],
  ['Residencia panorámica', 'Lujosa', 6, ['Exclusiva', 'Tranquila'], 1],
  ['Apartamento familiar', 'Media', 4, ['Familiar', 'Reformada'], 2],
  ['Estudio de oportunidad', 'Barata', 2, ['Barata', 'Reformable'], 3],
  ['Casa compacta', 'Barata', 2, ['Familiar', 'Tranquila'], 3],
];
const urban: [string, Property['kind'], number][] = [
  ['Parque', 'service', 4],
  ['Colegio', 'service', 5],
  ['Metro', 'service', 6],
  ['Hospital', 'service', 7],
  ['Comercio', 'service', 8],
  ['Ocio', 'service', 9],
  ['Obras', 'incident', 11],
  ['Ruido', 'incident', 12],
  ['Impuestos altos', 'incident', 14],
  ['Litigio', 'incident', 13],
  ['Mala conexion', 'incident', 15],
];
export const PROPERTIES: Property[] = [
  { id: 'town', name: 'Ayuntamiento', kind: 'town', base: 0, traits: [], art: 0 },
  ...houses.map(([name, category, base, traits, art], i) => ({
    id: `h${i}`,
    name,
    category,
    base: base + (category === 'Lujosa' ? 5 : category === 'Media' ? 3 : 2),
    traits,
    art: category === 'Lujosa' ? 1 : category === 'Media' ? 2 : 3,
    kind: 'home' as const,
  })),
  ...urban.map(([name, kind, art], i) => ({ id: `u${i}`, name, kind, base: 0, traits: [], art })),
];
export const property = (id: string) => PROPERTIES.find((p) => p.id === id)!;
export type Client = {
  id: number;
  name: string;
  accepts: Category[];
  family: string;
  wants: string[];
  text: string;
  portrait: number;
};
const clients: [string, string, string, string[], string][] = [
  [
    'Familia con dos niños',
    'M',
    'Familiar',
    ['Familiar', 'Colegio', 'Parque'],
    '+2 por Familiar, Colegio y Parque. -2 sin Colegio ni Parque.',
  ],
  [
    'Madre práctica',
    'BM',
    'Familiar',
    ['Colegio', 'Comercio', 'Metro'],
    '+2 Colegio, +1 Comercio, +1 Metro. -1 con Obras.',
  ],
  [
    'Familia que crece',
    'M',
    'Familiar',
    ['Familiar', 'Parque'],
    '+3 Familiar, +2 Parque. -2 con Ruido.',
  ],
  [
    'Padres primerizos',
    'M',
    'Familiar',
    ['Hospital', 'Colegio'],
    '+2 Hospital, +2 Colegio. -2 sin ninguno.',
  ],
  [
    'Pareja joven',
    'BM',
    'Urbano',
    ['Metro', 'Ocio', 'Centrica'],
    '+2 Metro, +2 Ocio, +1 Céntrica. -1 Tranquila sin Metro.',
  ],
  [
    'Profesional sin tiempo',
    'M',
    'Urbano',
    ['Metro', 'Comercio', 'Reformada'],
    '+2 Metro, +1 Comercio, +2 Reformada. -2 Mala conexión.',
  ],
  [
    'Amantes del centro',
    'BM',
    'Urbano',
    ['Metro', 'Ocio', 'Comercio'],
    '+2 por cada Metro, Ocio y Comercio. -1 sin servicios.',
  ],
  ['Reubicación exprés', 'BM', 'Flexible', [], '+1 y roba una carta de agencia al vender.'],
  ['Inversor de alquiler', 'BM', 'Inversor', ['Inversion', 'Metro'], '+3 Inversión, +2 Metro.'],
  ['Cazador de gangas', 'B', 'Inversor', ['Reformable', 'Conexion'], '+3 Reformable, +2 Conexión.'],
  [
    'Fondo discreto',
    'M',
    'Inversor',
    ['Inversion', 'Comercio'],
    '+2 Inversión, +2 Comercio. -2 con Litigio.',
  ],
  [
    'Comprador oportunista',
    'BM',
    'Inversor',
    [],
    '+4 con cualquier incidencia adyacente; -2 sin incidencias.',
  ],
  [
    'Directiva internacional',
    'L',
    'Premium',
    ['Exclusiva', 'Metro', 'Comercio'],
    '+3 Exclusiva, +2 Metro, +1 Comercio. -2 con Obras.',
  ],
  [
    'Matrimonio reservado',
    'L',
    'Premium',
    ['Tranquila', 'Parque', 'Hospital'],
    '+3 Tranquila, +2 Parque, +2 Hospital. -3 con Ruido u Ocio.',
  ],
  [
    'Cliente de capricho',
    'L',
    'Premium',
    ['Exclusiva'],
    '+6 si es Exclusiva y tiene 2 servicios. -3 si falta alguna condición.',
  ],
  [
    'Comprador de prestigio',
    'ML',
    'Premium',
    ['Exclusiva', 'Reformada', 'Centrica'],
    '+2 Exclusiva, +2 Reformada, +2 Céntrica. -2 Impuestos.',
  ],
  [
    'Jubilados activos',
    'M',
    'Tranquilo',
    ['Hospital', 'Parque', 'Comercio'],
    '+2 Hospital, +2 Parque, +1 Comercio. -2 Ruido u Ocio.',
  ],
  [
    'Teletrabajador',
    'BM',
    'Tranquilo',
    ['Tranquila', 'Parque'],
    '+3 Tranquila, +2 Parque. -3 Ruido.',
  ],
  [
    'Escritora',
    'BM',
    'Tranquilo',
    ['Tranquila', 'Parque'],
    '+2 Tranquila, +2 Parque. -2 por Metro y por Ocio.',
  ],
  [
    'Pareja con perro',
    'BM',
    'Tranquilo',
    ['Parque', 'Comercio'],
    '+3 Parque, +1 Comercio. -1 sin Parque.',
  ],
  [
    'Cliente indeciso',
    'BM',
    'Flexible',
    [],
    '+3 con al menos 1 servicio vecino. El rival roba una carta.',
  ],
  ['Cliente recomendado', 'BM', 'Flexible', [], '+3 si tienes prioridad en la vivienda.'],
  ['Hipoteca justa', 'BM', 'Flexible', ['Comercio'], '+3 Barata, +1 Comercio. -2 Impuestos.'],
  ['Cliente emocional', 'BM', 'Flexible', [], '+2 por servicio, máximo +4. -2 sin servicios.'],
];
const codes: Record<string, Category> = { L: 'Lujosa', M: 'Media', B: 'Barata' };
export const CLIENTS: Client[] = clients.map(([name, a, family, wants, text], id) => ({
  id,
  name,
  accepts: [...a].map((x) => codes[x]),
  family,
  wants,
  text,
  portrait: id % 12,
}));
export type CardEffect = 'removePriority' | 'explore' | 'client' | 'saleBonus' | 'extendPriority';
export type Card = {
  id: number;
  name: string;
  type: 'tactic';
  effect: CardEffect;
  text: string;
  target?: 'home' | 'hidden';
};
export const CARD_EFFECTS: Omit<Card, 'id'>[] = [
  {
    name: 'Quitar prioridad',
    type: 'tactic',
    effect: 'removePriority',
    target: 'home',
    text: 'Quita la prioridad de una vivienda rival. Queda libre para ambos; no la reserva para ti.',
  },
  {
    name: 'Explorar gratis',
    type: 'tactic',
    effect: 'explore',
    target: 'hidden',
    text: 'Descubre una loseta junto a la zona abierta. Si es una casa y tienes ficha libre, ganas la prioridad habitual.',
  },
  {
    name: 'Robar 1 cliente',
    type: 'tactic',
    effect: 'client',
    text: 'Añade a tu mano 1 cliente al azar del mazo.',
  },
  {
    name: 'Próxima venta +3',
    type: 'tactic',
    effect: 'saleBonus',
    text: 'Tu próxima venta suma 3 puntos. Se guarda hasta que vendas; no se acumula con otra igual.',
  },
  {
    name: 'Reserva +1 turno',
    type: 'tactic',
    effect: 'extendPriority',
    target: 'home',
    text: 'Alarga una de tus reservas hasta el final de un turno tuyo más.',
  },
];
// Unique physical IDs keep hands, discards and exposure metrics unambiguous.
export const CARDS: Card[] = Array.from({ length: 30 }, (_, id) => ({
  ...CARD_EFFECTS[id % CARD_EFFECTS.length],
  id,
}));

export const SPECIALTIES = [
  {
    name: 'Especialista en lujo',
    category: 'Lujosa',
    bonus: 2,
    text: '+2 puntos por cada lujosa que vendas.',
  },
  {
    name: 'Agencia residencial',
    category: 'Media',
    bonus: 2,
    text: '+2 puntos por cada vivienda media que vendas.',
  },
  {
    name: 'Ventas de proximidad',
    category: 'Barata',
    bonus: 2,
    text: '+2 puntos por cada barata que vendas.',
  },
] as const;
