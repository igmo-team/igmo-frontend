import { useEffect, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';
import { areAllGuestsReady } from '../../domain/room/gameStart';

import { RoomGameHeader } from './components/RoomGameHeader';
import { RoomGeneratingView } from './components/RoomGeneratingView';
import { RoomLobbyView } from './components/RoomLobbyView';
import { RoomPromptingView } from './components/RoomPromptingView';
import { RoomPromptResultView } from './components/RoomPromptResultView';
import { useRoomSocket } from './hooks/useRoomSocket';
import { useUrlCopy } from './hooks/useUrlCopy';
import { getMyPromptingView } from './utils/getMyPromptingView';
import { getRoomEntryState } from './utils/getRoomEntryState';
import { getRoomPhaseLabel } from './utils/getRoomPhaseLabel';

const TEMPORARY_ROUND = 1;
const TEMPORARY_TIMER_SECONDS = 12;
// TODO: 결과 화면 이미지 URL은 아직 스냅샷에 없어 임시 placeholder 사용. 스펙 확정 시 교체.
const TEMPORARY_RESULT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%23f3d9e4'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%23b06'>미리보기</text></svg>";

export function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const entryState = useMemo(
    () => getRoomEntryState(location.state),
    [location.state],
  );

  const {
    receivedSnapshot,
    promptSubmissionSnapshot,
    isConnected,
    errorMessage,
    sendReady,
    sendStart,
    sendPrompt,
  } = useRoomSocket({ roomCode, entryState });

  const [submittedPrompt, setSubmittedPrompt] = useState('');

  const snapshot = receivedSnapshot ?? entryState?.snapshot ?? null;
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';
  const inviteLink = displayRoomCode
    ? `${window.location.origin}${PAGE_URL.ROOM}/${displayRoomCode}`
    : '';

  const { isCopied, copyUrl } = useUrlCopy(inviteLink);

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

  const handleSubmitPrompt = (prompt: string) => {
    sendPrompt(prompt);
    setSubmittedPrompt(prompt);
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

  if (snapshot.phase === 'LOBBY') {
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

  const promptingView = getMyPromptingView(
    promptSubmissionSnapshot,
    entryState?.playerId,
  );

  return (
    <S_GamePage>
      <RoomGameHeader
        snapshot={snapshot}
        currentPlayerId={entryState?.playerId}
        round={TEMPORARY_ROUND}
        phaseLabel={getRoomPhaseLabel(snapshot.phase)}
        timerSeconds={TEMPORARY_TIMER_SECONDS}
      />

      <S_GameContent>
        {snapshot.phase === 'PROMPTING' && (
          <>
            {promptingView === 'INPUT' && (
              <RoomPromptingView
                isSocketConnected={isConnected}
                socketErrorMessage={errorMessage}
                onSubmit={handleSubmitPrompt}
              />
            )}
            {promptingView === 'GENERATING' && <RoomGeneratingView />}
            {promptingView === 'RESULT' && (
              <RoomPromptResultView
                imageUrl={TEMPORARY_RESULT_IMAGE}
                prompt={submittedPrompt}
              />
            )}
            {promptingView === 'FAILED' && (
              <RoomPromptResultView prompt={submittedPrompt} isFailed />
            )}
          </>
        )}
      </S_GameContent>
    </S_GamePage>
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
