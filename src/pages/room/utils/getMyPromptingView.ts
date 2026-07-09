import type { ImageGenerationStatus } from '../../../domain/room/types';

export type PromptingViewState = 'INPUT' | 'GENERATING' | 'RESULT' | 'FAILED';

const IMAGE_STATUS_TO_VIEW: Record<ImageGenerationStatus, PromptingViewState> = {
  WAITING: 'GENERATING',
  GENERATING: 'GENERATING',
  READY: 'RESULT',
  FAILED: 'FAILED',
};

/**
 * 현재 플레이어의 프롬프트 단계 화면 상태를 판별한다.
 * - 제출 전(rooms 채널 submitted=false)이면 입력 화면.
 * - 제출 후에는 개인 이미지 큐의 status로 생성 중/결과/실패를 가른다.
 *   (제출 직후 큐 메시지가 오기 전 status는 undefined → 생성 중)
 */
export function getMyPromptingView(
  isSubmitted: boolean,
  imageStatus: ImageGenerationStatus | undefined,
): PromptingViewState {
  if (!isSubmitted) {
    return 'INPUT';
  }

  return imageStatus ? IMAGE_STATUS_TO_VIEW[imageStatus] : 'GENERATING';
}
