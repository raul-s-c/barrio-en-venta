import { it, expect } from 'vitest';
import { makeApp } from '../server/app';
import type { AddressInfo } from 'node:net';
it('dos cuentas, partida privada, idempotencia, conflicto y persistencia', async () => {
  const { app, db } = makeApp(':memory:');
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((r) => server.once('listening', r));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  const call = async (path: string, token?: string, body?: unknown) => {
    const res = await fetch(url + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  };
  try {
    const a = (
      await call('/auth/register', undefined, { name: 'Raul test', password: 'testing1234' })
    ).data;
    const b = (
      await call('/auth/register', undefined, { name: 'Ana test', password: 'testing1234' })
    ).data;
    const c = (
      await call('/auth/register', undefined, { name: 'Intruso', password: 'testing1234' })
    ).data;
    const made = await call('/games', a.token, {});
    expect(made.status).toBe(201);
    expect(made.data.waiting).toBe(true);
    const id = made.data.id;
    expect((await call(`/games/${id}`, c.token)).status).toBe(404);
    expect((await call(`/games/${id}`, undefined)).status).toBe(401);
    const joined = await call('/join', b.token, { code: made.data.invite });
    expect(joined.status).toBe(200);
    const current = (await call(`/games/${id}`, a.token)).data;
    const active = current.view.active === 0 ? a : b,
      inactive = current.view.active === 0 ? b : a;
    const command = {
      commandId: crypto.randomUUID(),
      revision: current.view.revision,
      command: { type: 'draw' },
    };
    expect((await call(`/games/${id}/commands`, inactive.token, command)).status).toBe(400);
    const first = await call(`/games/${id}/commands`, active.token, command);
    expect(first.status).toBe(200);
    const duplicate = await call(`/games/${id}/commands`, active.token, command);
    expect(duplicate.data.view.revision).toBe(first.data.view.revision);
    expect(
      (
        await call(`/games/${id}/commands`, active.token, {
          ...command,
          commandId: crypto.randomUUID(),
        })
      ).status,
    ).toBe(409);
    expect(
      (await call(`/games/${id}/commands`, active.token, { ...command, command: { type: 'end' } }))
        .status,
    ).toBe(409);
    const ended = await call(`/games/${id}/commands`, active.token, {
      commandId: crypto.randomUUID(),
      revision: first.data.view.revision,
      command: { type: 'end' },
    });
    expect(ended.status).toBe(200);
    expect(ended.data.view.active).not.toBe(current.view.active);
    expect(
      (db.prepare('SELECT count(*) AS n FROM outbox').get() as { n: number }).n,
    ).toBeGreaterThan(0);
    const read = await call(`/games/${id}`, inactive.token);
    expect(read.data.view.revision).toBe(ended.data.view.revision);
    expect(read.data.view.you.name).toBe(inactive.user.name);
    expect(read.data.view.players[1 - read.data.view.self]).not.toHaveProperty('cards');
    expect(read.data.view).not.toHaveProperty('seed');
    expect(read.data.view.you.clients).toHaveLength(5);
    expect(read.data.view.market).toEqual([]);
    const oldGame = (await call('/games', a.token, {})).data;
    const oldRow = db.prepare('SELECT state FROM games WHERE id=?').get(oldGame.id) as {
      state: string;
    };
    const oldState = JSON.parse(oldRow.state);
    oldState.version = 'digital-0.1.0';
    db.prepare('UPDATE games SET state=? WHERE id=?').run(JSON.stringify(oldState), oldGame.id);
    expect((await call('/join', b.token, { code: oldGame.invite })).status).toBe(409);
    expect(
      (db.prepare('SELECT p1 FROM games WHERE id=?').get(oldGame.id) as { p1: string | null }).p1,
    ).toBeNull();
    expect((await call(`/games/${oldGame.id}`, a.token)).status).toBe(409);
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
    db.close();
  }
}, 15000);
