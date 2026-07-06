import client from '../../../common/api/client';

import type { RoomSnapshot } from '../../../domain/room/types';

type PostGamePlayerRequest = {
  code: string;
  nickname: string;
};

type PostGamePlayerBody = {
  nickname: string;
};

type PostGamePlayerResponse = {
  playerId: string;
  secret: string;
  snapshot: RoomSnapshot;
};

export default function postGamePlayer({
  code,
  nickname,
}: PostGamePlayerRequest) {
  return client.post<PostGamePlayerResponse, PostGamePlayerBody>({
    url: `/games/${code}/players`,
    data: {
      nickname,
    },
  });
}
