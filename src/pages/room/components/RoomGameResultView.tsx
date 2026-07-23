import styled from '@emotion/styled';

import { Button } from '../../../common/components';
import { ROOM_AVATAR_COLORS } from '../constants/avatarColors';

import { CrownIcon } from './CrownIcon';

import type {
  FinalRankingEntry,
  GameResultSnapshot,
  RoomPlayer,
} from '../../../domain/room/types';

type RoomGameResultViewProps = {
  snapshot: GameResultSnapshot;
  onRestart: () => void;
  onHomeButtonClick: () => void;
};

type FinalRankingDisplayItem = {
  entry: FinalRankingEntry;
  colorIndex: number;
};

export function RoomGameResultView({
  snapshot,
  onRestart,
  onHomeButtonClick,
}: RoomGameResultViewProps) {
  const sortedRanking = sortFinalRanking(snapshot.finalRanking);
  const rankingItems = sortedRanking.map((entry, index) => ({
    entry,
    colorIndex: index,
  }));
  const winners = rankingItems.filter(({ entry }) => entry.rank === 1);
  const isTiedWinner = winners.length > 1;
  const displayRanking = isTiedWinner
    ? rankingItems
    : rankingItems.filter(({ entry }) => entry.rank !== 1);

  return (
    <S_ResultCard>
      <S_Hero isTiedWinner={isTiedWinner}>
        {isTiedWinner ? (
          <TiedWinnerHero winners={winners.map(({ entry }) => entry)} />
        ) : (
          <SingleWinnerHero winner={winners[0]} />
        )}
      </S_Hero>

      <S_RankingPanel>
        {isTiedWinner && <S_RankingTitle>전체 순위</S_RankingTitle>}

        {displayRanking.length > 0 ? (
          <S_RankingList aria-label="최종 순위">
            {displayRanking.map(({ entry, colorIndex }) => (
              <S_RankingItem
                key={entry.player.id}
                isCardRow={isTiedWinner}
                isWinner={entry.rank === 1}
              >
                <S_RankText isWinner={entry.rank === 1}>
                  {entry.rank}
                </S_RankText>

                <PlayerAvatar
                  player={entry.player}
                  colorIndex={colorIndex}
                />

                <S_Nickname>{entry.player.nickname}</S_Nickname>

                {entry.rank === 1 && (
                  <S_RowCrown aria-label="우승자" width={22} height={22} />
                )}

                <S_TotalScore>{entry.totalScore}</S_TotalScore>
              </S_RankingItem>
            ))}
          </S_RankingList>
        ) : (
          <S_EmptyRanking>다른 참가자 순위가 없어요.</S_EmptyRanking>
        )}

        <S_ActionGroup>
          <Button onClick={onRestart}>한판 더 하기</Button>
          <Button variant="secondary" onClick={onHomeButtonClick}>
            처음 화면으로
          </Button>
        </S_ActionGroup>
      </S_RankingPanel>
    </S_ResultCard>
  );
}

function SingleWinnerHero({ winner }: { winner?: FinalRankingDisplayItem }) {
  if (!winner) {
    return (
      <>
        <S_HeroEyebrow>GAME OVER</S_HeroEyebrow>
        <S_WinnerName>결과 없음</S_WinnerName>
      </>
    );
  }

  return (
    <>
      <S_HeroEyebrow>GAME OVER · WINNER</S_HeroEyebrow>
      <S_WinnerAvatarWrap>
        <S_WinnerCrown aria-hidden width={40} height={40} />
        <S_WinnerAvatar
          player={winner.entry.player}
          colorIndex={winner.colorIndex}
        />
      </S_WinnerAvatarWrap>
      <S_WinnerName>{winner.entry.player.nickname}</S_WinnerName>
      <S_WinnerScoreBadge>최종 {winner.entry.totalScore}점</S_WinnerScoreBadge>
    </>
  );
}

function TiedWinnerHero({ winners }: { winners: FinalRankingEntry[] }) {
  const topScore = winners[0]?.totalScore ?? 0;

  return (
    <>
      <S_HeroEyebrow>GAME OVER · 공동 우승</S_HeroEyebrow>
      <S_CrownEmblem>
        <S_EmblemCrown aria-hidden width={42} height={42} />
      </S_CrownEmblem>
      <S_TiedWinnerName>{getWinnerNameText(winners)}</S_TiedWinnerName>
      <S_TiedWinnerScore>최종 {topScore}점</S_TiedWinnerScore>
    </>
  );
}

