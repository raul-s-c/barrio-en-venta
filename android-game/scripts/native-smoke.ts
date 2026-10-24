import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9223', { noDefaults: true });
const context = browser.contexts()[0],
  page = context.pages()[0];
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.getByRole('button', { name: 'Agencia', exact: true }).click();
await page.getByRole('button', { name: 'Robar 2 cartas' }).click();
await page.getByText('1 acción restante').waitFor();
await page.getByRole('button', { name: 'Clientes', exact: true }).click();
await page.getByRole('button', { name: 'Buscar cliente', exact: true }).click();
await page.getByRole('button', { name: 'Terminar turno', exact: true }).click();
await page.getByText('Tu turno', { exact: true }).waitFor({ timeout: 20000 });
await page.getByRole('button', { name: 'Laboratorio', exact: true }).click();
await page.getByRole('spinbutton', { name: 'Partidas', exact: true }).fill('4');
await page.getByRole('button', { name: 'Simular', exact: true }).click();
await page.getByText('Lote terminado · 4 / 4 partidas').waitFor({ timeout: 30000 });
await page.screenshot({ path: 'reports/android-lab-webview.png', fullPage: false });
await page.getByRole('button', { name: 'Partida', exact: true }).click();
const before = await page.locator('.round>b').innerText();
await page.reload();
await page.getByText('Entrenamiento con Clara').waitFor();
const after = await page.locator('.round>b').innerText();
if (before !== after) throw new Error('La partida local no persistió');
if (errors.length) throw new Error(errors.join('\n'));
const report = {
  platform: 'Android API 36, WebView real',
  localTurn: true,
  ai: true,
  labGames: 4,
  persistence: true,
  errors,
};
writeFileSync('reports/android-smoke.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await browser.close();
