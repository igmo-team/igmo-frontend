import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
} from '../../../common/analytics';

import type {
  GameResultSnapshot,
  GuessSubmissionPayload,
  PromptSubmissionPayload,
  RoomPhase,
  RoomSnapshot,
  RoundResultSnapshot,
  RoundSnapshot,
  VoteSnapshot,
} from '../../../domain/room/types';

type UseRoomAnalyticsParams = {
  roomCode: string;
  currentPlayerId?: string;
  roomSnapshot: RoomSnapshot | null;
  phase: RoomPhase;
  roundSnapshot: RoundSnapshot | null;
  voteSnapshot: VoteSnapshot | null;
  roundResultSnapshot: RoundResultSnapshot | null;
  gameResultSnapshot: GameResultSnapshot | null;
};

export function useRoomAnalytics({
  roomCode,
  currentPlayerId,
  roomSnapshot,
  phase,
  roundSnapshot,
  voteSnapshot,
  roundResultSnapshot,
  gameResultSnapshot,
}: UseRoomAnalyticsParams) {
  const trackedPhaseKeyRef = useRef('');
  const trackedGameCompletedRoomCodeRef = useRef('');
  const roomAnalyticsProperties = useMemo(
    () => ({
      room_code: roomCode,
      player_id: currentPlayerId,
      is_host: roomSnapshot
        ? roomSnapshot.hostId === currentPlayerId
        : undefined,
      player_count: roomSnapshot?.players.length,
      phase,
      is_questioner: roundSnapshot
        ? roundSnapshot.questioner.id === currentPlayerId
        : undefined,
      round_number: getCurrentRoundNumber({
        roundSnapshot,
        voteSnapshot,
        roundResultSnapshot,
      }),
      total_round_count: getCurrentTotalRoundCount({
        roundSnapshot,
        roundResultSnapshot,
      }),
    }),
    [
      currentPlayerId,
      phase,
      roomCode,
      roomSnapshot,
      roundResultSnapshot,
      roundSnapshot,
      voteSnapshot,
    ],
  );

  useEffect(() => {
    if (currentPlayerId) {
      identifyAnalyticsUser(currentPlayerId);
    }
  }, [currentPlayerId]);

  useEffect(() => {
    if (!roomSnapshot || !roomCode) {
      return;
    }

    const phaseKey = [
      roomCode,
      phase,
      roomAnalyticsProperties.round_number ?? '',
    ].join(':');

    if (trackedPhaseKeyRef.current === phaseKey) {
      return;
    }

    trackedPhaseKeyRef.current = phaseKey;
    captureAnalyticsEvent('game_phase_entered', roomAnalyticsProperties);
  }, [phase, roomAnalyticsProperties, roomCode, roomSnapshot]);

  useEffect(() => {
    if (
      phase !== 'ENDED' ||
      !roomCode ||
      !gameResultSnapshot ||
      trackedGameCompletedRoomCodeRef.current === roomCode
    ) {
      return;
    }

    trackedGameCompletedRoomCodeRef.current = roomCode;
    captureAnalyticsEvent('game_completed', {
      ...roomAnalyticsProperties,
      player_count: gameResultSnapshot.finalRanking.length,
    });
  }, [gameResultSnapshot, phase, roomAnalyticsProperties, roomCode]);

  const trackGameStarted = useCallback(() => {
    captureAnalyticsEvent('game_started', roomAnalyticsProperties);
  }, [roomAnalyticsProperties]);

  const trackPromptSubmitted = useCallback(
    ({ prompt, submissionType }: PromptSubmissionPayload) => {
      captureAnalyticsEvent('prompt_submitted', {
        ...roomAnalyticsProperties,
        prompt_length: prompt.length,
        submission_type: submissionType,
      });
    },
    [roomAnalyticsProperties],
  );

  const trackGuessSubmitted = useCallback(
    ({ guess, submissionType }: GuessSubmissionPayload) => {
      captureAnalyticsEvent('guess_submitted', {
        ...roomAnalyticsProperties,
        guess_length: guess.length,
        submission_type: submissionType,
      });
    },
    [roomAnalyticsProperties],
  );

  const trackVoteSubmitted = useCallback(() => {
    captureAnalyticsEvent('vote_submitted', roomAnalyticsProperties);
  }, [roomAnalyticsProperties]);

  return useMemo(
    () => ({
      trackGameStarted,
      trackPromptSubmitted,
      trackGuessSubmitted,
      trackVoteSubmitted,
    }),
    [
      trackGameStarted,
      trackGuessSubmitted,
      trackPromptSubmitted,
      trackVoteSubmitted,
    ],
  );
}

function getCurrentRoundNumber({
  roundSnapshot,
  voteSnapshot,
  roundResultSnapshot,
}: {
  roundSnapshot: RoundSnapshot | null;
  voteSnapshot: VoteSnapshot | null;
  roundResultSnapshot: RoundResultSnapshot | null;
}) {
  return (
    roundSnapshot?.roundNumber ??
    voteSnapshot?.roundNumber ??
    roundResultSnapshot?.roundNumber
  );
}

function getCurrentTotalRoundCount({
  roundSnapshot,
  roundResultSnapshot,
}: {
  roundSnapshot: RoundSnapshot | null;
  roundResultSnapshot: RoundResultSnapshot | null;
}) {
  return roundSnapshot?.totalRoundCount ?? roundResultSnapshot?.totalRoundCount;
}
