import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import { lobbyMessage, player } from './fixtures/snapshots';

/**
 * Task 1 게이트(스모크):
 * 1컨텍스트 → sessionStorage seed → /rooms/TEST01 → 브로커가 SUBSCRIBE에
 * LOBBY_SNAPSHOT(players 2명)을 replay → 로비 렌더 + 연결됨.
 */
test('스모크: 구독 시 LOBBY_SNAPSHOT replay로 로비가 연결 상태로 렌더된다', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const context = await browser.newContext();
  await broker.attach(context);

  // 연결 전에 현재 topic 스냅샷을 저장해두면 SUBSCRIBE 때 즉시 replay된다.
  broker.pushTopic(
    'TEST01',
    lobbyMessage({ players: [player('p1'), player('p2')] }),
  );

  const page = await context.newPage();
  await seedRoomSession(page, {
    roomCode: 'TEST01',
    playerId: 'p1',
    secret: 's1',
  });

  await page.goto('/room/TEST01');

  // 로비에 인원수가 보이고,
  await expect(page.getByText('플레이어 2명')).toBeVisible();
  // 소켓이 연결됐으므로 끊김 문구는 없어야 한다.
  await expect(
    page.getByText('실시간 연결을 확인하고 있어요'),
  ).toHaveCount(0);
  // 브로커도 p1 연결을 인지한다.
  expect(broker.connections()).toContain('p1');

  await context.close();
});
