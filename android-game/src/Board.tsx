import { memo, useId } from 'react';
import { property } from '../shared/catalog';
import { adjacent, type View } from '../shared/engine';
import { House } from 'lucide-react';
import { tileTheme } from './tile-theme';
import { useNewlyTrue } from './fx';
const rowEdges = [0, 326, 614, 905, 1254];
export function displayProperty(t?: { id?: string; renewed?: boolean }) {
  if (!t?.id) return null;
  const p = property(t.id);
  return t.renewed ? { ...p, name: 'Reforma urbana', kind: 'service' as const, art: 10 } : p;
}
const crop = (index: number) =>
  `${(index % 4) * 313.5} ${rowEdges[Math.floor(index / 4)]} 313.5 ${rowEdges[Math.floor(index / 4) + 1] - rowEdges[Math.floor(index / 4)]}`;
export function Art({ index, className = '' }: { index: number; className?: string }) {
  return (
    <svg aria-hidden="true" className={`art ${className}`} viewBox={crop(index)} overflow="hidden">
      <image href="/art/city-atlas-v2.png" width="1254" height="1254" />
    </svg>
  );
}
export const Board = memo(function Board({
  v,
  selected,
  onSelect,
  zoom,
}: {
  v: View;
  selected: number;
  onSelect: (i: number) => void;
  zoom: boolean;
}) {
  const prefix = useId().replaceAll(':', '');
  const revealed = useNewlyTrue(v.tiles.map((t) => t.open));
  const sold = useNewlyTrue(v.tiles.map((t) => t.sold !== undefined));
  const R = 45;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 30) * Math.PI) / 180;
    return `${Math.cos(a) * R},${Math.sin(a) * R}`;
  }).join(' ');
  return (
    <div className={`board-wrap ${zoom ? 'zoomed' : ''}`}>
      <svg
        className="city-board"
        viewBox="0 0 660 540"
        role="group"
        aria-label="Mapa de la ciudad, 37 losetas"
      >
        <defs>
          <pattern id={`${prefix}dots`} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r=".8" fill="#b8c8bb" />
          </pattern>
          <clipPath id={`${prefix}hex`}>
            <polygon points={hex} />
          </clipPath>
        </defs>
        <rect width="660" height="540" fill={`url(#${prefix}dots)`} />
        {v.tiles.map((t, i) => {
          const p = displayProperty(t),
            x = 330 + Math.sqrt(3) * (R + 2) * (t.q + t.r / 2),
            y = 270 + (R + 2) * 1.5 * t.r;
          const theme = tileTheme(p);
          const frontier = !t.open && v.tiles.some((a) => a.open && adjacent(t, a));
          const color =
            t.sold !== undefined
              ? t.sold === v.self
                ? '#217878'
                : '#b45343'
              : t.owner !== undefined
                ? t.owner === v.self
                  ? '#217878'
                  : '#b45343'
                : i === selected
                  ? '#203438'
                  : '#ccd5cc';
          return (
            <g
              key={i}
              transform={`translate(${x},${y})`}
              role="button"
              tabIndex={0}
              aria-label={`${p && t.open ? p.name : t.known ? `Plano privado: ${p?.name}` : frontier ? 'Explorar frontera' : 'Loseta oculta'}${t.sold !== undefined ? ' · vendida' : ''}${t.owner !== undefined ? ' · reservada' : ''}`}
              aria-pressed={selected === i}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
              className={`hex ${!t.open ? 'fog' : ''} ${frontier ? 'frontier' : ''}`}
            >
              <g
                className={`${revealed.has(i) ? 'fx-reveal' : ''} ${sold.has(i) ? 'fx-sold' : ''}`}
              >
                <polygon
                  points={hex}
                  fill={t.open ? theme.background : t.known ? '#e5eddf' : '#cddbd7'}
                  stroke={color}
                  strokeWidth={i === selected ? 4 : 2}
                />
                <g clipPath={`url(#${prefix}hex)`}>
                  {t.open && p ? (
                    <svg
                      x="-39"
                      y="-39"
                      width="78"
                      height="78"
                      overflow="hidden"
                      viewBox={crop(p.art)}
                    >
                      <image href="/art/city-atlas-v2.png" width="1254" height="1254" />
                    </svg>
                  ) : (
                    <>
                      <House
                        x="-24"
                        y="-24"
                        width="48"
                        height="48"
                        opacity={0.12}
                        color="#376c64"
                      />
                      <circle r="12" fill={frontier ? '#eaf0e6' : 'transparent'} />
                      <text y="6" textAnchor="middle" fill="#4d7066" fontSize="18" fontWeight="700">
                        {t.known ? '?' : frontier ? '+' : ''}
                      </text>
                    </>
                  )}
                  {t.sold !== undefined ? (
                    <>
                      <path d="M-43 0 0-43 43 0 0 43Z" fill={color} opacity=".15" />
                      <rect x="-31" y="9" width="62" height="19" rx="3" fill={color} />
                      <text y="22" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
                        VENDIDA
                      </text>
                    </>
                  ) : t.open && p ? (
                    <>
                      <rect x="-37" y="20" width="74" height="17" rx="2" fill={theme.color} />
                      <text
                        y="32"
                        textAnchor="middle"
                        fontSize={theme.label.length > 10 ? '7' : '9'}
                        fontWeight="700"
                        fill="white"
                      >
                        {theme.label.toUpperCase()}
                      </text>
                    </>
                  ) : null}
                </g>
                {t.owner !== undefined && t.sold === undefined ? (
                  <>
                    <circle cx="26" cy="-26" r="10" fill={color} />
                    <text
                      x="26"
                      y="-22"
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      fontWeight="700"
                    >
                      {t.owner === v.self ? 'T' : 'R'}
                    </text>
                  </>
                ) : null}
                {t.renewed ? <circle cy="-29" r="5" fill="#217878" /> : null}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
