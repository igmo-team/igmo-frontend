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

export type RoomMessageType = 'LOBBY_SNAPSHOT' | 'PROMPT_SUBMISSION_SNAPSHOT';

export type RoomMessage<TPayload> = {
  type: RoomMessageType;
  payload: TPayload;
};

export type RoomSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  hostId: string;
  players: RoomPlayer[];
};

export type PromptSubmissionStatus = 'WAITING' | 'SUBMITTED';

export type PromptEntry = {
  player: RoomPlayer;
  status: PromptSubmissionStatus;
};

export type PromptSubmissionSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  promptEntries: PromptEntry[];
};
