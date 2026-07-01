import { expect, test, type Locator, type Page } from '@playwright/test';

type CardView = {
  locator: Locator;
  id: string;
  kind: string;
  color: string;
  value?: number;
};

type Coverage = {
  drewCard: boolean;
  playedCard: boolean;
  playedAction: boolean;
  choseWildColor: boolean;
  choseTarget: boolean;
  resolvedPendingDraw: boolean;
};

const drawKinds = new Set(['pack-two', 'munchies', 'hotbox-plus-four']);
const colorChoiceKinds = new Set(['strain-switch', 'hotbox-plus-four']);
const targetKinds = new Set(['bogart', 'greener-side']);

async function readCards(page: Page, zone: 'hand' | 'discard'): Promise<CardView[]> {
  const cards = page.locator(`[data-card-zone="${zone}"]`);
  const count = await cards.count();
  const result: CardView[] = [];

  for (let index = 0; index < count; index += 1) {
    const locator = cards.nth(index);
    const id = await locator.getAttribute('data-card-id');
    const kind = await locator.getAttribute('data-card-kind');
    const color = await locator.getAttribute('data-card-color');
    const rawValue = await locator.getAttribute('data-card-value');
    if (!id || !kind || !color) continue;
    result.push({ locator, id, kind, color, value: rawValue === null ? undefined : Number(rawValue) });
  }

  return result;
}

async function currentTurnPage(pages: Page[]): Promise<Page> {
  await expect.poll(async () => {
    const currentIds: string[] = [];
    for (const page of pages) {
      const table = page.locator('.game-table');
      if (await table.count() !== 1) continue;
      const currentId = await table.getAttribute('data-current-player-id');
      if (currentId) currentIds.push(currentId);
    }
    return currentIds.length === pages.length && new Set(currentIds).size === 1;
  }).toBe(true);

  for (const page of pages) {
    const table = page.locator('.game-table');
    if ((await table.getAttribute('data-current-player-id')) === (await table.getAttribute('data-player-id'))) return page;
  }
  throw new Error('No active player page found');
}

async function waitForSynchronizedUpdate(pages: Page[], previousUpdatedAt: string | null): Promise<void> {
  await expect.poll(async () => {
    const states = await Promise.all(pages.map(async page => {
      const table = page.locator('.game-table');
      return {
        currentPlayerId: await table.getAttribute('data-current-player-id'),
        updatedAt: await table.getAttribute('data-updated-at')
      };
    }));
    const updatedValues = states.map(state => state.updatedAt);
    const currentValues = states.map(state => state.currentPlayerId);
    return updatedValues.every(value => value && value !== previousUpdatedAt) &&
      new Set(updatedValues).size === 1 &&
      new Set(currentValues).size === 1;
  }).toBe(true);
}

async function chooseLegalCard(page: Page, coverage: Coverage): Promise<CardView | undefined> {
  const table = page.locator('.game-table');
  const pendingDraw = Number(await table.getAttribute('data-pending-draw'));
  const activeText = await page.locator('.status-row strong').innerText();
  const activeColor = activeText.split(':').at(-1)?.trim();
  const [top] = await readCards(page, 'discard');
  const hand = await readCards(page, 'hand');

  const legal = hand.filter(card => {
    if (pendingDraw > 0) return card.kind === 'tolerance-break' || drawKinds.has(card.kind);
    if (card.color === 'black') return true;
    if (card.color === activeColor) return true;
    if (card.kind === 'number' && top?.kind === 'number' && card.value === top.value) return true;
    return card.kind !== 'number' && card.kind === top?.kind;
  });

  const priority = (card: CardView): number => {
    if (!coverage.choseTarget && targetKinds.has(card.kind)) return 60;
    if (!coverage.choseWildColor && colorChoiceKinds.has(card.kind)) return 50;
    if (!coverage.resolvedPendingDraw && drawKinds.has(card.kind)) return 40;
    if (!coverage.playedAction && card.kind !== 'number') return 30;
    return card.kind === 'number' ? 20 : 10;
  };

  return legal.toSorted((left, right) => priority(right) - priority(left))[0];
}

async function resolveCardPrompt(page: Page, otherPlayerName: string, coverage: Coverage): Promise<void> {
  const colorButtons = page.locator('.wild-picker .color-choice');
  if (await colorButtons.count()) {
    await page.getByRole('button', { name: 'green', exact: true }).click();
    coverage.choseWildColor = true;
    return;
  }

  const targetButton = page.getByRole('button', { name: otherPlayerName, exact: true });
  if (await targetButton.count()) {
    await targetButton.click();
    coverage.choseTarget = true;
  }
}

