import client from '../../../common/api/client';

import type { RoomSnapshot } from '../../../domain/room/types';

type PostGamesRequest = {
  nickname: string;
};

type PostGamesResponse = {
  roomCode: string;
  playerId: string;
  snapshot: RoomSnapshot;
};

export default function postGames(data: PostGamesRequest) {
  return client.post<PostGamesResponse, PostGamesRequest>({
    url: '/games',
    data,
  });
}
