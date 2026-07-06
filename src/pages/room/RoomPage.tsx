import { useEffect, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button, Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';
import { createStompClient } from '../../common/socket/createStompClient';

import { RoomPlayerList } from './components/RoomPlayerList';

import type { RoomMessage, RoomSnapshot } from '../../domain/room/types';
import type { Client } from '@stomp/stompjs';

type RoomEntryState = {
  snapshot: RoomSnapshot;
  playerId: string;
  secret: string;
};

type ErrorResponse = {
  message?: string;
};

const COPY_FEEDBACK_DURATION_MS = 1500;
const MINIMUM_START_PLAYER_COUNT = 3;

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
  const players = snapshot?.players ?? [];
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';
  const inviteLink = displayRoomCode
    ? `${window.location.origin}${PAGE_URL.ROOM}/${displayRoomCode}`
    : '';
  const currentPlayer = players.find(
    (player) => player.id === entryState?.playerId,
  );
  const isHost = currentPlayer?.id === snapshot?.hostId;
  const isLobbyPhase = snapshot?.phase === 'LOBBY';
  const guestPlayers = players.filter(
    (player) => player.id !== snapshot?.hostId,
  );
  const hasEnoughPlayers = players.length >= MINIMUM_START_PLAYER_COUNT;
  const areGuestsReady = guestPlayers.every((player) => player.ready);
  const primaryActionText = getPrimaryActionText({
    isHost: Boolean(isHost),
    isReady: Boolean(currentPlayer?.ready),
  });
  const isReadyButtonDisabled =
    !isLobbyPhase || !currentPlayer || isHost || !isSocketConnected;
  const isStartButtonDisabled =
    !snapshot ||
    !isHost ||
    !isLobbyPhase ||
    (hasEnoughPlayers && (!areGuestsReady || !isSocketConnected));
  const isPrimaryActionDisabled = isHost
    ? isStartButtonDisabled
    : isReadyButtonDisabled;
  const actionGuideText = getActionGuideText({
    areGuestsReady,
    currentPlayerReady: Boolean(currentPlayer?.ready),
    hasEnoughPlayers,
    isHost: Boolean(isHost),
    isLobbyPhase: Boolean(isLobbyPhase),
    isSocketConnected,
  });

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

  const handleReadyButtonClick = () => {
    if (
      !roomCode ||
      !currentPlayer ||
      isHost ||
      !isLobbyPhase ||
      !stompClientRef.current?.connected
    ) {
      return;
    }

    setSocketErrorMessage('');
    stompClientRef.current.publish({
      destination: `/app/rooms/${roomCode}/ready`,
      body: JSON.stringify({ ready: !currentPlayer.ready }),
      headers: { 'content-type': 'application/json' },
    });
  };

  const handleStartButtonClick = () => {
    if (!isHost || !isLobbyPhase) {
      return;
    }

    if (!hasEnoughPlayers) {
      alert('게임을 시작하려면 최소 3명이 필요합니다.');
      return;
    }

    if (!roomCode || !areGuestsReady || !stompClientRef.current?.connected) {
      return;
    }

    setSocketErrorMessage('');
    stompClientRef.current.publish({
      destination: `/app/rooms/${roomCode}/start`,
    });
  };

  const handlePrimaryActionClick = isHost
    ? handleStartButtonClick
    : handleReadyButtonClick;

  return (
    <S_Page>
      <S_RoomCard padding="lg" shadow>
        <S_RoomHeader>
          <S_SectionLabel>방 코드</S_SectionLabel>
          <S_RoomCode>{displayRoomCode}</S_RoomCode>
        </S_RoomHeader>

        <S_InviteBox>
          <S_InviteLink>{inviteLink}</S_InviteLink>
          <S_CopyButton
            type="button"
            variant="dark"
            size="sm"
            width="hug"
            disabled={!inviteLink}
            onClick={handleCopyButtonClick}
          >
            {isCopied ? '복사됨!' : '링크 복사'}
          </S_CopyButton>
        </S_InviteBox>

        <S_PlayerHeader>
          <S_PlayerTitle>플레이어 {players.length}명</S_PlayerTitle>
          <S_PlayerGuide>
            {snapshot
              ? '친구에게 링크를 공유하세요'
              : '실시간 방 정보를 기다리고 있어요'}
          </S_PlayerGuide>
        </S_PlayerHeader>

        {snapshot ? (
          <RoomPlayerList
            players={players}
            hostId={snapshot.hostId}
            currentPlayerId={entryState?.playerId}
          />
        ) : (
          <S_EmptyState>방 정보를 불러오는 중이에요.</S_EmptyState>
        )}

        <S_ActionGroup>
          {socketErrorMessage && (
            <S_ErrorMessage role="alert">{socketErrorMessage}</S_ErrorMessage>
          )}
          {actionGuideText && <S_ActionGuide>{actionGuideText}</S_ActionGuide>}
          <Button
            type="button"
            disabled={isPrimaryActionDisabled}
            onClick={handlePrimaryActionClick}
          >
            {primaryActionText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleLeaveButtonClick}
          >
            나가기
          </Button>
        </S_ActionGroup>
      </S_RoomCard>
    </S_Page>
  );
}

