import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import { lobbyMessage, player, threePlayers } from './fixtures/snapshots';

const ROOM_CODE = 'TEST01';

// 견고성 — 잘못된 메시지/알 수 없는 type이 화면을 깨뜨리지 않는다.
// union 파서(JSON.parse 실패/미지 type/shape 불일치 → null로 무시)를 직접 겨냥한다.
test('견고성 — 잘못된 JSON·미지 type·잘못된 shape 프레임을 무시하고 화면 유지', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const context = await browser.newContext();
  await broker.attach(context);
  const page = await context.newPage();

  // 페이지에서 던져진 미처리 예외를 수집(파서가 throw하면 여기 잡힘).
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await seedRoomSession(page, {
    roomCode: ROOM_CODE,
    playerId: 'p1',
    secret: 'p1-secret',
  });

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: 'p1' }),
  );
  await page.goto(`/room/${ROOM_CODE}`);
  await expect(page.getByText('플레이어 3명')).toBeVisible();

  await test.step('잘못된/미지 프레임을 연달아 던져도 로비 화면 유지', async () => {
    // 1) 파싱 불가한 잘못된 JSON
    broker.pushRawTopic(ROOM_CODE, '{ this is not valid json }}}');
    // 2) 알 수 없는 type
    broker.pushTopic(ROOM_CODE, {
      type: 'BOGUS_SNAPSHOT',
      payload: { foo: 'bar' },
    });
    // 3) 유효한 type이지만 payload shape가 틀림(가드가 걸러야 함)
    broker.pushTopic(ROOM_CODE, { type: 'VOTE_SNAPSHOT', payload: {} });

    // 여전히 로비 3명이 보이고, 다른 화면으로 깨져 넘어가지 않았다.
    await expect(page.getByText('플레이어 3명')).toBeVisible();
    await expect(page.getByRole('heading', { name: '투표' })).toHaveCount(0);
    await expect(page.getByText('방 정보를 불러오는 중이에요.')).toHaveCount(0);
  });

  await test.step('이후 정상 프레임은 여전히 반영됨(소켓이 막히지 않음)', async () => {
    // 쓰레기 프레임이 연결/파서를 망가뜨렸다면 이 정상 갱신이 반영되지 않는다.
    broker.pushTopic(
      ROOM_CODE,
      lobbyMessage({
        players: [player('p1'), player('p2')],
        hostId: 'p1',
      }),
    );
    await expect(page.getByText('플레이어 2명')).toBeVisible();
  });

  // 잘못된 프레임 처리 중 미처리 예외가 없었어야 한다.
  expect(pageErrors).toEqual([]);

  await context.close();
});
