import styled from '@emotion/styled';

import { Button, Surface } from '../../../common/components';
import { areAllGuestsReady } from '../../../domain/room/gameStart';

import { RoomPlayerList } from './RoomPlayerList';

import type { RoomSnapshot } from '../../../domain/room/types';

type RoomLobbyViewProps = {
  snapshot: RoomSnapshot;
  currentPlayerId?: string;
  displayRoomCode: string;
  inviteLink: string;
  isCopied: boolean;
  isSocketConnected: boolean;
  socketErrorMessage: string;
  onCopyButtonClick: () => void;
  onReadyButtonClick: (nextReady: boolean) => void;
  onStart: () => void;
  onLeaveButtonClick: () => void;
};

export function RoomLobbyView({
  snapshot,
  currentPlayerId,
  displayRoomCode,
  inviteLink,
  isCopied,
  isSocketConnected,
  socketErrorMessage,
  onCopyButtonClick,
  onReadyButtonClick,
  onStart,
  onLeaveButtonClick,
}: RoomLobbyViewProps) {
  const currentPlayer = snapshot.players.find(
    (player) => player.id === currentPlayerId,
  );
  const isHost = currentPlayer?.id === snapshot.hostId;
  const allGuestsReady = areAllGuestsReady(snapshot);
  const minPlayersToStart = Number(import.meta.env.VITE_MIN_PLAYERS_TO_START);

  return (
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
          onClick={onCopyButtonClick}
        >
          {isCopied ? '복사됨!' : '링크 복사'}
        </S_CopyButton>
      </S_InviteBox>

      <S_PlayerHeader>
        <S_PlayerTitle>플레이어 {snapshot.players.length}명</S_PlayerTitle>
        <S_PlayerGuide>친구에게 링크를 공유하세요</S_PlayerGuide>
      </S_PlayerHeader>

      <RoomPlayerList
        players={snapshot.players}
        hostId={snapshot.hostId}
        currentPlayerId={currentPlayerId}
      />

      <S_ActionGroup>
        {socketErrorMessage && (
          <S_ErrorMessage role="alert">{socketErrorMessage}</S_ErrorMessage>
        )}
        {isHost ? (
          <>
            {!isSocketConnected && (
              <S_ActionGuide>실시간 연결을 확인하고 있어요</S_ActionGuide>
            )}
            {isSocketConnected && !allGuestsReady && (
              <S_ActionGuide>
                모든 참가자가 준비하면 시작할 수 있어요
              </S_ActionGuide>
            )}
            {isSocketConnected &&
              allGuestsReady &&
              snapshot.players.length < minPlayersToStart && (
                <S_ActionGuide>
                  게임을 시작하려면 최소 {minPlayersToStart}명이 필요해요
                </S_ActionGuide>
              )}
            {isSocketConnected &&
              allGuestsReady &&
              snapshot.players.length >= minPlayersToStart && (
                <S_ActionGuide>게임을 시작할 수 있어요</S_ActionGuide>
              )}
            <Button
              type="button"
              disabled={
                !allGuestsReady ||
                snapshot.players.length < minPlayersToStart ||
                !isSocketConnected
              }
              onClick={onStart}
            >
              시작하기
            </Button>
          </>
        ) : (
          <>
            {!isSocketConnected && (
              <S_ActionGuide>실시간 연결을 확인하고 있어요</S_ActionGuide>
            )}
            {isSocketConnected && currentPlayer?.ready && (
              <S_ActionGuide>준비 완료 상태예요</S_ActionGuide>
            )}
            {isSocketConnected && !currentPlayer?.ready && (
              <S_ActionGuide>준비되면 버튼을 눌러주세요</S_ActionGuide>
            )}
            <Button
              type="button"
              disabled={!currentPlayer || !isSocketConnected}
              onClick={() => {
                if (currentPlayer) {
                  onReadyButtonClick(!currentPlayer.ready);
                }
              }}
            >
              {currentPlayer?.ready ? '준비 해제' : '준비하기'}
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onLeaveButtonClick}
        >
          나가기
        </Button>
      </S_ActionGroup>
    </S_RoomCard>
  );
}

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

const S_CopyButton = styled(Button)`
  min-width: 8.2rem;
`;
