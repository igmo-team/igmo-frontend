import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import {
  lobbyMessage,
  player,
  roundMessage,
  roundResultMessage,
  threePlayers,
  voteSkippedMessage,
} from './fixtures/snapshots';

import type { BrowserContext, Page } from '@playwright/test';

const ROOM_CODE = 'TEST01';

type Client = {
  id: 'p1' | 'p2' | 'p3';
  context: BrowserContext;
  page: Page;
};

test('VOTE_SKIPPED 스냅샷 수신 시 투표 생략 화면을 거쳐 결과로 이동', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const clients: Client[] = [];

  for (const id of ['p1', 'p2', 'p3'] as const) {
    const context = await browser.newContext();
    await broker.attach(context);
    const page = await context.newPage();
    await seedRoomSession(page, {
      roomCode: ROOM_CODE,
      playerId: id,
      secret: `${id}-secret`,
    });
    await seedCountdownPlayed(page);
    clients.push({ id, context, page });
  }

  const questioner = clients[0];
  const pages = clients.map((client) => client.page);

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: questioner.id }),
  );
  await Promise.all(pages.map((page) => page.goto(`/room/${ROOM_CODE}`)));

  broker.pushTopic(
    ROOM_CODE,
    roundMessage({
      roundNumber: 1,
      questioner: player(questioner.id),
      imageUrl: 'https://example.test/p1.png',
      guessEntries: clients.slice(1).map((client) => ({
        player: player(client.id),
        submitted: true,
      })),
    }),
  );

  for (const page of pages) {
    await expect.poll(() => completedAvatarCount(page)).toBe(2);
  }

  // 서버가 ALL_PERFECT 판정을 완료한 신호이므로, 프론트는 스냅샷 수신 후 화면만 전환한다.
  broker.pushTopic(
    ROOM_CODE,
    voteSkippedMessage({
      roundNumber: 1,
      deadline: new Date(Date.now() + 3_000).toISOString(),
    }),
  );

  await test.step('전원 완벽 정답 후 투표 생략 화면 표시', async () => {
    for (const page of pages) {
      await expect(
        page.getByRole('heading', { name: '투표 생략' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', {
          name: /모두가 정답을 맞혀서.*투표 단계를 생략해요/,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: '투표 확정' }),
      ).toHaveCount(0);
      await expect(page.getByLabel(/남은 시간 [1-3]초/)).toBeVisible();
      await expect(
        page.getByRole('heading', { name: '진짜 프롬프트는? 🤔' }),
      ).toHaveCount(0);
    }
  });

  broker.pushTopic(
    ROOM_CODE,
    roundResultMessage({ roundNumber: 1, voteSkippedReason: 'ALL_PERFECT' }),
  );

  for (const page of pages) {
    await expect(
      page.getByRole('heading', { name: '결과', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('결과 공개')).toBeVisible();
  }

  await Promise.all(clients.map((client) => client.context.close()));
});

async function seedCountdownPlayed(page: Page): Promise<void> {
  await page.addInitScript((roomCode: string) => {
    window.sessionStorage.setItem(
      `igmo:room-countdown-played:${roomCode}`,
      'true',
    );
  }, ROOM_CODE);
}

function completedAvatarCount(page: Page): Promise<number> {
  return page
    .locator('ul[aria-label="게임 참가자 목록"] [aria-label*="준비 완료"]')
    .count();
}
