import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';

// GitHub Pages sirve la app en /barrio-en-venta/; en local y en Android, en la raíz.
const base = process.env.BASE_PATH ?? '/';
const buildId = process.env.GITHUB_SHA?.slice(0, 12) ?? `local-${Date.now().toString(36)}`;
const builtAt = new Date().toISOString();

/** Escribe version.json, que la app consulta para avisar de actualizaciones. */
function versionFile(): Plugin {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ build: buildId, builtAt }),
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), versionFile()],
  define: {
    'import.meta.env.VITE_FIREBASE_READY': JSON.stringify(
      existsSync('android/app/google-services.json') ? 'true' : 'false',
    ),
    __BUILD_ID__: JSON.stringify(buildId),
    __BUILT_AT__: JSON.stringify(builtAt),
  },
  server: { port: 5178, strictPort: true, proxy: { '/api': 'http://127.0.0.1:8788' } },
  build: { target: 'es2022' },
});
