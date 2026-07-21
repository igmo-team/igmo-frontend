import { useEffect, useRef, useState } from 'react';

import { createStompClient } from '../../../common/socket/createStompClient';
import {
  readHasPlayedCountdown,
  writeHasPlayedCountdown,
} from '../utils/countdownPlayedStorage';
import { parseImageGenerationSnapshot } from '../utils/parseImageGenerationSnapshot';
import { parsePromptSubmissionSnapshot } from '../utils/parsePromptSubmissionSnapshot';
import { parseRoomSnapshot } from '../utils/parseRoomSnapshot';
import { parseRoundSnapshot } from '../utils/parseRoundSnapshot';
import { parseSocketError } from '../utils/parseSocketError';

import type {
  ImageGenerationSnapshot,
  PromptSubmissionSnapshot,
  RoomPhase,
  RoomSnapshot,
  RoundSnapshot,
} from '../../../domain/room/types';
import type { RoomEntryState } from '../utils/getRoomEntryState';
import type { Client } from '@stomp/stompjs';

type UseRoomSocketParams = {
  roomCode?: string;
  entryState: RoomEntryState | null;
};

type UseRoomSocketResult = {
  phase: RoomPhase;
  receivedSnapshot: RoomSnapshot | null;
  promptSubmissionSnapshot: PromptSubmissionSnapshot | null;
  roundSnapshot: RoundSnapshot | null;
  // 최초 ROUND_SNAPSHOT 수신 + 이번 탭에서 미재생일 때만 true
  isCountdownTriggered: boolean;
  imageGenerationSnapshot: ImageGenerationSnapshot | null;
  isConnected: boolean;
  errorMessage: string;
  sendReady: (nextReady: boolean) => void;
  sendStart: () => void;
  sendPrompt: (prompt: string) => void;
};

export function useRoomSocket({
  roomCode,
  entryState,
}: UseRoomSocketParams): UseRoomSocketResult {
  const [phase, setPhase] = useState<RoomPhase>(
    () => entryState?.snapshot.phase ?? 'LOBBY',
  );
  const [receivedSnapshot, setReceivedSnapshot] = useState<RoomSnapshot | null>(
    null,
  );
  const [promptSubmissionSnapshot, setPromptSubmissionSnapshot] =
    useState<PromptSubmissionSnapshot | null>(null);
  const [roundSnapshot, setRoundSnapshot] = useState<RoundSnapshot | null>(
    null,
  );
  const [isCountdownTriggered, setIsCountdownTriggered] = useState(false);
  const hasHandledFirstRoundSnapshotRef = useRef(false);
  const [imageGenerationSnapshot, setImageGenerationSnapshot] =
    useState<ImageGenerationSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!roomCode || !entryState) {
      return;
    }

    let isActive = true;
    const client = createStompClient();
    stompClientRef.current = client;

    client.connectHeaders = {
      roomCode,
      playerId: entryState.playerId,
      secret: entryState.secret,
    };

    client.onConnect = () => {
      if (!isActive) {
        return;
      }

      setIsConnected(true);
      setErrorMessage('');

      client.subscribe(`/topic/rooms/${roomCode}`, (message) => {
        if (!isActive) {
          return;
        }

        const nextSnapshot = parseRoomSnapshot(message.body);

        if (nextSnapshot) {
          setReceivedSnapshot(nextSnapshot);
          setPhase(nextSnapshot.phase);
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
          setPhase(nextPromptSnapshot.phase);
          setErrorMessage('');
        }
      });

      client.subscribe('/user/queue/image-generation', (message) => {
        if (!isActive) {
          return;
        }

        const nextImageGenerationSnapshot = parseImageGenerationSnapshot(
          message.body,
        );

        if (nextImageGenerationSnapshot) {
          setImageGenerationSnapshot(nextImageGenerationSnapshot);
        }
      });

      client.subscribe('/user/queue/errors', (message) => {
        if (!isActive) {
          return;
        }

        setErrorMessage(parseSocketError(message.body));
      });
    };

    client.onDisconnect = () => {
      if (isActive) {
        setIsConnected(false);
      }
    };

    client.onWebSocketClose = () => {
      if (isActive) {
        setIsConnected(false);
      }
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
  }, [entryState, roomCode]);

  const publish = (destination: string, body?: string) => {
    if (!roomCode || !stompClientRef.current?.connected) {
      return;
    }

    setErrorMessage('');
    stompClientRef.current.publish({
      destination,
      ...(body === undefined
        ? {}
        : { body, headers: { 'content-type': 'application/json' } }),
    });
  };

  const sendReady = (nextReady: boolean) => {
    publish(
      `/app/rooms/${roomCode}/ready`,
      JSON.stringify({ ready: nextReady }),
    );
  };

  const sendStart = () => {
    publish(`/app/rooms/${roomCode}/start`);
  };

  const sendPrompt = (prompt: string) => {
    publish(`/app/rooms/${roomCode}/prompts`, JSON.stringify({ prompt }));
  };

  return {
    phase,
    receivedSnapshot,
    promptSubmissionSnapshot,
    roundSnapshot,
    isCountdownTriggered,
    imageGenerationSnapshot,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
    sendPrompt,
  };
}
