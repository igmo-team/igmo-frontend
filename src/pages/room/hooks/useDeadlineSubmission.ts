import { useEffect, useState } from 'react';

type UseDeadlineSubmissionParams = {
  deadline?: string;
  shouldSubmit: boolean;
  onDeadline: () => void;
};

export function useDeadlineSubmission({
  deadline,
  shouldSubmit,
  onDeadline,
}: UseDeadlineSubmissionParams) {
  const [expiredDeadline, setExpiredDeadline] = useState<string | null>(null);
  const isDeadlineExpired = expiredDeadline === deadline;

  useEffect(() => {
    if (!deadline || !shouldSubmit || isDeadlineExpired) {
      return;
    }

    const deadlineTime = new Date(deadline).getTime();

    if (Number.isNaN(deadlineTime)) {
      return;
    }

    const timeoutId = setTimeout(
      () => {
        setExpiredDeadline(deadline);
        onDeadline();
      },
      Math.max(0, deadlineTime - Date.now()),
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [deadline, isDeadlineExpired, onDeadline, shouldSubmit]);

  return isDeadlineExpired;
}
