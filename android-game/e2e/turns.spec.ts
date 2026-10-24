import { test, expect, type Page } from '@playwright/test';

// Dos navegadores aislados hacen de dos móviles. navigator.share se sustituye por una
// función que guarda el enlace, como si se hubiera enviado por WhatsApp.
async function phone(browser: import('@playwright/test').Browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    (navigator as Navigator & { share: unknown }).share = async (data: ShareData) => {
      (window as unknown as { sharedUrl: string }).sharedUrl = data.url!;
    };
  });
  const page = await context.newPage();
  page.on('dialog', (dialog) => void dialog.accept());
  return page;
}
async function sendTurn(page: Page, to: string) {
  await page.getByRole('button', { name: `Enviar a ${to}` }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { sharedUrl?: string }).sharedUrl))
    .toContain('#turno=');
  const url = await page.evaluate(() => (window as unknown as { sharedUrl: string }).sharedUrl);
  await page.evaluate(() => delete (window as unknown as { sharedUrl?: string }).sharedUrl);
  return url;
}
async function endTurn(page: Page) {
  await page.getByRole('button', { name: 'Terminar turno', exact: true }).click();
}

test('dos móviles juegan por turnos con enlaces, sin servidor', async ({ browser }) => {
  const raul = await phone(browser);
  const ana = await phone(browser);
  await raul.goto('/');
  await raul.getByRole('button', { name: 'Partidas y conexión', exact: true }).click();
  await raul.getByLabel('Tu nombre').fill('Raúl');
  await raul.getByLabel('Con quién juegas').fill('Ana');
  await raul.getByRole('button', { name: /Nueva partida por turnos/ }).click();
  await expect(raul.locator('.mode-link')).toContainText('Por turnos con Ana');

  // Si empieza Raúl, juega su turno antes de enviar; si empieza Ana, envía la invitación.
  if (await raul.getByRole('button', { name: 'Terminar turno', exact: true }).isEnabled())
    await endTurn(raul);
  const invite = await sendTurn(raul, 'Ana');

  await ana.goto(invite);
  await expect(ana.locator('.mode-link')).toContainText('Por turnos con Raúl');
  await expect(ana.locator('.turn')).toHaveText('Tu turno');
  await endTurn(ana);
  const reply = await sendTurn(ana, 'Raúl');

  await raul.goto(reply);
  await expect(raul.locator('.notice')).toContainText('Ana ha jugado');
  await expect(raul.locator('.turn')).toHaveText('Tu turno');

  // Reabrir un enlace ya aplicado no duplica jugadas.
  await raul.goto(reply);
  await expect(raul.locator('.notice')).toContainText('ya estaba aplicado');
  await raul.getByRole('button', { name: 'Partidas y conexión', exact: true }).click();
  await expect(raul.locator('.turn-row')).toHaveCount(1);
  await expect(raul.locator('.turn-row')).toContainText('Te toca');
  expect(await raul.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
