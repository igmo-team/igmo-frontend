import type { Page } from '@playwright/test';

export type RoomSessionSeed = {
  roomCode: string;
  playerId: string;
  secret: string;
};

/**
 * RoomPage 진입 전 sessionStorage에 방 세션을 심는다.
 * 주의: localStorage가 아니라 **sessionStorage** (키: `igmo:room-session:{roomCode}`).
 * addInitScript는 goto 이전에 등록되어야 페이지 스크립트보다 먼저 실행된다.
 */
export async function seedRoomSession(
  page: Page,
  session: RoomSessionSeed,
): Promise<void> {
  await page.addInitScript((seed: RoomSessionSeed) => {
    try {
      window.sessionStorage.setItem(
        `igmo:room-session:${seed.roomCode}`,
        JSON.stringify(seed),
      );
    } catch {
      // 저장 실패해도 테스트 흐름은 라우터 state로 진행될 수 있어 무시.
    }
  }, session);
}
