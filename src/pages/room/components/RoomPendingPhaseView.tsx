import styled from '@emotion/styled';

import { Surface } from '../../../common/components';

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

const S_RoomCard = styled(Surface)`
  display: flex;
  max-width: 56rem;
  flex-direction: column;
`;

const S_RoomHeader = styled.div`
  text-align: center;
`;

const S_SectionLabel = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  letter-spacing: 0.08em;
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
`;

const S_RoomCode = styled.p`
  margin: 0.2rem 0 1.4rem;
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
  font-size: clamp(4.2rem, 9vw, 6rem);
  line-height: 1.1;
  letter-spacing: 0.12em;
`;

const S_EmptyState = styled.p`
  width: 100%;
  padding: 2rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_R}
`;
