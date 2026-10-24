import { copyFileSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
mkdirSync('deliverables', { recursive: true });
const version = JSON.parse(readFileSync('package.json', 'utf8')).version as string;
const source = 'android/app/build/outputs/apk/debug/app-debug.apk',
  target = `deliverables/Barrio-en-Venta-${version}-debug.apk`;
copyFileSync(source, target);
const sha256 = createHash('sha256').update(readFileSync(target)).digest('hex');
const result = {
  file: target,
  version,
  package: 'es.barrioenventa.app',
  kind: 'debug',
  minAndroid: 7,
  bytes: statSync(target).size,
  sha256,
  firebaseConfigured: false,
  publicServerDeployed: false,
};
writeFileSync('deliverables/build-info.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
