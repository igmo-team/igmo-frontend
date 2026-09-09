import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  captureAnalyticsEvent,
  identifyAnalyticsUser,
} from '../../../common/analytics';

import type {
  GuessSubmissionPayload,
  PromptSubmissionPayload,
  RoomPhase,
  RoomTopicSnapshot,
} from '../../../domain/room/types';

type UseRoomAnalyticsParams = {
  roomCode: string;
  currentPlayerId?: string;
  currentSnapshot: RoomTopicSnapshot | null;
  phase: RoomPhase;
};

export function useRoomAnalytics({
  roomCode,
  currentPlayerId,
  currentSnapshot,
  phase,
}: UseRoomAnalyticsParams) {
  const trackedPhaseKeyRef = useRef('');
  const trackedGameCompletedRoomCodeRef = useRef('');
  const roomAnalyticsProperties = useMemo(
    () => ({
      room_code: roomCode,
      player_id: currentPlayerId,
      is_host:
        currentSnapshot?.type === 'LOBBY_SNAPSHOT'
          ? currentSnapshot.hostId === currentPlayerId
          : undefined,
      player_count:
        currentSnapshot && 'players' in currentSnapshot
          ? currentSnapshot.players.length
          : undefined,
      phase,
      is_questioner:
        currentSnapshot && 'questioner' in currentSnapshot
          ? currentSnapshot.questioner.id === currentPlayerId
          : undefined,
      round_number:
        currentSnapshot && 'roundNumber' in currentSnapshot
          ? currentSnapshot.roundNumber
          : undefined,
      total_round_count:
        currentSnapshot && 'totalRoundCount' in currentSnapshot
          ? currentSnapshot.totalRoundCount
          : undefined,
    }),
    [currentPlayerId, currentSnapshot, phase, roomCode],
  );

  useEffect(() => {
    if (currentPlayerId) {
      identifyAnalyticsUser(currentPlayerId);
    }
  }, [currentPlayerId]);

  useEffect(() => {
    if (!currentSnapshot || !roomCode) {
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
  }, [currentSnapshot, phase, roomAnalyticsProperties, roomCode]);

  useEffect(() => {
    if (
      phase !== 'ENDED' ||
      !roomCode ||
      currentSnapshot?.type !== 'GAME_RESULT_SNAPSHOT' ||
      trackedGameCompletedRoomCodeRef.current === roomCode
    ) {
      return;
    }

    trackedGameCompletedRoomCodeRef.current = roomCode;
    captureAnalyticsEvent('game_completed', {
      ...roomAnalyticsProperties,
      player_count: currentSnapshot.finalRanking.length,
    });
  }, [currentSnapshot, phase, roomAnalyticsProperties, roomCode]);

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
