export type RoomPlayer = {
  id: string;
  nickname: string;
  score: number;
  ready: boolean;
};

export type RoomPhase =
  | 'LOBBY'
  | 'PROMPTING'
  | 'GENERATING'
  | 'SUBMITTING'
  | 'VOTING'
  | 'RESULTS'
  | 'ENDED';

export type RoomMessage<TPayload> = {
  type: 'LOBBY_SNAPSHOT';
  payload: TPayload;
};

export type RoomSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  hostId: string;
  players: RoomPlayer[];
};
