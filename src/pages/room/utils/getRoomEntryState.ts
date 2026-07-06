import type { RoomSnapshot } from '../../../domain/room/types';

export type RoomEntryState = {
  snapshot: RoomSnapshot;
  playerId: string;
  secret: string;
};

export function getRoomEntryState(state: unknown): RoomEntryState | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const maybeState = state as Partial<RoomEntryState>;
  const maybeSnapshot = maybeState.snapshot;

  if (
    typeof maybeState.playerId !== 'string' ||
    typeof maybeState.secret !== 'string' ||
    !maybeSnapshot ||
    typeof maybeSnapshot.roomCode !== 'string' ||
    !Array.isArray(maybeSnapshot.players)
  ) {
    return null;
  }

  return {
    playerId: maybeState.playerId,
    secret: maybeState.secret,
    snapshot: maybeSnapshot,
  };
}
