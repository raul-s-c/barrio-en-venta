import { makeApp } from './app';
import { startPush } from './push';
const { app, db } = makeApp();
const port = Number(process.env.PORT || 8788),
  host = process.env.HOST || '0.0.0.0';
const stop = startPush(db);
const server = app.listen(port, host, () =>
  console.log(`Barrio en Venta API: http://${host}:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => {
    stop();
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
