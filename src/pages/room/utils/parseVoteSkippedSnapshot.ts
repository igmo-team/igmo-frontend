import type {
  VoteSkippedReason,
  VoteSkippedSnapshot,
} from '../../../domain/room/types';

const VOTE_SKIPPED_REASONS = [
  'ALL_PERFECT',
] as const satisfies readonly VoteSkippedReason[];

export function isVoteSkippedSnapshot(
  value: unknown,
): value is VoteSkippedSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<VoteSkippedSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'VOTE_SKIPPED' &&
    typeof snapshot.roundNumber === 'number' &&
    typeof snapshot.startedAt === 'string' &&
    typeof snapshot.deadline === 'string' &&
    isVoteSkippedReason(snapshot.reason)
  );
}

function isVoteSkippedReason(value: unknown): value is VoteSkippedReason {
  return (
    typeof value === 'string' &&
    VOTE_SKIPPED_REASONS.includes(value as VoteSkippedReason)
  );
}
