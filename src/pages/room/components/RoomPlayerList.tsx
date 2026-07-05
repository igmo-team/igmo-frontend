import styled from '@emotion/styled';

import type { RoomPlayer } from '../../../domain/room/types';

type RoomPlayerListProps = {
  players: RoomPlayer[];
  hostId?: string;
  currentPlayerId?: string;
};

const AVATAR_COLORS = [
  { background: '#FF3FBE', color: '#FFFFFF' },
  { background: '#22C9DD', color: '#1B1130' },
  { background: '#C8B6FF', color: '#1B1130' },
  { background: '#9AA0FF', color: '#FFFFFF' },
  { background: '#FFD6F2', color: '#1B1130' },
  { background: '#2BB673', color: '#FFFFFF' },
  { background: '#FFB35C', color: '#1B1130' },
  { background: '#FF4D6D', color: '#FFFFFF' },
];

export function RoomPlayerList({
  players,
  hostId,
  currentPlayerId,
}: RoomPlayerListProps) {
  if (players.length === 0) {
    return <S_EmptyMessage>아직 입장한 플레이어가 없어요.</S_EmptyMessage>;
  }

  return (
    <S_List aria-label="입장한 플레이어 목록">
      {players.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const isHost = player.id === hostId;
        const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

        return (
          <S_PlayerCard key={player.id}>
            <S_Avatar
              aria-hidden="true"
              backgroundColor={avatarColor.background}
              textColor={avatarColor.color}
            >
              {getInitial(player.nickname)}
            </S_Avatar>
            <S_Nickname title={player.nickname}>{player.nickname}</S_Nickname>
            {(isCurrentPlayer || isHost) && (
              <S_BadgeList aria-label="플레이어 상태">
                {isCurrentPlayer && <S_Badge>나</S_Badge>}
                {isHost && <S_Badge>방장</S_Badge>}
              </S_BadgeList>
            )}
          </S_PlayerCard>
        );
      })}
    </S_List>
  );
}

function getInitial(nickname: string) {
  return nickname.trim().charAt(0) || '?';
}

const S_List = styled.ul`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(8.6rem, 1fr));
  gap: 1.2rem;
`;

const S_PlayerCard = styled.li`
  display: flex;
  min-width: 0;
  min-height: 12rem;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.7rem;
  padding: 1.4rem 0.6rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
`;

const S_Avatar = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'backgroundColor' && prop !== 'textColor',
})<{
  backgroundColor: string;
  textColor: string;
}>`
  display: grid;
  width: 4.6rem;
  height: 4.6rem;
  flex: none;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: 50%;
  background: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;

const S_Nickname = styled.span`
  max-width: 7.4rem;
  overflow: hidden;
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_BadgeList = styled.div`
  display: flex;
  min-height: 1.7rem;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
`;

const S_Badge = styled.span`
  padding: 0.1rem 0.7rem;
  border-radius: ${({ theme }) => theme.RADIUS.PILL};
  background: ${({ theme }) => theme.COLOR.PRIMARY500};
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.LABEL4}
`;

const S_EmptyMessage = styled.p`
  width: 100%;
  padding: 2rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_R}
`;
