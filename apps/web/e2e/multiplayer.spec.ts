import { expect, test } from '@playwright/test';

test('host creates smoke circle and second player joins by code', async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  await host.goto('/');
  await host.getByLabel('Player name').fill('Host Grower');
  await host.getByLabel('Game mode').selectOption('classic');
  await host.getByRole('button', { name: 'Host Smoke Circle' }).click();

  await expect(host.getByRole('heading', { name: 'Smoke Circle' })).toBeVisible();
  const code = (await host.locator('.session-code').innerText()).trim();
  expect(code).toMatch(/^[A-Z0-9]{6}$/);

  await guest.goto(`/?join=${code}`);
  await guest.getByLabel('Player name').fill('Guest Grower');
  await guest.getByRole('button', { name: 'Join Smoke Circle' }).click();

  await expect(host.getByText('Guest Grower')).toBeVisible();
  await expect(guest.getByText('Host Grower')).toBeVisible();

  await host.getByRole('button', { name: 'Start Game' }).click();

  await expect(host.getByRole('heading', { name: 'Your Hand' })).toBeVisible();
  await expect(guest.getByRole('heading', { name: 'Your Hand' })).toBeVisible();

  await hostContext.close();
  await guestContext.close();
});
