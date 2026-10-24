import type { Property } from '../shared/catalog';
type Theme = { color: string; background: string; label: string; effect: string };
export function tileTheme(p: Property | null): Theme {
  if (!p)
    return {
      color: '#668b83',
      background: '#dce9e4',
      label: 'Oculta',
      effect: 'Todavía sin explorar.',
    };
  const themes: Record<string, Theme> = {
    Hospital: {
      color: '#bf3c80',
      background: '#fbd9e8',
      label: 'Hospital',
      effect: '+1 punto a viviendas vecinas.',
    },
    Obras: {
      color: '#c43837',
      background: '#ffd4d1',
      label: 'Obras',
      effect: '-2 puntos a cada venta vecina.',
    },
    Parque: {
      color: '#418345',
      background: '#dceecf',
      label: 'Parque',
      effect: '+1 punto a viviendas vecinas.',
    },
    Colegio: {
      color: '#a7850a',
      background: '#fff0b8',
      label: 'Colegio',
      effect: '+1 punto a viviendas vecinas.',
    },
    Metro: {
      color: '#087e9e',
      background: '#c9ecf6',
      label: 'Metro',
      effect: '+1 punto y rasgo Conexión a viviendas vecinas.',
    },
    Comercio: {
      color: '#b56718',
      background: '#ffdfbd',
      label: 'Comercio',
      effect: '+1 punto a viviendas vecinas.',
    },
    Ocio: {
      color: '#8051a3',
      background: '#eaddf4',
      label: 'Ocio',
      effect: '+1 punto. Algunos clientes prefieren tranquilidad.',
    },
    'Reforma urbana': {
      color: '#359377',
      background: '#ccf1df',
      label: 'Reforma',
      effect: '+1 punto a viviendas vecinas.',
    },
    Ruido: {
      color: '#a68400',
      background: '#fff197',
      label: 'Ruido',
      effect: '-1 punto por venta vecina, además de las preferencias del cliente.',
    },
    Litigio: {
      color: '#9b305f',
      background: '#f3c8dd',
      label: 'Litigio',
      effect: 'Bloquea ventas vecinas hasta abrir expediente en el Ayuntamiento (1 acción).',
    },
    'Impuestos altos': {
      color: '#a26624',
      background: '#f4ddb5',
      label: 'Impuestos',
      effect: '-1 punto por venta vecina.',
    },
    'Mala conexion': {
      color: '#bd692d',
      background: '#f7d1b9',
      label: 'Conexión rota',
      effect: '-1 punto por venta vecina.',
    },
    Ayuntamiento: {
      color: '#276c79',
      background: '#d5e9ed',
      label: 'Ayuntamiento',
      effect: 'Da Conexión a las viviendas vecinas. Cada trámite cuesta 1 acción.',
    },
  };
  if (p.category)
    return p.category === 'Lujosa'
      ? {
          color: '#ad8332',
          background: '#fff0c5',
          label: 'Lujosa',
          effect: 'Base 10–11. Solo 4 de los 24 clientes aceptan lujo.',
        }
      : p.category === 'Media'
        ? {
            color: '#487fac',
            background: '#dbeaf8',
            label: 'Media',
            effect: 'Base 6–7. Necesita un cliente que acepte Media.',
          }
        : {
            color: '#32856e',
            background: '#d7f0e3',
            label: 'Barata',
            effect: 'Base 3–4. Necesita un cliente que acepte Barata.',
          };
  return themes[p.name] || themes['Reforma urbana'];
}
