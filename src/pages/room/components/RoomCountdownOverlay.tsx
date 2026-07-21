import { useEffect, useState } from 'react';

import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const COUNTDOWN_START_SECONDS = 3;
const TICK_MS = 1000;
const EXIT_DURATION_MS = 180;

type CountdownStatus = 'counting' | 'exiting' | 'done';

interface RoomCountdownOverlayProps {
  onCountdownEnd: () => void;
}

export function RoomCountdownOverlay({
  onCountdownEnd,
}: RoomCountdownOverlayProps) {
  const [status, setStatus] = useState<CountdownStatus>('counting');
  const [seconds, setSeconds] = useState(COUNTDOWN_START_SECONDS);

  useEffect(() => {
    let remainingSeconds = COUNTDOWN_START_SECONDS;
    let exitTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const intervalId = setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds > 0) {
        setSeconds(remainingSeconds);
        return;
      }

      clearInterval(intervalId);
      setStatus('exiting');
      onCountdownEnd();
      exitTimeoutId = setTimeout(() => {
        setStatus('done');
      }, EXIT_DURATION_MS);
    }, TICK_MS);

    return () => {
      clearInterval(intervalId);
      if (exitTimeoutId !== null) {
        clearTimeout(exitTimeoutId);
      }
    };
  }, [onCountdownEnd]);

  if (status === 'done') {
    return null;
  }

  return (
    <S_Overlay
      role="status"
      aria-live="assertive"
      aria-label={`${seconds}초 후 시작`}
      exiting={status === 'exiting'}
    >
      <S_Number key={seconds} aria-hidden="true">
        {seconds}
      </S_Number>
    </S_Overlay>
  );
}

const numberPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.75);
  }

  55% {
    opacity: 1;
    transform: scale(0.92);
  }

  75% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
`;

const exitFade = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
`;

const S_Overlay = styled('div', {
  shouldForwardProp: (prop) => prop !== 'exiting',
})<{ exiting: boolean }>`
  position: fixed;
  z-index: 10;
  display: grid;
  inset: 0;
  place-items: center;
  background: rgba(27, 17, 48, 0.55);
  ${({ exiting }) =>
    exiting &&
    css`
      animation: ${exitFade} ${EXIT_DURATION_MS}ms ease both;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 0;
      }
    `}
`;

const S_Number = styled.span`
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
  font-size: clamp(14rem, 30vw, 24rem);
  line-height: 1;
  text-shadow: 0.5rem 0.6rem 0 ${({ theme }) => theme.COLOR.TEXT};
  animation: ${numberPop} 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.35) both;

  @media (max-width: 36rem) {
    text-shadow: 0.3rem 0.4rem 0 ${({ theme }) => theme.COLOR.TEXT};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
