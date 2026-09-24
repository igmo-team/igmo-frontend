import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import { lobbyMessage, player } from './fixtures/snapshots';

const ROOM_CODE = 'TEST01';
const PLAYER_ID = 'p1';
const ROOM_SESSION_KEY = `igmo:room-session:${ROOM_CODE}`;

test('로비 마감기한 만료 후 토스트 자동 종료 시 홈으로 이동한다', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const context = await browser.newContext();
  await broker.attach(context);

  const page = await context.newPage();
  const fixedNow = new Date('2026-09-25T00:00:00.000Z');
  await page.clock.install({ time: fixedNow });
  await seedRoomSession(page, {
    roomCode: ROOM_CODE,
    playerId: PLAYER_ID,
    secret: 's1',
  });

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({
      lobbyDeadline: new Date(fixedNow.getTime() + 10_000).toISOString(),
      players: [player('p1'), player('p2', { ready: true })],
    }),
  );

  await page.goto(`/room/${ROOM_CODE}`);

  await expect(
    page.getByText('시간 안에 시작하지 않으면 방이 사라져요'),
  ).toBeVisible();
  await expect(page.locator('time')).toHaveText(/^00:(09|10)$/);

  await page.clock.fastForward(10_000);

  await expect(
    page
      .getByRole('region', { name: /Notifications/ })
      .getByText('입장 시간이 끝났어요'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '시작하기' })).toBeDisabled();
  await page.clock.fastForward(2_400);

  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(() =>
      page.evaluate((key) => sessionStorage.getItem(key), ROOM_SESSION_KEY),
    )
    .toBeNull();

  await context.close();
});
