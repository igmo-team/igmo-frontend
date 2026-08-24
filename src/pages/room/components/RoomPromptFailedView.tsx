import { useRef, useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';

import type { PromptSubmissionPayload } from '../../../domain/room/types';

type RoomPromptFailedViewProps = {
  prompt?: string;
  isSocketConnected?: boolean;
  socketErrorMessage?: string;
  onSubmit?: (payload: PromptSubmissionPayload) => boolean;
};

export function RoomPromptFailedView({
  prompt = '',
  isSocketConnected = false,
  socketErrorMessage = '',
  onSubmit,
}: RoomPromptFailedViewProps) {
  const isComposingRef = useRef(false);
  const [promptText, setPromptText] = useState(prompt);
  const isPromptEmpty = promptText === '';

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

    if (promptText === '' || !isSocketConnected || !onSubmit) {
      return;
    }

    onSubmit({ prompt: promptText, submissionType: 'NORMAL' });
  };

  return (
    <S_ResultSection onSubmit={handleRetrySubmit}>
      <S_TextGroup>
        <S_Title>😭 그림 생성에 실패했어요</S_Title>
        <S_Guide>프롬프트를 다듬어 다시 시도해 보세요.</S_Guide>
      </S_TextGroup>

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
  gap: 2.4rem;
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

const S_ErrorMessage = styled.p`
  color: ${({ theme }) => theme.COLOR.DANGER};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;
