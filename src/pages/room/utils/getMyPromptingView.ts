// TODO(다음 범위): imageStatus 기반 화면 분기 유틸.
// 개인 이미지 큐(다다음 범위)에서 imageStatus를 수신하면 아래 로직을 복구한다.
/*
import type {
  ImageStatus,
  PromptSubmissionSnapshot,
} from '../../../domain/room/types';

export type PromptingViewState = 'INPUT' | 'GENERATING' | 'RESULT' | 'FAILED';

const IMAGE_STATUS_TO_VIEW: Record<ImageStatus, PromptingViewState> = {
  WAITING: 'INPUT',
  GENERATING: 'GENERATING',
  READY: 'RESULT',
  FAILED: 'FAILED',
};

export function getMyPromptingView(
  snapshot: PromptSubmissionSnapshot | null,
  playerId: string | undefined,
): PromptingViewState {
  const entry = snapshot?.promptEntries.find(
    (promptEntry) => promptEntry.player.id === playerId,
  );

  return entry ? IMAGE_STATUS_TO_VIEW[entry.imageStatus] : 'INPUT';
}
*/

export {};
