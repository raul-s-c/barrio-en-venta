import { existsSync, readFileSync } from 'node:fs';
const android = 'android/app/google-services.json',
  admin = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'secrets/firebase-service-account.json';
const checks: { name: string; ok: boolean }[] = [];
let project = '';
if (existsSync(android)) {
  const data = JSON.parse(readFileSync(android, 'utf8'));
  project = data.project_info?.project_id;
  checks.push({
    name: 'Android registrado como es.barrioenventa.app',
    ok: data.client?.some(
      (c: any) => c.client_info?.android_client_info?.package_name === 'es.barrioenventa.app',
    ),
  });
} else checks.push({ name: 'google-services.json en android/app', ok: false });
if (existsSync(admin)) {
  const data = JSON.parse(readFileSync(admin, 'utf8'));
  checks.push({
    name: 'Cuenta de servicio en el mismo proyecto Firebase',
    ok:
      data.type === 'service_account' &&
      !!project &&
      data.project_id === project &&
      !!data.private_key,
  });
} else checks.push({ name: 'Cuenta de servicio solo en el servidor', ok: false });
if (process.argv[2]) {
  try {
    const url = new URL(process.argv[2]);
    if (url.protocol !== 'https:') throw new Error('HTTPS requerido');
    const r = await fetch(new URL('/api/health', url), { signal: AbortSignal.timeout(10000) });
    const health = (await r.json()) as { ok: boolean; pushConfigured: boolean };
    checks.push({
      name: 'API pública HTTPS y Firebase activado',
      ok: r.ok && health.ok && health.pushConfigured,
    });
  } catch {
    checks.push({ name: 'API pública HTTPS accesible', ok: false });
  }
}
for (const c of checks) console.log(`${c.ok ? 'OK' : 'PENDIENTE'}: ${c.name}`);
if (checks.some((c) => !c.ok)) process.exitCode = 1;
