import type {
  RoomMessage,
  RoomPlayer,
  RoundResult,
  RoundResultSnapshot,
  RoundScoreDetail,
  RoundScoreReason,
} from '../../../domain/room/types';

const ROUND_SCORE_REASONS = [
  'CORRECT_ANSWER',
  'FOOLED_PLAYER',
  'QUESTIONER',
] as const satisfies readonly RoundScoreReason[];

export function parseRoundResultSnapshot(
  body: string,
): RoundResultSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<RoundResultSnapshot>;

    if (
      data.type === 'ROUND_RESULT_SNAPSHOT' &&
      isRoundResultSnapshot(data.payload)
    ) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isRoundResultSnapshot(value: unknown): value is RoundResultSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<RoundResultSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    snapshot.phase === 'RESULTS' &&
    typeof snapshot.roundNumber === 'number' &&
    typeof snapshot.totalRoundCount === 'number' &&
    isRoomPlayer(snapshot.questioner) &&
    typeof snapshot.answerText === 'string' &&
    typeof snapshot.resultDeadline === 'string' &&
    Array.isArray(snapshot.results) &&
    snapshot.results.every(isRoundResult) &&
    Array.isArray(snapshot.players) &&
    snapshot.players.every(isRoomPlayer)
  );
}

function isRoundResult(value: unknown): value is RoundResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const result = value as Partial<RoundResult>;

  return (
    isRoomPlayer(result.player) &&
    typeof result.guessText === 'string' &&
    typeof result.isAnswer === 'boolean' &&
    typeof result.roundScore === 'number' &&
    Array.isArray(result.voters) &&
    result.voters.every(isRoomPlayer) &&
    Array.isArray(result.scoreDetails) &&
    result.scoreDetails.every(isRoundScoreDetail)
  );
}

function isRoundScoreDetail(value: unknown): value is RoundScoreDetail {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const scoreDetail = value as Partial<RoundScoreDetail>;

  return (
    isRoundScoreReason(scoreDetail.reason) &&
    typeof scoreDetail.label === 'string' &&
    typeof scoreDetail.score === 'number'
  );
}

function isRoundScoreReason(value: unknown): value is RoundScoreReason {
  return (
    typeof value === 'string' &&
    ROUND_SCORE_REASONS.includes(value as RoundScoreReason)
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
