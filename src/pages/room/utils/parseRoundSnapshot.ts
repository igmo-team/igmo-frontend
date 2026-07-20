import type { RoomMessage, RoundSnapshot } from '../../../domain/room/types';

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
    Boolean(snapshot.questioner) &&
    typeof snapshot.imageUrl === 'string' &&
    typeof snapshot.guessDeadline === 'string' &&
    Array.isArray(snapshot.guessEntries)
  );
}
