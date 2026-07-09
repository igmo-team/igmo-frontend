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

// TODO(다음 범위): imageStatus는 개인 이미지 큐에서 수신. 그때 복구.
// export type ImageStatus = 'WAITING' | 'GENERATING' | 'READY' | 'FAILED';

export type PromptEntry = {
  player: RoomPlayer;
  submitted: boolean;
  // imageStatus: ImageStatus; // TODO(다음 범위): 개인 이미지 큐 수신 시 복구
};

export type PromptSubmissionSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  promptStartedAt: string;
  promptDeadline: string;
  promptEntries: PromptEntry[];
};
