import styled from '@emotion/styled';

import type { RoomConnectionState } from '../hooks/useRoomSocket';

type RoomConnectionStatusProps = {
  state: RoomConnectionState;
};

export default function RoomConnectionStatus({
  state,
}: RoomConnectionStatusProps) {
  if (state === 'CONNECTED') {
    return null;
  }

  return (
    <S_Status role="status" aria-live="polite">
      {getConnectionMessage(state)}
    </S_Status>
  );
}

function getConnectionMessage(state: RoomConnectionState) {
  switch (state) {
    case 'CONNECTING':
      return '실시간 연결을 확인하고 있어요';
    case 'RECONNECTING':
      return '연결이 끊겼어요. 다시 연결하고 있어요';
    case 'SYNCING':
      return '게임 상태를 다시 불러오고 있어요';
    case 'DISCONNECTED':
      return '실시간 연결이 끊겼어요';
    case 'CONNECTED':
      return '';
  }
}

const S_Status = styled.p`
  box-sizing: border-box;
  width: min(100%, 56rem);
  margin: 0 auto;
  padding: 1.2rem 1.6rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_B}
`;
