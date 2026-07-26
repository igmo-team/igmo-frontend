import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';
import { areAllGuestsReady } from '../../domain/room/gameStart';
import { isRoomCodeValid } from '../../domain/room/roomCode';

import { RoomCountdownOverlay } from './components/RoomCountdownOverlay';
import { RoomGameHeader } from './components/RoomGameHeader';
import { RoomGameResultView } from './components/RoomGameResultView';
import { RoomGeneratingView } from './components/RoomGeneratingView';
import { RoomGuestEntryModal } from './components/RoomGuestEntryModal';
import { RoomLobbyView } from './components/RoomLobbyView';
import { RoomPlayingView } from './components/RoomPlayingView';
import { RoomPromptFailedView } from './components/RoomPromptFailedView';
import { RoomPromptingView } from './components/RoomPromptingView';
import { RoomPromptResultView } from './components/RoomPromptResultView';
import { RoomRoundResultView } from './components/RoomRoundResultView';
import { RoomVotingView } from './components/RoomVotingView';
import { useCountdownSeconds } from './hooks/useCountdownSeconds';
import { useRoomSocket } from './hooks/useRoomSocket';
import { useUrlCopy } from './hooks/useUrlCopy';
import { getRoomEntryState } from './utils/getRoomEntryState';
import { getRoomPhaseLabel } from './utils/getRoomPhaseLabel';

