import styled from '@emotion/styled';

import { HomeHero } from './components/HomeHero';
import { LobbyEntryForm } from './components/LobbyEntryForm';

export function HomePage() {
  return (
    <S_Page>
      <HomeHero />
      <LobbyEntryForm />
      <S_Footnote>🔓 로그인 없이 닉네임만으로 바로 시작</S_Footnote>
    </S_Page>
  );
}

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

const S_Footnote = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B5_R}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