async function playerScores(page: Page): Promise<Record<string, number>> {
  const pills = page.locator('.player-pill');
  const count = await pills.count();
  const scores: Record<string, number> = {};
  for (let index = 0; index < count; index += 1) {
    const pill = pills.nth(index);
    const playerId = await pill.getAttribute('data-player-id');
    const score = await pill.getAttribute('data-score');
    if (playerId && score) scores[playerId] = Number(score);
  }
  return scores;
}

test('two players can complete multiplayer card flows, scoring, and rematch', async ({ browser }) => {
  test.setTimeout(180_000);
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  const pages = [host, guest];
  const coverage: Coverage = {
    drewCard: false,
    playedCard: false,
    playedAction: false,
    choseWildColor: false,
    choseTarget: false,
    resolvedPendingDraw: false
  };

  await host.goto('./');
  await host.getByLabel('Player name').fill('Host Grower');
  await host.getByLabel('Game mode').selectOption('no-mercy');
  await host.getByRole('button', { name: 'Host Smoke Circle' }).click();

  await expect(host.getByRole('heading', { name: 'Smoke Circle' })).toBeVisible();
  const code = (await host.locator('.session-code').innerText()).trim();
  expect(code).toMatch(/^[A-Z0-9]{6}$/);

  await guest.goto(`./?join=${code}`);
  await guest.getByLabel('Player name').fill('Guest Grower');
  await guest.getByRole('button', { name: 'Join Smoke Circle' }).click();

  await expect(host.getByText('Guest Grower')).toBeVisible();
  await expect(guest.getByText('Host: Host Grower')).toBeVisible();
  await host.getByRole('button', { name: 'Start Game' }).click();
  await expect(host.getByRole('heading', { name: 'Your Hand' })).toBeVisible();
  await expect(guest.getByRole('heading', { name: 'Your Hand' })).toBeVisible();

  let verifiedScorePreservation = false;
  let completedRounds = 0;

  for (let move = 0; move < 450 && completedRounds < 6; move += 1) {
    const winnerVisible = await host.locator('.winner-panel').count();
    if (winnerVisible) {
      completedRounds += 1;
      const scoresBefore = await playerScores(host);
      expect(Math.max(...Object.values(scoresBefore))).toBeGreaterThan(0);
      const currentRound = Number(await host.locator('.game-table').getAttribute('data-round-number'));
      await host.getByRole('button', { name: 'Start Rematch' }).click();
      await expect.poll(async () => Number(await host.locator('.game-table').getAttribute('data-round-number'))).toBe(currentRound + 1);
      const scoresAfter = await playerScores(host);
      expect(scoresAfter).toEqual(scoresBefore);
      verifiedScorePreservation = true;
      if (Object.values(coverage).every(Boolean)) break;
      continue;
    }

    const activePage = await currentTurnPage(pages);
    const otherName = activePage === host ? 'Guest Grower' : 'Host Grower';
    const table = activePage.locator('.game-table');
    const pendingDraw = Number(await table.getAttribute('data-pending-draw'));

    if (!coverage.drewCard) {
      const stash = activePage.locator('button.pile');
      const previousUpdatedAt = await table.getAttribute('data-updated-at');
      await stash.click();
      await waitForSynchronizedUpdate(pages, previousUpdatedAt);
      coverage.drewCard = true;
      continue;
    }

    if (pendingDraw > 0) {
      const legalResponse = await chooseLegalCard(activePage, coverage);
      if (!legalResponse) {
        const previousUpdatedAt = await table.getAttribute('data-updated-at');
        await activePage.locator('button.pile').click();
        await waitForSynchronizedUpdate(pages, previousUpdatedAt);
        coverage.resolvedPendingDraw = true;
        continue;
      }
    }

    const card = await chooseLegalCard(activePage, coverage);
    if (!card) {
      const previousUpdatedAt = await table.getAttribute('data-updated-at');
      await activePage.locator('button.pile').click();
      await waitForSynchronizedUpdate(pages, previousUpdatedAt);
      continue;
    }

    const handCount = await activePage.locator('[data-card-zone="hand"]').count();
    if (handCount === 1) await activePage.getByRole('button', { name: 'THC U Know!' }).click();

    const previousUpdatedAt = await table.getAttribute('data-updated-at');
    await card.locator.click();
    await resolveCardPrompt(activePage, otherName, coverage);
    await waitForSynchronizedUpdate(pages, previousUpdatedAt);
    await expect(activePage.locator(`[data-card-zone="hand"][data-card-id="${card.id}"]`)).toHaveCount(0);
    coverage.playedCard = true;
    if (card.kind !== 'number') coverage.playedAction = true;
  }

  expect(completedRounds).toBeGreaterThan(0);
  expect(verifiedScorePreservation).toBe(true);
  expect(coverage).toEqual({
    drewCard: true,
    playedCard: true,
    playedAction: true,
    choseWildColor: true,
    choseTarget: true,
    resolvedPendingDraw: true
  });

  await hostContext.close();
  await guestContext.close();
});
