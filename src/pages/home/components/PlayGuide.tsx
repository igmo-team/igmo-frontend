import { useEffect, useRef, useState } from 'react';

import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Maximize2, Minimize2, X } from 'lucide-react';

import Surface from '../../../common/components/Surface';
import { PLAY_GUIDE_COMPACT_MEDIA_QUERY } from '../constants/playGuideSlides';

import PlayGuideCarousel from './PlayGuideCarousel';

import type { PlayGuideSlideData } from '../types/playGuide';

type PlayGuideProps = {
  slides: PlayGuideSlideData[];
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export default function PlayGuide({
  slides,
  isExpanded,
  onToggleExpand,
}: PlayGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenButtonClick = () => {
    setIsOpen(true);
  };

  const handleCloseButtonClick = () => {
    setIsOpen(false);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseButtonClick();
      }
    };
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <S_TriggerDock isOpen={isOpen}>
        <S_HintText aria-hidden="true">처음이면 여기!</S_HintText>
        <S_HintArrow aria-hidden="true" viewBox="0 0 46 24" fill="none">
          <path
            d="M3 12H38"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <path
            d="M30 4L40 12L30 20"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </S_HintArrow>
        <S_Trigger
          ref={triggerRef}
          type="button"
          aria-label="플레이 방법 열기"
          onClick={handleOpenButtonClick}
        >
          ?
        </S_Trigger>
      </S_TriggerDock>
      <S_Panel
        aria-labelledby="play-guide-title"
        isOpen={isOpen}
        isExpanded={isExpanded}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? true : undefined}
      >
        <S_PanelHeader>
          <S_Title id="play-guide-title">플레이 방법</S_Title>
          <S_ExpandButton
            type="button"
            aria-label={isExpanded ? '안내 축소' : '안내 확대'}
            onClick={onToggleExpand}
          >
            {isExpanded ? (
              <Minimize2 aria-hidden="true" />
            ) : (
              <Maximize2 aria-hidden="true" />
            )}
          </S_ExpandButton>
          <S_CloseButton
            type="button"
            aria-label="플레이 방법 닫기"
            onClick={handleCloseButtonClick}
          >
            <S_CloseIcon aria-hidden="true" />
          </S_CloseButton>
        </S_PanelHeader>
        <S_PanelBody>
          <PlayGuideCarousel
            key={isOpen ? 'open' : 'closed'}
            slides={slides}
            isExpanded={isExpanded}
          />
        </S_PanelBody>
      </S_Panel>
    </>
  );
}

const nudgeX = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(0.5rem);
  }
`;

const pulseRing = keyframes`
  0% {
    box-shadow: 0 0 0 0 var(--play-guide-pulse-ring);
  }
  70% {
    box-shadow: 0 0 0 1.1rem transparent;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
`;

const S_TriggerDock = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  display: none;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    position: fixed;
    z-index: 10;
    top: 2rem;
    right: 2rem;
    display: ${({ isOpen }) => (isOpen ? 'none' : 'flex')};
    align-items: center;
    gap: 0.8rem;
  }
`;

const S_HintText = styled.span`
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  white-space: nowrap;
`;

const S_HintArrow = styled.svg`
  width: 4.6rem;
  height: 2.4rem;
  flex: none;
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  animation: ${nudgeX} 1.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const S_Trigger = styled.button`
  --play-guide-pulse-ring: ${({ theme }) =>
    `color-mix(in srgb, ${theme.COLOR.PRIMARY500} 50%, transparent)`};

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  padding: 0;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
  box-shadow: ${({ theme }) => theme.SHADOW.BUTTON};
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.BUTTON2}
  cursor: pointer;

  /* 원래 버튼(테두리+하드섀도)은 그대로 두고, 핑크 하이라이트 링만 가상요소로 얹음 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    animation: ${pulseRing} 1.8s ease-out infinite;
  }

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.COLOR.PRIMARY500};
    outline-offset: 0.2rem;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

const S_Panel = styled(Surface, {
  shouldForwardProp: (prop) => prop !== 'isOpen' && prop !== 'isExpanded',
})<{ isOpen: boolean; isExpanded: boolean }>`
  display: flex;
  flex: 1;
  min-width: 0;
  max-width: ${({ isExpanded }) => (isExpanded ? '48rem' : '38rem')};
  transition: max-width 0.3s ease;
  flex-direction: column;
  gap: 0.6rem;
  /* 4c: 반투명 흰 패널이 핑크 배경에 녹아들고, 로그인 카드가 도드라짐 */
  background: ${({ theme }) => theme.COLOR.PLAY_GUIDE_PANEL};
  border: none;
  box-shadow: ${({ theme }) => theme.SHADOW.PLAY_GUIDE_PANEL};
  padding: 1.5rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: fixed;
    z-index: 9;
    inset: 0;
    max-width: none;
    height: 100dvh;
    padding: 1.5rem;
    background: ${({ theme }) => theme.COLOR.PINK50};
    border: 0;
    border-radius: 0;
    box-shadow: none;
    gap: 0.6rem;
  }
`;

const S_PanelHeader = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    min-height: 3.2rem;
  }
`;

const S_ExpandButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  padding: 0;
  border: 0;
  border-radius: 0.8rem;
  background: ${({ theme }) =>
    `color-mix(in srgb, ${theme.COLOR.TEXT} 6%, transparent)`};
  color: ${({ theme }) => theme.COLOR.TEXT};
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  & > svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  &:hover {
    background: ${({ theme }) => theme.COLOR.PRIMARY200};
    color: ${({ theme }) => theme.COLOR.PRIMARY700};
  }

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    display: none;
  }

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.COLOR.PRIMARY500};
    outline-offset: 0.2rem;
  }
`;

const S_Title = styled.h2`
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
`;

const S_CloseButton = styled.button`
  display: none;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.COLOR.TEXT};
    ${({ theme }) => theme.TYPOGRAPHY.TITLE2}
    cursor: pointer;
  }

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.COLOR.PRIMARY500};
    outline-offset: 0.2rem;
  }
`;

const S_CloseIcon = styled(X)`
  width: 2.4rem;
  height: 2.4rem;
`;

const S_PanelBody = styled.div`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
`;
