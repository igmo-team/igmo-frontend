import { useEffect, useState } from 'react';

import styled from '@emotion/styled';

import { Button } from '../../../common/components';

import type {
  OwnVoteOptionNotice,
  VoteSnapshot,
} from '../../../domain/room/types';

type RoomVotingViewProps = {
  snapshot: VoteSnapshot;
  currentPlayerId?: string;
  ownVoteOptionNotice?: OwnVoteOptionNotice;
  isSocketConnected: boolean;
  socketErrorMessage?: string;
  onSubmit: (optionId: string) => void;
};

export function RoomVotingView({
  snapshot,
  currentPlayerId,
  ownVoteOptionNotice,
  isSocketConnected,
  socketErrorMessage = '',
  onSubmit,
}: RoomVotingViewProps) {
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [isVotePending, setIsVotePending] = useState(false);
  const isVoted =
    snapshot.voteEntries.find((entry) => entry.player.id === currentPlayerId)
      ?.voted ?? false;
  const isOwnImage = ownVoteOptionNotice?.ownImage === true;
  const ownOptionId =
    ownVoteOptionNotice?.ownImage === false
      ? ownVoteOptionNotice.optionId
      : null;
  const isConfirmDisabled =
    !selectedOptionId ||
    isOwnImage ||
    isVoted ||
    isVotePending ||
    !isSocketConnected;
  const confirmButtonText = getConfirmButtonText(isVoted, isVotePending);

  useEffect(() => {
    if (isOwnImage || isVoted || socketErrorMessage || !isSocketConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVotePending(false);
    }
  }, [isOwnImage, isSocketConnected, isVoted, socketErrorMessage]);

  useEffect(() => {
    if (isOwnImage || (ownOptionId && selectedOptionId === ownOptionId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOptionId('');
    }
  }, [isOwnImage, ownOptionId, selectedOptionId]);

  const handleOptionClick = (optionId: string) => {
    if (isOwnImage || isVoted || isVotePending || optionId === ownOptionId) {
      return;
    }

    setSelectedOptionId(optionId);
  };

  const handleConfirmClick = () => {
    if (isConfirmDisabled) {
      return;
    }

    setIsVotePending(true);
    onSubmit(selectedOptionId);
  };

  return (
    <S_VotingSection>
      <S_TextGroup>
        <S_Title>진짜 프롬프트는? 🤔</S_Title>
        <S_Guide>실제로 입력한 프롬프트 하나를 고르세요.</S_Guide>
      </S_TextGroup>

      <S_OptionList aria-label="투표 선택지">
        {snapshot.voteOptions.map((option, index) => {
          const isOwnOption = option.optionId === ownOptionId;
          const isSelected = option.optionId === selectedOptionId;

          return (
            <S_OptionItem key={option.optionId}>
              {isOwnOption ? (
                <S_OwnOptionBox aria-disabled="true">
                  <S_OptionLabel>{getOptionLabel(index)}</S_OptionLabel>
                  <S_OptionText>{option.text}</S_OptionText>
                  <S_OwnOptionBadge>내 답</S_OwnOptionBadge>
                </S_OwnOptionBox>
              ) : (
                <S_OptionButton
                  type="button"
                  disabled={isOwnImage || isVoted || isVotePending}
                  selected={isSelected}
                  onClick={() => handleOptionClick(option.optionId)}
                >
                  <S_OptionLabel>{getOptionLabel(index)}</S_OptionLabel>
                  <S_OptionText>{option.text}</S_OptionText>
                </S_OptionButton>
              )}
            </S_OptionItem>
          );
        })}
      </S_OptionList>

      <S_ActionArea>
        {isOwnImage ? (
          <S_OwnerWaiting role="status">
            내 그림 라운드라 투표할 수 없어요.
          </S_OwnerWaiting>
        ) : (
          <>
            <S_Notice>한번 투표하면 선택을 바꿀 수 없어요.</S_Notice>
            {socketErrorMessage && (
              <S_ErrorMessage role="alert">{socketErrorMessage}</S_ErrorMessage>
            )}
            <Button
              type="button"
              disabled={isConfirmDisabled}
              onClick={handleConfirmClick}
            >
              {confirmButtonText}
            </Button>
          </>
        )}
      </S_ActionArea>
    </S_VotingSection>
  );
}

function getConfirmButtonText(isVoted: boolean, isVotePending: boolean) {
  if (isVoted) {
    return '투표 완료';
  }

  if (isVotePending) {
    return '투표 중...';
  }

  return '투표 확정';
}

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

const S_VotingSection = styled.section`
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

const S_OptionList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const S_OptionItem = styled.li`
  display: flex;
`;

const S_OptionButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>`
  display: grid;
  width: 100%;
  min-height: 7.2rem;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1.6rem;
  padding: 1.6rem 2rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-color: ${({ theme, selected }) =>
    selected ? theme.COLOR.PRIMARY500 : theme.COLOR.LINE};
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  background: ${({ theme, selected }) =>
    selected ? theme.COLOR.PRIMARY100 : theme.COLOR.WHITE};
  color: ${({ theme }) => theme.COLOR.TEXT};
  box-shadow: ${({ theme, selected }) =>
    selected ? theme.SHADOW.SURFACE : 'none'};
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:not(:disabled):hover {
    transform: translateY(-0.1rem);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const S_OwnOptionBox = styled.div`
  display: grid;
  width: 100%;
  min-height: 7.2rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.6rem;
  padding: 1.6rem 2rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-color: ${({ theme }) => theme.COLOR.LINE};
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  background: ${({ theme }) => theme.COLOR.WHITE};
  color: ${({ theme }) => theme.COLOR.TEXT};
  cursor: not-allowed;
  opacity: 0.45;
`;

const S_OptionLabel = styled.span`
  display: grid;
  width: 3.2rem;
  height: 3.2rem;
  place-items: center;
  border-radius: ${({ theme }) => theme.RADIUS.SM};
  background: ${({ theme }) => theme.COLOR.PRIMARY100};
  color: ${({ theme }) => theme.COLOR.PRIMARY500};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;

const S_OptionText = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: left;
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;

const S_OwnOptionBadge = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: ${({ theme }) => theme.RADIUS.PILL};
  background: ${({ theme }) => theme.COLOR.PINK50};
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  white-space: nowrap;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const S_Notice = styled.p`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
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
