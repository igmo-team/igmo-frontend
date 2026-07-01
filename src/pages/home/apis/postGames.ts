import client from '../../../common/api/client';

type PostGamesRequest = {
  nickname: string;
};

type PostGamesResponse = {
  roomCode: string;
  playerId: string;
};

export function postGames(data: PostGamesRequest) {
  return client.post<PostGamesResponse, PostGamesRequest>({
    url: '/games',
    data,
  });
}
