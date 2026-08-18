import styled from '@emotion/styled';

import { ROOM_AVATAR_COLORS } from '../constants/avatarColors';

import type {
  RoomPlayer,
  RoundResult,
  RoundResultSnapshot,
} from '../../../domain/room/types';
import type { Theme } from '@emotion/react';

type RoomRoundResultViewProps = {
  snapshot: RoundResultSnapshot;
  currentPlayerId?: string;
};

type ResultCardVariant = 'default' | 'answer' | 'current';

const RESULT_CARD_BORDER_COLOR = (
  theme: Theme,
): Record<ResultCardVariant, string> => ({
  answer: theme.COLOR.SUCCESS,
  current: theme.COLOR.PRIMARY500,
  default: theme.COLOR.LINE,
});

const RESULT_CARD_BOX_SHADOW = (
  theme: Theme,
): Record<ResultCardVariant, string> => ({
  answer: `0 0.6rem 0 ${theme.COLOR.SUCCESS}`,
  current: `0 0.6rem 0 ${theme.COLOR.PRIMARY500}`,
  default: 'none',
});

export function RoomRoundResultView({
  snapshot,
  currentPlayerId,
}: RoomRoundResultViewProps) {
  const totalVoteCount = snapshot.results.reduce(
    (sum, result) => sum + result.voters.length,
    0,
  );
  const roundScores = [...snapshot.results].sort(
    (a, b) => b.roundScore - a.roundScore,
  );

  return (
    <S_ResultSection>
      <S_Title>결과 공개</S_Title>

      <S_ResultList aria-label="라운드 선택지 결과">
        {snapshot.results.map((result, index) => {
          const voteCount = result.voters.length;
          const voteRatio = totalVoteCount > 0 ? voteCount / totalVoteCount : 0;
          const isCurrentPlayer = result.player.id === currentPlayerId;
          const resultCardVariant = getResultCardVariant({
            isAnswer: result.isAnswer,
            isCurrentPlayer,
          });

          return (
            <S_ResultItem key={`${result.player.id}-${result.guessText}`}>
              <S_ResultCard
                isAnswer={result.isAnswer}
                isCurrentPlayer={isCurrentPlayer}
                variant={resultCardVariant}
                voteRatio={voteRatio}
              >
                <S_ResultMain>
                  <PlayerAvatar player={result.player} index={index} />

                  <S_ResultTextGroup>
                    <S_GuessText>{result.guessText}</S_GuessText>
                    {result.voters.length > 0 && (
                      <S_VoterText>{getVoterText(result.voters)}</S_VoterText>
                    )}
                  </S_ResultTextGroup>
                </S_ResultMain>

                <S_ResultMeta>
                  {result.isAnswer && <S_AnswerBadge>정답</S_AnswerBadge>}
                  <S_VoteCount isAnswer={result.isAnswer}>
                    {voteCount}표
                  </S_VoteCount>
                </S_ResultMeta>
              </S_ResultCard>
            </S_ResultItem>
          );
        })}
      </S_ResultList>

      <S_ScoreBoard>
        <S_ScoreTitle>이번 라운드 점수</S_ScoreTitle>

        <S_ScoreList aria-label="이번 라운드 점수">
          {roundScores.map((roundScore, index) => {
            const isCurrentPlayer = roundScore.player.id === currentPlayerId;

            return (
              <S_ScoreItem
                key={roundScore.player.id}
                isCurrentPlayer={isCurrentPlayer}
              >
                <S_RankBadge rank={index + 1}>
                  {getRankLabel(index)}
                </S_RankBadge>

                <PlayerAvatar player={roundScore.player} index={index} />

                <S_PlayerName>{roundScore.player.nickname}</S_PlayerName>

                <S_DetailList>
                  {roundScore.scoreDetails.map((detail) => (
                    <S_DetailBadge key={`${detail.reason}-${detail.label}`}>
                      {detail.label} +{detail.score}
                    </S_DetailBadge>
                  ))}
                </S_DetailList>

                <S_RoundScore score={roundScore.roundScore}>
                  {formatRoundScore(roundScore.roundScore)}
                </S_RoundScore>
              </S_ScoreItem>
            );
          })}
        </S_ScoreList>
      </S_ScoreBoard>
    </S_ResultSection>
  );
}

function PlayerAvatar({
  player,
  index,
}: {
  player: RoomPlayer;
  index: number;
}) {
  const avatarColor = ROOM_AVATAR_COLORS[index % ROOM_AVATAR_COLORS.length];

  return (
    <S_Avatar
      aria-label={player.nickname}
      backgroundColor={avatarColor.background}
      textColor={avatarColor.color}
    >
      {getInitial(player.nickname)}
    </S_Avatar>
  );
}

function getInitial(nickname: string) {
  return nickname.trim().charAt(0) || '?';
}

function getVoterText(voters: RoundResult['voters']) {
  return `${voters.map((voter) => voter.nickname).join(', ')} 선택`;
}

function getRankLabel(index: number) {
  if (index === 0) {
    return '🥇';
  }

  if (index === 1) {
    return '🥈';
  }

  if (index === 2) {
    return '🥉';
  }

  return String(index + 1);
}

function formatRoundScore(score: RoundResult['roundScore']) {
  if (score > 0) {
    return `+${score}`;
  }

  return '0';
}

