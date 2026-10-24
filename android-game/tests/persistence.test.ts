import { it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makeApp } from '../server/app';
import { createGame } from '../shared/engine';
it('SQLite conserva una partida tras cerrar y volver a abrir el servidor', () => {
  const directory = mkdtempSync(join(tmpdir(), 'barrio-test-')),
    file = join(directory, 'state.sqlite');
  try {
    const first = makeApp(file);
    first.db.prepare('INSERT INTO users VALUES(?,?,?,?)').run('test', 'Prueba', 'salt', 'hash');
    const state = createGame(99);
    first.db
      .prepare('INSERT INTO games VALUES(?,?,?,?,?,?,?,?)')
      .run('game', 'test', null, 'AABBCCDDEEFF', JSON.stringify(state), state.revision, 1, 1);
    first.db.close();
    const second = makeApp(file);
    const row = second.db.prepare('SELECT state FROM games WHERE id=?').get('game') as {
      state: string;
    };
    expect(JSON.parse(row.state)).toEqual(state);
    second.db.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
