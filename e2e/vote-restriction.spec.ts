import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import { lobbyMessage, threePlayers, voteMessage } from './fixtures/snapshots';

import type { OwnVoteOptionNotice } from '../src/domain/room/types';
import type { BrowserContext, Page } from '@playwright/test';

const ROOM_CODE = 'TEST01';

type Client = { id: 'p1' | 'p2' | 'p3'; context: BrowserContext; page: Page };

// 예외 경로 B4 — 투표 제한
// 출제자(QUESTIONER)와 퍼펙트 정답자(PERFECT_GUESS)는 투표할 수 없고,
// 나머지 참가자만 정상 투표한다. 퍼펙트 정답자 발생 시 토스트가 뜬다.
test('예외 — 투표 제한: 출제자/퍼펙트 정답자 투표 불가, 일반 참가자만 투표', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const ids: Client['id'][] = ['p1', 'p2', 'p3'];
  const clients: Client[] = [];
  for (const id of ids) {
    const context = await browser.newContext();
    await broker.attach(context);
    const page = await context.newPage();
    await seedRoomSession(page, {
      roomCode: ROOM_CODE,
      playerId: id,
      secret: `${id}-secret`,
    });
    clients.push({ id, context, page });
  }
  const [A, B, C] = clients; // A=철수(출제자), B=영희(퍼펙트 정답자), C=민수(일반 투표자)
  const pages = clients.map((client) => client.page);

  const voteOptions = [
    { optionId: 'o1', text: '한강 고양이' }, // 정답(출제자 A)
    { optionId: 'o2', text: '라면 고양이' }, // 영희(B) 추측
    { optionId: 'o3', text: '산책하는 강아지' }, // 민수(C) 추측
  ];

  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: 'p1' }),
  );
  await Promise.all(pages.map((page) => page.goto(`/room/${ROOM_CODE}`)));
  await expect
    .poll(() => broker.connections().sort())
    .toEqual(['p1', 'p2', 'p3']);

  // VOTING 전환(퍼펙트 정답자 존재 → 투표자는 민수 1명).
  broker.pushTopic(
    ROOM_CODE,
    voteMessage({
      roundNumber: 1,
      voteOptions,
      completedVoteCount: 0,
      totalVoteCount: 1,
      perfectGuessExists: true,
    }),
  );

  // 투표 권한 공지: A=출제자, B=퍼펙트 정답자(둘 다 불가), C=일반.
  const noticeA: OwnVoteOptionNotice = {
    roomCode: ROOM_CODE,
    roundNumber: 1,
    ownImage: true,
    voteAllowed: false,
    voteDisabledReason: 'QUESTIONER',
    optionId: null,
  };
  const noticeB: OwnVoteOptionNotice = {
    roomCode: ROOM_CODE,
    roundNumber: 1,
    ownImage: false,
    voteAllowed: false,
    voteDisabledReason: 'PERFECT_GUESS',
    optionId: 'o2', // 퍼펙트 공지도 optionId는 string 필수(parseOwnVoteOptionNotice).
  };
  const noticeC: OwnVoteOptionNotice = {
    roomCode: ROOM_CODE,
    roundNumber: 1,
    ownImage: false,
    voteAllowed: true,
    voteDisabledReason: null,
    optionId: 'o3',
  };
  broker.pushUserQueue('p1', '/user/queue/vote-own-option', noticeA);
  broker.pushUserQueue('p2', '/user/queue/vote-own-option', noticeB);
  broker.pushUserQueue('p3', '/user/queue/vote-own-option', noticeC);

  await test.step('전원 투표 phase 진입', async () => {
    for (const page of pages) {
      await expect(page.getByRole('heading', { name: '투표' })).toBeVisible();
    }
  });

  await test.step('퍼펙트 정답자 발생 토스트 노출', async () => {
    // 토스트는 VOTING 진입 직후 뜨므로 먼저 확인(자동 소멸 전).
    await expect(C.page.getByText('완벽 정답자가 나왔어요!')).toBeVisible();
  });

  await test.step('출제자(A): 투표 불가 안내 + 확정 버튼 없음', async () => {
    await expect(
      A.page.getByText(
        '다른 참가자들이 내 그림의 진짜 프롬프트를 고르고 있어요.',
      ),
    ).toBeVisible();
    await expect(
      A.page.getByRole('button', { name: '투표 확정' }),
    ).toHaveCount(0);
  });

  await test.step('퍼펙트 정답자(B): 쉬어가기 안내 + 확정 버튼 없음', async () => {
    await expect(
      B.page.getByText('정답을 완벽히 맞혀서 이번 투표는 쉬어가도 돼요.'),
    ).toBeVisible();
    await expect(
      B.page.getByRole('button', { name: '투표 확정' }),
    ).toHaveCount(0);
  });

  await test.step('일반 참가자(C): 투표 가능 → /votes 발행', async () => {
    await C.page.getByRole('button', { name: /한강/ }).click(); // 정답 o1 선택
    await expect(
      C.page.getByRole('button', { name: '투표 확정' }),
    ).toBeEnabled();
    await C.page.getByRole('button', { name: '투표 확정' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p3')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/votes`),
      )
      .toBe(true);
  });

  await Promise.all(clients.map((client) => client.context.close()));
});
