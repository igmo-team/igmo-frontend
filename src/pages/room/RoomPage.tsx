import { useEffect, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';
import { createStompClient } from '../../common/socket/createStompClient';

import { RoomLobbyView } from './components/RoomLobbyView';
import { RoomPendingPhaseView } from './components/RoomPendingPhaseView';
import { RoomPromptingView } from './components/RoomPromptingView';
import { getRoomEntryState } from './utils/getRoomEntryState';
import { parseRoomSnapshot } from './utils/parseRoomSnapshot';
import { parseSocketError } from './utils/parseSocketError';

import type { RoomSnapshot } from '../../domain/room/types';
import type { Client } from '@stomp/stompjs';

const COPY_FEEDBACK_DURATION_MS = 1500;

export function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entryState = useMemo(
    () => getRoomEntryState(location.state),
    [location.state],
  );
  const [receivedSnapshot, setReceivedSnapshot] = useState<RoomSnapshot | null>(
    null,
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketErrorMessage, setSocketErrorMessage] = useState('');
  const stompClientRef = useRef<Client | null>(null);
  const copyFeedbackTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const snapshot = receivedSnapshot ?? entryState?.snapshot ?? null;
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';
  const inviteLink = displayRoomCode
    ? `${window.location.origin}${PAGE_URL.ROOM}/${displayRoomCode}`
    : '';

  useEffect(() => {
    if (roomCode && !entryState) {
      navigate(PAGE_URL.HOME, { replace: true });
    }
  }, [entryState, navigate, roomCode]);

  useEffect(() => {
    if (!roomCode || !entryState) {
      return;
    }

    let isActive = true;
    const client = createStompClient();
    stompClientRef.current = client;

    if (entryState) {
      client.connectHeaders = {
        roomCode,
        playerId: entryState.playerId,
        secret: entryState.secret,
      };
    }

    client.onConnect = () => {
      if (!isActive) {
        return;
      }

      setIsSocketConnected(true);
      setSocketErrorMessage('');

      client.subscribe(`/topic/rooms/${roomCode}`, (message) => {
        if (!isActive) {
          return;
        }

        const nextSnapshot = parseRoomSnapshot(message.body);

        if (!nextSnapshot) {
          return;
        }

        setReceivedSnapshot(nextSnapshot);
        setSocketErrorMessage('');
      });

      client.subscribe('/user/queue/errors', (message) => {
        if (!isActive) {
          return;
        }

        setSocketErrorMessage(parseSocketError(message.body));
      });
    };

    client.onDisconnect = () => {
      if (isActive) {
        setIsSocketConnected(false);
      }
    };

    client.onWebSocketClose = () => {
      if (isActive) {
        setIsSocketConnected(false);
      }
    };

    client.activate();

    return () => {
      isActive = false;
      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }
      setIsSocketConnected(false);
      void client.deactivate();
    };
  }, [entryState, roomCode]);

  const clearCopyFeedbackTimeout = () => {
    if (copyFeedbackTimeoutId.current) {
      clearTimeout(copyFeedbackTimeoutId.current);
      copyFeedbackTimeoutId.current = null;
    }
  };

  useEffect(() => {
    return clearCopyFeedbackTimeout;
  }, []);

  const handleCopyButtonClick = async () => {
    if (!inviteLink || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);

      clearCopyFeedbackTimeout();

      copyFeedbackTimeoutId.current = setTimeout(() => {
        setIsCopied(false);
        copyFeedbackTimeoutId.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      clearCopyFeedbackTimeout();
      setIsCopied(false);
    }
  };

  const handleLeaveButtonClick = () => {
    navigate(PAGE_URL.HOME);
  };

  const handleReadyButtonClick = (nextReady: boolean) => {
    if (!roomCode || !stompClientRef.current?.connected) {
      return;
    }

    setSocketErrorMessage('');
    stompClientRef.current.publish({
      destination: `/app/rooms/${roomCode}/ready`,
      body: JSON.stringify({ ready: nextReady }),
      headers: { 'content-type': 'application/json' },
    });
  };

  const handleStartButtonClick = (
    snapshot: RoomSnapshot,
    currentPlayerId?: string,
  ) => {
    if (snapshot.phase !== 'LOBBY' || currentPlayerId !== snapshot.hostId) {
      return;
    }

    if (
      !snapshot.players
        .filter((player) => player.id !== snapshot.hostId)
        .every((player) => player.ready)
    ) {
      return;
    }

    if (snapshot.players.length < 3) {
      alert('게임을 시작하려면 최소 3명이 필요합니다.');
      return;
    }

    if (!roomCode || !stompClientRef.current?.connected) {
      return;
    }

    setSocketErrorMessage('');
    stompClientRef.current.publish({
      destination: `/app/rooms/${roomCode}/start`,
    });
  };

  if (!snapshot) {
    return (
      <S_Page>
        <S_RoomCard padding="lg" shadow>
          <S_EmptyState>방 정보를 불러오는 중이에요.</S_EmptyState>
        </S_RoomCard>
      </S_Page>
    );
  }

  return (
    <S_Page>
      {snapshot.phase === 'LOBBY' && (
        <RoomLobbyView
          snapshot={snapshot}
          currentPlayerId={entryState?.playerId}
          displayRoomCode={displayRoomCode}
          inviteLink={inviteLink}
          isCopied={isCopied}
          isSocketConnected={isSocketConnected}
          socketErrorMessage={socketErrorMessage}
          onCopyButtonClick={handleCopyButtonClick}
          onReadyButtonClick={handleReadyButtonClick}
          onStartButtonClick={handleStartButtonClick}
          onLeaveButtonClick={handleLeaveButtonClick}
        />
      )}

      {snapshot.phase === 'PROMPTING' && (
        <RoomPromptingView
          snapshot={snapshot}
          currentPlayerId={entryState?.playerId}
        />
      )}

      {snapshot.phase !== 'LOBBY' && snapshot.phase !== 'PROMPTING' && (
        <RoomPendingPhaseView snapshot={snapshot} />
      )}
    </S_Page>
  );
}

const S_Page = styled.main`
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 4.4rem 2rem 9.6rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_RoomCard = styled(Surface)`
  display: flex;
  max-width: 56rem;
  flex-direction: column;
`;

const S_EmptyState = styled.p`
  width: 100%;
  padding: 2rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_R}
`;
