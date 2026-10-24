import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_FIREBASE_READY': JSON.stringify(
      existsSync('android/app/google-services.json') ? 'true' : 'false',
    ),
  },
  server: { port: 5178, strictPort: true, proxy: { '/api': 'http://127.0.0.1:8788' } },
  build: { target: 'es2022' },
});
