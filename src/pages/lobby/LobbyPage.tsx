import { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button, Surface } from '../../common/components';
import { PAGE_URL } from '../../common/constants/pageUrl';

import { LobbyPlayerList } from './components/LobbyPlayerList';

import type { LobbySnapshot } from '../../domain/lobby/types';

type LobbyLocationState = {
  snapshot: LobbySnapshot;
  playerId: string;
};

export function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const lobbyState = getLobbyLocationState(location.state);
  const [isCopied, setIsCopied] = useState(false);

  const snapshot = lobbyState?.snapshot;
  const players = snapshot?.players ?? [];
  const displayRoomCode = snapshot?.roomCode ?? roomCode ?? '';
  const inviteLink = displayRoomCode
    ? `${window.location.origin}${PAGE_URL.LOBBY}/${displayRoomCode}`
    : '';

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false);
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isCopied]);

  const handleCopyButtonClick = async () => {
    if (!inviteLink || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
    } catch {
      setIsCopied(false);
    }
  };

  const handleLeaveButtonClick = () => {
    navigate(PAGE_URL.HOME);
  };

  return (
    <S_Page>
      <S_LobbyCard padding="lg" shadow>
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
              : '홈에서 다시 입장하면 목록을 볼 수 있어요'}
          </S_PlayerGuide>
        </S_PlayerHeader>

        {snapshot ? (
          <LobbyPlayerList
            players={players}
            hostId={snapshot.hostId}
            currentPlayerId={lobbyState.playerId}
          />
        ) : (
          <S_EmptyState>
            입장 정보가 없어요. 홈에서 닉네임과 방 코드를 입력해 다시
            들어와주세요.
          </S_EmptyState>
        )}

        <S_ActionGroup>
          <Button type="button" disabled>
            게임 시작
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
      </S_LobbyCard>
    </S_Page>
  );
}

function getLobbyLocationState(state: unknown): LobbyLocationState | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const maybeState = state as Partial<LobbyLocationState>;
  const maybeSnapshot = maybeState.snapshot;

  if (
    typeof maybeState.playerId !== 'string' ||
    !maybeSnapshot ||
    typeof maybeSnapshot.roomCode !== 'string' ||
    !Array.isArray(maybeSnapshot.players)
  ) {
    return null;
  }

  return {
    playerId: maybeState.playerId,
    snapshot: maybeSnapshot,
  };
}

const S_Page = styled.main`
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 4.4rem 2rem 9.6rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_LobbyCard = styled(Surface)`
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
