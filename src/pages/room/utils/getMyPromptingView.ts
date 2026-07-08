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
