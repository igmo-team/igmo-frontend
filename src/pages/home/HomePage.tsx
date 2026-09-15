import { useEffect } from 'react';

import styled from '@emotion/styled';

import { captureAnalyticsEvent } from '../../common/analytics';

import { HomeHero } from './components/HomeHero';
import PlayGuide from './components/PlayGuide';
import { RoomEntryForm } from './components/RoomEntryForm';
import {
  PLAY_GUIDE_COMPACT_MEDIA_QUERY,
  PLAY_GUIDE_SLIDES,
} from './constants/playGuideSlides';

export function HomePage() {
  useEffect(() => {
    captureAnalyticsEvent('home_viewed');
  }, []);

  return (
    <S_Page>
      <HomeHero />
      <S_MainContent>
        <S_EntryColumn>
          <RoomEntryForm />
          <S_Footnote>🔓 로그인 없이 닉네임만으로 바로 시작</S_Footnote>
        </S_EntryColumn>
        <PlayGuide slides={PLAY_GUIDE_SLIDES} />
      </S_MainContent>
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
`;

const S_MainContent = styled.div`
  display: grid;
  width: 100%;
  max-width: 100rem;
  grid-template-columns: minmax(0, 40rem) minmax(0, 38rem);
  align-items: center;
  justify-content: center;
  gap: 4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const S_EntryColumn = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 1.6rem;
`;

const S_Footnote = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B5_R}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
