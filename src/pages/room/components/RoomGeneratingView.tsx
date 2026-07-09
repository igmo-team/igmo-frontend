import styled from '@emotion/styled';

// TODO: 실제 생성 진행 UI로 교체 (현재 임시 placeholder)
export function RoomGeneratingView() {
  return (
    <S_GeneratingSection>
      <S_Title>그림을 그리는 중이에요</S_Title>
      <S_Guide>AI가 프롬프트를 열심히 그리고 있어요. 잠시만 기다려주세요.</S_Guide>
    </S_GeneratingSection>
  );
}

const S_GeneratingSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  text-align: center;
`;

const S_Title = styled.h2`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_Guide = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;
