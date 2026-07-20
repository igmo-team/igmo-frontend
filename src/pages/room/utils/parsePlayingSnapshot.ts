import type { PlayingSnapshot, RoomMessage } from '../../../domain/room/types';

export function parsePlayingSnapshot(body: string): PlayingSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<PlayingSnapshot>;

    if (
      data.type === 'PLAYING_SNAPSHOT' &&
      isPlayingSnapshot(data.payload)
    ) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isPlayingSnapshot(value: unknown): value is PlayingSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<PlayingSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'PLAYING' &&
    typeof snapshot.round === 'number' &&
    typeof snapshot.turnId === 'string' &&
    typeof snapshot.promptStartedAt === 'string' &&
    typeof snapshot.promptDeadline === 'string' &&
    typeof snapshot.imageUrl === 'string' &&
    typeof snapshot.promptSubmissionOpen === 'boolean' &&
    Boolean(snapshot.imageOwner) &&
    Array.isArray(snapshot.players)
  );
}
