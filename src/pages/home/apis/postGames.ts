import client from '../../../common/api/client';

import type { LobbySnapshot } from '../../../domain/lobby/types';

type PostGamesRequest = {
  nickname: string;
};

type PostGamesResponse = {
  roomCode: string;
  playerId: string;
  snapshot: LobbySnapshot;
};

export function postGames(data: PostGamesRequest) {
  return client.post<PostGamesResponse, PostGamesRequest>({
    url: '/games',
    data,
  });
}
