import { useEffect, useMemo } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';
import { areAllGuestsReady } from '../../domain/room/gameStart';

import { RoomGameHeader } from './components/RoomGameHeader';
import { RoomGeneratingView } from './components/RoomGeneratingView';
import { RoomLobbyView } from './components/RoomLobbyView';
import { RoomPromptFailedView } from './components/RoomPromptFailedView';
import { RoomPromptingView } from './components/RoomPromptingView';
import { RoomPromptResultView } from './components/RoomPromptResultView';
import { useCountdownSeconds } from './hooks/useCountdownSeconds';
import { useRoomSocket } from './hooks/useRoomSocket';
import { useUrlCopy } from './hooks/useUrlCopy';
import { getMyPromptingView } from './utils/getMyPromptingView';
import { getRoomEntryState } from './utils/getRoomEntryState';
import { getRoomPhaseLabel } from './utils/getRoomPhaseLabel';

const TEMPORARY_ROUND = 1;

export function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entryState = useMemo(
    () => getRoomEntryState(location.state),
    [location.state],
  );

  const {
    phase,
    receivedSnapshot,
    promptSubmissionSnapshot,
    imageGenerationSnapshot,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
    sendPrompt,
  } = useRoomSocket({ roomCode, entryState });

  const snapshot = receivedSnapshot ?? entryState?.snapshot ?? null;
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';
  const inviteLink = displayRoomCode
    ? `${window.location.origin}${PAGE_URL.ROOM}/${displayRoomCode}`
    : '';

  const { isCopied, copyUrl } = useUrlCopy(inviteLink);
  const countdownSeconds = useCountdownSeconds(
    promptSubmissionSnapshot?.promptDeadline,
  );
  const promptTimerTotalSeconds = getPromptTimerTotalSeconds(
    promptSubmissionSnapshot?.promptStartedAt,
    promptSubmissionSnapshot?.promptDeadline,
  );
  const timerSeconds = Math.min(countdownSeconds, promptTimerTotalSeconds);
  const timerProgressRatio =
    promptTimerTotalSeconds > 0
      ? Math.min(Math.max(timerSeconds / promptTimerTotalSeconds, 0), 1)
      : 0;

  useEffect(() => {
    if (roomCode && !entryState) {
      navigate(PAGE_URL.HOME, { replace: true });
    }
  }, [entryState, navigate, roomCode]);

  const handleLeaveButtonClick = () => {
    navigate(PAGE_URL.HOME);
  };

  const handleStart = () => {
    if (!snapshot) {
      return;
    }

    if (
      snapshot.phase !== 'LOBBY' ||
      entryState?.playerId !== snapshot.hostId
    ) {
      return;
    }

    if (!areAllGuestsReady(snapshot)) {
      return;
    }

    sendStart();
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

  if (phase === 'LOBBY') {
    return (
      <S_Page>
        <RoomLobbyView
          snapshot={snapshot}
          currentPlayerId={entryState?.playerId}
          displayRoomCode={displayRoomCode}
          inviteLink={inviteLink}
          isCopied={isCopied}
          isSocketConnected={isConnected}
          socketErrorMessage={errorMessage}
          onCopyButtonClick={copyUrl}
          onReadyButtonClick={sendReady}
          onStart={handleStart}
          onLeaveButtonClick={handleLeaveButtonClick}
        />
      </S_Page>
    );
  }

  const isPromptSubmitted =
    promptSubmissionSnapshot?.promptEntries.find(
      (entry) => entry.player.id === entryState?.playerId,
    )?.submitted ?? false;

  const submittedPlayerIds =
    promptSubmissionSnapshot?.promptEntries
      .filter((entry) => entry.submitted)
      .map((entry) => entry.player.id) ?? [];

  const promptingView = getMyPromptingView(
    isPromptSubmitted,
    imageGenerationSnapshot?.status,
  );

  return (
    <S_GamePage>
      <RoomGameHeader
        snapshot={snapshot}
        currentPlayerId={entryState?.playerId}
        submittedPlayerIds={submittedPlayerIds}
        round={TEMPORARY_ROUND}
        phaseLabel={getRoomPhaseLabel(phase)}
        timer={
          promptingView === 'INPUT'
            ? {
                seconds: timerSeconds,
                progressRatio: timerProgressRatio,
              }
            : null
        }
      />

      <S_GameContent>
        {phase === 'GENERATING' && (
          <>
            {promptingView === 'INPUT' && (
              <RoomPromptingView
                isSocketConnected={isConnected}
                socketErrorMessage={errorMessage}
                onSubmit={sendPrompt}
              />
            )}
            {promptingView === 'GENERATING' && <RoomGeneratingView />}
            {promptingView === 'RESULT' && (
              <RoomPromptResultView
                imageUrl={imageGenerationSnapshot?.imageUrl ?? ''}
                prompt={imageGenerationSnapshot?.prompt ?? ''}
              />
            )}
            {promptingView === 'FAILED' && <RoomPromptFailedView />}
          </>
        )}
      </S_GameContent>
    </S_GamePage>
  );
}

function getPromptTimerTotalSeconds(startedAt?: string, deadline?: string) {
  if (!startedAt || !deadline) {
    return 0;
  }

  const startedAtTime = new Date(startedAt).getTime();
  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(startedAtTime) || Number.isNaN(deadlineTime)) {
    return 0;
  }

  return Math.max(0, Math.round((deadlineTime - startedAtTime) / 1000));
}

const S_Page = styled.main`
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 4.4rem 2rem 9.6rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_GamePage = styled.main`
  min-height: 100dvh;
  padding: 1.4rem 1.8rem 9.6rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_GameContent = styled.div`
  width: 100%;
  max-width: 64rem;
  margin: 4.8rem auto 0;
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
