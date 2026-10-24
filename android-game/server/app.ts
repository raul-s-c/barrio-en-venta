import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { z } from 'zod';
import { applyCommand, createGame, view, type State, type Seat } from '../shared/engine';
import { RULES_VERSION } from '../shared/catalog';
const hash = (x: string) => createHash('sha256').update(x).digest('hex');
const derive = promisify(scrypt);
type Row = {
  id: string;
  p0: string;
  p1: string | null;
  code: string;
  state: string;
  revision: number;
  created: number;
  updated: number;
};
export function makeApp(dbPath = process.env.DB_PATH || 'data/barrio.sqlite') {
  if (dbPath !== ':memory:') mkdirSync(dirname(resolve(dbPath)), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE UNIQUE, salt TEXT NOT NULL, password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS games(id TEXT PRIMARY KEY,p0 TEXT NOT NULL REFERENCES users(id),p1 TEXT REFERENCES users(id),code TEXT NOT NULL UNIQUE,state TEXT NOT NULL,revision INTEGER NOT NULL,created INTEGER NOT NULL,updated INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS commands(game_id TEXT NOT NULL,user_id TEXT NOT NULL,command_id TEXT NOT NULL,payload TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(game_id,user_id,command_id));
 CREATE TABLE IF NOT EXISTS devices(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),updated INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,game_id TEXT NOT NULL,user_id TEXT NOT NULL,turn INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,next_try INTEGER NOT NULL DEFAULT 0,delivered INTEGER NOT NULL DEFAULT 0,last_error TEXT);
 CREATE INDEX IF NOT EXISTS game_players ON games(p0,p1);
 CREATE INDEX IF NOT EXISTS outbox_pending ON outbox(delivered,next_try);`);
  const app = express();
  app.disable('x-powered-by');
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    }),
  );
  const allowed = new Set([
    'http://localhost:5178',
    'http://127.0.0.1:5178',
    'https://localhost',
    'http://localhost',
    'capacitor://localhost',
    ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
  ]);
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowed.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    } else if (origin && origin !== `${req.protocol}://${req.get('host')}`) {
      res.status(403).json({ error: 'Origen no autorizado.' });
      return;
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    if (process.env.NODE_ENV === 'production' && !req.secure) {
      res.status(400).json({ error: 'HTTPS obligatorio.' });
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.use(
    '/api',
    rateLimit({ windowMs: 60000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false }),
  );
  app.get('/api/health', (_req, res) =>
    res.json({
      ok: true,
      version: RULES_VERSION,
      pushConfigured: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    }),
  );
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });
  const credentials = z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(24)
      .regex(/^[\p{L}\p{N} ._-]+$/u),
    password: z.string().min(8).max(128),
  });
  app.post('/api/auth/:mode', authLimit, async (req, res) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success || !['register', 'login'].includes(String(req.params.mode))) {
      res.status(400).json({ error: 'Nombre de 2 a 24 caracteres y contraseña de 8 o más.' });
      return;
    }
    const { name, password } = parsed.data;
    let user = db.prepare('SELECT * FROM users WHERE name=? COLLATE NOCASE').get(name) as
      { id: string; name: string; salt: string; password: string } | undefined;
    if (req.params.mode === 'register') {
      if (user) {
        res.status(409).json({ error: 'Este nombre ya existe.' });
        return;
      }
      const salt = randomBytes(16).toString('hex'),
        digest = (await derive(password, salt, 64)) as Buffer;
      const id = randomUUID();
      try {
        db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(id, name, salt, digest.toString('hex'));
      } catch {
        res.status(409).json({ error: 'Este nombre ya existe.' });
        return;
      }
      user = { id, name, salt, password: digest.toString('hex') };
    } else {
      const digest = (await derive(password, user?.salt || 'unused-dummy-salt', 64)) as Buffer;
      if (!user || !timingSafeEqual(digest, Buffer.from(user.password, 'hex'))) {
        res.status(401).json({ error: 'Nombre o contraseña incorrectos.' });
        return;
      }
    }
    const token = randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(
      hash(token),
      user.id,
      Date.now() + 90 * 86400000,
    );
    res.json({ token, user: { id: user.id, name: user.name } });
  });
  app.use('/api', (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer /, '') || '';
    const session = db
      .prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?')
      .get(hash(token), Date.now()) as { user_id: string } | undefined;
    if (!session) {
      res.status(401).json({ error: 'Inicia sesión para continuar.' });
      return;
    }
    res.locals.user = session.user_id;
    next();
  });
  const game = (id: string, user: string): { row: Row; seat: Seat; state: State } => {
    const row = db
      .prepare('SELECT * FROM games WHERE id=? AND (p0=? OR p1=?)')
      .get(id, user, user) as Row | undefined;
    if (!row) throw Object.assign(new Error('Partida no encontrada.'), { status: 404 });
    const state = JSON.parse(row.state) as State;
    if (state.version !== RULES_VERSION)
      throw Object.assign(
        new Error(
          'Partida v0.1 conservada como archivo. Crea una nueva para jugar con las reglas v0.2.',
        ),
        { status: 409 },
      );
    return { row, seat: row.p0 === user ? 0 : 1, state };
  };
  const payload = (g: ReturnType<typeof game>) => ({
    id: g.row.id,
    invite: g.row.p1 ? undefined : g.row.code,
    waiting: !g.row.p1,
    view: { ...view(g.state, g.seat), choices: g.row.p1 ? view(g.state, g.seat).choices : [] },
  });
  const enqueue = (id: string, user: string, turn: number) =>
    db
      .prepare('INSERT OR IGNORE INTO outbox(id,game_id,user_id,turn) VALUES(?,?,?,?)')
      .run(`${id}:${turn}`, id, user, turn);
  app.post('/api/logout', (req, res) => {
    db.prepare('DELETE FROM sessions WHERE token=?').run(
      hash(req.headers.authorization!.replace(/^Bearer /, '')),
    );
    if (typeof req.body.deviceToken === 'string')
      db.prepare('DELETE FROM devices WHERE token=? AND user_id=?').run(
        req.body.deviceToken,
        res.locals.user,
      );
    res.json({ ok: true });
  });
  app.get('/api/games', (_req, res) => {
    const rows = db
      .prepare('SELECT * FROM games WHERE p0=? OR p1=? ORDER BY updated DESC LIMIT 50')
      .all(res.locals.user, res.locals.user) as Row[];
    res.json(
      rows.map((row) => {
        const s = JSON.parse(row.state) as State;
        return {
          id: row.id,
          archived: s.version !== RULES_VERSION,
          opponent: s.players[row.p0 === res.locals.user ? 1 : 0].name,
          round: s.round,
          waiting: !row.p1,
          finished: s.finished,
          yourTurn: !!row.p1 && s.active === (row.p0 === res.locals.user ? 0 : 1),
          scores: s.result?.scores ?? s.players.map((p) => p.score),
        };
      }),
    );
  });
  app.post('/api/games', (_req, res) => {
    const count = (
      db.prepare('SELECT count(*) AS n FROM games WHERE p0=?').get(res.locals.user) as { n: number }
    ).n;
    if (count >= 100) {
      res.status(409).json({ error: 'Límite de 100 partidas creadas.' });
      return;
    }
    const user = db.prepare('SELECT name FROM users WHERE id=?').get(res.locals.user) as {
      name: string;
    };
    const id = randomUUID(),
      code = randomBytes(6).toString('hex').toUpperCase(),
      now = Date.now(),
      s = createGame(
        randomBytes(4).readUInt32LE(),
        [user.name, 'Esperando rival'],
        (randomBytes(1)[0] % 2) as Seat,
      );
    db.prepare('INSERT INTO games VALUES(?,?,?,?,?,?,?,?)').run(
      id,
      res.locals.user,
      null,
      code,
      JSON.stringify(s),
      s.revision,
      now,
      now,
    );
    res.status(201).json(payload(game(id, res.locals.user)));
  });
  app.post('/api/join', (req, res) => {
    const code = z
      .string()
      .regex(/^[A-F0-9]{12}$/)
      .safeParse(req.body.code?.toUpperCase());
    if (!code.success) {
      res.status(400).json({ error: 'Código de invitación de 12 caracteres.' });
      return;
    }
    db.exec('BEGIN IMMEDIATE');
    try {
      const row = db.prepare('SELECT * FROM games WHERE code=?').get(code.data) as Row | undefined;
      if (!row || row.p0 === res.locals.user || row.p1) {
        throw Object.assign(new Error('Invitación no disponible.'), { status: 409 });
      }
      const name = (
        db.prepare('SELECT name FROM users WHERE id=?').get(res.locals.user) as { name: string }
      ).name;
      const s = JSON.parse(row.state) as State;
      if (s.version !== RULES_VERSION)
        throw Object.assign(
          new Error('Esta invitación pertenece a una edición anterior. Crea una nueva partida.'),
          { status: 409 },
        );
      s.players[1].name = name;
      s.revision++;
      db.prepare('UPDATE games SET p1=?,state=?,revision=?,updated=? WHERE id=?').run(
        res.locals.user,
        JSON.stringify(s),
        s.revision,
        Date.now(),
        row.id,
      );
      enqueue(row.id, s.active === 0 ? row.p0 : res.locals.user, s.turn);
      db.exec('COMMIT');
      res.json(payload(game(row.id, res.locals.user)));
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  });
  app.get('/api/games/:id', (req, res) => res.json(payload(game(req.params.id, res.locals.user))));
  const commandSchema = z
    .object({
      commandId: z.string().uuid(),
      revision: z.number().int().nonnegative(),
      command: z
        .object({
          type: z.enum([
            'explore',
            'reserve',
            'sell',
            'capture',
            'draw',
            'town',
            'card',
            'choose',
            'discard',
            'end',
          ]),
          tile: z.number().int().min(0).max(36).optional(),
          client: z.number().int().min(0).max(23).optional(),
          card: z.number().int().min(0).max(29).optional(),
          mode: z.string().max(20).optional(),
        })
        .strict(),
    })
    .strict();
  app.post('/api/games/:id/commands', (req, res) => {
    const data = commandSchema.parse(req.body),
      user = res.locals.user;
    db.exec('BEGIN IMMEDIATE');
    try {
      const g = game(req.params.id, user);
      if (!g.row.p1)
        throw Object.assign(new Error('Espera a que entre tu rival.'), { status: 409 });
      const old = db
        .prepare('SELECT payload FROM commands WHERE game_id=? AND user_id=? AND command_id=?')
        .get(g.row.id, user, data.commandId) as { payload: string } | undefined;
      const serialized = JSON.stringify(data.command);
      if (old) {
        if (old.payload !== serialized)
          throw Object.assign(new Error('Identificador ya utilizado.'), { status: 409 });
        db.exec('COMMIT');
        res.json(payload(g));
        return;
      }
      if (g.row.revision !== data.revision)
        throw Object.assign(
          new Error('La partida ha cambiado. Se actualizará antes de tu próxima jugada.'),
          { status: 409 },
        );
      const s = applyCommand(g.state, g.seat, data.command);
      db.prepare('UPDATE games SET state=?,revision=?,updated=? WHERE id=?').run(
        JSON.stringify(s),
        s.revision,
        Date.now(),
        g.row.id,
      );
      db.prepare('INSERT INTO commands VALUES(?,?,?,?,?)').run(
        g.row.id,
        user,
        data.commandId,
        serialized,
        s.revision,
      );
      if (!s.finished && s.turn !== g.state.turn && s.active !== g.seat)
        enqueue(g.row.id, s.active === 0 ? g.row.p0 : g.row.p1!, s.turn);
      db.exec('COMMIT');
      res.json(payload(game(g.row.id, user)));
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  });
  app.post('/api/devices', (req, res) => {
    const token = z.string().min(20).max(4096).parse(req.body.token);
    db.prepare(
      'INSERT INTO devices VALUES(?,?,?) ON CONFLICT(token) DO UPDATE SET user_id=excluded.user_id,updated=excluded.updated',
    ).run(token, res.locals.user, Date.now());
    res.json({ ok: true });
  });
  app.delete('/api/devices', (req, res) => {
    db.prepare('DELETE FROM devices WHERE token=? AND user_id=?').run(
      z.string().parse(req.body.token),
      res.locals.user,
    );
    res.json({ ok: true });
  });
  app.use(express.static(resolve('dist')));
  app.use(
    (
      err: Error & { status?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const status = err instanceof z.ZodError ? 400 : err.status || 400;
      res.status(status).json({
        error:
          status >= 500
            ? 'Error interno. Reintenta en unos segundos.'
            : err instanceof z.ZodError
              ? 'Datos inválidos.'
              : err.message,
      });
    },
  );
  return { app, db };
}
