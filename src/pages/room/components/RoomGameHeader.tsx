import styled from '@emotion/styled';

import { LogoMark } from '../../../common/components';
import { ROOM_AVATAR_COLORS } from '../constants/avatarColors';

import type { RoomPlayer } from '../../../domain/room/types';

const TIMER_PROGRESS_RADIUS = 26;
const TIMER_PROGRESS_CIRCUMFERENCE = 2 * Math.PI * TIMER_PROGRESS_RADIUS;

type TimerState = {
  seconds: number;
  progressRatio: number;
};

export type RoomGameHeaderStatus =
  | {
      type: 'avatars';
      players: RoomPlayer[];
      currentPlayerId?: string;
      completedPlayerIds?: string[];
    }
  | {
      type: 'voteProgress';
      completedCount: number;
      totalCount: number;
    };

type RoomGameHeaderProps = {
  headerStatus: RoomGameHeaderStatus;
  round?: number;
  phaseLabel: string;
  timer?: TimerState | null;
};

export function RoomGameHeader({
  headerStatus,
  round,
  phaseLabel,
  timer = null,
}: RoomGameHeaderProps) {
  const timerProgressOffset =
    TIMER_PROGRESS_CIRCUMFERENCE * (1 - (timer?.progressRatio ?? 0));

  return (
    <S_Header>
      <S_PhaseSummary>
        <LogoMark size="sm" />
        <S_PhaseTextGroup>
          {round !== undefined && <S_RoundLabel>라운드 {round}</S_RoundLabel>}
          <S_PhaseLabel>{phaseLabel}</S_PhaseLabel>
        </S_PhaseTextGroup>
      </S_PhaseSummary>

      <S_StatusGroup>
        {headerStatus.type === 'avatars' ? (
          <S_AvatarStack aria-label="게임 참가자 목록">
            {headerStatus.players.map((player, index) => {
              const avatarColor =
                ROOM_AVATAR_COLORS[index % ROOM_AVATAR_COLORS.length];
              const isCurrentPlayer =
                player.id === headerStatus.currentPlayerId;
              const isCompleted =
                headerStatus.completedPlayerIds?.includes(player.id) ?? false;

              return (
                <S_AvatarItem key={player.id} completed={isCompleted}>
                  <S_Avatar
                    aria-label={`${player.nickname}${isCurrentPlayer ? ' 나' : ''}${isCompleted ? ' 준비 완료' : ''}`}
                    backgroundColor={avatarColor.background}
                    textColor={avatarColor.color}
                  >
                    {getInitial(player.nickname)}
                  </S_Avatar>
                  {isCompleted && (
                    <S_CompletedBadge aria-hidden="true">✓</S_CompletedBadge>
                  )}
                </S_AvatarItem>
              );
            })}
          </S_AvatarStack>
        ) : (
          <S_VoteProgress
            aria-label={`투표 현황 ${headerStatus.completedCount}명 중 ${headerStatus.totalCount}명 완료`}
          >
            <S_VoteProgressLabel aria-hidden="true">
              투표 현황
            </S_VoteProgressLabel>
            <S_VoteProgressCount aria-hidden="true">
              <S_VoteProgressCompleted>
                {headerStatus.completedCount}
              </S_VoteProgressCompleted>
              <S_VoteProgressTotal>
                {' '}
                / {headerStatus.totalCount}
              </S_VoteProgressTotal>
            </S_VoteProgressCount>
          </S_VoteProgress>
        )}

        {timer && (
          <S_Timer aria-label={`남은 시간 ${timer.seconds}초`}>
            <S_TimerSvg aria-hidden="true" viewBox="0 0 58 58">
              <S_TimerTrack cx="29" cy="29" r={TIMER_PROGRESS_RADIUS} />
              <S_TimerProgress
                cx="29"
                cy="29"
                r={TIMER_PROGRESS_RADIUS}
                strokeDasharray={TIMER_PROGRESS_CIRCUMFERENCE}
                strokeDashoffset={timerProgressOffset}
              />
            </S_TimerSvg>
            <S_TimerInner>{timer.seconds}</S_TimerInner>
          </S_Timer>
        )}
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
  padding: 1.4rem 1.8rem;

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

  @media (max-width: 36rem) {
    gap: 1rem;
  }
`;

const S_AvatarStack = styled.ul`
  display: flex;
  align-items: center;
  padding-left: 0.7rem;
`;

const S_AvatarItem = styled('li', {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>`
  position: relative;
  z-index: ${({ completed }) => (completed ? 2 : 1)};
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

const S_CompletedBadge = styled.span`
  position: absolute;
  right: -0.2rem;
  bottom: -0.1rem;
  display: grid;
  width: 1.7rem;
  height: 1.7rem;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: 50%;
  background: ${({ theme }) => theme.COLOR.SUCCESS};
  color: ${({ theme }) => theme.COLOR.WHITE};
  font-size: 1rem;
  font-weight: 900;
  line-height: 1;
`;

const S_VoteProgress = styled.div`
  display: flex;
  min-width: 6.8rem;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const S_VoteProgressLabel = styled.span`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B6_B}
`;

const S_VoteProgressCount = styled.span`
  display: flex;
  align-items: baseline;
  justify-content: center;
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE2}
`;

const S_VoteProgressCompleted = styled.span`
  color: ${({ theme }) => theme.COLOR.TEXT};
`;

const S_VoteProgressTotal = styled.span`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;

const S_Timer = styled.div`
  position: relative;
  display: grid;
  width: 5.8rem;
  height: 5.8rem;
  flex: none;
  place-items: center;
`;

const S_TimerSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform: rotate(-90deg);
`;

const S_TimerTrack = styled.circle`
  fill: none;
  stroke: #efe8fe;
  stroke-width: 6;
`;

const S_TimerProgress = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.COLOR.PRIMARY500};
  stroke-linecap: round;
  stroke-width: 6;
  transition: stroke-dashoffset 0.3s ease;
`;

const S_TimerInner = styled.span`
  position: relative;
  display: grid;
  width: 4.8rem;
  height: 4.8rem;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme }) => theme.COLOR.WHITE};
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;
