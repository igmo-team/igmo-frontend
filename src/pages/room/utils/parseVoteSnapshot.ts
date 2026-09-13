import type { VoteOption, VoteSnapshot } from '../../../domain/room/types';

export function isVoteSnapshot(value: unknown): value is VoteSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<VoteSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'VOTING' &&
    typeof snapshot.roundNumber === 'number' &&
    Array.isArray(snapshot.voteOptions) &&
    snapshot.voteOptions.every(isVoteOption) &&
    typeof snapshot.voteStartedAt === 'string' &&
    typeof snapshot.voteDeadline === 'string' &&
    typeof snapshot.completedVoteCount === 'number' &&
    typeof snapshot.totalVoteCount === 'number' &&
    typeof snapshot.perfectGuessExists === 'boolean'
  );
}

function isVoteOption(value: unknown): value is VoteOption {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const option = value as Partial<VoteOption>;

  return typeof option.optionId === 'string' && typeof option.text === 'string';
}
