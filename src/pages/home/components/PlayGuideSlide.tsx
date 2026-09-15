import styled from '@emotion/styled';

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
`;

const S_ImageFrame = styled.div`
  display: flex;
  min-height: 22rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  padding: 1.2rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
`;

const S_Image = styled.img`
  display: block;
  max-width: 100%;
  max-height: 30rem;
  object-fit: contain;
`;

const S_TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: center;
`;

const S_MainText = styled.h3`
  ${({ theme }) => theme.TYPOGRAPHY.TITLE3}
  color: ${({ theme }) => theme.COLOR.TEXT};
`;

const S_SubText = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B3_R}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
