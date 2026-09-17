import { useEffect, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PLAY_GUIDE_COMPACT_MEDIA_QUERY } from '../constants/playGuideSlides';

import PlayGuideSlide from './PlayGuideSlide';

import type { PlayGuideSlideData } from '../types/playGuide';

const PLAY_GUIDE_AUTOPLAY_DELAY = 5000;
const PLAY_GUIDE_AUTOPLAY_ENABLED = true;
const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

type PlayGuideCarouselProps = {
  slides: PlayGuideSlideData[];
};

export default function PlayGuideCarousel({ slides }: PlayGuideCarouselProps) {
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: PLAY_GUIDE_AUTOPLAY_DELAY,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1 },
    PLAY_GUIDE_AUTOPLAY_ENABLED ? [autoplay] : [],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches,
  );

  const handlePreviousButtonClick = () => {
    emblaApi?.scrollPrev();
  };

  const handleNextButtonClick = () => {
    emblaApi?.scrollNext();
  };

  const handleDotButtonClick = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  const handleFocusCapture = () => {
    emblaApi?.plugins().autoplay?.stop();
  };

  const handleBlurCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) {
      return;
    }

    if (!isReducedMotion) {
      emblaApi?.plugins().autoplay?.play();
    }
  };

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    handleSelect();
    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', handleSelect);

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', handleSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    const autoplayApi = emblaApi?.plugins().autoplay;

    if (!autoplayApi || !PLAY_GUIDE_AUTOPLAY_ENABLED) {
      return;
    }

    if (isReducedMotion) {
      autoplayApi.stop();
      return;
    }

    autoplayApi.play();
  }, [emblaApi, isReducedMotion]);

  return (
    <S_Carousel
      aria-label="플레이 방법"
      aria-roledescription="carousel"
      onBlurCapture={handleBlurCapture}
      onFocusCapture={handleFocusCapture}
    >
      <S_Viewport ref={emblaRef}>
        <S_Slides>
          {slides.map((slide, index) => (
            <S_Slide
              aria-hidden={selectedIndex !== index}
              aria-label={`플레이 방법 ${index + 1}`}
              aria-roledescription="slide"
              key={slide.image}
            >
              <PlayGuideSlide {...slide} />
            </S_Slide>
          ))}
        </S_Slides>
      </S_Viewport>

      <S_Controls>
        <S_ArrowButton
          type="button"
          aria-label="이전 플레이 방법"
          onClick={handlePreviousButtonClick}
        >
          <S_ArrowIcon aria-hidden="true" />
        </S_ArrowButton>
        <S_DotList aria-label="플레이 방법 단계">
          {slides.map((slide, index) => (
            <S_DotButton
              key={slide.image}
              type="button"
              active={selectedIndex === index}
              aria-current={selectedIndex === index ? 'true' : undefined}
              aria-label={`플레이 방법 ${index + 1} 보기`}
              onClick={() => handleDotButtonClick(index)}
            />
          ))}
        </S_DotList>
        <S_ArrowButton
          type="button"
          aria-label="다음 플레이 방법"
          onClick={handleNextButtonClick}
        >
          <S_ArrowRightIcon aria-hidden="true" />
        </S_ArrowButton>
      </S_Controls>
    </S_Carousel>
  );
}

const S_Carousel = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.6rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    gap: 1.6rem;
  }
`;

const S_Viewport = styled.div`
  overflow: hidden;
  width: 100%;
`;

const S_Slides = styled.div`
  display: flex;
`;

const S_Slide = styled.div`
  display: flex;
  min-width: 0;
  flex: 0 0 100%;
  justify-content: center;
`;

const S_Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    gap: 1rem;
  }
`;

const S_ArrowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.COLOR.ICON};
  cursor: pointer;

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.COLOR.PRIMARY500};
    outline-offset: 0.2rem;
  }

  &:disabled {
    color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
    cursor: not-allowed;
  }

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    padding: 0.4rem;
  }
`;

const S_ArrowIcon = styled(ChevronLeft)`
  width: 2.4rem;
  height: 2.4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    width: 3.2rem;
    height: 3.2rem;
  }
`;

const S_ArrowRightIcon = styled(ChevronRight)`
  width: 2.4rem;
  height: 2.4rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    width: 3.2rem;
    height: 3.2rem;
  }
`;

const S_DotList = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const S_DotButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>`
  width: ${({ active }) => (active ? '1rem' : '0.7rem')};
  height: ${({ active }) => (active ? '1rem' : '0.7rem')};
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.RADIUS.PILL};
  background: ${({ active, theme }) =>
    active ? theme.COLOR.PRIMARY500 : '#dfdde1'};
  cursor: pointer;

  &:focus-visible {
    outline: 0.2rem solid ${({ theme }) => theme.COLOR.PRIMARY500};
    outline-offset: 0.2rem;
  }
`;
