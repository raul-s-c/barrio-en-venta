import { test, expect } from '@playwright/test';
import { applyExpeditionCommand, createExpedition, EXPEDITION_CARDS } from '../shared/expedition';

test('Campaña descubre zonas, persiste la partida y ejecuta el simulador', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Campaña', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'La ciudad por conquistar' })).toBeVisible();
  await expect(page.locator('.expedition-map [role="button"]')).toHaveCount(91);
  await page.locator('.expedition-map [role="button"]').first().click();
  await expect(page.locator('.expedition-turn')).toContainText('Zona 1 · 10/91 casillas');
  await page.reload();
  await page.getByRole('button', { name: 'Campaña', exact: true }).click();
  await expect(page.locator('.expedition-turn')).toContainText('Zona 1 · 10/91 casillas');
  await page.getByRole('button', { name: 'Simular 100 partidas' }).click();
  await expect(page.locator('.expedition-metrics')).toContainText('duración estimada', {
    timeout: 20000,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Inspección urbana deja elegir la casilla en el mapa y no gasta la acción', async ({
  page,
}) => {
  let game = createExpedition(84, ['Tú', 'Rival'], 0);
  game = applyExpeditionCommand(game, 0, { type: 'zone', tile: 45 });
  const seat = game.active;
  const scout = EXPEDITION_CARDS.findIndex((card) => card.effect === 'scout');
  const deckIndex = game.cardDeck.findIndex((id) => id % EXPEDITION_CARDS.length === scout);
  [game.players[seat].cards[0], game.cardDeck[deckIndex]] = [
    game.cardDeck[deckIndex],
    game.players[seat].cards[0],
  ];
  await page.addInitScript(
    (saved) => localStorage.setItem('expedition-game', saved),
    JSON.stringify(game),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Campaña', exact: true }).click();
  await expect(page.locator('.expedition-turn')).toContainText('10/91 casillas');
  await page.getByRole('button', { name: 'Elegir casilla · gratis' }).first().click();
  await expect(page.locator('.expedition-feedback')).toContainText('toca una casilla oculta');
  const tile = page.locator('.expedition-map [role="button"]').first();
  await expect(tile).toHaveAttribute('aria-label', 'Casilla oculta');
  await tile.click();
  await expect(page.locator('.expedition-turn')).toContainText('12/91 casillas');
  await expect(tile).not.toHaveAttribute('aria-label', 'Casilla oculta');
  await expect(page.locator('.expedition-turn')).toContainText(
    `Turno de ${game.players[seat].name}`,
  );
});
