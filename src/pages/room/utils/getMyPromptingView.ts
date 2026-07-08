import type {
  ImageStatus,
  PromptSubmissionSnapshot,
} from '../../../domain/room/types';

export type PromptingViewState = 'INPUT' | 'GENERATING' | 'RESULT' | 'FAILED';

// Record<ImageStatus, …>라 imageStatus에 상태가 추가/변경되면 여기서 컴파일 에러가 나 동기화가 강제된다.
const IMAGE_STATUS_TO_VIEW: Record<ImageStatus, PromptingViewState> = {
  WAITING: 'INPUT',
  GENERATING: 'GENERATING',
  READY: 'RESULT',
  FAILED: 'FAILED',
};

/**
 * 현재 플레이어의 프롬프트 단계 화면 상태를 imageStatus 기준으로만 판별한다.
 * 내 엔트리가 아직 없으면 입력 화면으로 둔다.
 */
export function getMyPromptingView(
  snapshot: PromptSubmissionSnapshot | null,
  playerId: string | undefined,
): PromptingViewState {
  const entry = snapshot?.promptEntries.find(
    (promptEntry) => promptEntry.player.id === playerId,
  );

  return entry ? IMAGE_STATUS_TO_VIEW[entry.imageStatus] : 'INPUT';
}
