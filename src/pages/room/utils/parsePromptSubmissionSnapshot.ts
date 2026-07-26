import type {
  PromptEntry,
  PromptSubmissionSnapshot,
  RoomMessage,
  RoomPlayer,
} from '../../../domain/room/types';

const PROMPT_ENTRY_STATUSES = [
  'WAITING',
  'GENERATING',
  'READY',
  'FAILED',
] as const;

export function parsePromptSubmissionSnapshot(
  body: string,
): PromptSubmissionSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<PromptSubmissionSnapshot>;

    if (
      data.type === 'PROMPT_SUBMISSION_SNAPSHOT' &&
      isPromptSubmissionSnapshot(data.payload)
    ) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isPromptSubmissionSnapshot(
  value: unknown,
): value is PromptSubmissionSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<PromptSubmissionSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    typeof snapshot.phase === 'string' &&
    typeof snapshot.promptStartedAt === 'string' &&
    typeof snapshot.promptDeadline === 'string' &&
    Array.isArray(snapshot.promptEntries) &&
    snapshot.promptEntries.every(isPromptEntry)
  );
}

function isPromptEntry(value: unknown): value is PromptEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<PromptEntry>;

  return (
    isRoomPlayer(entry.player) &&
    typeof entry.status === 'string' &&
    (PROMPT_ENTRY_STATUSES as readonly string[]).includes(entry.status)
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
