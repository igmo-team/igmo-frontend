import { Button } from '../../../common/components';

import { RoomPlayerList } from './RoomPlayerList';
import {
  S_ActionGroup,
  S_ActionGuide,
  S_CopyButton,
  S_ErrorMessage,
  S_InviteBox,
  S_InviteLink,
  S_PlayerGuide,
  S_PlayerHeader,
  S_PlayerTitle,
  S_RoomCard,
  S_RoomCode,
  S_RoomHeader,
  S_SectionLabel,
} from './RoomView.styles';

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
  onStartButtonClick: (
    snapshot: RoomSnapshot,
    currentPlayerId?: string,
  ) => void;
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
  onStartButtonClick,
  onLeaveButtonClick,
}: RoomLobbyViewProps) {
  const currentPlayer = snapshot.players.find(
    (player) => player.id === currentPlayerId,
  );
  const isHost = currentPlayer?.id === snapshot.hostId;
  const areAllGuestsReady = snapshot.players
    .filter((player) => player.id !== snapshot.hostId)
    .every((player) => player.ready);

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
            {!areAllGuestsReady && (
              <S_ActionGuide>
                모든 참가자가 준비하면 시작할 수 있어요
              </S_ActionGuide>
            )}
            {areAllGuestsReady && snapshot.players.length < 3 && (
              <S_ActionGuide>
                게임을 시작하려면 최소 3명이 필요해요
              </S_ActionGuide>
            )}
            {areAllGuestsReady &&
              snapshot.players.length >= 3 &&
              isSocketConnected && (
                <S_ActionGuide>게임을 시작할 수 있어요</S_ActionGuide>
              )}
            <Button
              type="button"
              disabled={!areAllGuestsReady || !isSocketConnected}
              onClick={() => onStartButtonClick(snapshot, currentPlayerId)}
            >
              시작하기
            </Button>
          </>
        ) : (
          <>
            {!isSocketConnected && (
              <S_ActionGuide>실시간 연결을 준비하고 있어요</S_ActionGuide>
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
