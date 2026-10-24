import { test, expect, type Page } from '@playwright/test';
import { applyCommand, choices, createGame, frontier } from '../shared/engine';
import { property } from '../shared/catalog';
import { join } from 'node:path';
import { DEFAULTS } from '../shared/catalog';
// Estas pruebas montan partidas con dos acciones desde el primer turno.
const TWO_ACTIONS = { ...DEFAULTS, openingActions: 2 };

async function clickHex(page: Page, index: number) {
  const polygon = page
    .locator('.city-board [role=button]')
    .nth(index)
    .locator(':scope > g > polygon');
  await polygon.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const box = (await polygon.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test('explorar permite vender; agotar acciones explica el motivo; ayuda visible en móvil', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const state = createGame(2, undefined, 0, TWO_ACTIONS);
  const index = state.tiles.findIndex((t, i) => {
    if (!frontier(state, i) || property(t.id).kind !== 'home') return false;
    const explored = applyCommand(state, 0, { type: 'explore', tile: i });
    return choices(explored).some(
      (c) => c.command.type === 'sell' && c.command.tile === i && c.command.card === undefined,
    );
  });
  expect(index).toBeGreaterThanOrEqual(0);
  await page.addInitScript(
    (s) => localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s)),
    state,
  );
  await page.goto('/');
  await expect(page).toHaveTitle('Barrio en Venta');
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  await expect(page.getByText('Entrenamiento con Clara')).toBeVisible();
  await clickHex(page, index);
  await page.getByRole('button', { name: 'Explorar', exact: true }).click();
  await expect(page.getByText('1 acción restante')).toBeVisible();
  await expect(page.locator('.offer').first()).toBeVisible();
  await page.getByText('¿Por qué conservar un cliente?').click();
  await expect(page.getByText(/cliente de lujo es escaso/)).toBeVisible();
  if (process.env.GAME_QA_DIR)
    await page.screenshot({
      path: join(process.env.GAME_QA_DIR, 'rules-sale-desktop.png'),
      fullPage: true,
    });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Agencia', exact: true }).click();
  await expect(page.getByRole('button', { name: /Completar mano · 1 acción/ })).toBeVisible();
  await page.getByRole('button', { name: /Completar mano/ }).click();
  await page.getByRole('button', { name: 'Partida', exact: true }).click();
  await expect(page.locator('.sale-block')).toContainText(
    'Has gastado tus 2 acciones: Explorar y Robar cartas',
  );
  await expect(page.locator('.offer:enabled')).toHaveCount(0);
  if (process.env.GAME_QA_DIR)
    await page.screenshot({
      path: join(process.env.GAME_QA_DIR, 'rules-block-mobile.png'),
      fullPage: true,
    });
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Reglamento', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cartas de juego' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Barrio y Ayuntamiento' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Ayuntamiento explica coste y mirar plano no descubre la loseta', async ({ page }) => {
  const state = createGame(2, undefined, 0, TWO_ACTIONS);
  state.tiles.find((t) => !t.open)!.open = true;
  const openedName = property(state.tiles.find((t) => t.open && t.id !== 'town')!.id).name;
  const index = state.tiles.findIndex((t) => !t.open && property(t.id).kind === 'home');
  await page.addInitScript(
    (s) => localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s)),
    state,
  );
  await page.goto('/');
  await expect(page.getByRole('button', { name: openedName, exact: true })).toBeVisible();
  const townHex = page.getByRole('button', { name: 'Ayuntamiento', exact: true });
  await townHex.focus();
  await townHex.press('Enter');
  await expect(page.getByText('Un trámite = 1 acción.', { exact: false })).toBeVisible();
  const procedures = page.getByText('Los tres trámites', { exact: true });
  await procedures.focus();
  await procedures.press('Enter');
  await expect(page.getByText(/libera todas tus reservas/)).toBeVisible();
  await clickHex(page, index);
  await page.getByRole('button', { name: 'Consultar el plano', exact: true }).click();
  await expect(page.getByText('PLANO PRIVADO', { exact: true })).toBeVisible();
  await expect(page.locator('.sale-block')).toContainText('Consultar el plano no es explorar');
  await expect(page.getByText('1 acción restante')).toBeVisible();
});

test('la venta funciona como segunda acción después de explorar', async ({ page }) => {
  const state = createGame(2, undefined, 0, TWO_ACTIONS);
  const index = state.tiles.findIndex(
    (t, i) =>
      frontier(state, i) &&
      property(t.id).kind === 'home' &&
      choices(applyCommand(state, 0, { type: 'explore', tile: i })).some(
        (c) => c.command.type === 'sell' && c.command.tile === i && c.command.card === undefined,
      ),
  );
  await page.addInitScript(
    (s) => localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s)),
    state,
  );
  await page.goto('/');
  await expect(page.getByText('Entrenamiento con Clara')).toBeVisible();
  await clickHex(page, index);
  await page.getByRole('button', { name: 'Explorar', exact: true }).click();
  await page.locator('.offer:enabled').first().click();
  await expect(page.getByText('0 acciones restantes')).toBeVisible();
  await expect(page.locator('.property-panel').getByText(/^Vendida por/)).toBeVisible();
  await expect(page.locator('.action-pips')).toContainText('Usadas: Explorar + Vender');
});
