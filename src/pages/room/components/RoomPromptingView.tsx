import { useRef, useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';

type RoomPromptingViewProps = {
  isSocketConnected: boolean;
  socketErrorMessage: string;
  onSubmit: (prompt: string) => void;
};

export function RoomPromptingView({
  isSocketConnected,
  socketErrorMessage,
  onSubmit,
}: RoomPromptingViewProps) {
  const isComposingRef = useRef(false);
  const [promptText, setPromptText] = useState('');
  const isPromptEmpty = promptText.trim().length === 0;

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setPromptText(event.target.value);
  };

  const handlePromptKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229 ||
      isComposingRef.current
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleGenerateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPrompt = promptText.trim();

    if (trimmedPrompt.length === 0 || !isSocketConnected) {
      return;
    }

    onSubmit(trimmedPrompt);
  };

  return (
    <S_PromptSection>
      <S_TextGroup>
        <S_Title>AI에게 어떤 그림을 그리게 할까요?</S_Title>
        <S_Guide>친구들이 헷갈릴 만큼 생생하게 적어보세요.</S_Guide>
      </S_TextGroup>

      <S_InputGroup onSubmit={handleGenerateSubmit}>
        <Textarea
          value={promptText}
          tone="white"
          rows={4}
          placeholder="예: 눈사람한테 목도리 빌리는 강아지, 엘리베이터에 갇힌 산타 "
          shadow
          onChange={handlePromptChange}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onKeyDown={handlePromptKeyDown}
        />

        {socketErrorMessage && (
          <S_ErrorMessage role="alert">{socketErrorMessage}</S_ErrorMessage>
        )}

        <Button type="submit" disabled={isPromptEmpty || !isSocketConnected}>
          그림 생성하기
        </Button>
      </S_InputGroup>
    </S_PromptSection>
  );
}

const S_PromptSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.8rem;
`;

const S_TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const S_Title = styled.h2`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_Guide = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;

const S_InputGroup = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const S_ErrorMessage = styled.p`
  color: ${({ theme }) => theme.COLOR.DANGER};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;
