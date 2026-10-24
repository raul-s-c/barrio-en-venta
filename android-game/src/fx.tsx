import { useEffect, useRef, useState } from 'react';

// Small presentation effects shared by both modes. Pure CSS animations; the
// stylesheet disables them under prefers-reduced-motion.

/** Remembers how much a number changed the last time it moved. */
export function useChange(value: number) {
  const previous = useRef(value);
  const [change, setChange] = useState({ delta: 0, tick: 0 });
  useEffect(() => {
    const delta = value - previous.current;
    previous.current = value;
    if (delta) setChange((old) => ({ delta, tick: old.tick + 1 }));
  }, [value]);
  return change;
}

/** A score that pulses and floats "+N" when it grows. */
export function AnimatedScore({ value, className = '' }: { value: number; className?: string }) {
  const { delta, tick } = useChange(value);
  return (
    <span className={`fx-score ${className}`}>
      <span key={tick} className={tick ? 'fx-pulse' : ''}>
        {value}
      </span>
      {tick > 0 && delta > 0 ? (
        <span key={`d${tick}`} className="fx-float" aria-hidden="true">
          +{delta}
        </span>
      ) : null}
    </span>
  );
}

/** Indices that became true since the previous render, cleared after the animation. */
export function useNewlyTrue(flags: boolean[], duration = 900) {
  const previous = useRef<boolean[] | null>(null);
  const [fresh, setFresh] = useState<Set<number>>(() => new Set());
  const signature = flags.map((flag) => (flag ? 1 : 0)).join('');
  useEffect(() => {
    const before = previous.current;
    previous.current = flags;
    if (!before) return;
    const added = new Set(flags.flatMap((flag, i) => (flag && !before[i] ? [i] : [])));
    setFresh(added);
    if (!added.size) return;
    const timer = setTimeout(() => setFresh(new Set()), duration);
    return () => clearTimeout(timer);
  }, [signature]);
  return fresh;
}

/** A short banner announcing whose turn starts, shown whenever `turnKey` changes. */
export function TurnBanner({
  turnKey,
  text,
  tone = 'neutral',
}: {
  turnKey: string;
  text: string;
  tone?: 'mine' | 'rival' | 'neutral';
}) {
  const previous = useRef(turnKey);
  const [shown, setShown] = useState<{ text: string; key: string } | null>(null);
  useEffect(() => {
    if (previous.current === turnKey) return;
    previous.current = turnKey;
    setShown({ text, key: turnKey });
    const timer = setTimeout(() => setShown(null), 1600);
    return () => clearTimeout(timer);
  }, [turnKey]);
  if (!shown) return null;
  return (
    <div key={shown.key} className={`fx-turn-banner tone-${tone}`} role="status">
      {shown.text}
    </div>
  );
}
