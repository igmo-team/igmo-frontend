export type RoomPlayer = {
  id: string;
  nickname: string;
  score: number;
};

export type RoomSnapshot = {
  roomCode: string;
  phase: 'LOBBY';
  hostId: string;
  players: RoomPlayer[];
};
