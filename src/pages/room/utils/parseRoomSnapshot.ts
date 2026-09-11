import type { RoomSnapshot } from '../../../domain/room/types';

export function isRoomSnapshot(value: unknown): value is RoomSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<RoomSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'LOBBY' &&
    typeof snapshot.hostId === 'string' &&
    Array.isArray(snapshot.players)
  );
}