function PlayerAvatar({
  player,
  colorIndex,
}: {
  player: RoomPlayer;
  colorIndex: number;
}) {
  const avatarColor =
    ROOM_AVATAR_COLORS[colorIndex % ROOM_AVATAR_COLORS.length];

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

function S_WinnerAvatar({
  player,
  colorIndex,
}: {
  player: RoomPlayer;
  colorIndex: number;
}) {
  const avatarColor =
    ROOM_AVATAR_COLORS[colorIndex % ROOM_AVATAR_COLORS.length];

  return (
    <S_HeroAvatar
      aria-label={player.nickname}
      backgroundColor={avatarColor.background}
      textColor={avatarColor.color}
    >
      {getInitial(player.nickname)}
    </S_HeroAvatar>
  );
}

function sortFinalRanking(entries: FinalRankingEntry[]) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.rank - b.entry.rank || a.index - b.index)
    .map(({ entry }) => entry);
}

function getInitial(nickname: string) {
  return nickname.trim().charAt(0) || '?';
}

function getWinnerNameText(winners: FinalRankingEntry[]) {
  const names = winners.map((winner) => winner.player.nickname);

  if (names.length <= 2) {
    return names.join(' · ');
  }

  return `${names.slice(0, 2).join(' · ')} 외 ${names.length - 2}명`;
}

const S_ResultCard = styled.article`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  overflow: hidden;

  @media (min-width: 36.0625rem) {
    border: 0.25rem solid #1b1130;
    border-radius: 1.8rem;
  }
`;

const S_Hero = styled('section', {
  shouldForwardProp: (prop) => prop !== 'isTiedWinner',
})<{ isTiedWinner: boolean }>`
  display: flex;
  width: 100%;
  min-height: ${({ isTiedWinner }) => (isTiedWinner ? '20.4rem' : '26rem')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ isTiedWinner }) => (isTiedWinner ? '0.9rem' : '1rem')};
  padding: 0;
  background: ${({ theme }) => theme.COLOR.PRIMARY500};
  color: ${({ theme }) => theme.COLOR.WHITE};
  text-align: center;

  @media (max-width: 36rem) {
    min-height: ${({ isTiedWinner }) => (isTiedWinner ? '20.4rem' : '23rem')};
  }
`;

const S_HeroEyebrow = styled.p`
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
`;

const S_WinnerAvatarWrap = styled.div`
  position: relative;
  margin-top: 0.6rem;
`;

const S_HeroAvatar = styled('span', {
  shouldForwardProp: (prop) =>
    prop !== 'backgroundColor' && prop !== 'textColor',
})<{
  backgroundColor: string;
  textColor: string;
}>`
  display: grid;
  width: 9.4rem;
  height: 9.4rem;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: 50%;
  background: ${({ backgroundColor }) => backgroundColor};
  box-shadow: 0 0.7rem 0 ${({ theme }) => theme.COLOR.TEXT};
  color: ${({ textColor }) => textColor};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_WinnerCrown = styled(CrownIcon)`
  position: absolute;
  top: -2.8rem;
  left: 50%;
  color: #ffc83d;
  filter: drop-shadow(0 0.2rem 0 ${({ theme }) => theme.COLOR.TEXT});
  transform: translateX(-50%) rotate(4deg);
`;

const S_WinnerName = styled.h2`
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_WinnerScoreBadge = styled.strong`
  display: inline-grid;
  min-height: 3.6rem;
  place-items: center;
  padding: 0.4rem 1.8rem;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: ${({ theme }) => theme.RADIUS.PILL};
  background: ${({ theme }) => theme.COLOR.PINK50};
  color: ${({ theme }) => theme.COLOR.PRIMARY600};
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;

const S_CrownEmblem = styled.div`
  display: grid;
  width: 8rem;
  height: 8rem;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: 50%;
  background: ${({ theme }) => theme.COLOR.PINK50};
  box-shadow: 0 0.7rem 0 ${({ theme }) => theme.COLOR.TEXT};

  @media (max-width: 36rem) {
    width: 7.6rem;
    height: 7.6rem;
  }
