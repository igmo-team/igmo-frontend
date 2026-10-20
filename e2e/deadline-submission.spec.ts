import { expect, test } from '@playwright/test';

import { FakeStompBroker } from './broker/fakeStompBroker';
import { seedRoomSession } from './fixtures/session';
import {
  lobbyMessage,
  promptSubmissionMessage,
  roundMessage,
} from './fixtures/snapshots';

const ROOM_CODE = 'TEST01';
const DEADLINE_DELAY_MS = 3_000;
const PROMPT_TEXT = '노을 지는 한강의 고양이';

for (const phase of ['GENERATING', 'PLAYING'] as const) {
  for (const input of ['empty', 'cleared', 'filled'] as const) {
    test(`${phase} 마감 자동 제출 — ${input}`, async ({ page }) => {
      const broker = new FakeStompBroker();
      await broker.attach(page);
      await seedRoomSession(page, {
        roomCode: ROOM_CODE,
        playerId: 'p2',
        secret: 'p2-secret',
      });
      await page.addInitScript((roomCode) => {
        sessionStorage.setItem(
          `igmo:room-countdown-played:${roomCode}`,
          'true',
        );
      }, ROOM_CODE);
      broker.pushTopic(ROOM_CODE, lobbyMessage());
      await page.goto(`/room/${ROOM_CODE}`);
      await expect.poll(() => broker.connections()).toContain('p2');

      const deadline = new Date(Date.now() + DEADLINE_DELAY_MS).toISOString();
      broker.pushTopic(
        ROOM_CODE,
        phase === 'GENERATING'
          ? promptSubmissionMessage({ promptDeadline: deadline })
          : roundMessage({ roundNumber: 2, guessDeadline: deadline }),
      );

      await expect(
        page.getByRole('heading', {
          name:
            phase === 'GENERATING'
              ? 'AI에게 어떤 그림을 그리게 할까요?'
              : '진짜 같은 가짜 프롬프트를 적으세요',
        }),
      ).toBeVisible();
      const textbox = page.getByRole('textbox');
      await expect(textbox).toBeEnabled();

      if (input !== 'empty') {
        await textbox.fill(PROMPT_TEXT);
      }

      if (input === 'cleared') {
        await textbox.fill('');
      }

      await expect(textbox).toBeDisabled();

      const destination = `/app/rooms/${ROOM_CODE}/${phase === 'GENERATING' ? 'prompts' : 'guesses'}`;
      const submissions = () =>
        broker.inbox('p2').filter((frame) => frame.destination === destination);

      if (input === 'filled') {
        await expect.poll(() => submissions().length).toBe(1);
        expect(JSON.parse(submissions()[0].body)).toEqual({
          [phase === 'GENERATING' ? 'prompt' : 'guess']: PROMPT_TEXT,
          submissionType: 'DEADLINE',
        });
      } else {
        expect(submissions()).toHaveLength(0);
      }
    });
  }
}
