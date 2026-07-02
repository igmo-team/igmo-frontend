export type LobbyPlayer = {
  id: string;
  nickname: string;
  score: number;
};

export type LobbySnapshot = {
  roomCode: string;
  phase: 'LOBBY';
  hostId: string;
  players: LobbyPlayer[];
};
