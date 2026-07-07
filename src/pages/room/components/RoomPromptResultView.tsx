import styled from '@emotion/styled';

type RoomPromptResultViewProps = {
  imageUrl: string;
  prompt: string;
};

// TODO: 실제 결과 화면 디자인으로 교체 (현재 임시 placeholder)
export function RoomPromptResultView({
  imageUrl,
  prompt,
}: RoomPromptResultViewProps) {
  return (
    <S_ResultSection>
      <S_Title>그림이 완성됐어요</S_Title>
      <S_Image src={imageUrl} alt="생성된 그림" />
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
`;

const S_Title = styled.h2`
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_Image = styled.img`
  width: 100%;
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  object-fit: cover;
`;

const S_PromptBox = styled.div`
  display: flex;
  flex-direction: column;
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
