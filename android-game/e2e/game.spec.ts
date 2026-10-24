import { test, expect, type Page } from '@playwright/test';
import { join } from 'node:path';
test('tablero, acciones, agenda, laboratorio y móvil sin desbordamiento', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto('/');
  await expect(page.getByText('Entrenamiento con Clara')).toBeVisible();
  await expect(page.locator('.city-board [role=button]')).toHaveCount(37);
  const board = await page.locator('.city-board').boundingBox();
  const dock = await page.locator('.decision-dock').boundingBox();
  expect(board!.y + board!.height).toBeLessThanOrEqual(dock!.y);
  if (process.env.GAME_QA_DIR)
    await page.screenshot({ path: join(process.env.GAME_QA_DIR, 'desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Agencia', exact: true }).click();
  // Quien abre la partida solo tiene 1 acción en su primer turno.
  await expect(page.getByText('1 acción restante')).toBeVisible();
  await page.getByRole('button', { name: /Completar mano/ }).click();
  await expect(page.getByText('0 acciones restantes')).toBeVisible();
  await page.getByRole('button', { name: 'Clientes', exact: true }).click();
  await expect(page.locator('.client-card')).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Buscar cliente', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Terminar turno', exact: true }).click();
  await expect(page.locator('.turn')).toContainText('Tu turno', { timeout: 20000 });
  await page.getByRole('button', { name: 'Laboratorio', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Partidas', exact: true }).fill('8');
  await page.getByRole('button', { name: 'Simular', exact: true }).click();
  await expect(page.getByText('Lote terminado · 8 / 8 partidas')).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('Sin errores de ejecución en este lote.')).toBeVisible();
  if (process.env.GAME_QA_DIR)
    await page.screenshot({
      path: join(process.env.GAME_QA_DIR, 'laboratorio.png'),
      fullPage: true,
    });
  await page.getByRole('button', { name: 'Partida', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  if (process.env.GAME_QA_DIR)
    await page.screenshot({ path: join(process.env.GAME_QA_DIR, 'mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Reglamento', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar reglamento' }).click();
  expect(errors).toEqual([]);
});
test('dos jugadores separados comparten partida y turnos persistidos', async ({ browser }) => {
  const a = await browser.newContext(),
    b = await browser.newContext();
  const pa = await a.newPage(),
    pb = await b.newPage();
  const suffix = Date.now().toString().slice(-8);
  async function signup(page: Page, name: string) {
    await page.goto('/');
    await page.getByRole('button', { name: 'Partidas y conexión', exact: true }).click();
    await page.getByLabel('Nombre', { exact: true }).fill(name);
    await page.getByLabel('Contraseña', { exact: true }).fill('prueba-123456');
    await page.locator('.online-advanced form button.primary').click();
    await expect(page.getByRole('button', { name: 'Crear partida privada' })).toBeVisible();
  }
  await signup(pa, `Raul${suffix}`);
  await signup(pb, `Ana${suffix}`);
  await pa.getByRole('button', { name: 'Crear partida privada' }).click();
  const code = await pa.locator('.invite-code').innerText();
  await pb.getByLabel('Código de invitación').fill(code);
  await pb.getByRole('button', { name: 'Unirme', exact: true }).click();
  await expect(pa.locator('.invite-banner')).toHaveCount(0, { timeout: 15000 });
  const active = (await pa.locator('.turn').innerText()) === 'Tu turno' ? pa : pb;
  const passive = active === pa ? pb : pa;
  await active.getByRole('button', { name: 'Agencia', exact: true }).click();
  await active.getByRole('button', { name: /Completar mano/ }).click();
  await active.getByRole('button', { name: 'Terminar turno', exact: true }).click();
  await expect(passive.locator('.turn')).toHaveText('Tu turno', { timeout: 15000 });
  await passive.reload();
  await passive.getByRole('button', { name: 'Partidas y conexión', exact: true }).click();
  await expect(passive.locator('.game-row')).toHaveCount(1);
  await passive.locator('.game-row').click();
  await expect(passive.locator('.turn')).toHaveText('Tu turno');
  await a.close();
  await b.close();
});
