import { useCallback, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';
import { useDeadlineSubmission } from '../hooks/useDeadlineSubmission';
import { useMobileInputScrollLock } from '../hooks/useMobileInputScrollLock';

import type { PromptSubmissionPayload } from '../../../domain/room/types';

type RoomPromptingViewProps = {
  deadline: string;
  isSocketConnected: boolean;
  socketErrorMessage: string;
  onSubmit: (payload: PromptSubmissionPayload) => boolean;
};

export function RoomPromptingView({
  deadline,
  isSocketConnected,
  socketErrorMessage,
  onSubmit,
}: RoomPromptingViewProps) {
  const isComposingRef = useRef(false);
  const latestPromptRef = useRef('');
  const {
    inputRef: promptTextareaRef,
    handleInputBlur,
    handleInputFocus,
    handleInputTouchEnd,
    handleInputTouchStart,
  } = useMobileInputScrollLock();
  const [promptText, setPromptText] = useState('');
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const isPromptEmpty = promptText === '';

  const handleDeadlineSubmit = useCallback(() => {
    onSubmit({
      prompt: latestPromptRef.current,
      submissionType: 'DEADLINE',
    });
  }, [onSubmit]);

  const isDeadlineExpired = useDeadlineSubmission({
    deadline,
    shouldSubmit: !isSubmitPending,
    onDeadline: handleDeadlineSubmit,
  });

  const isSubmissionClosed = isDeadlineExpired || isSubmitPending;

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const nextPrompt = event.target.value;

    latestPromptRef.current = nextPrompt;
    setPromptText(nextPrompt);
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

    if (promptText === '' || !isSocketConnected || isSubmissionClosed) {
      return;
    }

    if (onSubmit({ prompt: promptText, submissionType: 'NORMAL' })) {
      setIsSubmitPending(true);
    }
  };

  return (
    <S_PromptSection>
      <S_TextGroup>
        <S_Title>AI에게 어떤 그림을 그리게 할까요?</S_Title>
        <S_Guide>
          시간 안에 입력하지 않으면 샘플 프롬프트로 자동 제출돼요.
        </S_Guide>
      </S_TextGroup>

      <S_InputGroup onSubmit={handleGenerateSubmit}>
        <Textarea
          ref={promptTextareaRef}
          value={promptText}
          tone="white"
          rows={4}
          placeholder="예: 눈사람한테 목도리 빌리는 강아지, 엘리베이터에 갇힌 산타 "
          shadow
          disabled={isSubmissionClosed}
          onBlur={handleInputBlur}
          onChange={handlePromptChange}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onFocus={handleInputFocus}
          onKeyDown={handlePromptKeyDown}
          onTouchEnd={handleInputTouchEnd}
          onTouchStart={handleInputTouchStart}
        />

        {socketErrorMessage && (
          <S_ErrorMessage role="alert">{socketErrorMessage}</S_ErrorMessage>
        )}

        <Button
          type="submit"
          disabled={isPromptEmpty || !isSocketConnected || isSubmissionClosed}
        >
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
