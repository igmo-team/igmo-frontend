import type {
  GuessSubmissionSnapshot,
  GuessSubmissionStatus,
} from '../../../domain/room/types';

const GUESS_SUBMISSION_STATUSES = [
  'SUBMITTED',
  'REJECTED',
  'PERFECT_RETRY_REQUIRED',
] as const satisfies readonly GuessSubmissionStatus[];

export function parseGuessSubmissionSnapshot(
  body: string,
): GuessSubmissionSnapshot | null {
  try {
    const data = JSON.parse(body) as unknown;

    if (isGuessSubmissionSnapshot(data)) {
      return data;
    }
  } catch {
    return null;
  }

  return null;
}

function isGuessSubmissionSnapshot(
  value: unknown,
): value is GuessSubmissionSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<GuessSubmissionSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    typeof snapshot.roundNumber === 'number' &&
    typeof snapshot.totalRoundCount === 'number' &&
    typeof snapshot.status === 'string' &&
    GUESS_SUBMISSION_STATUSES.includes(snapshot.status) &&
    typeof snapshot.guess === 'string' &&
    (snapshot.confirmedScore === null ||
      typeof snapshot.confirmedScore === 'number') &&
    (snapshot.message === null || typeof snapshot.message === 'string')
  );
}
