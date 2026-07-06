import { RoomPlayerList } from './RoomPlayerList';
import {
  S_PhaseGuide,
  S_PhaseTitle,
  S_PlayerGuide,
  S_PlayerHeader,
  S_PlayerTitle,
  S_RoomCard,
  S_RoomCode,
  S_RoomHeader,
  S_SectionLabel,
} from './RoomView.styles';

import type { RoomSnapshot } from '../../../domain/room/types';

type RoomPromptingViewProps = {
  snapshot: RoomSnapshot;
  currentPlayerId?: string;
};

export function RoomPromptingView({
  snapshot,
  currentPlayerId,
}: RoomPromptingViewProps) {
  return (
    <S_RoomCard padding="lg" shadow>
      <S_RoomHeader>
        <S_SectionLabel>방 코드</S_SectionLabel>
        <S_RoomCode>{snapshot.roomCode}</S_RoomCode>
      </S_RoomHeader>

      <S_PhaseTitle>프롬프트 입력</S_PhaseTitle>
      <S_PhaseGuide>질문을 준비하고 있어요.</S_PhaseGuide>

      <S_PlayerHeader>
        <S_PlayerTitle>플레이어 {snapshot.players.length}명</S_PlayerTitle>
        <S_PlayerGuide>게임이 시작됐어요</S_PlayerGuide>
      </S_PlayerHeader>
      <RoomPlayerList
        players={snapshot.players}
        hostId={snapshot.hostId}
        currentPlayerId={currentPlayerId}
      />
    </S_RoomCard>
  );
}
