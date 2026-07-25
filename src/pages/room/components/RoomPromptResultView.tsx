import { useState } from 'react';

import styled from '@emotion/styled';

type RoomPromptResultViewProps = {
  prompt: string;
  imageUrl?: string;
};

export function RoomPromptResultView({
  prompt,
  imageUrl,
}: RoomPromptResultViewProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const hasImageError = !imageUrl || failedImageUrl === imageUrl;

  return (
    <S_ResultSection>
      <S_Title>그림이 완성됐어요</S_Title>

      {hasImageError ? (
        <S_ImageFallback>
          <S_ImageFallbackText>이미지를 불러오지 못했어요.</S_ImageFallbackText>
        </S_ImageFallback>
      ) : (
        <S_Image
          src={imageUrl}
          alt="생성된 그림"
          onError={() => setFailedImageUrl(imageUrl ?? null)}
        />
      )}

      <S_PromptBox>
        <S_PromptLabel>내가 입력한 프롬프트</S_PromptLabel>
        <S_PromptText>{prompt}</S_PromptText>
      </S_PromptBox>
    </S_ResultSection>
  );
}

const S_ResultSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.8rem;
  align-items: center;
`;

const S_Title = styled.h2`
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_Image = styled.img`
  width: 100%;
  max-width: 50rem;
  aspect-ratio: 1 / 1;
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  object-fit: cover;
`;

const S_ImageFallback = styled.div`
  display: flex;
  width: 100%;
  max-width: 50rem;
  aspect-ratio: 1 / 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
`;

const S_ImageFallbackText = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;

const S_PromptBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.6rem;
  padding: 1.6rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
`;

const S_PromptLabel = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
`;

const S_PromptText = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;
