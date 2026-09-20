import styled from '@emotion/styled';

import { PLAY_GUIDE_COMPACT_MEDIA_QUERY } from '../constants/playGuideSlides';

import type { PlayGuideSlideData } from '../types/playGuide';

type PlayGuideSlideProps = PlayGuideSlideData;

export default function PlayGuideSlide({
  image,
  imageAlt,
  mainText,
  subText,
}: PlayGuideSlideProps) {
  return (
    <S_Slide>
      <S_ImageFrame>
        <S_Image src={image} alt={imageAlt} />
      </S_ImageFrame>
      <S_TextGroup>
        <S_MainText>{mainText}</S_MainText>
        <S_SubText>{subText}</S_SubText>
      </S_TextGroup>
    </S_Slide>
  );
}

const S_Slide = styled.article`
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 1.2rem;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    gap: 1.2rem;
  }
`;

const S_ImageFrame = styled.div`
  display: flex;
  height: 13rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;

  background: ${({ theme }) => theme.COLOR.BACKGROUND};
  border-radius: ${({ theme }) => theme.RADIUS.MD};

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    height: auto;
    min-height: 22rem;
    padding: 1.2rem;
  }
`;

const S_Image = styled.img`
  display: block;
  max-width: 100%;
  /* 프레임(S_ImageFrame) 높이에 종속 — 프레임만 바꾸면 이미지도 따라온다.
     프레임이 height:auto인 모바일에서는 100%가 무의미하므로 별도 값 사용. */
  max-height: 100%;
  object-fit: contain;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    max-height: 30rem;
  }
`;

const S_TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: center;

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    gap: 0.6rem;
  }
`;

const S_MainText = styled.h3`
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
  color: ${({ theme }) => theme.COLOR.TEXT};

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    ${({ theme }) => theme.TYPOGRAPHY.TITLE3}
  }
`;

const S_SubText = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B6_R}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};

  @media ${PLAY_GUIDE_COMPACT_MEDIA_QUERY} {
    ${({ theme }) => theme.TYPOGRAPHY.B3_R}
  }
`;
