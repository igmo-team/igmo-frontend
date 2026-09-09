import type {
  FinalRankingEntry,
  GameResultSnapshot,
  RoomPlayer,
} from '../../../domain/room/types';

export function isGameResultSnapshot(
  value: unknown,
): value is GameResultSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<GameResultSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'ENDED' &&
    Array.isArray(snapshot.finalRanking) &&
    snapshot.finalRanking.every(isFinalRankingEntry)
  );
}

function isFinalRankingEntry(value: unknown): value is FinalRankingEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const rankingEntry = value as Partial<FinalRankingEntry>;

  return (
    isRoomPlayer(rankingEntry.player) &&
    typeof rankingEntry.rank === 'number' &&
    typeof rankingEntry.totalScore === 'number'
  );
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