function getRoomEntryState(state: unknown): RoomEntryState | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const maybeState = state as Partial<RoomEntryState>;
  const maybeSnapshot = maybeState.snapshot;

  if (
    typeof maybeState.playerId !== 'string' ||
    typeof maybeState.secret !== 'string' ||
    !maybeSnapshot ||
    typeof maybeSnapshot.roomCode !== 'string' ||
    !Array.isArray(maybeSnapshot.players)
  ) {
    return null;
  }

  return {
    playerId: maybeState.playerId,
    secret: maybeState.secret,
    snapshot: maybeSnapshot,
  };
}

function parseRoomSnapshot(body: string): RoomSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<RoomSnapshot> | RoomSnapshot;

    if (isRoomSnapshot(data)) {
      return data;
    }

    if (data.type === 'LOBBY_SNAPSHOT' && isRoomSnapshot(data.payload)) {
      return data.payload;
    }
  } catch {
    return null;
  }

  return null;
}

function isRoomSnapshot(value: unknown): value is RoomSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<RoomSnapshot>;

  return (
    typeof snapshot.roomCode === 'string' &&
    typeof snapshot.phase === 'string' &&
    typeof snapshot.hostId === 'string' &&
    Array.isArray(snapshot.players)
  );
}

function parseSocketError(body: string) {
  try {
    const error = JSON.parse(body) as ErrorResponse;

    if (error.message) {
      return error.message;
    }
  } catch {
    return '요청을 처리하지 못했어요. 다시 시도해주세요.';
  }

  return '요청을 처리하지 못했어요. 다시 시도해주세요.';
}

function getPrimaryActionText({
  isHost,
  isReady,
}: {
  isHost: boolean;
  isReady: boolean;
}) {
  if (isHost) {
    return '시작하기';
  }

  return isReady ? '준비 해제' : '준비하기';
}

function getActionGuideText({
  areGuestsReady,
  currentPlayerReady,
  hasEnoughPlayers,
  isHost,
  isLobbyPhase,
  isSocketConnected,
}: {
  areGuestsReady: boolean;
  currentPlayerReady: boolean;
  hasEnoughPlayers: boolean;
  isHost: boolean;
  isLobbyPhase: boolean;
  isSocketConnected: boolean;
}) {
  if (!isLobbyPhase) {
    return '';
  }

  if (isHost) {
    if (!hasEnoughPlayers) {
      return '게임을 시작하려면 최소 3명이 필요해요';
    }

    if (!areGuestsReady) {
      return '모든 참가자가 준비하면 시작할 수 있어요';
    }

    if (!isSocketConnected) {
      return '실시간 연결을 준비하고 있어요';
    }

    return '게임을 시작할 수 있어요';
  }

  if (!isSocketConnected) {
    return '실시간 연결을 준비하고 있어요';
  }

  return currentPlayerReady
    ? '준비 완료 상태예요'
    : '준비되면 버튼을 눌러주세요';
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

const S_RoomHeader = styled.div`
  text-align: center;
`;

const S_SectionLabel = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  letter-spacing: 0.08em;
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
`;

const S_RoomCode = styled.p`
  margin: 0.2rem 0 1.4rem;
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
  font-size: clamp(4.2rem, 9vw, 6rem);
  line-height: 1.1;
  letter-spacing: 0.12em;
`;

const S_InviteBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.6rem 0.6rem 1.6rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: 1.4rem;
  background: ${({ theme }) => theme.COLOR.PINK50};
`;

const S_InviteLink = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ theme }) => theme.TYPOGRAPHY.B4_B}
`;

const S_CopyButton = styled(Button)`
  min-width: 8.2rem;
`;

const S_PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  margin: 2.2rem 0 1.2rem;
`;

const S_PlayerTitle = styled.h1`
  flex: none;
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;

const S_PlayerGuide = styled.p`
  min-width: 0;
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: right;
  ${({ theme }) => theme.TYPOGRAPHY.B6_B}
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

const S_ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 2.2rem;
`;

const S_ErrorMessage = styled.p`
  color: ${({ theme }) => theme.COLOR.DANGER};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_ActionGuide = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B5_R}
`;
