import type { OwnVoteOptionNotice } from '../../../domain/room/types';
import type { useRoomSocket } from '../hooks/useRoomSocket';

type RoomSocket = ReturnType<typeof useRoomSocket>;

export type VotePermissionState = {
  ownVoteOptionNotice?: OwnVoteOptionNotice;
  isOwnVoteOptionNoticePending: boolean;
};

export function getVotePermissionState(
  roomSocket: RoomSocket,
): VotePermissionState {
  const { currentSnapshot, ownVoteOptionNoticeByRound } = roomSocket;

  if (currentSnapshot?.type !== 'VOTE_SNAPSHOT') {
    return {
      ownVoteOptionNotice: undefined,
      isOwnVoteOptionNoticePending: false,
    };
  }

  const ownVoteOptionNotice =
    ownVoteOptionNoticeByRound[currentSnapshot.roundNumber];

  return {
    ownVoteOptionNotice,
    isOwnVoteOptionNoticePending: ownVoteOptionNotice === undefined,
  };
}
