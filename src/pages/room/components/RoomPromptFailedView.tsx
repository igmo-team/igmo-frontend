import styled from '@emotion/styled';

export function RoomPromptFailedView() {
  return (
    <S_ResultSection>
      <S_Title>그림 생성에 실패했어요</S_Title>

      <S_FailedImage>
        <S_FailedIcon aria-hidden="true">😢</S_FailedIcon>
        <S_FailedGuide>이번 그림은 만들지 못했어요.</S_FailedGuide>
      </S_FailedImage>
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

const S_FailedImage = styled.div`
  display: flex;
  aspect-ratio: 1 / 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.PINK50};
  text-align: center;
`;

const S_FailedIcon = styled.span`
  margin-bottom: 2.4rem;
  font-size: 6.4rem;
  line-height: 1;
`;

const S_FailedGuide = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE3}
`;
