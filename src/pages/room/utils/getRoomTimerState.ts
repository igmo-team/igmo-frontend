import type { useRoomSocket } from '../hooks/useRoomSocket';

type RoomSocket = ReturnType<typeof useRoomSocket>;

type GetRoomTimerRangeParams = {
  roomSocket: RoomSocket;
  activeImageGenerationSnapshot: RoomSocket['imageGenerationSnapshot'];
  isCountdownPlaying: boolean;
};

export type RoomTimerRange = {
  startedAt: string;
  deadline: string;
};

export type RoomTimerState = {
  seconds: number;
  progressRatio: number;
};

export function getRoomTimerRange({
  roomSocket,
  activeImageGenerationSnapshot,
  isCountdownPlaying,
}: GetRoomTimerRangeParams): RoomTimerRange | null {
  const { currentSnapshot } = roomSocket;

  if (!currentSnapshot) {
    return null;
  }

  switch (currentSnapshot.type) {
    case 'PROMPT_SUBMISSION_SNAPSHOT': {
      const shouldShowPromptTimer =
        activeImageGenerationSnapshot?.status !== 'GENERATING' &&
        activeImageGenerationSnapshot?.status !== 'READY';

      if (!shouldShowPromptTimer) {
        return null;
      }

      return {
        startedAt: currentSnapshot.promptStartedAt,
        deadline: currentSnapshot.promptDeadline,
      };
    }

    case 'ROUND_SNAPSHOT':
      if (isCountdownPlaying) {
        return null;
      }

      return {
        startedAt: currentSnapshot.guessStartedAt,
        deadline: currentSnapshot.guessDeadline,
      };

    case 'VOTE_SNAPSHOT':
      return {
        startedAt: currentSnapshot.voteStartedAt,
        deadline: currentSnapshot.voteDeadline,
      };

    case 'ROUND_RESULT_SNAPSHOT':
      return {
        startedAt: currentSnapshot.resultStartedAt,
        deadline: currentSnapshot.resultDeadline,
      };

    case 'LOBBY_SNAPSHOT':
    case 'GAME_RESULT_SNAPSHOT':
      return null;
  }
}

export function getRoomTimerState(
  timerRange: RoomTimerRange | null,
  countdownSeconds: number,
): RoomTimerState | null {
  if (!timerRange) {
    return null;
  }

  const totalSeconds = getTimerTotalSeconds(
    timerRange.startedAt,
    timerRange.deadline,
  );
  const seconds = Math.min(countdownSeconds, totalSeconds);

  return {
    seconds,
    progressRatio:
      totalSeconds > 0 ? Math.min(Math.max(seconds / totalSeconds, 0), 1) : 0,
  };
}

function getTimerTotalSeconds(startedAt: string, deadline: string) {
  const startedAtTime = new Date(startedAt).getTime();
  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(startedAtTime) || Number.isNaN(deadlineTime)) {
    return 0;
  }

  return Math.max(0, Math.round((deadlineTime - startedAtTime) / 1000));
}
