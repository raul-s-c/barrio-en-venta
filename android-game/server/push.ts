import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import type { DatabaseSync } from 'node:sqlite';
import type { State } from '../shared/engine';
export function startPush(db: DatabaseSync) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(
      'FCM sin configurar: partidas persistentes activas; notificaciones remotas desactivadas.',
    );
    return () => {};
  }
  if (!getApps().length) initializeApp({ credential: applicationDefault() });
  let busy = false;
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const jobs = db
        .prepare(
          'SELECT * FROM outbox WHERE delivered=0 AND next_try<=? AND attempts<8 ORDER BY rowid LIMIT 10',
        )
        .all(Date.now()) as unknown as {
        id: string;
        game_id: string;
        user_id: string;
        turn: number;
        attempts: number;
      }[];
      for (const job of jobs) {
        const row = db.prepare('SELECT state,p0,p1 FROM games WHERE id=?').get(job.game_id) as
          { state: string; p0: string; p1: string } | undefined;
        const state = row ? (JSON.parse(row.state) as State) : null;
        if (
          !state ||
          state.finished ||
          state.turn !== job.turn ||
          (state.active === 0 ? row!.p0 : row!.p1) !== job.user_id
        ) {
          db.prepare('UPDATE outbox SET delivered=1,last_error=? WHERE id=?').run(
            'Turno ya resuelto',
            job.id,
          );
          continue;
        }
        const devices = db
          .prepare('SELECT token FROM devices WHERE user_id=? ORDER BY updated DESC LIMIT 20')
          .all(job.user_id) as { token: string }[];
        if (!devices.length) {
          db.prepare('UPDATE outbox SET next_try=? WHERE id=?').run(Date.now() + 60000, job.id);
          continue;
        }
        try {
          const result = await getMessaging().sendEachForMulticast({
            tokens: devices.map((d) => d.token),
            notification: {
              title: 'Te toca en Barrio en Venta',
              body: `Ronda ${state.round}. Tu ciudad te espera.`,
            },
            data: { gameId: job.game_id, turn: String(job.turn) },
            android: {
              priority: 'high',
              ttl: 86400000,
              collapseKey: job.game_id,
              notification: { channelId: 'turnos', tag: job.game_id },
            },
          });
          result.responses.forEach((r, i) => {
            if (
              r.error &&
              [
                'messaging/registration-token-not-registered',
                'messaging/invalid-registration-token',
              ].includes(r.error.code)
            )
              db.prepare('DELETE FROM devices WHERE token=?').run(devices[i].token);
          });
          if (result.successCount > 0)
            db.prepare('UPDATE outbox SET delivered=1,last_error=NULL WHERE id=?').run(job.id);
          else throw new Error(result.responses[0]?.error?.code || 'FCM rechazó la entrega');
        } catch (error) {
          db.prepare(
            'UPDATE outbox SET attempts=attempts+1,next_try=?,last_error=? WHERE id=?',
          ).run(
            Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts),
            String(error).slice(0, 300),
            job.id,
          );
        }
      }
    } finally {
      busy = false;
    }
  }, 5000);
  timer.unref();
  return () => clearInterval(timer);
}