function getResultCardVariant({
  isAnswer,
  isCurrentPlayer,
}: {
  isAnswer: boolean;
  isCurrentPlayer: boolean;
}): ResultCardVariant {
  if (isCurrentPlayer) {
    return 'current';
  }

  if (isAnswer) {
    return 'answer';
  }

  return 'default';
}

const S_ResultSection = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.8rem;
`;

const S_Title = styled.h2`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_ResultList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const S_ResultItem = styled.li`
  display: flex;
`;

const S_ResultCard = styled('article', {
  shouldForwardProp: (prop) =>
    prop !== 'isAnswer' &&
    prop !== 'isCurrentPlayer' &&
    prop !== 'variant' &&
    prop !== 'voteRatio',
})<{
  isAnswer: boolean;
  isCurrentPlayer: boolean;
  variant: ResultCardVariant;
  voteRatio: number;
}>`
  display: flex;
  width: 100%;
  min-height: 6.8rem;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.6rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-color: ${({ theme, variant }) =>
    RESULT_CARD_BORDER_COLOR(theme)[variant]};
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  background: ${({ theme, isAnswer, isCurrentPlayer, voteRatio }) => {
    const progress = `${Math.min(Math.max(voteRatio, 0), 1) * 100}%`;
    const progressColor = isAnswer
      ? theme.COLOR.PINK50
      : theme.COLOR.PRIMARY200;
    const baseColor = isCurrentPlayer ? theme.COLOR.PINK50 : theme.COLOR.WHITE;

    return `linear-gradient(90deg, ${progressColor} 0 ${progress}, ${baseColor} ${progress} 100%)`;
  }};
  box-shadow: ${({ theme, variant }) => RESULT_CARD_BOX_SHADOW(theme)[variant]};

  @media (max-width: 36rem) {
    min-height: 6.8rem;
    padding: 1.2rem 1.4rem;
  }
`;

const S_ResultMain = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  align-items: center;
  gap: 1.1rem;
`;

const S_ResultTextGroup = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.2rem;
`;

const S_GuessText = styled.p`
  min-width: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;

const S_VoterText = styled.p`
  min-width: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_ResultMeta = styled.div`
  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;
  gap: 1.2rem;
`;

const S_AnswerBadge = styled.span`
  display: grid;
  min-width: 4.4rem;
  height: 2.6rem;
  place-items: center;
  padding: 0 1rem;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: ${({ theme }) => theme.RADIUS.PILL};
  background: ${({ theme }) => theme.COLOR.SUCCESS};
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_VoteCount = styled('strong', {
  shouldForwardProp: (prop) => prop !== 'isAnswer',
})<{ isAnswer: boolean }>`
  min-width: 3rem;
  color: ${({ theme, isAnswer }) =>
    isAnswer ? theme.COLOR.SUCCESS : theme.COLOR.TEXT_SUBTLE};
  text-align: right;
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;

const S_Avatar = styled('span', {
  shouldForwardProp: (prop) =>
    prop !== 'backgroundColor' && prop !== 'textColor',
})<{
  backgroundColor: string;
  textColor: string;
}>`
  display: grid;
  width: 3.4rem;
  height: 3.4rem;
  flex: none;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: 50%;
  background: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  ${({ theme }) => theme.TYPOGRAPHY.B5_B}
`;

const S_ScoreBoard = styled.section`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1.4rem;
  margin-top: 1.2rem;
  padding: 2.2rem 2rem 2.4rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.IMAGE};
  background: ${({ theme }) => theme.COLOR.WHITE};
  box-shadow: ${({ theme }) => theme.SHADOW.SURFACE};

  @media (max-width: 36rem) {
    padding: 1.8rem 1.2rem 2rem;
  }
`;

const S_ScoreTitle = styled.h3`
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;

const S_ScoreList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const S_ScoreItem = styled('li', {
  shouldForwardProp: (prop) => prop !== 'isCurrentPlayer',
})<{ isCurrentPlayer: boolean }>`
  display: grid;
  min-width: 0;
  grid-template-columns: 2.4rem auto auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.2rem;
  padding: 0.6rem 1rem;
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme, isCurrentPlayer }) =>
    isCurrentPlayer ? theme.COLOR.PINK50 : 'transparent'};

  @media (max-width: 36rem) {
    grid-template-columns: 2rem auto auto minmax(0, 1fr) auto;
    gap: 0.8rem;
  }
`;

const S_RankBadge = styled('span', {
  shouldForwardProp: (prop) => prop !== 'rank',
})<{ rank: number }>`
  color: ${({ theme, rank }) =>
    rank <= 3 ? theme.COLOR.TEXT : theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_B}
`;

const S_PlayerName = styled.span`
  min-width: 3.6rem;
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;

const S_DetailList = styled.div`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const S_DetailBadge = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: ${({ theme }) => theme.RADIUS.PILL};
  background: ${({ theme }) => theme.COLOR.PRIMARY200};
  color: ${({ theme }) => theme.COLOR.PRIMARY600};
  white-space: nowrap;
  ${({ theme }) => theme.TYPOGRAPHY.LABEL2}
`;

const S_RoundScore = styled('strong', {
  shouldForwardProp: (prop) => prop !== 'score',
})<{ score: number }>`
  min-width: 4.4rem;
  color: ${({ theme, score }) =>
    score > 0 ? theme.COLOR.PRIMARY500 : theme.COLOR.TEXT_SUBTLE};
  text-align: right;
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}

  @media (max-width: 36rem) {
    min-width: 3.6rem;
  }
`;
