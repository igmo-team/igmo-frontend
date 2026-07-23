import { useEffect, useState } from 'react';

import styled from '@emotion/styled';

import { Button, Textarea } from '../../../common/components';

import type { RoundSnapshot } from '../../../domain/room/types';

type RoomPlayingViewProps = {
  snapshot: RoundSnapshot;
  currentPlayerId?: string;
  isSocketConnected: boolean;
  socketErrorMessage?: string;
  onSubmit: (prompt: string) => void;
};

export function RoomPlayingView({
  snapshot,
  currentPlayerId,
  isSocketConnected,
  socketErrorMessage = '',
  onSubmit,
}: RoomPlayingViewProps) {
  const [promptText, setPromptText] = useState('');
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  const isQuestioner = snapshot.questioner.id === currentPlayerId;
  const isSubmitted =
    snapshot.guessEntries.find((entry) => entry.player.id === currentPlayerId)
      ?.submitted ?? false;
  const isPromptEmpty = promptText.trim().length === 0;
  const isSubmitDisabled =
    isPromptEmpty ||
    isQuestioner ||
    isSubmitted ||
    isSubmitPending ||
    !isSocketConnected;
  const submitButtonText = getSubmitButtonText(isSubmitted, isSubmitPending);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPromptText('');
    setIsSubmitPending(false);
  }, [snapshot.roundNumber, snapshot.questioner.id, snapshot.imageUrl]);

  useEffect(() => {
    if (isSubmitted || socketErrorMessage || !isSocketConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSubmitPending(false);
    }
  }, [isSubmitted, isSocketConnected, socketErrorMessage]);

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
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handlePromptSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    setIsSubmitPending(true);
    onSubmit(promptText);
  };

  return (
    <S_PlayingSection>
      <S_ImageFrame>
        {snapshot.imageUrl ? (
          <S_Image src={snapshot.imageUrl} alt="프롬프트를 추측할 이미지" />
        ) : (
          <S_ImagePlaceholder aria-hidden="true" />
        )}
        <S_ImageLabel>{snapshot.questioner.nickname}'s IMAGE</S_ImageLabel>
      </S_ImageFrame>

      {isQuestioner ? (
        <S_OwnerWaiting role="status">
          다른 참가자들이 가짜 프롬프트를 작성 중이에요.
        </S_OwnerWaiting>
      ) : (
        <S_FormArea>
          <S_TextGroup>
            <S_Title>진짜 같은 가짜 프롬프트를 적으세요</S_Title>
            <S_Guide>
              남들이 당신의 답을 진짜라고 착각하면 <S_Point>+100점!</S_Point>
            </S_Guide>
          </S_TextGroup>

          <S_InputGroup onSubmit={handlePromptSubmit}>
            <Textarea
              value={promptText}
              tone="white"
              rows={3}
              placeholder="예: 노을 지는 한강에서 컵라면 먹는 고양이"
              shadow
              disabled={isSubmitted || isSubmitPending}
              onChange={handlePromptChange}
              onKeyDown={handlePromptKeyDown}
            />

            {socketErrorMessage && (
              <S_ErrorMessage role="alert">{socketErrorMessage}</S_ErrorMessage>
            )}

            <Button
              type="submit"
              disabled={isSubmitDisabled}
            >
              {submitButtonText}
            </Button>
          </S_InputGroup>
        </S_FormArea>
      )}
    </S_PlayingSection>
  );
}

function getSubmitButtonText(isSubmitted: boolean, isSubmitPending: boolean) {
  if (isSubmitted) {
    return '제출 완료';
  }

  if (isSubmitPending) {
    return '제출 중...';
  }

  return '제출하기';
}

const S_PlayingSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 2.4rem;
`;

const S_ImageFrame = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.IMAGE};
  background: ${({ theme }) => theme.COLOR.PINK50};
  box-shadow: ${({ theme }) => theme.SHADOW.SURFACE};
`;

const S_Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const S_ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background:
    repeating-linear-gradient(
      45deg,
      rgb(255 255 255 / 12%) 0 1.2rem,
      rgb(255 255 255 / 0%) 1.2rem 2.4rem
    ),
    linear-gradient(135deg, #ffb263 0%, #ff5c9b 45%, #6366ff 100%);
`;

const S_ImageLabel = styled.span`
  position: absolute;
  top: 1.3rem;
  left: 1.3rem;
  padding: 0.6rem 1.2rem;
  border-radius: ${({ theme }) => theme.RADIUS.SM};
  background: rgb(104 64 31 / 58%);
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
`;

const S_FormArea = styled.div`
  display: flex;
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

const S_Point = styled.strong`
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
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

const S_OwnerWaiting = styled.p`
  width: 100%;
  padding: 2.4rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.WHITE};
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-align: center;
  box-shadow: ${({ theme }) => theme.SHADOW.SURFACE};
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;
