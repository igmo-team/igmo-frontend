import styled from '@emotion/styled';

import { LogoMark } from '../../../common/components';

export function HomeHero() {
  return (
    <S_Hero>
      <S_LogoRow>
        <LogoMark size="lg" animated />
        <S_Title>이그모</S_Title>
      </S_LogoRow>
      <S_Subtitle>이 그림, 모지? · AI가 그린 그림 추리 파티게임</S_Subtitle>
    </S_Hero>
  );
}

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

const S_Title = styled.h1`
  ${({ theme }) => theme.TYPOGRAPHY.LOGO}
  color: ${({ theme }) => theme.COLOR.TEXT};
  letter-spacing: -0.2rem;
`;

const S_Subtitle = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B1_B}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
