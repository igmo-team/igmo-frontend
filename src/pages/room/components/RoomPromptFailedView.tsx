import { useRef, useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';

type RoomPromptFailedViewProps = {
  prompt?: string;
  isSocketConnected?: boolean;
  socketErrorMessage?: string;
  onSubmit?: (prompt: string) => void;
};

export function RoomPromptFailedView({
  prompt = '',
  isSocketConnected = false,
  socketErrorMessage = '',
  onSubmit,
}: RoomPromptFailedViewProps) {
  const isComposingRef = useRef(false);
  const [promptText, setPromptText] = useState(prompt);
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

  const handleRetrySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPrompt = promptText.trim();

    if (trimmedPrompt.length === 0 || !isSocketConnected || !onSubmit) {
      return;
    }

    onSubmit(trimmedPrompt);
  };

  return (
    <S_ResultSection onSubmit={handleRetrySubmit}>
      <S_Title>그림 생성에 실패했어요</S_Title>

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
        다시 생성하기
      </Button>
    </S_ResultSection>
  );
}

const S_ResultSection = styled.form`
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

const S_ErrorMessage = styled.p`
  color: ${({ theme }) => theme.COLOR.DANGER};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;
