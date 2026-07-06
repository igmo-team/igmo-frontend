import styled from '@emotion/styled';

import { Surface } from '../../../common/components';

import { RoomPlayerList } from './RoomPlayerList';

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

const S_PhaseTitle = styled.h1`
  margin-top: 0.8rem;
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE2}
`;

const S_PhaseGuide = styled.p`
  margin-top: 0.8rem;
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_R}
`;

const S_PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  margin: 2.2rem 0 1.2rem;
`;

const S_PlayerTitle = styled.h1`
  flex: none;
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;

const S_PlayerGuide = styled.p`
  min-width: 0;
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: right;
  ${({ theme }) => theme.TYPOGRAPHY.B6_B}
`;
