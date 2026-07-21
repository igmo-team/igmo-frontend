import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';
import { areAllGuestsReady } from '../../domain/room/gameStart';

import { RoomCountdownOverlay } from './components/RoomCountdownOverlay';
import { RoomGameHeader } from './components/RoomGameHeader';
import { RoomGeneratingView } from './components/RoomGeneratingView';
import { RoomLobbyView } from './components/RoomLobbyView';
import { RoomPlayingView } from './components/RoomPlayingView';
import { RoomPromptFailedView } from './components/RoomPromptFailedView';
import { RoomPromptingView } from './components/RoomPromptingView';
import { RoomPromptResultView } from './components/RoomPromptResultView';
import { useCountdownSeconds } from './hooks/useCountdownSeconds';
import { useRoomSocket } from './hooks/useRoomSocket';
import { useUrlCopy } from './hooks/useUrlCopy';
import { getMyPromptingView } from './utils/getMyPromptingView';
import { getRoomEntryState } from './utils/getRoomEntryState';
import { getRoomPhaseLabel } from './utils/getRoomPhaseLabel';

import type { RoomPlayer, RoundSnapshot } from '../../domain/room/types';

const TEMPORARY_ROUND = 1;
const TEMPORARY_GUESS_TIMER_TOTAL_SECONDS = 10;

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
    roundSnapshot,
    isCountdownTriggered,
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
  const promptCountdownSeconds = useCountdownSeconds(
    promptSubmissionSnapshot?.promptDeadline,
  );
  const guessCountdownSeconds = useCountdownSeconds(
    roundSnapshot?.guessDeadline,
  );
  const promptTimerTotalSeconds = getPromptTimerTotalSeconds(
    promptSubmissionSnapshot?.promptStartedAt,
    promptSubmissionSnapshot?.promptDeadline,
  );
  const promptTimerSeconds = Math.min(
    promptCountdownSeconds,
    promptTimerTotalSeconds,
  );
  const promptTimerProgressRatio =
    promptTimerTotalSeconds > 0
      ? Math.min(Math.max(promptTimerSeconds / promptTimerTotalSeconds, 0), 1)
      : 0;
  const guessTimerSeconds = Math.min(
    guessCountdownSeconds,
    TEMPORARY_GUESS_TIMER_TOTAL_SECONDS,
  );
  const guessTimerProgressRatio =
    guessTimerSeconds / TEMPORARY_GUESS_TIMER_TOTAL_SECONDS;

  const [isCountdownDone, setIsCountdownDone] = useState(false);
  const handleCountdownEnd = useCallback(() => setIsCountdownDone(true), []);
  const isCountdownPlaying = isCountdownTriggered && !isCountdownDone;
  const isPlayingViewVisible = phase === 'PLAYING' && !isCountdownPlaying;

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

  const shouldShowTimer = phase === 'GENERATING' && promptingView === 'INPUT';
  const shouldShowPlayingTimer = isPlayingViewVisible && Boolean(roundSnapshot);
  const headerPlayers =
    isPlayingViewVisible && roundSnapshot
      ? getRoundPlayers(roundSnapshot)
      : snapshot.players;
  const headerSubmittedPlayerIds =
    phase === 'GENERATING' || isCountdownPlaying
      ? submittedPlayerIds
      : (roundSnapshot?.guessEntries
          .filter((entry) => entry.submitted)
          .map((entry) => entry.player.id) ?? []);
  const headerRound =
    isPlayingViewVisible && roundSnapshot
      ? roundSnapshot.roundNumber
      : TEMPORARY_ROUND;

  return (
    <S_GamePage>
      <RoomGameHeader
        players={headerPlayers}
        currentPlayerId={entryState?.playerId}
        submittedPlayerIds={headerSubmittedPlayerIds}
        round={headerRound}
        phaseLabel={getRoomPhaseLabel(phase)}
        timer={
          (shouldShowTimer && {
            seconds: promptTimerSeconds,
            progressRatio: promptTimerProgressRatio,
          }) ||
          (shouldShowPlayingTimer && {
            seconds: guessTimerSeconds,
            progressRatio: guessTimerProgressRatio,
          }) ||
          null
        }
      />

      <S_GameContent>
        {(phase === 'GENERATING' || isCountdownPlaying) && (
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

        {isPlayingViewVisible &&
          (roundSnapshot ? (
            <RoomPlayingView
              snapshot={roundSnapshot}
              currentPlayerId={entryState?.playerId}
            />
          ) : (
            <S_EmptyState>프롬프트 추측 정보를 불러오는 중이에요.</S_EmptyState>
          ))}
      </S_GameContent>

      {isCountdownTriggered && (
        <RoomCountdownOverlay onCountdownEnd={handleCountdownEnd} />
      )}
    </S_GamePage>
  );
}

function getRoundPlayers(snapshot: RoundSnapshot): RoomPlayer[] {
  return [
    snapshot.questioner,
    ...snapshot.guessEntries.map((entry) => entry.player),
  ];
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
