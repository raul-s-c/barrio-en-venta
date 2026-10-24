import { useEffect, useRef, useState } from 'react';
import { Play, Square, Download, FlaskConical } from 'lucide-react';
import { PROFILES, type Profile, type Simulation } from '../shared/ai';
import { CARDS, CARD_EFFECTS, CLIENTS, DEFAULTS, SPECIALTIES } from '../shared/catalog';
function download(value: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Lab() {
  const [games, setGames] = useState(40),
    [seed, setSeed] = useState(20260916),
    [profiles, setProfiles] = useState<[Profile, Profile]>(['equilibrada', 'lujo']),
    [progress, setProgress] = useState(0),
    [result, setResult] = useState<Simulation | null>(null),
    [running, setRunning] = useState(false),
    [closeBonus, setBonus] = useState(DEFAULTS.closeBonus);
  const worker = useRef<Worker | null>(null);
  useEffect(() => () => worker.current?.terminate(), []);
  function start() {
    worker.current?.terminate();
    const w = new Worker(new URL('./lab.worker.ts', import.meta.url), { type: 'module' });
    worker.current = w;
    setRunning(true);
    setProgress(0);
    setResult(null);
    w.onmessage = (e) => {
      setResult(e.data.result);
      setProgress(e.data.done / e.data.total);
      if (e.data.done === e.data.total) {
        setRunning(false);
        w.terminate();
      }
    };
    w.onerror = () => {
      setRunning(false);
      w.terminate();
    };
    w.postMessage({ games, seed, profiles, params: { ...DEFAULTS, closeBonus } });
  }
  const low = result
    ? CARD_EFFECTS.map((effect, id) => {
        const copies = result.cards.filter((c) => CARDS[c.id].effect === effect.effect);
        const drawn = copies.reduce((sum, c) => sum + c.drawn, 0);
        const used = copies.reduce((sum, c) => sum + c.used, 0);
        return { id, drawn, used, rate: drawn ? used / drawn : 0 };
      }).toSorted((a, b) => a.rate - b.rate)
    : undefined;
  return (
    <section className="lab page">
      <header className="section-heading">
        <div>
          <span className="eyebrow">MISMO MOTOR · INFORMACIÓN PRIVADA</span>
          <h1>Laboratorio</h1>
        </div>
        <FlaskConical size={32} />
      </header>
      <div className="lab-config">
        <label>
          Partidas
          <input
            aria-label="Partidas"
            type="number"
            min="2"
            max="2000"
            step="2"
            value={games}
            onChange={(e) => setGames(Math.min(2000, Math.max(2, Number(e.target.value))))}
          />
        </label>
        <label>
          Semilla
          <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
        </label>
        {profiles.map((p, i) => (
          <label key={i}>
            IA {i === 0 ? 'A' : 'B'}
            <select
              value={p}
              onChange={(e) =>
                setProfiles(
                  (old) => old.map((x, j) => (j === i ? e.target.value : x)) as [Profile, Profile],
                )
              }
            >
              {PROFILES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Bonus de cierre
          <input
            type="number"
            min="0"
            max="20"
            value={closeBonus}
            onChange={(e) => setBonus(Math.max(0, Math.min(20, Number(e.target.value))))}
          />
        </label>
        <button
          className="primary"
          onClick={
            running
              ? () => {
                  worker.current?.terminate();
                  setRunning(false);
                }
              : start
          }
        >
          {running ? <Square size={17} /> : <Play size={17} />} {running ? 'Detener' : 'Simular'}
        </button>
      </div>
      <progress value={progress} max="1" />
      <div className="lab-status" aria-live="polite">
        {running ? 'Simulando' : result ? 'Lote terminado' : 'Sin ejecutar'} · {result?.games || 0}{' '}
        / {games} partidas
      </div>
      {result ? (
        <>
          <div className="metrics">
            <div>
              <span>Victorias A / B</span>
              <strong>{result.wins.join(' / ')}</strong>
              <small>{result.draws} empates</small>
            </div>
            <div>
              <span>Puntuación media A / B</span>
              <strong>{result.meanScore.map((n) => n.toFixed(1)).join(' / ')}</strong>
              <small>{result.meanTurns.toFixed(1)} turnos de media</small>
            </div>
            <div>
              <span>Gana quien empieza</span>
              <strong>
                {result.firstWins + result.firstLosses
                  ? Math.round((result.firstWins / (result.firstWins + result.firstLosses)) * 100)
                  : 0}
                %
              </strong>
              <small>Sin empates · {result.firstWins + result.firstLosses} partidas</small>
            </div>
            <div>
              <span>Cierres por línea</span>
              <strong>{result.games - result.roundLimit}</strong>
              <small>{result.roundLimit} por límite de rondas</small>
            </div>
            <div>
              <span>Manos iniciales con comprador de lujo</span>
              <strong>
                {result.openingLuxuryAccess.playerHands
                  ? Math.round(
                      (result.openingLuxuryAccess.handsWithBuyer /
                        result.openingLuxuryAccess.playerHands) *
                        100,
                    )
                  : 0}
                %
              </strong>
              <small>
                {result.openingLuxuryAccess.handsWithBuyer} de{' '}
                {result.openingLuxuryAccess.playerHands} manos ·{' '}
                {result.openingLuxuryAccess.playerHands
                  ? (
                      result.openingLuxuryAccess.buyersDealt /
                      result.openingLuxuryAccess.playerHands
                    ).toFixed(2)
                  : '0.00'}{' '}
                clientes de lujo por mano
              </small>
            </div>
          </div>
          <div className="split-stats">
            <section>
              <h2>Ventas y dificultad</h2>
              <table>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Ventas</th>
                    <th>Puntos medios</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.categories).map(([cat, value]) => (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td>{value.sales}</td>
                      <td>{(value.points / value.sales).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted">
                Prioridades caducadas: {result.expiredPriorities} · Prórrogas usadas:{' '}
                {result.extendedPriorities}
              </p>
              <p className="muted">
                Ventas por debajo de la mejor oferta inmediata para esa vivienda y carta:{' '}
                {result.retainedClientDecisions}. Es un indicador de decisiones de la política, no
                prueba de que conservar fuese mejor.
              </p>
            </section>
            <section>
              <h2>Especialidades</h2>
              <table>
                <thead>
                  <tr>
                    <th>Ficha</th>
                    <th>Partidas</th>
                    <th>Victorias</th>
                  </tr>
                </thead>
                <tbody>
                  {result.specialtyResults.map((r, i) => (
                    <tr key={i}>
                      <td>{SPECIALTIES[i].name}</td>
                      <td>{r.games}</td>
                      <td>{r.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
          <div className="split-stats">
            <section>
              <h2>Acciones por partida</h2>
              {Object.entries(result.actions)
                .filter(([x]) => x !== 'end')
                .map(([name, n]) => (
                  <div className="bar-row" key={name}>
                    <span>
                      {
                        (
                          {
                            explore: 'Explorar',
                            reserve: 'Prioridades',
                            sell: 'Vender',
                            capture: 'Captar',
                            draw: 'Preparar',
                            town: 'Ayuntamiento',
                            card: 'Tácticas',
                            choose: 'Elegir',
                          } as Record<string, string>
                        )[name]
                      }
                    </span>
                    <span className="bar">
                      <i
                        style={{
                          width: `${Math.min(100, (n / Math.max(1, result.games) / 20) * 100)}%`,
                        }}
                      />
                    </span>
                    <b>{(n / Math.max(1, result.games)).toFixed(1)}</b>
                  </div>
                ))}
              <h2>Última línea completada</h2>
              {Object.entries(result.closures).map(([cat, n]) => (
                <p key={cat}>
                  {cat} <b>{n}</b>
                </p>
              ))}
            </section>
            <section>
              <h2>Cartas menos utilizadas</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Carta</th>
                      <th>Robada</th>
                      <th>Usada</th>
                      <th>Uso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {low?.map((c) => (
                      <tr key={c.id}>
                        <td>{CARDS[c.id].name}</td>
                        <td>{c.drawn}</td>
                        <td>{c.used}</td>
                        <td>{(100 * c.rate).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <div className="split-stats">
            <section>
              <h2>Clientes utilizados</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CLIENTS.toSorted((a, b) => result.clients[a.id] - result.clients[b.id]).map(
                      (c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{result.clients[c.id]}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            <section>
              <h2>Entornos de las ventas</h2>
              <table>
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Ventas junto a él</th>
                    <th>Puntos medios</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.services).map(([name, data]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{data.sales}</td>
                      <td>{(data.points / data.sales).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted">
                Una venta puede contar en varios servicios. Correlación, no beneficio causado por el
                servicio.
              </p>
            </section>
          </div>
          <section className="lab-notes">
            <h2>Alcance de estas pruebas</h2>
            <p>
              Las IA son políticas heurísticas. Una carta poco jugada puede señalar una regla débil
              o una limitación de la IA; no demuestra que sea inútil. Cada pareja usa la misma
              ciudad y reparto con la iniciativa intercambiada. Los cambios de parámetros solo
              afectan al laboratorio.
            </p>
            <p>
              {result.failures.length
                ? `${result.failures.length} errores detectados: ${result.failures.join('; ')}`
                : 'Sin errores de ejecución en este lote.'}
            </p>
            <div className="button-row">
              <button
                onClick={() =>
                  download(
                    JSON.stringify(result, null, 2),
                    'barrio-simulacion.json',
                    'application/json',
                  )
                }
              >
                <Download size={16} /> JSON completo
              </button>
              <button
                onClick={() =>
                  download(
                    'carta,robada,usada,tasa\n' +
                      result.cards
                        .map(
                          (c) => `"${CARDS[c.id].name}",${c.drawn},${c.used},${c.rate.toFixed(4)}`,
                        )
                        .join('\n'),
                    'barrio-cartas.csv',
                    'text/csv',
                  )
                }
              >
                <Download size={16} /> CSV de cartas
              </button>
            </div>
          </section>
        </>
      ) : (
        <div className="lab-empty">
          <FlaskConical size={48} />
          <h2>Una ciudad. Seis formas de competir.</h2>
          <p>Equilibrada · Lujo · Volumen · Bloqueo · Codiciosa · Azar</p>
        </div>
      )}
    </section>
  );
}
