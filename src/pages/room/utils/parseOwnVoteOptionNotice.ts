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
    typeof notice.ownImage !== 'boolean' ||
    typeof notice.voteAllowed !== 'boolean' ||
    !isVoteDisabledReasonOrNull(notice.voteDisabledReason)
  ) {
    return false;
  }

  if (notice.ownImage) {
    return (
      notice.voteAllowed === false &&
      notice.voteDisabledReason === 'QUESTIONER' &&
      notice.optionId === null
    );
  }

  if (typeof notice.optionId !== 'string') {
    return false;
  }

  if (notice.voteAllowed) {
    return notice.voteDisabledReason === null;
  }

  return notice.voteDisabledReason === 'PERFECT_GUESS';
}

function isVoteDisabledReasonOrNull(
  value: unknown,
): value is OwnVoteOptionNotice['voteDisabledReason'] {
  return value === null || value === 'QUESTIONER' || value === 'PERFECT_GUESS';
}
