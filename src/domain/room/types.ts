export type RoomPlayer = {
  id: string;
  nickname: string;
  score: number;
  ready: boolean;
};

export type RoomPhase =
  | 'LOBBY'
  | 'GENERATING'
  | 'PLAYING'
  | 'SUBMITTING'
  | 'VOTING'
  | 'RESULTS'
  | 'ENDED';

export type RoomMessageType =
  | 'LOBBY_SNAPSHOT'
  | 'PROMPT_SUBMISSION_SNAPSHOT'
  | 'ROUND_SNAPSHOT'
  | 'VOTE_SNAPSHOT';

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

export type PromptEntry = {
  player: RoomPlayer;
  submitted: boolean;
};

export type PromptSubmissionSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  promptStartedAt: string;
  promptDeadline: string;
  promptEntries: PromptEntry[];
};

export type RoundGuessEntry = {
  player: RoomPlayer;
  submitted: boolean;
};

export type RoundSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  roundNumber: number;
  totalRoundCount: number;
  questioner: RoomPlayer;
  imageUrl: string;
  guessDeadline: string;
  guessEntries: RoundGuessEntry[];
};

export type VoteOption = {
  optionId: string;
  text: string;
};

export type VoteEntry = {
  player: RoomPlayer;
  voted: boolean;
};

export type VoteSnapshot = {
  roomCode: string;
  phase: RoomPhase;
  roundNumber: number;
  voteOptions: VoteOption[];
  voteDeadline: string;
  voteEntries: VoteEntry[];
};

// 개인 이미지 큐(/queue/image-generation)에서 받는 내 이미지 생성 상태
export type ImageGenerationStatus =
  | 'WAITING'
  | 'GENERATING'
  | 'READY'
  | 'FAILED';

export type ImageGenerationSnapshot = {
  roomCode: string;
  status: ImageGenerationStatus;
  prompt: string;
  imageUrl?: string;
};
