import client from '../../../common/api/client';

import type { LobbySnapshot } from '../../../domain/lobby/types';

type PostGamePlayerRequest = {
  code: string;
  nickname: string;
};

type PostGamePlayerBody = {
  nickname: string;
};

type PostGamePlayerResponse = {
  playerId: string;
  snapshot: LobbySnapshot;
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
