import type { RoomPhase } from '../../../domain/room/types';

const ROOM_PHASE_LABELS: Record<RoomPhase, string> = {
  LOBBY: '대기',
  PROMPTING: '프롬프트 입력',
  GENERATING: '이미지 생성',
  SUBMITTING: '가짜 프롬프트',
  VOTING: '투표',
  RESULTS: '결과',
  ENDED: '종료',
};

export function getRoomPhaseLabel(phase: RoomPhase) {
  return ROOM_PHASE_LABELS[phase];
}
