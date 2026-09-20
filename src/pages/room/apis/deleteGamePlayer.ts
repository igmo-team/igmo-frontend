import client from '../../../common/api/client';

type DeleteGamePlayerRequest = {
  code: string;
  playerId: string;
  secret: string;
};

type DeleteGamePlayerResponse = void;

export default function deleteGamePlayer({
  code,
  playerId,
  secret,
}: DeleteGamePlayerRequest) {
  return client.delete<DeleteGamePlayerResponse, undefined>({
    url: `/games/${code}/players/${playerId}`,
    headers: {
      'X-Player-Secret': secret,
    },
  });
}
