import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import { lobbyMessage, player, threePlayers } from './fixtures/snapshots';

import type { BrowserContext, Page } from '@playwright/test';

const ROOM_CODE = 'TEST01';
const SESSION_KEY = `igmo:room-session:${ROOM_CODE}`;

type Client = {
  id: 'p1' | 'p2' | 'p3';
  context: BrowserContext;
  page: Page;
};

test('시나리오 2 — 중도 퇴장: 방장 나가기 → 연결 해제 → 남은 유저 로스터·방장 위임 반영', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();

  // ---- 3개 컨텍스트에 하나의 브로커 공유 attach (크로스클라이언트 fan-out) ----
  const ids: Client['id'][] = ['p1', 'p2', 'p3'];
  const clients: Client[] = [];
  for (const id of ids) {
    const context = await browser.newContext();
    await broker.attach(context); // newPage 이전에 attach
    const page = await context.newPage();
    await seedRoomSession(page, {
      roomCode: ROOM_CODE,
      playerId: id,
      secret: `${id}-secret`,
    });
    clients.push({ id, context, page });
  }

  const [A, B, C] = clients; // A=철수(방장), B=영희, C=민수
  const pages = clients.map((client) => client.page);

  // -------------------------------------------------------------------------
  // 1) 사전: 3명 로비 (hostId=p1)
  // -------------------------------------------------------------------------
  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: 'p1' }),
  );
  await Promise.all(pages.map((page) => page.goto(`/room/${ROOM_CODE}`)));

  await test.step('사전: 전원 3명·철수 노출·역할별 버튼', async () => {
    for (const page of pages) {
      await expect(page.getByText('플레이어 3명')).toBeVisible();
      await expect(page.getByText('철수')).toBeVisible();
      await expect(page.getByText('영희')).toBeVisible();
      await expect(page.getByText('민수')).toBeVisible();
    }
    // 방장(A)만 시작 버튼, 게스트(B·C)는 준비 버튼.
    await expect(A.page.getByRole('button', { name: '시작하기' })).toBeVisible();
    await expect(
      B.page.getByRole('button', { name: '준비하기' }),
    ).toBeVisible();
    await expect(
      C.page.getByRole('button', { name: '준비하기' }),
    ).toBeVisible();
    expect(broker.connections().sort()).toEqual(['p1', 'p2', 'p3']);
  });

  // -------------------------------------------------------------------------
  // 2) 퇴장: A(철수) 나가기 클릭 → 홈 이동 + 세션 삭제 + 방 UI 제거
  // -------------------------------------------------------------------------
  await test.step('퇴장: A 홈 이동·세션 삭제·방 UI 제거', async () => {
    // 나가기 전에는 세션이 남아 있음.
    expect(
      await A.page.evaluate((key) => window.sessionStorage.getItem(key), SESSION_KEY),
    ).not.toBeNull();

    await A.page.getByRole('button', { name: '나가기' }).click();

    // 홈으로 이동, 방 UI 사라짐.
    await expect(A.page).toHaveURL(/\/$/);
    await expect(
      A.page.getByRole('button', { name: '새 방 만들기' }),
    ).toBeVisible();
    await expect(A.page.getByText('플레이어 3명')).toHaveCount(0);
    await expect(A.page.getByRole('button', { name: '나가기' })).toHaveCount(0);

    // sessionStorage에서 방 세션 제거됨.
    expect(
      await A.page.evaluate((key) => window.sessionStorage.getItem(key), SESSION_KEY),
    ).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 3) 브로커 감지: A의 WS close → 연결 3→2 (p1 사라짐)
  // -------------------------------------------------------------------------
  await test.step('브로커 감지: 연결 3→2', async () => {
    await expect
      .poll(() => broker.connections().sort())
      .toEqual(['p2', 'p3']);
  });

  // -------------------------------------------------------------------------
  // 4) 반영: 남은 로스터[영희,민수] fan-out → B·C 2명, 철수 사라짐
  // -------------------------------------------------------------------------
  await test.step('반영: 남은 유저에 2명 로스터 반영', async () => {
    // 방장이 나갔지만 아직 위임 전(hostId=p1 잔존) 로스터.
    broker.pushTopic(
      ROOM_CODE,
      lobbyMessage({ players: [player('p2'), player('p3')], hostId: 'p1' }),
    );

    for (const guest of [B, C]) {
      await expect(guest.page.getByText('플레이어 2명')).toBeVisible();
      await expect(guest.page.getByText('플레이어 3명')).toHaveCount(0);
      await expect(guest.page.getByText('철수')).toHaveCount(0);
      await expect(guest.page.getByText('영희')).toBeVisible();
      await expect(guest.page.getByText('민수')).toBeVisible();
    }
    // 아직 방장이 없으므로(hostId=p1 부재) 둘 다 준비 버튼 유지, 시작 버튼 없음.
    await expect(B.page.getByRole('button', { name: '시작하기' })).toHaveCount(0);
    await expect(C.page.getByRole('button', { name: '시작하기' })).toHaveCount(0);
  });

  // -------------------------------------------------------------------------
  // 5) 방장 위임: hostId=영희(p2) → 영희 시작 버튼, 민수 준비 버튼 유지
  // -------------------------------------------------------------------------
  await test.step('방장 위임: 영희에게 시작 버튼 노출', async () => {
    broker.pushTopic(
      ROOM_CODE,
      lobbyMessage({ players: [player('p2'), player('p3')], hostId: 'p2' }),
    );

    // 영희(B): 방장 → 시작 버튼 노출, 준비 버튼 사라짐.
    await expect(B.page.getByRole('button', { name: '시작하기' })).toBeVisible();
    await expect(B.page.getByRole('button', { name: '준비하기' })).toHaveCount(0);

    // 민수(C): 여전히 게스트 → 준비 버튼 유지, 시작 버튼 없음.
    await expect(C.page.getByRole('button', { name: '준비하기' })).toBeVisible();
    await expect(C.page.getByRole('button', { name: '시작하기' })).toHaveCount(0);

    // 여전히 2명, 철수 없음(스테일 '3명' 없음).
    for (const guest of [B, C]) {
      await expect(guest.page.getByText('플레이어 2명')).toBeVisible();
      await expect(guest.page.getByText('철수')).toHaveCount(0);
    }
  });

  await Promise.all(clients.map((client) => client.context.close()));
});
