import { useEffect, useState } from 'react';

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
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

  useEffect(() => {
    captureAnalyticsEvent('home_viewed');
  }, []);

  const handleToggleGuideExpand = () => {
    setIsGuideExpanded((prev) => !prev);
  };

  return (
    <S_Page>
      <HomeHero />
      <S_MainContent>
        <S_FormSlot>
          <RoomEntryForm />
        </S_FormSlot>
        <PlayGuide
          slides={PLAY_GUIDE_SLIDES}
          isExpanded={isGuideExpanded}
          onToggleExpand={handleToggleGuideExpand}
        />
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
  display: flex;
  width: 100%;
  max-width: 88.4rem;
  align-items: flex-start;
  justify-content: center;
  gap: 2.4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    flex-direction: column;
    align-items: center;
  }
`;

const S_FormSlot = styled.div`
  flex: none;
  width: 56rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    width: 100%;
  }
`;
