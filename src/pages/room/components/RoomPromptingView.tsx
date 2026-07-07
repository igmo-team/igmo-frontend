import { useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';

export function RoomPromptingView() {
  const [promptText, setPromptText] = useState('');
  const isPromptEmpty = promptText.trim().length === 0;

  return (
    <S_PromptSection>
      <S_Title>AI에게 어떤 그림을 그리게 할까요?</S_Title>
      <S_Guide>친구들이 헷갈릴 만큼 생생하게 적어보세요.</S_Guide>

      <Textarea
        value={promptText}
        tone="white"
        rows={4}
        placeholder="예: 눈사람한테 목도리 빌리는 강아지, 엘리베이터에 갇힌 산타 "
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

const S_SubmitButton = styled(Button)`
  margin-top: 2.4rem;
`;
