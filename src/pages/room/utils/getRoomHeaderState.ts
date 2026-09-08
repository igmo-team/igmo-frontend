import type { RoomPlayer, RoomSnapshot } from '../../../domain/room/types';
import type { RoomGameHeaderStatus } from '../components/RoomGameHeader';
import type { useRoomSocket } from '../hooks/useRoomSocket';

type RoomSocket = ReturnType<typeof useRoomSocket>;

type GetRoomHeaderStatusParams = {
  roomSocket: RoomSocket;
  roomSnapshot: RoomSnapshot;
  currentPlayerId?: string;
  isCountdownPlaying: boolean;
};

export function getRoomHeaderRound(roomSocket: RoomSocket) {
  const { phase, roundSnapshot, voteSnapshot, roundResultSnapshot } =
    roomSocket;

  switch (phase) {
    case 'PLAYING':
      return roundSnapshot?.roundNumber;

    case 'VOTING':
      return voteSnapshot?.roundNumber;

    case 'RESULTS':
      return roundResultSnapshot?.roundNumber;

    case 'LOBBY':
    case 'GENERATING':
    case 'SUBMITTING':
    case 'ENDED':
      return undefined;
  }
}

export function getRoomHeaderStatus({
  roomSocket,
  roomSnapshot,
  currentPlayerId,
  isCountdownPlaying,
}: GetRoomHeaderStatusParams): RoomGameHeaderStatus {
  const { phase, voteSnapshot } = roomSocket;

  if (phase === 'VOTING' && voteSnapshot) {
    return {
      type: 'voteProgress',
      completedCount: voteSnapshot.completedVoteCount,
      totalCount: voteSnapshot.totalVoteCount,
    };
  }

  return {
    type: 'avatars',
    players: getRoomHeaderPlayers({
      roomSocket,
      roomSnapshot,
    }),
    currentPlayerId,
    completedPlayerIds: getRoomHeaderCompletedPlayerIds({
      roomSocket,
      isCountdownPlaying,
    }),
  };
}

function getRoomHeaderPlayers({
  roomSocket,
  roomSnapshot,
}: {
  roomSocket: RoomSocket;
  roomSnapshot: RoomSnapshot;
}): RoomPlayer[] {
  const { phase, roundSnapshot, roundResultSnapshot, gameResultSnapshot } =
    roomSocket;

  if (phase === 'PLAYING' && roundSnapshot) {
    return getRoundPlayers(roundSnapshot);
  }

  if (phase === 'RESULTS' && roundResultSnapshot) {
    return roundResultSnapshot.players;
  }

  if (phase === 'ENDED' && gameResultSnapshot) {
    return gameResultSnapshot.finalRanking.map((entry) => entry.player);
  }

  return roomSnapshot.players;
}

function getRoomHeaderCompletedPlayerIds({
  roomSocket,
  isCountdownPlaying,
}: {
  roomSocket: RoomSocket;
  isCountdownPlaying: boolean;
}) {
  const { phase, roundSnapshot } = roomSocket;

  if (phase === 'GENERATING' || isCountdownPlaying) {
    return getPromptReadyPlayerIds(roomSocket);
  }

  if (phase === 'PLAYING' && roundSnapshot) {
    return roundSnapshot.guessEntries
      .filter((entry) => entry.submitted)
      .map((entry) => entry.player.id);
  }

  return [];
}

function getPromptReadyPlayerIds({
  promptSubmissionSnapshot,
}: Pick<RoomSocket, 'promptSubmissionSnapshot'>) {
  return (
    promptSubmissionSnapshot?.promptEntries
      .filter((entry) => entry.status === 'READY')
      .map((entry) => entry.player.id) ?? []
  );
}

function getRoundPlayers({
  questioner,
  guessEntries,
}: NonNullable<RoomSocket['roundSnapshot']>): RoomPlayer[] {
  return [questioner, ...guessEntries.map((entry) => entry.player)];
}
