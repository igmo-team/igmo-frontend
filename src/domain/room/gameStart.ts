import type { RoomSnapshot } from './types';

export const MIN_PLAYERS_TO_START = 3;

export function areAllGuestsReady(snapshot: RoomSnapshot): boolean {
  return snapshot.players
    .filter((player) => player.id !== snapshot.hostId)
    .every((player) => player.ready);
}
