import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';

export function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();

  return (
    <S_Page>
      <S_Title>로비</S_Title>
      <S_RoomCode>{roomCode}</S_RoomCode>
    </S_Page>
  );
}

const S_Page = styled.main`
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.6rem;
  padding: 4rem 2.4rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_Title = styled.h1`
  ${({ theme }) => theme.TYPOGRAPHY.TITLE2}
  color: ${({ theme }) => theme.COLOR.TEXT};
`;

const S_RoomCode = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.DISPLAY}
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
`;
