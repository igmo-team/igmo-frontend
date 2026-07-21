import type {
  RoomMessage,
  RoomPlayer,
  VoteEntry,
  VoteOption,
  VoteSnapshot,
} from '../../../domain/room/types';

export function parseVoteSnapshot(body: string): VoteSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<VoteSnapshot>;

    if (data.type === 'VOTE_SNAPSHOT' && isVoteSnapshot(data.payload)) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isVoteSnapshot(value: unknown): value is VoteSnapshot {
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
    typeof snapshot.voteDeadline === 'string' &&
    Array.isArray(snapshot.voteEntries) &&
    snapshot.voteEntries.every(isVoteEntry)
  );
}

function isVoteOption(value: unknown): value is VoteOption {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const option = value as Partial<VoteOption>;

  return (
    typeof option.optionId === 'string' &&
    (option.authorId === undefined || typeof option.authorId === 'string') &&
    typeof option.text === 'string'
  );
}

function isVoteEntry(value: unknown): value is VoteEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<VoteEntry>;

  return isRoomPlayer(entry.player) && typeof entry.voted === 'boolean';
}

function isRoomPlayer(value: unknown): value is RoomPlayer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const player = value as Partial<RoomPlayer>;

  return (
    typeof player.id === 'string' &&
    typeof player.nickname === 'string' &&
    typeof player.score === 'number' &&
    typeof player.ready === 'boolean'
  );
}
