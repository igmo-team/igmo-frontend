import {
  S_EmptyState,
  S_RoomCard,
  S_RoomCode,
  S_RoomHeader,
  S_SectionLabel,
} from './RoomView.styles';

import type { RoomSnapshot } from '../../../domain/room/types';

type RoomPendingPhaseViewProps = {
  snapshot: RoomSnapshot;
};

export function RoomPendingPhaseView({ snapshot }: RoomPendingPhaseViewProps) {
  return (
    <S_RoomCard padding="lg" shadow>
      <S_RoomHeader>
        <S_SectionLabel>방 코드</S_SectionLabel>
        <S_RoomCode>{snapshot.roomCode}</S_RoomCode>
      </S_RoomHeader>
      <S_EmptyState>다음 화면을 준비하고 있어요.</S_EmptyState>
    </S_RoomCard>
  );
}
