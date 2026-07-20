import type {
  RoomMessage,
  RoomPlayer,
  RoundGuessEntry,
  RoundSnapshot,
} from '../../../domain/room/types';

export function parseRoundSnapshot(body: string): RoundSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<RoundSnapshot>;

    if (data.type === 'ROUND_SNAPSHOT' && isRoundSnapshot(data.payload)) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isRoundSnapshot(value: unknown): value is RoundSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<RoundSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'PLAYING' &&
    typeof snapshot.roundNumber === 'number' &&
    typeof snapshot.totalRoundCount === 'number' &&
    isRoomPlayer(snapshot.questioner) &&
    typeof snapshot.imageUrl === 'string' &&
    typeof snapshot.guessDeadline === 'string' &&
    Array.isArray(snapshot.guessEntries) &&
    snapshot.guessEntries.every(isRoundGuessEntry)
  );
}

function isRoundGuessEntry(value: unknown): value is RoundGuessEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<RoundGuessEntry>;

  return isRoomPlayer(entry.player) && typeof entry.submitted === 'boolean';
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
