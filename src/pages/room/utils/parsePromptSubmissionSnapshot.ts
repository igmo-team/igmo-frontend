import type {
  PromptSubmissionSnapshot,
  RoomMessage,
} from '../../../domain/room/types';

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
    Array.isArray(snapshot.promptEntries)
  );
}
