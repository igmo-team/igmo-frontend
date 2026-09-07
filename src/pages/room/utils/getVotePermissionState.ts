import type { useRoomSocket } from '../hooks/useRoomSocket';
import type { OwnVoteOptionNotice } from '../../../domain/room/types';

type RoomSocket = ReturnType<typeof useRoomSocket>;

export type VotePermissionState = {
  ownVoteOptionNotice?: OwnVoteOptionNotice;
  isOwnVoteOptionNoticePending: boolean;
};

export function getVotePermissionState(
  roomSocket: RoomSocket,
): VotePermissionState {
  const { phase, voteSnapshot, ownVoteOptionNoticeByRound } = roomSocket;

  if (phase !== 'VOTING' || voteSnapshot === null) {
    return {
      ownVoteOptionNotice: undefined,
      isOwnVoteOptionNoticePending: false,
    };
  }

  const ownVoteOptionNotice =
    ownVoteOptionNoticeByRound[voteSnapshot.roundNumber];

  return {
    ownVoteOptionNotice,
    isOwnVoteOptionNoticePending: ownVoteOptionNotice === undefined,
  };
}
