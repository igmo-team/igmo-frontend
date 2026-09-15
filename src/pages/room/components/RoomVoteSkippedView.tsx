import styled from '@emotion/styled';

export default function RoomVoteSkippedView() {
  return (
    <S_Section aria-live="polite">
      <S_Icon aria-hidden="true">🙌</S_Icon>
      <S_Title>
        모두가 정답을 맞혀서
        <br />
        투표 단계를 생략해요
      </S_Title>
      <S_Guide>잠시 후 결과 화면으로 이동합니다</S_Guide>
    </S_Section>
  );
}

const S_Section = styled.section`
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.4rem;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
  text-align: center;
`;

const S_Icon = styled.div`
  line-height: 1;
  ${({ theme }) => theme.TYPOGRAPHY.DISPLAY}
`;

const S_Title = styled.h1`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_Guide = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;
