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
import { useRoomAnalytics } from './hooks/useRoomAnalytics';
import { useRoomSocket } from './hooks/useRoomSocket';
import { useUrlCopy } from './hooks/useUrlCopy';
import { getRoomEntryState } from './utils/getRoomEntryState';
import {
  getRoomHeaderRound,
  getRoomHeaderStatus,
} from './utils/getRoomHeaderState';
import { getRoomPhaseLabel } from './utils/getRoomPhaseLabel';
import {
  getRoomTimerRange,
  getRoomTimerState,
} from './utils/getRoomTimerState';
import { getVotePermissionState } from './utils/getVotePermissionState';
import {
  deleteRoomSession,
  readRoomSession,
  writeRoomSession,
} from './utils/roomSessionStorage';

import type { RoomEntryState } from './utils/getRoomEntryState';
import type {
  GuessSubmissionPayload,
  PromptSubmissionPayload,
} from '../../domain/room/types';

export function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const entryState = useMemo(
    () => getRoomEntryState(location.state),
    [location.state],
  );

  const roomSession = useMemo(() => {
    if (!roomCode) {
      return null;
    }

    if (entryState) {
      return {
        roomCode,
        playerId: entryState.playerId,
        secret: entryState.secret,
      };
    }

    return readRoomSession(roomCode);
  }, [entryState, roomCode]);
  const initialSnapshot = entryState?.snapshot ?? null;
  const currentPlayerId = roomSession?.playerId;

  const roomSocket = useRoomSocket({ roomCode, roomSession, initialSnapshot });
  const {
    phase,
    receivedSnapshot,
    promptSubmissionSnapshot,
    guessSubmissionSnapshot,
    roundSnapshot,
    voteSnapshot,
    roundResultSnapshot,
    gameResultSnapshot,
    isCountdownTriggered,
    imageGenerationSnapshot,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
    sendPrompt,
    sendGuess,
    sendVote,
    sendRestart,
  } = roomSocket;

  const snapshot = receivedSnapshot ?? initialSnapshot;
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';

  const activeImageGenerationSnapshot =
    imageGenerationSnapshot?.roomCode === displayRoomCode
      ? imageGenerationSnapshot
      : null;
  const inviteLink = displayRoomCode
    ? `${window.location.origin}${PAGE_URL.ROOM}/${displayRoomCode}`
    : '';

  const { isCopied, copyUrl } = useUrlCopy(inviteLink);

  const [isCountdownDone, setIsCountdownDone] = useState(false);
  const handleCountdownEnd = useCallback(() => setIsCountdownDone(true), []);
  const isCountdownPlaying = isCountdownTriggered && !isCountdownDone;
  const isPlayingViewVisible = phase === 'PLAYING' && !isCountdownPlaying;
  const timerRange = getRoomTimerRange({
    roomSocket,
    activeImageGenerationSnapshot,
    isCountdownPlaying,
  });
  const timerCountdownSeconds = useCountdownSeconds(timerRange?.deadline);
  const timerState = getRoomTimerState(timerRange, timerCountdownSeconds);
  const votePermissionState = getVotePermissionState(roomSocket);
  const hasValidRoomCode = Boolean(roomCode && isRoomCodeValid(roomCode));
  const roomAnalytics = useRoomAnalytics({
    roomCode: displayRoomCode,
    currentPlayerId,
    roomSnapshot: snapshot,
    phase,
    roundSnapshot,
    voteSnapshot,
    roundResultSnapshot,
    gameResultSnapshot,
  });

  useEffect(() => {
    if (roomCode && !roomSession && !hasValidRoomCode) {
      navigate(PAGE_URL.HOME, { replace: true });
    }
  }, [hasValidRoomCode, navigate, roomCode, roomSession]);

  const handleGuestEntrySuccess = (nextEntryState: RoomEntryState) => {
    writeRoomSession({
      roomCode: nextEntryState.snapshot.roomCode,
      playerId: nextEntryState.playerId,
      secret: nextEntryState.secret,
    });

    navigate(`${PAGE_URL.ROOM}/${nextEntryState.snapshot.roomCode}`, {
      replace: true,
      state: nextEntryState,
    });
  };

  const handleLeaveButtonClick = () => {
    if (roomCode) {
      deleteRoomSession(roomCode);
    }

    navigate(PAGE_URL.HOME);
  };

  const handleStart = () => {
    if (!snapshot) {
      return;
    }

    if (snapshot.phase !== 'LOBBY' || currentPlayerId !== snapshot.hostId) {
      return;
    }

    if (!areAllGuestsReady(snapshot)) {
      return;
    }

    const isPublished = sendStart();

    if (isPublished) {
      roomAnalytics.trackGameStarted();
    }
  };

  const handlePromptSubmit = useCallback(
    ({ prompt, submissionType }: PromptSubmissionPayload) => {
      const isPublished = sendPrompt({ prompt, submissionType });

      if (isPublished) {
        roomAnalytics.trackPromptSubmitted({ prompt, submissionType });
      }

      return isPublished;
    },
    [roomAnalytics, sendPrompt],
  );

  const handleGuessSubmit = useCallback(
    ({ guess, submissionType }: GuessSubmissionPayload) => {
      const isPublished = sendGuess({ guess, submissionType });

      if (isPublished) {
        roomAnalytics.trackGuessSubmitted({ guess, submissionType });
      }

      return isPublished;
    },
    [roomAnalytics, sendGuess],
  );

  const handleVoteSubmit = useCallback(
    (optionId: string) => {
      const isPublished = sendVote(optionId);

      if (isPublished) {
        roomAnalytics.trackVoteSubmitted();
      }

      return isPublished;
    },
    [roomAnalytics, sendVote],
  );

  if (!roomSession && roomCode && hasValidRoomCode) {
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
          currentPlayerId={currentPlayerId}
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

  const headerRound = getRoomHeaderRound(roomSocket);
  const headerStatus = getRoomHeaderStatus({
    roomSocket,
    roomSnapshot: snapshot,
    currentPlayerId,
    isCountdownPlaying,
  });

  return (
    <S_GameContainer>
      <RoomGameHeader
        headerStatus={headerStatus}
        round={headerRound}
        phaseLabel={getRoomPhaseLabel(phase)}
        timer={timerState}
      />

      <S_GameMain>
        {phase === 'ENDED' ? (
          <S_GameResultContent>
            {gameResultSnapshot ? (
              <RoomGameResultView
                snapshot={gameResultSnapshot}
                currentPlayerId={currentPlayerId}
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
                      deadline={promptSubmissionSnapshot?.promptDeadline ?? ''}
                      isSocketConnected={isConnected}
                      socketErrorMessage={errorMessage}
                      onSubmit={handlePromptSubmit}
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
                      onSubmit={handlePromptSubmit}
                    />
                  )}
                </>
              )}

              {isPlayingViewVisible &&
                (roundSnapshot ? (
                  <RoomPlayingView
                    snapshot={roundSnapshot}
                    currentPlayerId={currentPlayerId}
                    guessSubmissionSnapshot={guessSubmissionSnapshot}
                    isSocketConnected={isConnected}
                    socketErrorMessage={errorMessage}
                    onSubmit={handleGuessSubmit}
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
                  ownVoteOptionNotice={
                    votePermissionState.ownVoteOptionNotice
                  }
                  isOwnVoteOptionNoticePending={
                    votePermissionState.isOwnVoteOptionNoticePending
                  }
                  isSocketConnected={isConnected}
                  socketErrorMessage={errorMessage}
                  onSubmit={handleVoteSubmit}
                />
              )}

              {phase === 'RESULTS' &&
                (roundResultSnapshot ? (
                  <RoomRoundResultView
                    key={roundResultSnapshot.roundNumber}
                    snapshot={roundResultSnapshot}
                    currentPlayerId={currentPlayerId}
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
