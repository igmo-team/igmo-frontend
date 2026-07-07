import styled from '@emotion/styled';

import { LogoMark } from '../../../common/components';
import { ROOM_AVATAR_COLORS } from '../constants/avatarColors';

import type { RoomSnapshot } from '../../../domain/room/types';

type RoomGameHeaderProps = {
  snapshot: RoomSnapshot;
  currentPlayerId?: string;
  round: number;
  phaseLabel: string;
  timerSeconds: number;
};

export function RoomGameHeader({
  snapshot,
  currentPlayerId,
  round,
  phaseLabel,
  timerSeconds,
}: RoomGameHeaderProps) {
  return (
    <S_Header>
      <S_PhaseSummary>
        <LogoMark size="sm" />
        <S_PhaseTextGroup>
          <S_RoundLabel>라운드 {round}</S_RoundLabel>
          <S_PhaseLabel>{phaseLabel}</S_PhaseLabel>
        </S_PhaseTextGroup>
      </S_PhaseSummary>

      <S_StatusGroup>
        <S_AvatarStack aria-label="게임 참가자 목록">
          {snapshot.players.map((player, index) => {
            const avatarColor =
              ROOM_AVATAR_COLORS[index % ROOM_AVATAR_COLORS.length];
            const isCurrentPlayer = player.id === currentPlayerId;

            return (
              <S_AvatarItem key={player.id}>
                <S_Avatar
                  aria-label={`${player.nickname}${isCurrentPlayer ? ' 나' : ''}`}
                  backgroundColor={avatarColor.background}
                  textColor={avatarColor.color}
                >
                  {getInitial(player.nickname)}
                </S_Avatar>
              </S_AvatarItem>
            );
          })}
        </S_AvatarStack>

        <S_Timer aria-label={`남은 시간 ${timerSeconds}초`}>
          <S_TimerInner>{timerSeconds}</S_TimerInner>
        </S_Timer>
      </S_StatusGroup>
    </S_Header>
  );
}

function getInitial(nickname: string) {
  return nickname.trim().charAt(0) || '?';
}

const S_Header = styled.header`
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 94rem);
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  margin: 0 auto;

  @media (max-width: 36rem) {
    align-items: flex-start;
  }
`;

const S_PhaseSummary = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 1.1rem;
`;

const S_PhaseTextGroup = styled.div`
  min-width: 0;
`;

const S_RoundLabel = styled.p`
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  letter-spacing: 0.06em;
  ${({ theme }) => theme.TYPOGRAPHY.LABEL2}
`;

const S_PhaseLabel = styled.h1`
  overflow: hidden;
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;

const S_StatusGroup = styled.div`
  display: flex;
  flex: none;
  align-items: center;
  gap: 1.6rem;
`;

const S_AvatarStack = styled.ul`
  display: flex;
  align-items: center;
  padding-left: 0.7rem;
`;

const S_AvatarItem = styled.li`
  margin-left: -0.7rem;
`;

const S_Avatar = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'backgroundColor' && prop !== 'textColor',
})<{
  backgroundColor: string;
  textColor: string;
}>`
  display: grid;
  width: 3.4rem;
  height: 3.4rem;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: 50%;
  background: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  ${({ theme }) => theme.TYPOGRAPHY.B4_B}
`;

const S_Timer = styled.div`
  display: grid;
  width: 5.8rem;
  height: 5.8rem;
  flex: none;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme }) =>
    `conic-gradient(${theme.COLOR.PRIMARY500} 80deg, #EFE8FE 0deg)`};
`;

const S_TimerInner = styled.span`
  display: grid;
  width: 4.8rem;
  height: 4.8rem;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme }) => theme.COLOR.WHITE};
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;
