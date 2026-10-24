import { mkdirSync, writeFileSync } from 'node:fs';
import {
  CARDS,
  CLIENTS,
  SPECIALTIES,
  PROPERTIES,
  DEFAULTS,
  RULES_VERSION,
} from '../shared/catalog';
import { RULES } from '../shared/rules';
mkdirSync('docs', { recursive: true });
const table = (head: string[], rows: unknown[][]) =>
  [head, head.map(() => '---'), ...rows].map((row) => '| ' + row.join(' | ') + ' |').join('\n');
writeFileSync(
  'docs/REGLAS.md',
  '# Barrio en Venta · ' +
    RULES_VERSION +
    '\n\n' +
    RULES.map(([title, body]) => '## ' + title + '\n\n' + body).join('\n\n') +
    '\n\n## Progreso de línea\n\n' +
    table(
      ['Categoría', '1.ª', '2.ª', '3.ª', '4.ª', '5.ª'],
      Object.entries(DEFAULTS.progress).map(([c, p]) => [c, ...p]),
    ) +
    '\n',
);
writeFileSync(
  'docs/CATALOGO.md',
  '# Catálogo · ' +
    RULES_VERSION +
    '\n\n## Losetas\n\n' +
    table(
      ['ID', 'Nombre', 'Tipo', 'Base', 'Rasgos'],
      PROPERTIES.map((p) => [p.id, p.name, p.category || p.kind, p.base, p.traits.join(', ')]),
    ) +
    '\n\n## Clientes\n\n' +
    table(
      ['ID', 'Cliente', 'Categorías', 'Preferencias', 'Puntos'],
      CLIENTS.map((c) => [c.id, c.name, c.accepts.join(', '), c.wants.join(', '), c.text]),
    ) +
    '\n\n## Cartas de juego\n\n' +
    table(
      ['ID', 'Carta', 'Tipo', 'Efecto'],
      CARDS.map((c) => [c.id, c.name, c.type, c.text]),
    ) +
    '\n\n## Especialidades públicas\n\n' +
    table(
      ['Ficha', 'Efecto'],
      SPECIALTIES.map((s) => [s.name, s.text]),
    ) +
    '\n',
);
console.log('Reglas y catálogo generados desde las mismas fuentes que utiliza la app.');
