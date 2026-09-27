import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import {
  lobbyExpiredMessage,
  lobbyMessage,
  player,
} from './fixtures/snapshots';

const ROOM_CODE = 'TEST01';
const PLAYER_ID = 'p1';
const ROOM_SESSION_KEY = `igmo:room-session:${ROOM_CODE}`;

test('서버가 로비 만료 이벤트를 보내면 토스트 표시 후 홈으로 이동한다', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const context = await browser.newContext();
  await broker.attach(context);

  const page = await context.newPage();
  await seedRoomSession(page, {
    roomCode: ROOM_CODE,
    playerId: PLAYER_ID,
    secret: 's1',
  });

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({
      players: [player('p1'), player('p2', { ready: true })],
    }),
  );

  await page.goto(`/room/${ROOM_CODE}`);

  await expect(
    page.getByText('시간 안에 시작하지 않으면 방이 사라져요'),
  ).toBeVisible();

  broker.pushTopic(ROOM_CODE, lobbyExpiredMessage(ROOM_CODE));

  await expect(
    page
      .getByRole('region', { name: /Notifications/ })
      .getByText('입장 시간이 끝났어요'),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect
    .poll(() =>
      page.evaluate((key) => sessionStorage.getItem(key), ROOM_SESSION_KEY),
    )
    .toBeNull();

  await context.close();
});

test('다른 방의 로비 만료 이벤트는 현재 방을 종료하지 않는다', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const context = await browser.newContext();
  await broker.attach(context);

  const page = await context.newPage();
  await seedRoomSession(page, {
    roomCode: ROOM_CODE,
    playerId: PLAYER_ID,
    secret: 's1',
  });

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({
      players: [player('p1'), player('p2', { ready: true })],
    }),
  );

  await page.goto(`/room/${ROOM_CODE}`);

  await expect(
    page.getByText('시간 안에 시작하지 않으면 방이 사라져요'),
  ).toBeVisible();

  broker.pushTopic(ROOM_CODE, lobbyExpiredMessage('OTHER1'));

  await expect(
    page.getByText('시간 안에 시작하지 않으면 방이 사라져요'),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/room/${ROOM_CODE}`));
  await expect(
    page
      .getByRole('region', { name: /Notifications/ })
      .getByText('입장 시간이 끝났어요'),
  ).not.toBeVisible();

  await context.close();
});
