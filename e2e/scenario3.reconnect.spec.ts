import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import { lobbyMessage, threePlayers, voteMessage } from './fixtures/snapshots';

import type { OwnVoteOptionNotice } from '../src/domain/room/types';
import type { Browser, BrowserContext, Page } from '@playwright/test';

const ROOM_CODE = 'TEST01';

type Client = {
  id: 'p1' | 'p2' | 'p3';
  context: BrowserContext;
  page: Page;
};

/** 카운트다운 오버레이(3초, 세션스토리지 플래그)를 건너뛰어 게임 뷰를 즉시 렌더. */
async function seedCountdownPlayed(page: Page): Promise<void> {
  await page.addInitScript((roomCode: string) => {
    try {
      window.sessionStorage.setItem(
        `igmo:room-countdown-played:${roomCode}`,
        'true',
      );
    } catch {
      // 무시.
    }
  }, ROOM_CODE);
}

async function setupClients(browser: Browser, broker: FakeStompBroker) {
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
    await seedCountdownPlayed(page);
    clients.push({ id, context, page });
  }
  return clients;
}

// ===========================================================================
// 시나리오 3 (핵심) — VOTING 중 끊김 → 재접속 → 프레임 하나로 뷰 완전 재구성
// ===========================================================================
test('시나리오 3 — 연결 끊김→재접속: VOTING phase가 room-state 응답으로 정확히 복원(서버 진실 무손실)', async ({
  browser,
}) => {
  test.slow(); // 실제 reconnectDelay(5s) 재연결 대기를 포함하므로 타임아웃 여유.
  const broker = new FakeStompBroker();
  const clients = await setupClients(browser, broker);
  const [A, B, C] = clients; // A=철수(투표자), B=영희(투표자), C=민수(출제자)
  const pages = clients.map((client) => client.page);

  // 투표 옵션: o1=고양이, o2=강아지. 투표자 2명(A,B), 출제자 1명(C) → totalVoteCount=2.
  // 후보 3개: 철수(o1)·영희(o2) 추측 + 정답(o3, 출제자 민수). 투표자 2명(철수·영희).
  const voteOptions = [
    { optionId: 'o1', text: '고양이' }, // 철수(p1) 추측
    { optionId: 'o2', text: '강아지' }, // 영희(p2) 추측
    { optionId: 'o3', text: '노란 병아리' }, // 정답(출제자 민수 p3)
  ];

  // -------------------------------------------------------------------------
  // 1) 사전: 로비 진입으로 방 스냅샷(receivedSnapshot) 확보 후 VOTING 전환.
  //    (RoomPage는 LOBBY_SNAPSHOT로 setReceivedSnapshot이 되어야 로딩 화면을 벗어남.
  //     이 roster 상태는 React state로 재접속 후에도 유지된다.)
  // -------------------------------------------------------------------------
  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: 'p3' }),
  );
  await Promise.all(pages.map((page) => page.goto(`/room/${ROOM_CODE}`)));

  // 연결 성립 대기(브로커가 3연결 인지) + 로비 렌더 확인.
  await expect.poll(() => broker.connections().sort()).toEqual(['p1', 'p2', 'p3']);
  for (const page of pages) {
    await expect(page.getByText('플레이어 3명')).toBeVisible();
  }

  // VOTING phase로 전환(이후 이 스냅샷이 재접속 replay 대상이 된다).
  broker.pushTopic(
    ROOM_CODE,
    voteMessage({
      roundNumber: 1,
      voteOptions,
      completedVoteCount: 0,
      totalVoteCount: 2,
    }),
  );

  // 각자 투표 권한 공지(개인 큐) — 이게 있어야 VOTING 뷰가 활성.
  const noticeA: OwnVoteOptionNotice = {
    roomCode: ROOM_CODE,
    roundNumber: 1,
    ownImage: false,
    voteAllowed: true,
    voteDisabledReason: null,
    optionId: 'o1', // A의 답 = 고양이(내 답) → A는 강아지에 투표.
  };
  const noticeB: OwnVoteOptionNotice = {
    roomCode: ROOM_CODE,
    roundNumber: 1,
    ownImage: false,
    voteAllowed: true,
    voteDisabledReason: null,
    optionId: 'o2',
  };
  const noticeC: OwnVoteOptionNotice = {
    roomCode: ROOM_CODE,
    roundNumber: 1,
    ownImage: true,
    voteAllowed: false,
    voteDisabledReason: 'QUESTIONER',
    optionId: null,
  };
  broker.pushUserQueue('p1', '/user/queue/vote-own-option', noticeA);
  broker.pushUserQueue('p2', '/user/queue/vote-own-option', noticeB);
  broker.pushUserQueue('p3', '/user/queue/vote-own-option', noticeC);

  await test.step('사전: 전원 투표 phase·진행도 0', async () => {
    for (const page of pages) {
      await expect(page.getByRole('heading', { name: '투표' })).toBeVisible();
      await expect(page.getByLabel('투표 현황 2명 중 0명 완료')).toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // 2) A 투표 완료 (o2 강아지) → 서버 진실 completedVoteCount=1
  // -------------------------------------------------------------------------
  await test.step('A 투표 완료 → completedVoteCount=1', async () => {
    await A.page.getByRole('button', { name: /강아지/ }).click();
    await A.page.getByRole('button', { name: '투표 확정' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p1')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/votes`),
      )
      .toBe(true);
    expect(
      broker.inbox('p1').find((f) => f.destination.endsWith('/votes'))?.body,
    ).toContain('"optionId":"o2"');

    // 브로커가 A 표를 반영한 스냅샷 fan-out(= 재접속 시 replay될 현재 진실).
    broker.pushTopic(
      ROOM_CODE,
      voteMessage({
        roundNumber: 1,
        voteOptions,
        completedVoteCount: 1,
        totalVoteCount: 2,
      }),
    );

    // A: 투표 완료 상태, 진행도 1.
    await expect(
      A.page.getByRole('button', { name: '투표 완료' }),
    ).toBeVisible();
    await expect(A.page.getByLabel('투표 현황 2명 중 1명 완료')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 3) 끊김: broker.close(p1) → A만 끊김(제출 컨트롤 비활성). B·C 무영향.
  //    재연결 시 topic replay가 아닌 room-state 응답을 검증하기 위해 replay를 끈다.
  // -------------------------------------------------------------------------
  await test.step('끊김: A 제출 컨트롤 비활성, B·C 무영향', async () => {
    broker.setTopicReplayEnabled(false);
    broker.close('p1', { blockReconnect: true });

    // A: 끊김의 관찰 가능한 결과 — 확정 버튼이 '투표 완료'→'투표 확정'으로 되돌아가고 비활성.
    await expect(
      A.page.getByRole('button', { name: '투표 완료' }),
    ).toHaveCount(0);
    await expect(
      A.page.getByRole('button', { name: '투표 확정' }),
    ).toBeDisabled();

    // 브로커도 p1 연결 해제 인지(재접속 차단 중이라 안정적으로 끊김 유지).
    await expect.poll(() => broker.connections().sort()).toEqual(['p2', 'p3']);

    // B·C: 영향 없음 — 현재 투표 상태/진행도 유지.
    for (const page of [B.page, C.page]) {
      await expect(page.getByRole('heading', { name: '투표' })).toBeVisible();
      await expect(page.getByLabel('투표 현황 2명 중 1명 완료')).toBeVisible();
    }
    // B는 여전히 연결됨 — 옵션 선택 시 확정 버튼이 활성(활성화 조건에 isSocketConnected 포함).
    await B.page.getByRole('button', { name: /고양이/ }).click();
    await expect(
      B.page.getByRole('button', { name: '투표 확정' }),
    ).toBeEnabled();
  });

  // -------------------------------------------------------------------------
  // 4) 재접속: visible 복귀 → sync 요청 → room-state 응답으로 뷰 완전 재구성
  // -------------------------------------------------------------------------
  await test.step('재접속: phase 투표로 정확 복원 + 서버 진실 무손실', async () => {
    broker.allowReconnect('p1'); // 다음 재연결 시도가 성공.

    await A.page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // visible 복귀 재연결은 reconnectDelay(5s)를 기다리지 않고 빠르게 성공해야 한다.
    await expect
      .poll(() => broker.connections().sort(), { timeout: 3_000 })
      .toEqual(['p1', 'p2', 'p3']);

    await expect
      .poll(() =>
        broker
          .inbox('p1')
          .some(
            (frame) =>
              frame.destination === `/app/rooms/${ROOM_CODE}/sync`,
          ),
      )
      .toBe(true);

    // A: phase가 LOBBY로 리셋되지 않고 '투표'로 정확 복원.
    await expect(A.page.getByRole('heading', { name: '투표' })).toBeVisible();
    // 로비로 리셋되지 않았음(로비 전용 문구/인원수 없음).
    await expect(A.page.getByText(/^플레이어 \d+명$/)).toHaveCount(0);

    // 서버 진실(A 표 포함 completedVoteCount=1) 무손실 복원.
    await expect(A.page.getByLabel('투표 현황 2명 중 1명 완료')).toBeVisible();
    // 투표 선택지도 그대로 복원(개인큐 공지 상태 유지 → 로딩중 아님).
    await expect(A.page.getByText('강아지')).toBeVisible();
    await expect(
      A.page.getByText('투표 정보를 불러오는 중이에요.'),
    ).toHaveCount(0);

    // 재연결됨(isConnected=true) → 확정 버튼 재활성.
    await expect(
      A.page.getByRole('button', { name: '투표 확정' }),
    ).toBeEnabled();
  });

  await Promise.all(clients.map((client) => client.context.close()));
});

// ===========================================================================
// 시나리오 3 (추가) — 로비에서 끊김 UI → 재접속 복원
// ===========================================================================
test('시나리오 3 — 로비 끊김 UI: 실시간 연결 문구 + 시작 버튼 비활성 → 재접속 복원', async ({
  browser,
}) => {
  test.slow(); // 실제 reconnectDelay(5s) 재연결 대기를 포함하므로 타임아웃 여유.
  const broker = new FakeStompBroker();
  const clients = await setupClients(browser, broker);
  const [A, B, C] = clients; // A=철수(방장)
  const pages = clients.map((client) => client.page);

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: 'p1' }),
  );
  await Promise.all(pages.map((page) => page.goto(`/room/${ROOM_CODE}`)));

  await test.step('사전: 전원 로비 연결됨', async () => {
    for (const page of pages) {
      await expect(page.getByText('플레이어 3명')).toBeVisible();
      await expect(
        page.getByText('실시간 연결을 확인하고 있어요'),
      ).toHaveCount(0);
    }
    await expect.poll(() => broker.connections().sort()).toEqual([
      'p1',
      'p2',
      'p3',
    ]);
  });

  await test.step('끊김: A 로비 끊김 UI + 시작 비활성, B·C 무영향', async () => {
    broker.close('p1', { blockReconnect: true });

    // A(방장): 끊김 안내 문구 + 시작 버튼 비활성.
    await expect(
      A.page.getByText('실시간 연결을 확인하고 있어요'),
    ).toBeVisible();
    await expect(
      A.page.getByRole('button', { name: '시작하기' }),
    ).toBeDisabled();

    await expect.poll(() => broker.connections().sort()).toEqual(['p2', 'p3']);

    // B·C: 끊김 문구 없음(무영향).
    for (const page of [B.page, C.page]) {
      await expect(
        page.getByText('실시간 연결을 확인하고 있어요'),
      ).toHaveCount(0);
      await expect(page.getByText('플레이어 3명')).toBeVisible();
    }
  });

  await test.step('재접속: 끊김 문구 사라지고 로비 복원', async () => {
    broker.allowReconnect('p1');

    // 실제 reconnectDelay(5s)만큼 걸릴 수 있어 넉넉히 대기.
    await expect
      .poll(() => broker.connections().sort(), { timeout: 15_000 })
      .toEqual(['p1', 'p2', 'p3']);

    await expect(
      A.page.getByText('실시간 연결을 확인하고 있어요'),
    ).toHaveCount(0);
    await expect(A.page.getByText('플레이어 3명')).toBeVisible();
    await expect(
      A.page.getByRole('button', { name: '시작하기' }),
    ).toBeVisible();
  });

  await Promise.all(clients.map((client) => client.context.close()));
});
