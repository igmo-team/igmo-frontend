import { useEffect, useRef, useState } from 'react';

import { captureAnalyticsEvent } from '../../../common/analytics';
import { createStompClient } from '../../../common/socket/createStompClient';
import {
  readHasPlayedCountdown,
  writeHasPlayedCountdown,
} from '../utils/countdownPlayedStorage';
import { parseGameResultSnapshot } from '../utils/parseGameResultSnapshot';
import { parseGuessSubmissionSnapshot } from '../utils/parseGuessSubmissionSnapshot';
import { parseImageGenerationSnapshot } from '../utils/parseImageGenerationSnapshot';
import { parseOwnVoteOptionNotice } from '../utils/parseOwnVoteOptionNotice';
import { parsePromptSubmissionSnapshot } from '../utils/parsePromptSubmissionSnapshot';
import { parseRoomSnapshot } from '../utils/parseRoomSnapshot';
import { parseRoundResultSnapshot } from '../utils/parseRoundResultSnapshot';
import { parseRoundSnapshot } from '../utils/parseRoundSnapshot';
import { parseSocketError } from '../utils/parseSocketError';
import { parseVoteSnapshot } from '../utils/parseVoteSnapshot';

import type {
  GameResultSnapshot,
  GuessSubmissionSnapshot,
  ImageGenerationSnapshot,
  OwnVoteOptionNotice,
  PromptSubmissionSnapshot,
  RoomPhase,
  RoomSnapshot,
  RoundResultSnapshot,
  RoundSnapshot,
  VoteSnapshot,
} from '../../../domain/room/types';
import type { RoomSession } from '../utils/roomSessionStorage';
import type { Client } from '@stomp/stompjs';

type UseRoomSocketParams = {
  roomCode?: string;
  roomSession: RoomSession | null;
  initialSnapshot: RoomSnapshot | null;
};

type OwnVoteOptionNoticeByRoundState = {
  roomCode: string;
  noticeByRound: Partial<Record<number, OwnVoteOptionNotice>>;
};

type UseRoomSocketResult = {
  phase: RoomPhase;
  receivedSnapshot: RoomSnapshot | null;
  promptSubmissionSnapshot: PromptSubmissionSnapshot | null;
  guessSubmissionSnapshot: GuessSubmissionSnapshot | null;
  roundSnapshot: RoundSnapshot | null;
  voteSnapshot: VoteSnapshot | null;
  roundResultSnapshot: RoundResultSnapshot | null;
  gameResultSnapshot: GameResultSnapshot | null;
  // 최초 ROUND_SNAPSHOT 수신 + 이번 탭에서 미재생일 때만 true
  isCountdownTriggered: boolean;
  imageGenerationSnapshot: ImageGenerationSnapshot | null;
  ownVoteOptionNoticeByRound: Partial<Record<number, OwnVoteOptionNotice>>;
  isConnected: boolean;
  errorMessage: string;
  sendReady: (nextReady: boolean) => void;
  sendStart: () => boolean;
  sendPrompt: (prompt: string) => boolean;
  sendGuess: (guess: string) => boolean;
  sendVote: (optionId: string) => boolean;
  sendRestart: () => void;
};

