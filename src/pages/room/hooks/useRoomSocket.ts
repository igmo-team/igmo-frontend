import { useEffect, useRef, useState } from 'react';

import { createStompClient } from '../../../common/socket/createStompClient';
import { parseRoomSnapshot } from '../utils/parseRoomSnapshot';
import { parseSocketError } from '../utils/parseSocketError';

import type { RoomSnapshot } from '../../../domain/room/types';
import type { RoomEntryState } from '../utils/getRoomEntryState';
import type { Client } from '@stomp/stompjs';

type UseRoomSocketParams = {
  roomCode?: string;
  entryState: RoomEntryState | null;
};

type UseRoomSocketResult = {
  receivedSnapshot: RoomSnapshot | null;
  isConnected: boolean;
  errorMessage: string;
  sendReady: (nextReady: boolean) => void;
  sendStart: () => void;
};

export function useRoomSocket({
  roomCode,
  entryState,
}: UseRoomSocketParams): UseRoomSocketResult {
  const [receivedSnapshot, setReceivedSnapshot] = useState<RoomSnapshot | null>(
    null,
  );
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

        if (!nextSnapshot) {
          return;
        }

        setReceivedSnapshot(nextSnapshot);
        setErrorMessage('');
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
      void client.deactivate();
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
    publish(`/app/rooms/${roomCode}/ready`, JSON.stringify({ ready: nextReady }));
  };

  const sendStart = () => {
    publish(`/app/rooms/${roomCode}/start`);
  };

  return {
    receivedSnapshot,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
  };
}
