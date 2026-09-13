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
      player_count: getPlayerCount(currentSnapshot),
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
    captureAnalyticsEvent('game_completed', roomAnalyticsProperties);
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

// 참가자 배열이 없는 투표 단계는 totalVoteCount로 근사한다.
function getPlayerCount(
  snapshot: RoomTopicSnapshot | null,
): number | undefined {
  if (!snapshot) {
    return undefined;
  }

  switch (snapshot.type) {
    case 'LOBBY_SNAPSHOT':
    case 'ROUND_RESULT_SNAPSHOT':
      return snapshot.players.length;
    case 'PROMPT_SUBMISSION_SNAPSHOT':
      return snapshot.promptEntries.length;
    case 'ROUND_SNAPSHOT':
      return snapshot.guessEntries.length + 1; // 출제자 포함
    case 'VOTE_SNAPSHOT':
      return snapshot.totalVoteCount;
    case 'GAME_RESULT_SNAPSHOT':
      return snapshot.finalRanking.length;
  }
}
