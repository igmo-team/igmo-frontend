import styled from '@emotion/styled';

import { useCountdownSeconds } from '../hooks/useCountdownSeconds';

type RoomLobbyDeadlineBannerProps = {
  deadline: string;
  onDeadlineExpired?: () => void;
};

export function RoomLobbyDeadlineBanner({
  deadline,
}: RoomLobbyDeadlineBannerProps) {
  const remainingSeconds = useCountdownSeconds(deadline);
  const displayTime = formatDisplayTime(remainingSeconds);

  return (
    <S_Banner role="status">
      <S_Message>시간 안에 시작하지 않으면 방이 사라져요</S_Message>
      <S_Time aria-label={`남은 시간 ${formatAccessibleTime(remainingSeconds)}`}>
        {displayTime}
      </S_Time>
    </S_Banner>
  );
}

function formatDisplayTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatAccessibleTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}분 ${seconds}초`;
}

const S_Banner = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.4rem 1.8rem;
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  background: ${({ theme }) => theme.COLOR.TEXT};
`;

const S_Message = styled.p`
  min-width: 0;
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_Time = styled.time`
  flex: none;
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;
