import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import {
  buildImageGenerationSnapshot,
  gameResultMessage,
  lobbyMessage,
  player,
  promptSubmissionMessage,
  roundMessage,
  roundResultMessage,
  threePlayers,
  voteMessage,
} from './fixtures/snapshots';

import type {
  GuessSubmissionSnapshot,
  OwnVoteOptionNotice,
} from '../src/domain/room/types';
import type { BrowserContext, Page } from '@playwright/test';

const ROOM_CODE = 'TEST01';

type Client = {
  id: 'p1' | 'p2' | 'p3';
  context: BrowserContext;
  page: Page;
};

/** 카운트다운 오버레이(3초, 세션스토리지 플래그)를 건너뛰어 PLAYING 뷰를 즉시 렌더. */
async function seedCountdownPlayed(page: Page): Promise<void> {
  await page.addInitScript((roomCode: string) => {
    try {
      window.sessionStorage.setItem(
        `igmo:room-countdown-played:${roomCode}`,
        'true',
      );
    } catch {
      // 무시: 저장 실패해도 최대 3초 카운트다운만 재생될 뿐.
    }
  }, ROOM_CODE);
}

/** 헤더 아바타(게임 중 참가자 목록)에서 '준비 완료' 표식이 붙은 수. */
function completedAvatarCount(page: Page) {
  return page
    .locator('ul[aria-label="게임 참가자 목록"] [aria-label*="준비 완료"]')
    .count();
}

