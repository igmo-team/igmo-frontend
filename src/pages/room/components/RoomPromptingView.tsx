import { useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';

const PROMPT_PLACEHOLDER =
  '예: 빨간 마라탕 그릇에 코를 박고 먹는 호랑이, 김 모락모락, 귀여운 표정';

export function RoomPromptingView() {
  const [promptText, setPromptText] = useState('');
  const isPromptEmpty = promptText.trim().length === 0;

  return (
    <S_PromptSection>
      <S_Title>AI에게 어떤 그림을 그리게 할까요?</S_Title>
      <S_Guide>
        한국어로 자유롭게 적어주세요. 결과물은 영어로 정교하게 변환돼요.
      </S_Guide>

      <S_Textarea
        value={promptText}
        rows={4}
        placeholder={PROMPT_PLACEHOLDER}
        shadow
        onChange={(event) => setPromptText(event.target.value)}
      />

      <S_SubmitButton type="button" disabled={isPromptEmpty}>
        그림 생성하기
      </S_SubmitButton>
    </S_PromptSection>
  );
}

const S_PromptSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const S_Title = styled.h2`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_Guide = styled.p`
  margin-top: 0.8rem;
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;

const S_Textarea = styled(Textarea)`
  min-height: 15.2rem;
  margin-top: 1.8rem;
  background: ${({ theme }) => theme.COLOR.WHITE};
`;

const S_SubmitButton = styled(Button)`
  margin-top: 2.4rem;
`;
