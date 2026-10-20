import styled from '@emotion/styled';
import { TriangleAlert } from 'lucide-react';

import { PAGE_URL } from '../constants/pageUrl';

import Button from './Button';
import Surface from './Surface';

export default function RouteErrorFallback() {
  const handleReloadButtonClick = () => {
    window.location.reload();
  };

  const handleHomeButtonClick = () => {
    window.location.assign(PAGE_URL.HOME);
  };

  return (
    <S_Page>
      <S_Card
        padding="lg"
        shadow
        role="alert"
        aria-labelledby="route-error-title"
      >
        <S_Icon aria-hidden="true" />
        <S_Title id="route-error-title">페이지를 불러오지 못했어요</S_Title>
        <S_Description>새로고침하거나 홈으로 이동해 주세요.</S_Description>
        <S_Actions>
          <Button onClick={handleReloadButtonClick}>새로고침</Button>
          <Button variant="secondary" onClick={handleHomeButtonClick}>
            홈으로 이동
          </Button>
        </S_Actions>
      </S_Card>
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

const S_Card = styled(Surface)`
  display: flex;
  max-width: 44rem;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
  text-align: center;
`;

const S_Icon = styled(TriangleAlert)`
  width: 4.8rem;
  height: 4.8rem;
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
`;

const S_Title = styled.h1`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE2}
`;

const S_Description = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B3_R}
`;

const S_Actions = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 0.8rem;
`;
