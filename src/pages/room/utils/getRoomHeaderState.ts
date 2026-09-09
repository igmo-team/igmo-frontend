import type { RoomPlayer } from '../../../domain/room/types';
import type { RoomGameHeaderStatus } from '../components/RoomGameHeader';
import type { useRoomSocket } from '../hooks/useRoomSocket';

type RoomSocket = ReturnType<typeof useRoomSocket>;

type GetRoomHeaderStatusParams = {
  roomSocket: RoomSocket;
  currentPlayerId?: string;
  isCountdownPlaying: boolean;
};

export function getRoomHeaderRound(roomSocket: RoomSocket) {
  const { currentSnapshot } = roomSocket;

  if (!currentSnapshot) {
    return undefined;
  }

  switch (currentSnapshot.type) {
    case 'ROUND_SNAPSHOT':
    case 'VOTE_SNAPSHOT':
    case 'ROUND_RESULT_SNAPSHOT':
      return currentSnapshot.roundNumber;

    case 'LOBBY_SNAPSHOT':
    case 'PROMPT_SUBMISSION_SNAPSHOT':
    case 'GAME_RESULT_SNAPSHOT':
      return undefined;
  }
}

export function getRoomHeaderStatus({
  roomSocket,
  currentPlayerId,
  isCountdownPlaying,
}: GetRoomHeaderStatusParams): RoomGameHeaderStatus {
  const { currentSnapshot } = roomSocket;

  if (currentSnapshot?.type === 'VOTE_SNAPSHOT') {
    return {
      type: 'voteProgress',
      completedCount: currentSnapshot.completedVoteCount,
      totalCount: currentSnapshot.totalVoteCount,
    };
  }

  return {
    type: 'avatars',
    players: getRoomHeaderPlayers(roomSocket),
    currentPlayerId,
    completedPlayerIds: getRoomHeaderCompletedPlayerIds({
      roomSocket,
      isCountdownPlaying,
    }),
  };
}

function getRoomHeaderPlayers(roomSocket: RoomSocket): RoomPlayer[] {
  const { currentSnapshot } = roomSocket;

  if (!currentSnapshot) {
    return [];
  }

  switch (currentSnapshot.type) {
    case 'ROUND_SNAPSHOT':
      return [
        currentSnapshot.questioner,
        ...currentSnapshot.guessEntries.map((entry) => entry.player),
      ];

    case 'ROUND_RESULT_SNAPSHOT':
      return currentSnapshot.players;

    case 'GAME_RESULT_SNAPSHOT':
      return currentSnapshot.finalRanking.map((entry) => entry.player);

    case 'PROMPT_SUBMISSION_SNAPSHOT':
      return currentSnapshot.promptEntries.map((entry) => entry.player);

    case 'LOBBY_SNAPSHOT':
      return currentSnapshot.players;

    case 'VOTE_SNAPSHOT':
      return [];
  }
}

function getRoomHeaderCompletedPlayerIds({
  roomSocket,
  isCountdownPlaying,
}: {
  roomSocket: RoomSocket;
  isCountdownPlaying: boolean;
}) {
  const { currentSnapshot } = roomSocket;

  if (currentSnapshot?.type === 'PROMPT_SUBMISSION_SNAPSHOT') {
    return currentSnapshot.promptEntries
      .filter((entry) => entry.status === 'READY')
      .map((entry) => entry.player.id);
  }

  if (currentSnapshot?.type === 'ROUND_SNAPSHOT' && !isCountdownPlaying) {
    return currentSnapshot.guessEntries
      .filter((entry) => entry.submitted)
      .map((entry) => entry.player.id);
  }

  return [];
}
