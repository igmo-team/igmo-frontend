import type { RoomMessage, RoomSnapshot } from '../../../domain/room/types';

export function parseRoomSnapshot(body: string): RoomSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<RoomSnapshot> | RoomSnapshot;

    if (isRoomSnapshot(data)) {
      return data;
    }

    if (data.type === 'LOBBY_SNAPSHOT' && isRoomSnapshot(data.payload)) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isRoomSnapshot(value: unknown): value is RoomSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<RoomSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    typeof snapshot.phase === 'string' &&
    typeof snapshot.hostId === 'string' &&
    Array.isArray(snapshot.players)
  );
}
