import { useEffect, useRef, useState } from 'react';

const DEFAULT_FEEDBACK_DURATION_MS = 1500;

type UseUrlCopyResult = {
  isCopied: boolean;
  copyUrl: () => Promise<void>;
};

export function useUrlCopy(
  url: string,
  durationMs: number = DEFAULT_FEEDBACK_DURATION_MS,
): UseUrlCopyResult {
  const [isCopied, setIsCopied] = useState(false);
  const feedbackTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedbackTimeout = () => {
    if (feedbackTimeoutId.current) {
      clearTimeout(feedbackTimeoutId.current);
      feedbackTimeoutId.current = null;
    }
  };

  useEffect(() => {
    return clearFeedbackTimeout;
  }, []);

  const copyUrl = async () => {
    if (!url || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);

      clearFeedbackTimeout();

      feedbackTimeoutId.current = setTimeout(() => {
        setIsCopied(false);
        feedbackTimeoutId.current = null;
      }, durationMs);
    } catch {
      clearFeedbackTimeout();
      setIsCopied(false);
    }
  };

  return { isCopied, copyUrl };
}
