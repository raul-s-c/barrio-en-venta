import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'es.barrioenventa.app',
  appName: 'Barrio en Venta',
  webDir: 'dist',
  plugins: { PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] } },
};
export default config;
