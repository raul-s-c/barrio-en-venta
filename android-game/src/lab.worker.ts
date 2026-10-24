import { emptySimulation, simulateOne, type BatchOptions } from '../shared/ai';
self.onmessage = (event: MessageEvent<BatchOptions>) => {
  const o = event.data;
  if (!Number.isInteger(o.games) || o.games < 2 || o.games > 2000) return;
  const result = emptySimulation(o);
  for (let i = 0; i < o.games; i++) {
    simulateOne(o, i, result);
    if (i % 4 === 3 || i === o.games - 1) self.postMessage({ done: i + 1, total: o.games, result });
  }
};
