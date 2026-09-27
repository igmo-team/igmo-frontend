import type { LobbyExpiredSnapshot } from '../../../domain/room/types';

export function isLobbyExpiredSnapshot(
  value: unknown,
): value is Omit<LobbyExpiredSnapshot, 'type'> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<LobbyExpiredSnapshot>;

  return typeof snapshot.roomCode === 'string';
}