`;

const S_EmblemCrown = styled(CrownIcon)`
  color: #ffc83d;
  filter: drop-shadow(0 0.2rem 0 ${({ theme }) => theme.COLOR.TEXT});
`;

const S_TiedWinnerName = styled.h2`
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE1}
`;

const S_TiedWinnerScore = styled.strong`
  color: ${({ theme }) => theme.COLOR.WHITE};
  ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
`;

const S_RankingPanel = styled.section`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.8rem;
  padding: 1.8rem;
`;

const S_RankingTitle = styled.h3`
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}
`;

const S_RankingList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const S_RankingItem = styled('li', {
  shouldForwardProp: (prop) => prop !== 'isCardRow' && prop !== 'isWinner',
})<{ isCardRow: boolean; isWinner: boolean }>`
  display: grid;
  min-height: ${({ isCardRow, isWinner }) => {
    if (!isCardRow) {
      return '5.6rem';
    }

    return isWinner ? '8.4rem' : '6.8rem';
  }};
  grid-template-columns: 3.2rem auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1.2rem;
  padding: ${({ isCardRow, isWinner }) => {
    if (!isCardRow) {
      return '0';
    }

    return isWinner ? '1.2rem 2rem' : '1rem 1.4rem';
  }};
  border: ${({ theme, isWinner }) =>
    isWinner ? theme.BORDER.DEFAULT : '0.25rem solid transparent'};
  border-color: ${({ theme, isWinner }) =>
    isWinner ? theme.COLOR.PRIMARY500 : 'transparent'};
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  background: ${({ theme, isCardRow, isWinner }) => {
    if (!isCardRow) {
      return 'transparent';
    }

    return isWinner ? theme.COLOR.PINK50 : theme.COLOR.WHITE;
  }};
  box-shadow: ${({ theme, isWinner }) =>
    isWinner ? `0 0.6rem 0 ${theme.COLOR.PRIMARY500}` : 'none'};

  @media (max-width: 36rem) {
    min-height: ${({ isCardRow, isWinner }) => {
      if (!isCardRow) {
        return '5.2rem';
      }

      return isWinner ? '7.6rem' : '6.2rem';
    }};
    grid-template-columns: 2.6rem auto minmax(0, 1fr) auto auto;
    gap: 0.8rem;
    padding: ${({ isCardRow, isWinner }) => {
      if (!isCardRow) {
        return '0';
      }

      return isWinner ? '1rem 1.4rem' : '0.9rem 1rem';
    }};
  }
`;

const S_RankText = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isWinner',
})<{ isWinner: boolean }>`
  color: ${({ theme, isWinner }) =>
    isWinner ? theme.COLOR.PRIMARY600 : theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B1_B}
`;

const S_Avatar = styled('span', {
  shouldForwardProp: (prop) =>
    prop !== 'backgroundColor' && prop !== 'textColor',
})<{
  backgroundColor: string;
  textColor: string;
}>`
  display: grid;
  width: 4.8rem;
  height: 4.8rem;
  flex: none;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: 50%;
  background: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  ${({ theme }) => theme.TYPOGRAPHY.B3_B}

  @media (max-width: 36rem) {
    width: 4.2rem;
    height: 4.2rem;
  }
`;

const S_Nickname = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.COLOR.TEXT};
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}
`;

const S_RowCrown = styled(CrownIcon)`
  color: #ffc83d;
  filter: drop-shadow(0 0.1rem 0 ${({ theme }) => theme.COLOR.TEXT});
`;

const S_TotalScore = styled.strong`
  min-width: 5.6rem;
  color: ${({ theme }) => theme.COLOR.TEXT};
  text-align: right;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE3}

  @media (max-width: 36rem) {
    min-width: 4.2rem;
    ${({ theme }) => theme.TYPOGRAPHY.B1_B}
  }
`;

const S_EmptyRanking = styled.p`
  padding: 1.6rem;
  border: ${({ theme }) => theme.BORDER.THIN};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  background: ${({ theme }) => theme.COLOR.WHITE};
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
  text-align: center;
  ${({ theme }) => theme.TYPOGRAPHY.B4_R}
`;

const S_ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  margin-top: auto;
`;
