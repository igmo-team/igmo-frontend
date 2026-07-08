import type { PromptSubmissionSnapshot } from '../../../domain/room/types';

export type PromptingViewState = 'INPUT' | 'GENERATING' | 'RESULT' | 'FAILED';

/**
 * 현재 플레이어의 프롬프트 단계 화면 상태를 판별한다.
 * imageStatus를 우선 기준으로 하되, 제출 직후 imageStatus가 아직 NONE인
 * 순간에는 promptStatus(SUBMITTED)로 생성 중 화면을 유지한다.
 *
 * TODO: promptStatus === 'EXPIRED'(시간 초과 미제출) 처리 — 타이머 연동 시 함께.
 */
export function getMyPromptingView(
  snapshot: PromptSubmissionSnapshot | null,
  playerId: string | undefined,
): PromptingViewState {
  const entry = snapshot?.promptEntries.find(
    (promptEntry) => promptEntry.player.id === playerId,
  );

  if (!entry) {
    return 'INPUT';
  }

  switch (entry.imageStatus) {
    case 'GENERATING':
      return 'GENERATING';
    case 'READY':
      return 'RESULT';
    case 'FAILED':
      return 'FAILED';
    case 'NONE':
    default:
      return entry.promptStatus === 'SUBMITTED' ? 'GENERATING' : 'INPUT';
  }
}
