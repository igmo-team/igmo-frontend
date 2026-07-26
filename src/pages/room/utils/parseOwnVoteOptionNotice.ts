import type { OwnVoteOptionNotice } from '../../../domain/room/types';

export function parseOwnVoteOptionNotice(
  body: string,
): OwnVoteOptionNotice | null {
  try {
    const data = JSON.parse(body) as unknown;

    if (isOwnVoteOptionNotice(data)) {
      return data;
    }
  } catch {
    return null;
  }

  return null;
}

function isOwnVoteOptionNotice(value: unknown): value is OwnVoteOptionNotice {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const notice = value as Partial<OwnVoteOptionNotice>;

  if (
    typeof notice.roomCode !== 'string' ||
    typeof notice.roundNumber !== 'number' ||
    typeof notice.ownImage !== 'boolean'
  ) {
    return false;
  }

  if (notice.ownImage) {
    return notice.optionId === null;
  }

  return typeof notice.optionId === 'string';
}
