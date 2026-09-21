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
        <S_FormSlot isExpanded={isGuideExpanded}>
          <S_FormScale isExpanded={isGuideExpanded}>
            <RoomEntryForm />
          </S_FormScale>
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
  align-items: stretch;
  justify-content: center;
  gap: 2.4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    flex-direction: column;
    align-items: center;
  }
`;

/* 확대 시 폼을 제자리에서 축소: 바깥 폭은 축소된 크기로 줄이고(빈 공간 방지),
   안쪽은 원래 폭을 유지한 채 scale로 줄여 안내와의 간격은 그대로 둔다. */
const S_FormSlot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded: boolean }>`
  flex: none;
  overflow: hidden;
  width: ${({ isExpanded }) => (isExpanded ? '44.8rem' : '56rem')};
  transition: width 0.3s ease;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    width: 100%;
  }
`;

const S_FormScale = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded: boolean }>`
  width: 56rem;
  transform-origin: top left;
  transform: ${({ isExpanded }) => (isExpanded ? 'scale(0.8)' : 'none')};
  transition: transform 0.3s ease;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    width: 100%;
    transform: none;
  }
`;
