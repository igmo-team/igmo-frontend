import { useState } from 'react';

import styled from '@emotion/styled';

import { Button } from '../../../common/components';

import type { VoteSnapshot } from '../../../domain/room/types';

type RoomVotingViewProps = {
  snapshot: VoteSnapshot;
};

export function RoomVotingView({ snapshot }: RoomVotingViewProps) {
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [confirmedOptionId, setConfirmedOptionId] = useState('');
  const isConfirmed = confirmedOptionId.length > 0;

  const handleOptionClick = (optionId: string) => {
    if (isConfirmed) {
      return;
    }

    setSelectedOptionId(optionId);
  };

  const handleConfirmClick = () => {
    if (!selectedOptionId || isConfirmed) {
      return;
    }

    setConfirmedOptionId(selectedOptionId);
  };

  return (
    <S_VotingSection>
      <S_TextGroup>
        <S_Title>진짜 프롬프트는? 🤔</S_Title>
        <S_Guide>실제로 입력한 프롬프트 하나를 고르세요.</S_Guide>
      </S_TextGroup>

      <S_OptionList aria-label="투표 선택지">
        {snapshot.voteOptions.map((option, index) => {
          const isSelected = option.optionId === selectedOptionId;

          return (
            <S_OptionItem key={option.optionId}>
              <S_OptionButton
                type="button"
                disabled={isConfirmed}
                selected={isSelected}
                onClick={() => handleOptionClick(option.optionId)}
              >
                <S_OptionLabel>{getOptionLabel(index)}</S_OptionLabel>
                <S_OptionText>{option.text}</S_OptionText>
              </S_OptionButton>
            </S_OptionItem>
          );
        })}
      </S_OptionList>

      <S_ActionArea>
        <S_Notice>한번 투표하면 선택을 바꿀 수 없어요.</S_Notice>
        <Button
          type="button"
          disabled={!selectedOptionId || isConfirmed}
          onClick={handleConfirmClick}
        >
          {isConfirmed ? '투표 완료' : '투표 확정'}
        </Button>
      </S_ActionArea>
    </S_VotingSection>
  );
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
