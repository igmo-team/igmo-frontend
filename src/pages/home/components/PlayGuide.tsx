import { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { X } from 'lucide-react';

import Surface from '../../../common/components/Surface';
import { PLAY_GUIDE_COMPACT_MEDIA_QUERY } from '../constants/playGuideSlides';

import PlayGuideCarousel from './PlayGuideCarousel';

import type { PlayGuideSlideData } from '../types/playGuide';

type PlayGuideProps = {
  slides: PlayGuideSlideData[];
};

export default function PlayGuide({ slides }: PlayGuideProps) {
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
      <S_Trigger
        ref={triggerRef}
        type="button"
        aria-label="플레이 방법 열기"
        isOpen={isOpen}
        onClick={handleOpenButtonClick}
      >
        ?
      </S_Trigger>
      <S_Panel
        aria-labelledby="play-guide-title"
        isOpen={isOpen}
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? true : undefined}
      >
        <S_PanelHeader>
          <S_Title id="play-guide-title">플레이 방법</S_Title>
          <S_CloseButton
            type="button"
            aria-label="플레이 방법 닫기"
            onClick={handleCloseButtonClick}
          >
            <S_CloseIcon aria-hidden="true" />
          </S_CloseButton>
        </S_PanelHeader>
        <S_PanelBody>
          <PlayGuideCarousel key={isOpen ? 'open' : 'closed'} slides={slides} />
        </S_PanelBody>
      </S_Panel>
    </>
  );
}

const S_Trigger = styled('button', {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  display: none;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    position: fixed;
    z-index: 10;
    top: 2rem;
    right: 2rem;
    display: ${({ isOpen }) => (isOpen ? 'none' : 'inline-flex')};
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
  }

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.COLOR.PRIMARY500};
    outline-offset: 0.2rem;
  }
`;

const S_Panel = styled(Surface, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  display: flex;
  max-width: 38rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    min-height: 3.2rem;
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