export function useRoomSocket({
  roomCode,
  roomSession,
  initialSnapshot,
}: UseRoomSocketParams): UseRoomSocketResult {
  const [phase, setPhase] = useState<RoomPhase>(
    () => initialSnapshot?.phase ?? 'LOBBY',
  );
  const [receivedSnapshot, setReceivedSnapshot] = useState<RoomSnapshot | null>(
    null,
  );
  const [promptSubmissionSnapshot, setPromptSubmissionSnapshot] =
    useState<PromptSubmissionSnapshot | null>(null);
  const [guessSubmissionSnapshot, setGuessSubmissionSnapshot] =
    useState<GuessSubmissionSnapshot | null>(null);
  const [roundSnapshot, setRoundSnapshot] = useState<RoundSnapshot | null>(
    null,
  );
  const [voteSnapshot, setVoteSnapshot] = useState<VoteSnapshot | null>(null);
  const [roundResultSnapshot, setRoundResultSnapshot] =
    useState<RoundResultSnapshot | null>(null);
  const [gameResultSnapshot, setGameResultSnapshot] =
    useState<GameResultSnapshot | null>(null);
  const [isCountdownTriggered, setIsCountdownTriggered] = useState(false);
  const hasHandledFirstRoundSnapshotRef = useRef(false);
  const [imageGenerationSnapshot, setImageGenerationSnapshot] =
    useState<ImageGenerationSnapshot | null>(null);
  const [ownVoteOptionNoticeByRoundState, setOwnVoteOptionNoticeByRoundState] =
    useState<OwnVoteOptionNoticeByRoundState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const stompClientRef = useRef<Client | null>(null);
  const lastMessageReceivedAtRef = useRef<number | null>(null);
  const hasConnectedRef = useRef(false);
  const hasConnectionLostRef = useRef(false);
  const hasReportedReconnectFailedRef = useRef(false);
  const socketAnalyticsPropertiesRef = useRef({
    room_code: roomCode,
    player_id: roomSession?.playerId,
    phase,
    round_number: undefined as number | undefined,
    total_round_count: undefined as number | undefined,
  });

  useEffect(() => {
    socketAnalyticsPropertiesRef.current = {
      room_code: roomCode,
      player_id: roomSession?.playerId,
      phase,
      round_number: getCurrentRoundNumber({
        roundSnapshot,
        voteSnapshot,
        roundResultSnapshot,
      }),
      total_round_count: getCurrentTotalRoundCount({
        roundSnapshot,
        roundResultSnapshot,
      }),
    };
  }, [
    phase,
    roomCode,
    roomSession?.playerId,
    roundResultSnapshot,
    roundSnapshot,
    voteSnapshot,
  ]);

  useEffect(() => {
    if (!roomCode || !roomSession) {
      return;
    }

    let isActive = true;
    const currentPlayerId = roomSession.playerId;
    const client = createStompClient();
    lastMessageReceivedAtRef.current = null;
    hasConnectedRef.current = false;
    hasConnectionLostRef.current = false;
    hasReportedReconnectFailedRef.current = false;
    stompClientRef.current = client;

    client.connectHeaders = {
      roomCode,
      playerId: currentPlayerId,
      secret: roomSession.secret,
    };

    client.onConnect = () => {
      if (!isActive) {
        return;
      }

      setIsConnected(true);
      setErrorMessage('');

      if (hasConnectionLostRef.current) {
        captureAnalyticsEvent('socket_reconnected', {
          ...socketAnalyticsPropertiesRef.current,
        });
      }

      hasConnectedRef.current = true;
      hasConnectionLostRef.current = false;
      hasReportedReconnectFailedRef.current = false;

      client.subscribe(`/topic/rooms/${roomCode}`, (message) => {
        if (!isActive) {
          return;
        }

        lastMessageReceivedAtRef.current = Date.now();

        const nextSnapshot = parseRoomSnapshot(message.body);

        if (nextSnapshot) {
          setReceivedSnapshot(nextSnapshot);
          setPhase(nextSnapshot.phase);
          if (nextSnapshot.phase === 'LOBBY') {
            setImageGenerationSnapshot(null);
            setGuessSubmissionSnapshot(null);
          }
          setErrorMessage('');
          return;
        }

        const nextRoundSnapshot = parseRoundSnapshot(message.body);

        if (nextRoundSnapshot) {
          if (!hasHandledFirstRoundSnapshotRef.current) {
            hasHandledFirstRoundSnapshotRef.current = true;
            setIsCountdownTriggered(!readHasPlayedCountdown(roomCode));
            writeHasPlayedCountdown(roomCode);
          }

          setRoundSnapshot(nextRoundSnapshot);
          setPhase(nextRoundSnapshot.phase);
          setErrorMessage('');
          return;
        }

        const nextPromptSnapshot = parsePromptSubmissionSnapshot(message.body);

        if (nextPromptSnapshot) {
          setPromptSubmissionSnapshot(nextPromptSnapshot);
          setGuessSubmissionSnapshot(null);
          setPhase(nextPromptSnapshot.phase);
          if (
            nextPromptSnapshot.promptEntries.find(
              (entry) => entry.player.id === currentPlayerId,
            )?.status === 'WAITING'
          ) {
            setImageGenerationSnapshot(null);
          }
          setErrorMessage('');
          return;
        }

        const nextVoteSnapshot = parseVoteSnapshot(message.body);

        if (nextVoteSnapshot) {
          setVoteSnapshot(nextVoteSnapshot);
          setPhase(nextVoteSnapshot.phase);
          setErrorMessage('');
          return;
        }

        const nextRoundResultSnapshot = parseRoundResultSnapshot(message.body);

        if (nextRoundResultSnapshot) {
          setRoundResultSnapshot(nextRoundResultSnapshot);
          setPhase(nextRoundResultSnapshot.phase);
          setErrorMessage('');
          return;
        }

        const nextGameResultSnapshot = parseGameResultSnapshot(message.body);

        if (nextGameResultSnapshot) {
          setGameResultSnapshot(nextGameResultSnapshot);
          setPhase(nextGameResultSnapshot.phase);
          setErrorMessage('');
        }
      });

      client.subscribe('/user/queue/image-generation', (message) => {
        if (!isActive) {
          return;
        }

        lastMessageReceivedAtRef.current = Date.now();

        const nextImageGenerationSnapshot = parseImageGenerationSnapshot(
          message.body,
        );

        if (nextImageGenerationSnapshot?.roomCode === roomCode) {
          setImageGenerationSnapshot(nextImageGenerationSnapshot);
        }
      });

      client.subscribe('/user/queue/guess-submission', (message) => {
        if (!isActive) {
          return;
        }

        lastMessageReceivedAtRef.current = Date.now();

        const nextGuessSubmissionSnapshot = parseGuessSubmissionSnapshot(
          message.body,
        );

        if (nextGuessSubmissionSnapshot?.roomCode !== roomCode) {
          return;
        }

        setGuessSubmissionSnapshot(nextGuessSubmissionSnapshot);

        if (nextGuessSubmissionSnapshot.status === 'REJECTED') {
          setErrorMessage(
            nextGuessSubmissionSnapshot.message ||
              '추측 프롬프트를 다시 확인해주세요.',
          );
          return;
        }

        setErrorMessage('');
      });

      client.subscribe('/user/queue/vote-own-option', (message) => {
        if (!isActive) {
          return;
        }

        lastMessageReceivedAtRef.current = Date.now();

        const nextOwnVoteOptionNotice = parseOwnVoteOptionNotice(message.body);

        if (nextOwnVoteOptionNotice?.roomCode === roomCode) {
          setOwnVoteOptionNoticeByRoundState((prev) => ({
            roomCode,
            noticeByRound: {
              ...(prev?.roomCode === roomCode ? prev.noticeByRound : {}),
              [nextOwnVoteOptionNotice.roundNumber]: nextOwnVoteOptionNotice,
            },
          }));
        }
      });

      client.subscribe('/user/queue/errors', (message) => {
        if (!isActive) {
          return;
        }

        lastMessageReceivedAtRef.current = Date.now();
        setErrorMessage(parseSocketError(message.body));
      });
    };

    client.onDisconnect = () => {
      if (isActive) {
        setIsConnected(false);
      }
    };

    client.onWebSocketClose = (event) => {
      if (isActive) {
        setIsConnected(false);

        if (hasConnectedRef.current && !hasConnectionLostRef.current) {
          hasConnectionLostRef.current = true;
          captureAnalyticsEvent('socket_connection_lost', {
            ...socketAnalyticsPropertiesRef.current,
            close_code: event.code,
            was_clean: event.wasClean,
            last_message_age_ms: getLastMessageAgeMs(
              lastMessageReceivedAtRef.current,
            ),
          });
        }
      }
    };

    client.onWebSocketError = () => {
      if (
        !isActive ||
        !hasConnectionLostRef.current ||
        hasReportedReconnectFailedRef.current
      ) {
        return;
      }

      hasReportedReconnectFailedRef.current = true;
      captureAnalyticsEvent('socket_reconnect_failed', {
        ...socketAnalyticsPropertiesRef.current,
        reason: 'WEBSOCKET_ERROR',
      });
    };

    client.activate();

    return () => {
      isActive = false;
      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }
      setIsConnected(false);
      client.deactivate();
    };
  }, [roomSession, roomCode]);

  const publish = (destination: string, body?: string) => {
    if (!roomCode || !stompClientRef.current?.connected) {
      return false;
    }

    setErrorMessage('');
    stompClientRef.current.publish({
      destination,
      ...(body === undefined
        ? {}
        : { body, headers: { 'content-type': 'application/json' } }),
    });
    return true;
  };

  const sendReady = (nextReady: boolean) => {
    publish(
      `/app/rooms/${roomCode}/ready`,
      JSON.stringify({ ready: nextReady }),
    );
  };

  const sendStart = () => {
    return publish(`/app/rooms/${roomCode}/start`);
  };

  const sendPrompt = (prompt: string) => {
    if (!roomCode) {
      return false;
    }

    return publish(
      `/app/rooms/${roomCode}/prompts`,
      JSON.stringify({ prompt }),
    );
  };

  const sendGuess = (guess: string) => {
    return publish(`/app/rooms/${roomCode}/guesses`, JSON.stringify({ guess }));
  };

  const sendVote = (optionId: string) => {
    return publish(
      `/app/rooms/${roomCode}/votes`,
      JSON.stringify({ optionId }),
    );
  };

  const sendRestart = () => {
    const isPublished = publish(`/app/rooms/${roomCode}/restart`);

    if (isPublished) {
      setOwnVoteOptionNoticeByRoundState(null);
      setGuessSubmissionSnapshot(null);
    }
  };

  const activeOwnVoteOptionNoticeByRound =
    ownVoteOptionNoticeByRoundState &&
    ownVoteOptionNoticeByRoundState.roomCode === roomCode
      ? ownVoteOptionNoticeByRoundState.noticeByRound
      : {};
  const activeGuessSubmissionSnapshot =
    guessSubmissionSnapshot?.roomCode === roomCode
      ? guessSubmissionSnapshot
      : null;

  return {
    phase,
    receivedSnapshot,
    promptSubmissionSnapshot,
    guessSubmissionSnapshot: activeGuessSubmissionSnapshot,
    roundSnapshot,
    voteSnapshot,
    roundResultSnapshot,
    gameResultSnapshot,
    isCountdownTriggered,
    imageGenerationSnapshot,
    ownVoteOptionNoticeByRound: activeOwnVoteOptionNoticeByRound,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
    sendPrompt,
    sendGuess,
    sendVote,
    sendRestart,
  };
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

function getLastMessageAgeMs(lastMessageReceivedAt: number | null) {
  if (lastMessageReceivedAt === null) {
    return null;
  }

  return Date.now() - lastMessageReceivedAt;
}