test('시나리오 1 — 해피패스: 입장→준비→시작→프롬프트→추측→투표→결과→다음 라운드→종료', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();

  // ---- 3개 브라우저 컨텍스트에 하나의 브로커를 공유 attach (크로스클라이언트 fan-out) ----
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

  const [A, B, C] = clients; // A=철수(방장), B=영희, C=민수
  const pages = clients.map((client) => client.page);

  // -------------------------------------------------------------------------
  // 1) 입장: SUBSCRIBE 시 LOBBY_SNAPSHOT(3명) replay → 로비 렌더
  // -------------------------------------------------------------------------
  broker.pushTopic(ROOM_CODE, lobbyMessage({ players: threePlayers() }));
  await Promise.all(clients.map((client) => client.page.goto(`/room/${ROOM_CODE}`)));

  await test.step('입장: 3명·닉네임·연결·역할별 버튼', async () => {
    for (const page of pages) {
      // 로비 phase 라벨은 헤더가 아니라 로비 뷰 인원수/버튼으로 관찰.
      await expect(page.getByText('플레이어 3명')).toBeVisible();
      await expect(page.getByText('철수')).toBeVisible();
      await expect(page.getByText('영희')).toBeVisible();
      await expect(page.getByText('민수')).toBeVisible();
      // 연결됨 → 끊김 문구 없음.
      await expect(
        page.getByText('실시간 연결을 확인하고 있어요'),
      ).toHaveCount(0);
    }
    // 방장(A)만 시작 버튼, 게스트(B·C)는 준비 버튼.
    await expect(
      A.page.getByRole('button', { name: '시작하기' }),
    ).toBeVisible();
    await expect(
      A.page.getByRole('button', { name: '준비하기' }),
    ).toHaveCount(0);
    for (const guest of [B, C]) {
      await expect(
        guest.page.getByRole('button', { name: '준비하기' }),
      ).toBeVisible();
      await expect(
        guest.page.getByRole('button', { name: '시작하기' }),
      ).toHaveCount(0);
    }
    // 아직 게스트 미준비 → 방장 시작 버튼 비활성.
    await expect(
      A.page.getByRole('button', { name: '시작하기' }),
    ).toBeDisabled();
    // 브로커도 3연결 인지.
    expect(broker.connections().sort()).toEqual(['p1', 'p2', 'p3']);
  });

  // -------------------------------------------------------------------------
  // 2) 준비: B·C 준비 → inbox /ready, ready 스냅샷 fan-out → 시작 버튼 활성
  // -------------------------------------------------------------------------
  await test.step('준비: /ready 발행 + ready fan-out + 시작 활성화', async () => {
    await B.page.getByRole('button', { name: '준비하기' }).click();
    await C.page.getByRole('button', { name: '준비하기' }).click();

    await expect
      .poll(() =>
        broker
          .inbox('p2')
          .some((frame) =>
            frame.destination === `/app/rooms/${ROOM_CODE}/ready`,
          ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        broker
          .inbox('p3')
          .some((frame) =>
            frame.destination === `/app/rooms/${ROOM_CODE}/ready`,
          ),
      )
      .toBe(true);
    // /ready body에 ready:true가 실렸는지 확인.
    expect(
      broker
        .inbox('p2')
        .find((f) => f.destination.endsWith('/ready'))?.body,
    ).toContain('"ready":true');

    // 브로커가 ready=true 로스터를 fan-out.
    broker.pushTopic(
      ROOM_CODE,
      lobbyMessage({
        players: threePlayers({ p2: { ready: true }, p3: { ready: true } }),
      }),
    );

    // 전원 준비 상태 반영, 방장 시작 버튼 활성화.
    for (const guest of [B, C]) {
      await expect(
        guest.page.getByRole('button', { name: '준비 해제' }),
      ).toBeVisible();
      await expect(guest.page.getByText('준비 완료 상태예요')).toBeVisible();
    }
    await expect(
      A.page.getByRole('button', { name: '시작하기' }),
    ).toBeEnabled();
    await expect(A.page.getByText('게임을 시작할 수 있어요')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 3) 시작: A 시작 클릭 → inbox /start, PROMPT_SUBMISSION(GENERATING) fan-out
  // -------------------------------------------------------------------------
  await test.step('시작: /start 발행 + GENERATING 전환', async () => {
    await A.page.getByRole('button', { name: '시작하기' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p1')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/start`),
      )
      .toBe(true);

    broker.pushTopic(
      ROOM_CODE,
      promptSubmissionMessage({
        promptEntries: [
          { player: player('p1'), status: 'WAITING' },
          { player: player('p2'), status: 'WAITING' },
          { player: player('p3'), status: 'WAITING' },
        ],
      }),
    );

    for (const page of pages) {
      // 헤더 phase 라벨 = 이미지 생성.
      await expect(
        page.getByRole('heading', { name: '이미지 생성' }),
      ).toBeVisible();
      // 프롬프트 입력 뷰.
      await expect(
        page.getByText('AI에게 어떤 그림을 그리게 할까요?'),
      ).toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // 4) 각자 프롬프트: 각 inbox /prompts + user-queue 이미지 생성 + 진행도 fan-out
  // -------------------------------------------------------------------------
  await test.step('프롬프트: /prompts 발행 + 실시간 반영', async () => {
    for (const client of clients) {
      await client.page.getByRole('textbox').fill(`${client.id}-프롬프트`);
      await client.page
        .getByRole('button', { name: '그림 생성하기' })
        .click();
      await expect
        .poll(() =>
          broker
            .inbox(client.id)
            .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/prompts`),
        )
        .toBe(true);
    }
    expect(
      broker.inbox('p1').find((f) => f.destination.endsWith('/prompts'))?.body,
    ).toContain('"submissionType":"NORMAL"');

    // 각자 개인 큐로 GENERATING → 로딩 뷰.
    for (const client of clients) {
      broker.pushUserQueue(
        client.id,
        '/user/queue/image-generation',
        buildImageGenerationSnapshot({ status: 'GENERATING' }),
      );
    }
    for (const page of pages) {
      await expect(page.getByText('그림을 그리는 중이에요')).toBeVisible();
    }

    // 각자 개인 큐로 READY → 완성 뷰.
    for (const client of clients) {
      broker.pushUserQueue(
        client.id,
        '/user/queue/image-generation',
        buildImageGenerationSnapshot({
          status: 'READY',
          prompt: `${client.id}-프롬프트`,
          imageUrl: `https://example.test/${client.id}.png`,
        }),
      );
    }
    for (const client of clients) {
      await expect(client.page.getByText('그림이 완성됐어요')).toBeVisible();
      await expect(
        client.page.getByText(`${client.id}-프롬프트`),
      ).toBeVisible();
    }

    // 진행도 fan-out(전원 READY) → 모든 클라 헤더에 3명 완료 표시(크로스클라이언트).
    broker.pushTopic(
      ROOM_CODE,
      promptSubmissionMessage({
        promptEntries: [
          { player: player('p1'), status: 'READY' },
          { player: player('p2'), status: 'READY' },
          { player: player('p3'), status: 'READY' },
        ],
      }),
    );
    for (const page of pages) {
      await expect.poll(() => completedAvatarCount(page)).toBe(3);
    }
  });

  // -------------------------------------------------------------------------
  // 5) 추측(PLAYING): ROUND_SNAPSHOT + 추측 제출 → 진행도 전원 증가
  // -------------------------------------------------------------------------
  await test.step('추측: ROUND_SNAPSHOT + /guesses + 진행도 증가', async () => {
    broker.pushTopic(
      ROOM_CODE,
      roundMessage({
        roundNumber: 1,
        questioner: player('p1'),
        imageUrl: 'https://example.test/round-1.png',
        guessEntries: [
          { player: player('p2'), submitted: false },
          { player: player('p3'), submitted: false },
        ],
      }),
    );

    for (const page of pages) {
      await expect(
        page.getByRole('heading', { name: '프롬프트 추측' }),
      ).toBeVisible();
      await expect(page.getByText('라운드 1')).toBeVisible();
    }
    // 출제자(A)는 대기 안내, 비출제자(B·C)는 입력 폼.
    await expect(
      A.page.getByText('다른 참가자들이 가짜 프롬프트를 작성 중이에요.'),
    ).toBeVisible();
    for (const guest of [B, C]) {
      await expect(
        guest.page.getByText('진짜 같은 가짜 프롬프트를 적으세요'),
      ).toBeVisible();
    }

    // B 추측 제출 → inbox /guesses.
    await B.page.getByRole('textbox').fill('my-guess-r1');
    await B.page.getByRole('button', { name: '제출하기' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p2')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/guesses`),
      )
      .toBe(true);

    // 서버 확정(SUBMITTED)을 B 개인 큐로 → B 화면에 제출값 반영.
    const bGuess: GuessSubmissionSnapshot = {
      roomCode: ROOM_CODE,
      roundNumber: 1,
      totalRoundCount: 3,
      status: 'SUBMITTED',
      guess: 'my-guess-r1',
      confirmedScore: null,
      message: null,
    };
    broker.pushUserQueue('p2', '/user/queue/guess-submission', bGuess);
    await expect(B.page.getByRole('textbox')).toHaveValue('my-guess-r1');
    await expect(
      B.page.getByRole('button', { name: '제출 완료' }),
    ).toBeVisible();

    // guessEntries 진행도 fan-out(B submitted) → 전원 헤더에 1명 완료.
    broker.pushTopic(
      ROOM_CODE,
      roundMessage({
        roundNumber: 1,
        questioner: player('p1'),
        imageUrl: 'https://example.test/round-1.png',
        guessEntries: [
          { player: player('p2'), submitted: true },
          { player: player('p3'), submitted: false },
        ],
      }),
    );
    for (const page of pages) {
      await expect.poll(() => completedAvatarCount(page)).toBe(1);
    }

    // C 추측 제출 → 진행도 2명.
    await C.page.getByRole('textbox').fill('c-guess-r1');
    await C.page.getByRole('button', { name: '제출하기' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p3')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/guesses`),
      )
      .toBe(true);
    broker.pushTopic(
      ROOM_CODE,
      roundMessage({
        roundNumber: 1,
        questioner: player('p1'),
        imageUrl: 'https://example.test/round-1.png',
        guessEntries: [
          { player: player('p2'), submitted: true },
          { player: player('p3'), submitted: true },
        ],
      }),
    );
    for (const page of pages) {
      await expect.poll(() => completedAvatarCount(page)).toBe(2);
    }
  });

  // -------------------------------------------------------------------------
  // 6) 투표(VOTING): VOTE_SNAPSHOT + vote-own-option + /votes → 진행도 증가
  // -------------------------------------------------------------------------
  await test.step('투표: VOTE_SNAPSHOT + /votes + completedVoteCount 증가', async () => {
    broker.pushTopic(
      ROOM_CODE,
      voteMessage({
        roundNumber: 1,
        voteOptions: [
          { optionId: 'o1', text: '한강 고양이' }, // 정답(출제자 A)
          { optionId: 'o2', text: '라면 고양이' }, // 영희(B) 추측
          { optionId: 'o3', text: '산책하는 강아지' }, // 민수(C) 추측
        ],
        completedVoteCount: 0,
        totalVoteCount: 2,
      }),
    );
    // 각자 투표 권한 공지(개인 큐).
    const noticeQ: OwnVoteOptionNotice = {
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
      voteAllowed: true,
      voteDisabledReason: null,
      optionId: 'o2',
    };
    const noticeC: OwnVoteOptionNotice = {
      roomCode: ROOM_CODE,
      roundNumber: 1,
      ownImage: false,
      voteAllowed: true,
      voteDisabledReason: null,
      optionId: 'o3',
    };
    broker.pushUserQueue('p1', '/user/queue/vote-own-option', noticeQ);
    broker.pushUserQueue('p2', '/user/queue/vote-own-option', noticeB);
    broker.pushUserQueue('p3', '/user/queue/vote-own-option', noticeC);

    for (const page of pages) {
      await expect(
        page.getByRole('heading', { name: '투표' }),
      ).toBeVisible();
      await expect(
        page.getByLabel('투표 현황 2명 중 0명 완료'),
      ).toBeVisible();
    }
    // 출제자(A)는 투표 불가 안내.
    await expect(
      A.page.getByText(
        '다른 참가자들이 내 그림의 진짜 프롬프트를 고르고 있어요.',
      ),
    ).toBeVisible();

    // B(영희) 투표: 자기 추측 o2 제외, 정답 o1(한강) 선택 → /votes.
    await B.page.getByRole('button', { name: /한강/ }).click();
    await B.page.getByRole('button', { name: '투표 확정' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p2')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/votes`),
      )
      .toBe(true);
    expect(
      broker.inbox('p2').find((f) => f.destination.endsWith('/votes'))?.body,
    ).toContain('"optionId":"o1"');

    broker.pushTopic(
      ROOM_CODE,
      voteMessage({
        roundNumber: 1,
        voteOptions: [
          { optionId: 'o1', text: '한강 고양이' },
          { optionId: 'o2', text: '라면 고양이' },
          { optionId: 'o3', text: '산책하는 강아지' },
        ],
        completedVoteCount: 1,
        totalVoteCount: 2,
      }),
    );
    for (const page of pages) {
      await expect(
        page.getByLabel('투표 현황 2명 중 1명 완료'),
      ).toBeVisible();
    }

    // C(민수) 투표: 자기 추측 o3 제외, 영희 추측 o2(라면) 선택(속음) → completedVoteCount 2.
    await C.page.getByRole('button', { name: /라면/ }).click();
    await C.page.getByRole('button', { name: '투표 확정' }).click();
    await expect
      .poll(() =>
        broker
          .inbox('p3')
          .some((f) => f.destination === `/app/rooms/${ROOM_CODE}/votes`),
      )
      .toBe(true);
    broker.pushTopic(
      ROOM_CODE,
      voteMessage({
        roundNumber: 1,
        voteOptions: [
          { optionId: 'o1', text: '한강 고양이' },
          { optionId: 'o2', text: '라면 고양이' },
          { optionId: 'o3', text: '산책하는 강아지' },
        ],
        completedVoteCount: 2,
        totalVoteCount: 2,
      }),
    );
    for (const page of pages) {
      await expect(
        page.getByLabel('투표 현황 2명 중 2명 완료'),
      ).toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // 7) 라운드 결과(RESULTS): ROUND_RESULT_SNAPSHOT
  // -------------------------------------------------------------------------
  await test.step('라운드 결과: RESULTS 뷰 + 점수/득표', async () => {
    // 규칙 반영 기본 빌더 사용(영희 정답2+속임1=3 / 철수 출제자2 / 민수 0).
    broker.pushTopic(ROOM_CODE, roundResultMessage({ roundNumber: 1 }));

    for (const page of pages) {
      await expect(
        page.getByRole('heading', { name: '결과', exact: true }),
      ).toBeVisible();
      await expect(page.getByText('결과 공개')).toBeVisible();
      const resultList = page.getByRole('list', {
        name: '라운드 선택지 결과',
      });
      await expect(resultList.getByText('한강 고양이')).toBeVisible();
      await expect(resultList.getByText('라면 고양이')).toBeVisible();
      await expect(resultList.getByText('산책하는 강아지')).toBeVisible();
      await expect(resultList.getByText('정답')).toBeVisible(); // 정답 배지(출제자 후보)
      // 이번 라운드 점수 보드: 영희 +3(정답2+속임1), 철수 +2(출제자).
      const scoreList = page.getByRole('list', { name: '이번 라운드 점수' });
      await expect(scoreList.getByText('+3', { exact: true })).toBeVisible();
      await expect(scoreList.getByText('+2', { exact: true })).toBeVisible();
      await expect(scoreList.getByText('출제자 +2')).toBeVisible();
    }
  });

  // -------------------------------------------------------------------------
  // 8) 다음 문제: roundNumber 2 → 이전 라운드 guess가 새 라운드에 새지 않음
  // -------------------------------------------------------------------------
  await test.step('다음 라운드: 라운드2 전환 + stale guess 격리', async () => {
    broker.pushTopic(
      ROOM_CODE,
      roundMessage({
        roundNumber: 2,
        questioner: player('p1'),
        imageUrl: 'https://example.test/round-2.png',
        guessEntries: [
          { player: player('p2'), submitted: false },
          { player: player('p3'), submitted: false },
        ],
      }),
    );

    for (const page of pages) {
      await expect(
        page.getByRole('heading', { name: '프롬프트 추측' }),
      ).toBeVisible();
      await expect(page.getByText('라운드 2')).toBeVisible();
    }
    // 진행도 초기화(0명 완료).
    for (const page of pages) {
      await expect.poll(() => completedAvatarCount(page)).toBe(0);
    }
    // 핵심: B의 라운드2 입력창은 라운드1 guess가 새지 않아 비어 있어야 함.
    await expect(B.page.getByRole('textbox')).toHaveValue('');
    await expect(
      B.page.getByRole('button', { name: '제출하기' }),
    ).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 9) 종료(ENDED): GAME_RESULT_SNAPSHOT → 최종 순위
  // -------------------------------------------------------------------------
  await test.step('종료: ENDED + 최종 순위 정렬/점수', async () => {
    broker.pushTopic(
      ROOM_CODE,
      gameResultMessage({
        finalRanking: [
          { player: player('p2', { score: 20 }), rank: 1, totalScore: 20 },
          { player: player('p1', { score: 15 }), rank: 2, totalScore: 15 },
          { player: player('p3', { score: 10 }), rank: 3, totalScore: 10 },
        ],
      }),
    );

    for (const page of pages) {
      await expect(
        page.getByRole('heading', { name: '종료' }),
      ).toBeVisible();
      // 1위(영희)는 히어로에 강조(우승자 명 + 최종 20점).
      await expect(
        page.getByRole('heading', { name: '영희' }),
      ).toBeVisible();
      await expect(page.getByText('최종 20점')).toBeVisible();

      // 최종 순위 리스트: 비우승 2명(철수 15, 민수 10), 정렬·점수 일치.
      const ranking = page.getByRole('list', { name: '최종 순위' });
      const items = ranking.getByRole('listitem');
      await expect(items).toHaveCount(2);
      await expect(items.nth(0)).toContainText('철수');
      await expect(items.nth(0)).toContainText('15');
      await expect(items.nth(1)).toContainText('민수');
      await expect(items.nth(1)).toContainText('10');
      // 우승자는 리스트가 아닌 히어로에 있으므로 리스트엔 없음.
      await expect(ranking.getByText('영희')).toHaveCount(0);
    }
  });

  await Promise.all(clients.map((client) => client.context.close()));
});
