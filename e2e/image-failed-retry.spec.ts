import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import {
  buildImageGenerationSnapshot,
  lobbyMessage,
  promptSubmissionMessage,
  threePlayers,
} from './fixtures/snapshots';

const ROOM_CODE = 'TEST01';

// 예외 경로 B1 — 이미지 생성 실패 → 프롬프트 재입력
// 이미지 생성 상태는 개인 큐(/user/queue/image-generation)로 오므로 한 명 관점으로 검증한다.
test('예외 — 이미지 생성 실패 시 실패 뷰 노출 후 프롬프트 재입력', async ({
  browser,
}) => {
  const broker = new FakeStompBroker();
  const context = await browser.newContext();
  await broker.attach(context);
  const page = await context.newPage();
  await seedRoomSession(page, {
    roomCode: ROOM_CODE,
    playerId: 'p1',
    secret: 'p1-secret',
  });

  // 로비 진입(receivedSnapshot 확보 → 로딩 화면 탈출) 후 GENERATING 전환.
  broker.pushTopic(
    ROOM_CODE,
    lobbyMessage({ players: threePlayers(), hostId: 'p1' }),
  );
  await page.goto(`/room/${ROOM_CODE}`);
  await expect.poll(() => broker.connections()).toContain('p1');

  broker.pushTopic(ROOM_CODE, promptSubmissionMessage());
  await expect(
    page.getByText('AI에게 어떤 그림을 그리게 할까요?'),
  ).toBeVisible();

  await test.step('프롬프트 제출 → /prompts 1회', async () => {
    await page.getByRole('textbox').fill('첫 프롬프트');
    await page.getByRole('button', { name: '그림 생성하기' }).click();
    await expect
      .poll(
        () =>
          broker
            .inbox('p1')
            .filter((f) => f.destination === `/app/rooms/${ROOM_CODE}/prompts`)
            .length,
      )
      .toBe(1);
  });

  await test.step('생성 실패 → 실패 뷰 노출', async () => {
    broker.pushUserQueue(
      'p1',
      '/user/queue/image-generation',
      buildImageGenerationSnapshot({
        status: 'FAILED',
        prompt: '첫 프롬프트',
        errorMessage: '생성에 실패했어요',
      }),
    );
    await expect(page.getByText('😭 그림 생성에 실패했어요')).toBeVisible();
    await expect(
      page.getByRole('button', { name: '다시 생성하기' }),
    ).toBeVisible();
  });

  await test.step('프롬프트 다듬어 재제출 → /prompts 2회째', async () => {
    await page.getByRole('textbox').fill('다듬은 프롬프트');
    await page.getByRole('button', { name: '다시 생성하기' }).click();
    await expect
      .poll(
        () =>
          broker
            .inbox('p1')
            .filter((f) => f.destination === `/app/rooms/${ROOM_CODE}/prompts`)
            .length,
      )
      .toBe(2);
    expect(
      broker
        .inbox('p1')
        .filter((f) => f.destination.endsWith('/prompts'))
        .at(-1)?.body,
    ).toContain('다듬은 프롬프트');
  });

  await context.close();
});
