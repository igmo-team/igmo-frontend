import { useEffect, useState } from 'react';

const COUNTDOWN_INTERVAL_MS = 1000;

export function useCountdownSeconds(deadline?: string | null) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const deadlineTime = getDeadlineTime(deadline);

  useEffect(() => {
    if (deadlineTime === null) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const updateCurrentTime = () => {
      const nextCurrentTime = Date.now();

      setCurrentTime(nextCurrentTime);

      if (nextCurrentTime >= deadlineTime && intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const timeoutId = setTimeout(() => {
      updateCurrentTime();
    }, 0);

    intervalId = setInterval(() => {
      updateCurrentTime();
    }, COUNTDOWN_INTERVAL_MS);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [deadlineTime]);

  if (deadlineTime === null) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((deadlineTime - currentTime) / COUNTDOWN_INTERVAL_MS),
  );
}

function getDeadlineTime(deadline?: string | null) {
  if (!deadline) {
    return null;
  }

  const deadlineTime = new Date(deadline).getTime();

  return Number.isNaN(deadlineTime) ? null : deadlineTime;
}
