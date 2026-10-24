import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { Command, View } from '../shared/engine';
export type Session = { token: string; user: { id: string; name: string } };
export type OnlineGame = { id: string; invite?: string; waiting: boolean; view: View };
export type GameSummary = {
  id: string;
  archived?: boolean;
  opponent: string;
  round: number;
  waiting: boolean;
  finished: boolean;
  yourTurn: boolean;
  scores: number[];
};
export const native = Capacitor.isNativePlatform();
export const storage = {
  async get(key: string) {
    return (await Preferences.get({ key })).value;
  },
  async set(key: string, value: string) {
    await Preferences.set({ key, value });
  },
  async remove(key: string) {
    await Preferences.remove({ key });
  },
};
export async function request<T>(
  base: string,
  path: string,
  session: Session | null,
  body?: unknown,
  method = body === undefined ? 'GET' : 'POST',
): Promise<T> {
  if (native && !base) throw new Error('Configura la URL HTTPS de vuestro servidor en Conexión.');
  if (
    base &&
    !/^https:\/\//.test(base) &&
    !(import.meta.env.DEV && /^http:\/\/(localhost|127\.0\.0\.1)/.test(base))
  )
    throw new Error('El servidor debe usar HTTPS.');
  const response = await fetch(`${base.replace(/\/$/, '')}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response
    .json()
    .catch(() => ({ error: 'El servidor no responde con datos válidos.' }));
  if (!response.ok)
    throw Object.assign(new Error(data.error || `Error ${response.status}`), {
      status: response.status,
    });
  return data as T;
}
export type Pending = { commandId: string; revision: number; command: Command };
let pushInitialized = false;
let pushSession: Session | null = null;
let pushBase = '';
let pushOpen: (id: string) => void = () => {};
export async function enablePush(
  base: string,
  session: Session,
  onOpen: (id: string) => void,
  prompt = true,
) {
  if (!native) throw new Error('Las notificaciones de turno se activan en la app Android.');
  if (import.meta.env.VITE_FIREBASE_READY !== 'true')
    throw new Error(
      'Este APK no incluye Firebase todavía. Añade google-services.json y vuelve a compilar.',
    );
  pushSession = session;
  pushBase = base;
  pushOpen = onOpen;
  const { PushNotifications } = await import('@capacitor/push-notifications');
  if (!pushInitialized) {
    await PushNotifications.addListener('registration', async ({ value }) => {
      await storage.set('device-token', value);
      if (pushSession)
        await request(pushBase, '/devices', pushSession, { token: value }).catch(console.error);
    });
    await PushNotifications.addListener('pushNotificationActionPerformed', (e) => {
      if (e.notification.data.gameId) pushOpen(e.notification.data.gameId);
    });
    await PushNotifications.addListener('registrationError', (e) => console.error('FCM', e.error));
    pushInitialized = true;
  }
  const permission = await (prompt
    ? PushNotifications.requestPermissions()
    : PushNotifications.checkPermissions());
  if (permission.receive !== 'granted') {
    if (!prompt) return;
    throw new Error('Permiso denegado. Puedes activarlo en Ajustes de Android.');
  }
  await PushNotifications.createChannel({
    id: 'turnos',
    name: 'Tu turno',
    description: 'Avisos de partidas de Barrio en Venta',
    importance: 4,
    sound: 'default',
  });
  await PushNotifications.register();
}
export function clearPushSession() {
  pushSession = null;
}