import type { RoomEntryState } from './utils/getRoomEntryState';
import type { RoomPlayer, RoundSnapshot } from '../../domain/room/types';

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
    voteSnapshot,
    roundResultSnapshot,
    gameResultSnapshot,
    isCountdownTriggered,
    imageGenerationSnapshot,
    ownVoteOptionNoticeByRound,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
    sendPrompt,
    sendGuess,
    sendVote,
    sendRestart,
  } = useRoomSocket({ roomCode, entryState });

  const snapshot = receivedSnapshot ?? entryState?.snapshot ?? null;
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';
  const activeImageGenerationSnapshot =
    imageGenerationSnapshot?.roomCode === displayRoomCode
      ? imageGenerationSnapshot
      : null;
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
  const voteCountdownSeconds = useCountdownSeconds(voteSnapshot?.voteDeadline);
  const resultCountdownSeconds = useCountdownSeconds(
    roundResultSnapshot?.resultDeadline,
  );
  const promptTimerTotalSeconds = getTimerTotalSeconds(
    promptSubmissionSnapshot?.promptStartedAt,
    promptSubmissionSnapshot?.promptDeadline,
  );
  const guessTimerTotalSeconds = getTimerTotalSeconds(
    roundSnapshot?.guessStartedAt,
    roundSnapshot?.guessDeadline,
  );
  const voteTimerTotalSeconds = getTimerTotalSeconds(
    voteSnapshot?.voteStartedAt,
    voteSnapshot?.voteDeadline,
  );
  const resultTimerTotalSeconds = getTimerTotalSeconds(
    roundResultSnapshot?.resultStartedAt,
    roundResultSnapshot?.resultDeadline,
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
    guessTimerTotalSeconds,
  );
  const guessTimerProgressRatio =
    guessTimerTotalSeconds > 0
      ? Math.min(Math.max(guessTimerSeconds / guessTimerTotalSeconds, 0), 1)
      : 0;
  const voteTimerSeconds = Math.min(
    voteCountdownSeconds,
    voteTimerTotalSeconds,
  );
  const voteTimerProgressRatio =
    voteTimerTotalSeconds > 0
      ? Math.min(Math.max(voteTimerSeconds / voteTimerTotalSeconds, 0), 1)
      : 0;
  const currentOwnVoteOptionNotice =
    voteSnapshot === null
      ? undefined
      : ownVoteOptionNoticeByRound[voteSnapshot.roundNumber];
  const isOwnVoteOptionNoticePending =
    phase === 'VOTING' &&
    voteSnapshot !== null &&
    currentOwnVoteOptionNotice === undefined;
  const resultTimerSeconds = Math.min(
    resultCountdownSeconds,
    resultTimerTotalSeconds,
  );
  const resultTimerProgressRatio =
    resultTimerTotalSeconds > 0
      ? Math.min(Math.max(resultTimerSeconds / resultTimerTotalSeconds, 0), 1)
      : 0;

  const [isCountdownDone, setIsCountdownDone] = useState(false);
  const handleCountdownEnd = useCallback(() => setIsCountdownDone(true), []);
  const isCountdownPlaying = isCountdownTriggered && !isCountdownDone;
  const isPlayingViewVisible = phase === 'PLAYING' && !isCountdownPlaying;
  const hasValidRoomCode = Boolean(roomCode && isRoomCodeValid(roomCode));

  useEffect(() => {
    if (roomCode && !entryState && !hasValidRoomCode) {
      navigate(PAGE_URL.HOME, { replace: true });
    }
  }, [entryState, hasValidRoomCode, navigate, roomCode]);

  const handleGuestEntrySuccess = (nextEntryState: RoomEntryState) => {
    navigate(`${PAGE_URL.ROOM}/${nextEntryState.snapshot.roomCode}`, {
      replace: true,
      state: nextEntryState,
    });
  };

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

  if (!entryState && roomCode && hasValidRoomCode) {
    return (
      <RoomGuestEntryModal
        roomCode={roomCode}
        onSuccess={handleGuestEntrySuccess}
      />
    );
  }

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

  const promptReadyPlayerIds =
    promptSubmissionSnapshot?.promptEntries
      .filter((entry) => entry.status === 'READY')
      .map((entry) => entry.player.id) ?? [];

  const shouldShowTimer =
    phase === 'GENERATING' &&
    activeImageGenerationSnapshot?.status !== 'GENERATING' &&
    activeImageGenerationSnapshot?.status !== 'READY';
  const shouldShowPlayingTimer = isPlayingViewVisible && Boolean(roundSnapshot);
  const shouldShowVotingTimer = phase === 'VOTING' && Boolean(voteSnapshot);
  const shouldShowResultTimer =
    phase === 'RESULTS' && Boolean(roundResultSnapshot);
  let headerPlayers = snapshot.players;
  let headerCompletedPlayerIds =
    roundSnapshot?.guessEntries
      .filter((entry) => entry.submitted)
      .map((entry) => entry.player.id) ?? [];
  let headerRound: number | undefined;

  if (phase === 'GENERATING' || isCountdownPlaying) {
    headerCompletedPlayerIds = promptReadyPlayerIds;
  }

  if (phase === 'PLAYING' && roundSnapshot) {
    headerPlayers = getRoundPlayers(roundSnapshot);
    headerRound = roundSnapshot.roundNumber;
  }

  if (phase === 'VOTING' && voteSnapshot) {
    headerPlayers = voteSnapshot.voteEntries.map((entry) => entry.player);
    headerCompletedPlayerIds = voteSnapshot.voteEntries
      .filter((entry) => entry.voted)
      .map((entry) => entry.player.id);
    headerRound = voteSnapshot.roundNumber;
  }

  if (phase === 'RESULTS' && roundResultSnapshot) {
    headerPlayers = roundResultSnapshot.players;
    headerCompletedPlayerIds = [];
    headerRound = roundResultSnapshot.roundNumber;
  }

  if (phase === 'ENDED' && gameResultSnapshot) {
    headerPlayers = gameResultSnapshot.finalRanking.map(
      (entry) => entry.player,
    );
    headerCompletedPlayerIds = [];
  }

  return (
    <S_GameContainer>
      <RoomGameHeader
        players={headerPlayers}
        currentPlayerId={entryState?.playerId}
        completedPlayerIds={headerCompletedPlayerIds}
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
          (shouldShowVotingTimer && {
            seconds: voteTimerSeconds,
            progressRatio: voteTimerProgressRatio,
          }) ||
          (shouldShowResultTimer && {
            seconds: resultTimerSeconds,
            progressRatio: resultTimerProgressRatio,
          }) ||
          null
        }
      />

      <S_GameMain>
        {phase === 'ENDED' ? (
          <S_GameResultContent>
            {gameResultSnapshot ? (
              <RoomGameResultView
                snapshot={gameResultSnapshot}
                onRestart={sendRestart}
                onHomeButtonClick={handleLeaveButtonClick}
              />
            ) : (
              <S_EmptyState>최종 결과를 불러오는 중이에요.</S_EmptyState>
            )}
          </S_GameResultContent>
        ) : (
          <S_GameContentFrame>
            <S_GameContent>
              {(phase === 'GENERATING' || isCountdownPlaying) && (
                <>
                  {!activeImageGenerationSnapshot && (
                    <RoomPromptingView
                      isSocketConnected={isConnected}
                      socketErrorMessage={errorMessage}
                      onSubmit={sendPrompt}
                    />
                  )}
                  {activeImageGenerationSnapshot?.status === 'GENERATING' && (
                    <RoomGeneratingView />
                  )}
                  {activeImageGenerationSnapshot?.status === 'READY' && (
                    <RoomPromptResultView
                      imageUrl={activeImageGenerationSnapshot?.imageUrl ?? ''}
                      prompt={activeImageGenerationSnapshot?.prompt ?? ''}
                    />
                  )}
                  {activeImageGenerationSnapshot?.status === 'FAILED' && (
                    <RoomPromptFailedView
                      prompt={activeImageGenerationSnapshot?.prompt ?? ''}
                      isSocketConnected={isConnected}
                      socketErrorMessage={
                        errorMessage ||
                        activeImageGenerationSnapshot?.errorMessage ||
                        ''
                      }
                      onSubmit={sendPrompt}
                    />
                  )}
                </>
              )}

              {isPlayingViewVisible &&
                (roundSnapshot ? (
                  <RoomPlayingView
                    snapshot={roundSnapshot}
                    currentPlayerId={entryState?.playerId}
                    isSocketConnected={isConnected}
                    socketErrorMessage={errorMessage}
                    onSubmit={sendGuess}
                  />
                ) : (
                  <S_EmptyState>
                    프롬프트 추측 정보를 불러오는 중이에요.
                  </S_EmptyState>
                ))}

              {phase === 'VOTING' && voteSnapshot && (
                <RoomVotingView
                  key={voteSnapshot.roundNumber}
                  snapshot={voteSnapshot}
                  currentPlayerId={entryState?.playerId}
                  ownVoteOptionNotice={currentOwnVoteOptionNotice}
                  isOwnVoteOptionNoticePending={
                    isOwnVoteOptionNoticePending
                  }
                  isSocketConnected={isConnected}
                  socketErrorMessage={errorMessage}
                  onSubmit={sendVote}
                />
              )}

              {phase === 'RESULTS' &&
                (roundResultSnapshot ? (
                  <RoomRoundResultView
                    key={roundResultSnapshot.roundNumber}
                    snapshot={roundResultSnapshot}
                  />
                ) : (
                  <S_EmptyState>결과 정보를 불러오는 중이에요.</S_EmptyState>
                ))}
            </S_GameContent>
          </S_GameContentFrame>
        )}

        {isCountdownTriggered && (
          <RoomCountdownOverlay onCountdownEnd={handleCountdownEnd} />
        )}
      </S_GameMain>
    </S_GameContainer>
  );
}

function getRoundPlayers(snapshot: RoundSnapshot): RoomPlayer[] {
  return [
    snapshot.questioner,
    ...snapshot.guessEntries.map((entry) => entry.player),
  ];
}

function getTimerTotalSeconds(startedAt?: string, deadline?: string) {
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

const S_GameContainer = styled.div`
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_GameMain = styled.main`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 6.5rem);
`;

const S_GameContentFrame = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 0 1.8rem 4rem;
`;

const S_GameContent = styled.div`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding-top: 1.8rem;
`;

const S_GameResultContent = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
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
