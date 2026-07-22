import styled from '@emotion/styled';

import { ROOM_AVATAR_COLORS } from '../constants/avatarColors';

import type {
  RoomPlayer,
  RoundPlayerScore,
  RoundResult,
  RoundResultSnapshot,
} from '../../../domain/room/types';

type RoomRoundResultViewProps = {
  snapshot: RoundResultSnapshot;
};

export function RoomRoundResultView({ snapshot }: RoomRoundResultViewProps) {
  const totalVoteCount = snapshot.results.reduce(
    (sum, result) => sum + result.voteCount,
    0,
  );

  return (
    <S_ResultSection>
      <S_Title>결과 공개</S_Title>

      <S_ResultList aria-label="라운드 선택지 결과">
        {snapshot.results.map((result, index) => {
          const voteRatio =
            totalVoteCount > 0 ? result.voteCount / totalVoteCount : 0;

          return (
            <S_ResultItem key={`${result.player.id}-${result.guessText}`}>
              <S_ResultCard
                isAnswer={result.isAnswer}
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
                    {result.voteCount}표
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
          {snapshot.roundScores.map((roundScore, index) => (
            <S_ScoreItem key={roundScore.player.id}>
              <S_RankBadge rank={index + 1}>{getRankLabel(index)}</S_RankBadge>

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
          ))}
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

function formatRoundScore(score: RoundPlayerScore['roundScore']) {
  if (score > 0) {
    return `+${score}`;
  }

  return '0';
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
  shouldForwardProp: (prop) => prop !== 'isAnswer' && prop !== 'voteRatio',
})<{ isAnswer: boolean; voteRatio: number }>`
  display: flex;
  width: 100%;
  min-height: 6.8rem;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.6rem;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-color: ${({ theme, isAnswer }) =>
    isAnswer ? theme.COLOR.SUCCESS : theme.COLOR.LINE};
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  background:
    ${({ theme, isAnswer, voteRatio }) => {
      const progress = `${Math.min(Math.max(voteRatio, 0), 1) * 100}%`;
      const progressColor = isAnswer ? '#E5F8EC' : theme.COLOR.PRIMARY200;

      return `linear-gradient(90deg, ${progressColor} 0 ${progress}, ${theme.COLOR.WHITE} ${progress} 100%)`;
    }};
  box-shadow: ${({ theme, isAnswer }) =>
    isAnswer ? `0 0.6rem 0 ${theme.COLOR.SUCCESS}` : 'none'};

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
  background: ${({ theme }) => theme.COLOR.PINK50};
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

const S_ScoreItem = styled.li`
  display: grid;
  min-width: 0;
  grid-template-columns: 2.4rem auto auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.2rem;

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
