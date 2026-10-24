import { test, expect } from '@playwright/test';
import { join } from 'node:path';
import { createGame, choices, applyCommand } from '../shared/engine';
import { CARDS, CLIENTS, RULES_VERSION, property } from '../shared/catalog';
import { DEFAULTS } from '../shared/catalog';
// Estas pruebas montan partidas con dos acciones desde el primer turno.
const TWO_ACTIONS = { ...DEFAULTS, openingActions: 2 };

test('modelos y colores propios, mano permanente y tamaño móvil', async ({ page }) => {
  const state = createGame(2, undefined, 0, TWO_ACTIONS);
  state.tiles.forEach((t) => {
    t.open = true;
    t.cleared = true;
  });
  await page.addInitScript(
    (s) => localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s)),
    state,
  );
  await page.setViewportSize({ width: 1440, height: 1100 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.hand-client')).toHaveCount(5);
  const hospital = state.tiles.findIndex((t) => property(t.id).name === 'Hospital');
  const works = state.tiles.findIndex((t) => property(t.id).name === 'Obras');
  const hospitalHex = page.locator('.hex').nth(hospital);
  await expect(hospitalHex.locator(':scope > g > polygon')).toHaveAttribute('fill', '#fbd9e8');
  await expect(page.locator('.hex').nth(works).locator(':scope > g > polygon')).toHaveAttribute(
    'fill',
    '#ffd4d1',
  );
  await hospitalHex.focus();
  await hospitalHex.press('Enter');
  await expect(page.locator('.tile-effect')).toContainText('Hospital');
  expect(
    await page.evaluate(async () => {
      const img = new Image();
      img.src = '/art/city-atlas-v2.png';
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    }),
  ).toEqual([1254, 1254]);
  await page.evaluate(() => scrollTo(0, 0));
  if (process.env.GAME_QA_DIR)
    await page.screenshot({ path: join(process.env.GAME_QA_DIR, 'v02-city-desktop.png') });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('.tile-effect').scrollIntoViewIfNeeded();
    const hand = await page.locator('.client-hand').boundingBox();
    expect(hand!.y).toBeGreaterThanOrEqual(0);
    expect(hand!.y + hand!.height).toBeLessThan(844);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page.locator('.hand-client').evaluateAll((cards) =>
        cards.every((card) => {
          const r = card.getBoundingClientRect();
          return [...card.children].every((child) => {
            const c = child.getBoundingClientRect();
            return c.bottom <= r.bottom + 1 && c.right <= r.right + 1;
          });
        }),
      ),
    ).toBe(true);
    if (width === 390 && process.env.GAME_QA_DIR)
      await page.screenshot({ path: join(process.env.GAME_QA_DIR, 'v02-city-mobile.png') });
  }
  expect(errors).toEqual([]);
});

test('conserva la partida antigua en archivo y no la interpreta con reglas nuevas', async ({
  page,
}) => {
  const legacy = { ...createGame(99), version: 'digital-0.1.0' };
  await page.addInitScript((s) => {
    if (!localStorage.getItem('fixture-set')) {
      localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s));
      localStorage.setItem('fixture-set', 'yes');
    }
  }, legacy);
  await page.goto('/');
  await expect(page.locator('.hand-client')).toHaveCount(5);
  const stored = await page.evaluate(() => ({
    archive: JSON.parse(localStorage.getItem('CapacitorStorage.archive-digital-0.1.0')!),
    current: JSON.parse(localStorage.getItem('CapacitorStorage.local-game')!),
  }));
  expect(stored.archive).toEqual(legacy);
  expect(stored.current.version).toBe(RULES_VERSION);
  await page.reload();
  await expect(page.locator('.hand-client')).toHaveCount(5);
});

test('las cartas tácticas y la elección de cliente funcionan después de dos acciones', async ({
  page,
}) => {
  let state = createGame(2, undefined, 0, TWO_ACTIONS);
  const frontier = choices(state).find((c) => c.command.type === 'explore')!;
  state = applyCommand(state, 0, frontier.command);
  state = applyCommand(state, 0, choices(state).find((c) => c.command.type === 'explore')!.command);
  const clientCard = state.cardDeck.find((id) => id === 2)!;
  state.players[0].cards = [clientCard];
  state.players[1].cards = state.players[1].cards.filter((c) => c !== clientCard);
  state.cardDeck = state.cardDeck.filter((c) => c !== clientCard);
  await page.addInitScript(
    (s) => localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s)),
    state,
  );
  await page.goto('/');
  await expect(page.getByText('0 acciones restantes')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Cartas de juego en tu mano' })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar gratis' }).click();
  await expect(page.locator('.hand-client')).toHaveCount(6);
  await expect(
    page.getByText('Carta jugada gratis. No consume acciones: 0 de 2 disponibles.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Agencia', exact: true }).click();
  await expect(
    page.getByText('Ya jugaste una carta este turno. Al gastarla robas otra.').first(),
  ).toBeVisible();
  await expect(page.getByText('0 acciones restantes')).toBeVisible();
});

test('prepara la carta de +3 desde las ofertas sin gastar acción', async ({ page }) => {
  const state = createGame(14, undefined, 0, TWO_ACTIONS);
  const houseIndex = state.tiles.findIndex((tile) => property(tile.id).kind === 'home');
  [state.tiles[18], state.tiles[houseIndex]] = [state.tiles[houseIndex], state.tiles[18]];
  for (const tile of state.tiles) {
    tile.open = true;
    tile.cleared = true;
    delete tile.owner;
    delete tile.sold;
  }
  const category = property(state.tiles[18].id).category!;
  const buyer = state.players[0].clients.find((id) => CLIENTS[id].accepts.includes(category))!;
  state.players[0].clients = [buyer];
  const bonus = CARDS.find((card) => card.effect === 'saleBonus')!.id;
  state.players[0].cards = [bonus];
  state.players[1].cards = state.players[1].cards.filter((id) => id !== bonus);
  state.cardDeck = state.cardDeck.filter((id) => id !== bonus);
  state.cardDiscard = state.cardDiscard.filter((id) => id !== bonus);
  state.used = ['explore'];
  await page.addInitScript(
    (s) => localStorage.setItem('CapacitorStorage.local-game', JSON.stringify(s)),
    state,
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Preparar \+3 para la próxima venta/ }).click();
  await expect(page.locator('.sale-controls .armed').first()).toContainText('Próxima venta +3');
  await expect(page.getByText('1 acción restante')).toBeVisible();
  await expect(page.locator('.sale-option').first()).toBeVisible();
  await expect(page.getByText('1 acción restante')).toBeVisible();
});
