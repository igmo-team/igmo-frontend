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
        <RoomEntryForm />
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
  max-width: 88.4rem;
  grid-template-columns: minmax(0, 56rem) minmax(0, 30rem);
  align-items: stretch;
  justify-content: center;
  column-gap: 2.4rem;
  row-gap: 0;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;
