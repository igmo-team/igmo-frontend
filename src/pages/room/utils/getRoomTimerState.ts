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
  const {
    phase,
    promptSubmissionSnapshot,
    roundSnapshot,
    voteSnapshot,
    roundResultSnapshot,
  } = roomSocket;

  switch (phase) {
    case 'GENERATING': {
      const shouldShowPromptTimer =
        activeImageGenerationSnapshot?.status !== 'GENERATING' &&
        activeImageGenerationSnapshot?.status !== 'READY';

      if (!shouldShowPromptTimer || !promptSubmissionSnapshot) {
        return null;
      }

      return {
        startedAt: promptSubmissionSnapshot.promptStartedAt,
        deadline: promptSubmissionSnapshot.promptDeadline,
      };
    }

    case 'PLAYING':
      if (isCountdownPlaying || !roundSnapshot) {
        return null;
      }

      return {
        startedAt: roundSnapshot.guessStartedAt,
        deadline: roundSnapshot.guessDeadline,
      };

    case 'VOTING':
      if (!voteSnapshot) {
        return null;
      }

      return {
        startedAt: voteSnapshot.voteStartedAt,
        deadline: voteSnapshot.voteDeadline,
      };

    case 'RESULTS':
      if (!roundResultSnapshot) {
        return null;
      }

      return {
        startedAt: roundResultSnapshot.resultStartedAt,
        deadline: roundResultSnapshot.resultDeadline,
      };

    case 'LOBBY':
    case 'SUBMITTING':
    case 'ENDED':
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
