import styled from '@emotion/styled';

import LoadingSpinner from '../../../common/components/LoadingSpinner';

export default function RoomPageLoading() {
  return (
    <S_Page>
      <S_Status role="status">
        <LoadingSpinner />
        <S_Message>게임방에 입장하는 중입니다.</S_Message>
      </S_Status>
    </S_Page>
  );
}

const S_Page = styled.main`
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 2.4rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

const S_Status = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
`;

const S_Message = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.B3_R}
`;
