import { useEffect, useState } from 'react';

const DEADLINE_SUBMISSION_LEAD_MS = 300;

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
      Math.max(0, deadlineTime - Date.now() - DEADLINE_SUBMISSION_LEAD_MS),
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [deadline, isDeadlineExpired, onDeadline, shouldSubmit]);

  return isDeadlineExpired;
}
