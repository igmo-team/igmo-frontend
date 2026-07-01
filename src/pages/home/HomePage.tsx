import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import { Button, Input, Surface } from '../../common/components';

export function HomePage() {
  return (
    <S_Page>
      <S_Hero>
        <S_LogoRow>
          <S_LogoMark>
            <S_LogoMarkText>?</S_LogoMarkText>
          </S_LogoMark>
          <S_Title>이그모</S_Title>
        </S_LogoRow>
        <S_Subtitle>이 그림, 모지? · AI가 그린 그림 추리 파티게임</S_Subtitle>
      </S_Hero>

      <S_FormCard padding="lg">
        <S_FieldLabel htmlFor="nickname">닉네임</S_FieldLabel>
        <Input id="nickname" maxLength={10} placeholder="예: 그림탐정" />
        <Button>새 방 만들기</Button>
        <Button variant="secondary" size="md">
          코드로 참여하기
        </Button>
      </S_FormCard>

      <S_Footnote>🔓 로그인 없이 닉네임만으로 바로 시작</S_Footnote>
    </S_Page>
  );
}

const logoFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2.8rem);
  }
`;

const S_Page = styled.main`
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3.2rem;
  padding: 4rem 2.4rem 9.6rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
  font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
`;

const S_Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
  text-align: center;
`;

const S_LogoRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 1.4rem;
`;

const S_LogoMark = styled.div`
  display: grid;
  width: 6.8rem;
  height: 6.8rem;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: 2rem;
  background: ${({ theme }) => theme.COLOR.PRIMARY500};
  box-shadow: ${({ theme }) => theme.SHADOW.BUTTON};
  animation: ${logoFloat} 4s ease-in-out infinite;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const S_LogoMarkText = styled.span`
  font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
  font-size: 3.4rem;
  line-height: 1;
  color: ${({ theme }) => theme.COLOR.WHITE};
`;

const S_Title = styled.h1`
  ${({ theme }) => theme.TYPOGRAPHY.LOGO}
  color: ${({ theme }) => theme.COLOR.TEXT};
  letter-spacing: -0.2rem;
`;

const S_Subtitle = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B1_B}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;

const S_FormCard = styled(Surface)`
  display: flex;
  max-width: 40rem;
  flex-direction: column;
  gap: 1.2rem;
`;

const S_FieldLabel = styled.label`
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;

const S_Footnote = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B5_R}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
