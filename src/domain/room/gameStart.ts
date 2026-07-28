import type { RoomSnapshot } from './types';

export function areAllGuestsReady(snapshot: RoomSnapshot): boolean {
  return snapshot.players
    .filter((player) => player.id !== snapshot.hostId)
    .every((player) => player.ready);
}
