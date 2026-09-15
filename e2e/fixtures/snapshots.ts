import type {
  GameResultSnapshot,
  ImageGenerationSnapshot,
  PromptSubmissionSnapshot,
  RoomPlayer,
  RoomSnapshot,
  RoundResultSnapshot,
  RoundSnapshot,
  VoteSkippedSnapshot,
  VoteSnapshot,
} from '../../src/domain/room/types';
import type { TopicMessage } from '../broker/fakeStompBroker';

const DEFAULT_ROOM_CODE = 'TEST01';

/** 기본 3플레이어 프리셋. p1=철수(방장 기본), p2=영희, p3=민수. */
export const PLAYER_PRESETS = {
  p1: { id: 'p1', nickname: '철수', score: 0, ready: false },
  p2: { id: 'p2', nickname: '영희', score: 0, ready: false },
  p3: { id: 'p3', nickname: '민수', score: 0, ready: false },
} as const satisfies Record<string, RoomPlayer>;

/** 프리셋 기반 플레이어 생성(부분 override). */
export function player(
  id: keyof typeof PLAYER_PRESETS,
  overrides: Partial<RoomPlayer> = {},
): RoomPlayer {
  return { ...PLAYER_PRESETS[id], ...overrides };
}

/** [철수, 영희, 민수] 3인 로스터(부분 override). */
export function threePlayers(
  overrides: Partial<Record<keyof typeof PLAYER_PRESETS, Partial<RoomPlayer>>> = {},
): RoomPlayer[] {
  return [
    player('p1', overrides.p1),
    player('p2', overrides.p2),
    player('p3', overrides.p3),
  ];
}

function isoFromNow(msFromNow: number): string {
  return new Date(Date.now() + msFromNow).toISOString();
}

// ---------------------------------------------------------------------------
// 스냅샷 payload 빌더 (src/domain/room/types.ts 기준 타입세이프)
// ---------------------------------------------------------------------------

export function buildLobbySnapshot(
  overrides: Partial<RoomSnapshot> = {},
): RoomSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'LOBBY',
    hostId: 'p1',
    players: [player('p1'), player('p2')],
    ...overrides,
  };
}

export function buildPromptSubmissionSnapshot(
  overrides: Partial<PromptSubmissionSnapshot> = {},
): PromptSubmissionSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'GENERATING',
    promptStartedAt: isoFromNow(0),
    promptDeadline: isoFromNow(60_000),
    promptEntries: [
      { player: player('p1'), status: 'WAITING' },
      { player: player('p2'), status: 'WAITING' },
      { player: player('p3'), status: 'WAITING' },
    ],
    ...overrides,
  };
}

export function buildRoundSnapshot(
  overrides: Partial<RoundSnapshot> = {},
): RoundSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'PLAYING',
    roundNumber: 1,
    totalRoundCount: 3,
    questioner: player('p1'),
    imageUrl: 'https://example.test/image-1.png',
    guessStartedAt: isoFromNow(0),
    guessDeadline: isoFromNow(60_000),
    guessEntries: [
      { player: player('p2'), submitted: false },
      { player: player('p3'), submitted: false },
    ],
    ...overrides,
  };
}

export function buildVoteSnapshot(
  overrides: Partial<VoteSnapshot> = {},
): VoteSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'VOTING',
    roundNumber: 1,
    // 후보 = 정답(출제자) 1 + 추측자 2명의 추측 2 = 3개.
    voteOptions: [
      { optionId: 'o1', text: '한강 고양이' }, // 정답(출제자 p1)
      { optionId: 'o2', text: '라면 고양이' }, // 추측 (p2)
      { optionId: 'o3', text: '산책하는 강아지' }, // 추측 (p3)
    ],
    voteStartedAt: isoFromNow(0),
    voteDeadline: isoFromNow(60_000),
    completedVoteCount: 0,
    // 투표자 = 추측자 2명(출제자 제외).
    totalVoteCount: 2,
    perfectGuessExists: false,
    ...overrides,
  };
}

export function buildVoteSkippedSnapshot(
  overrides: Partial<VoteSkippedSnapshot> = {},
): VoteSkippedSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'VOTE_SKIPPED',
    roundNumber: 1,
    startedAt: isoFromNow(0),
    deadline: isoFromNow(100),
    reason: 'ALL_PERFECT',
    ...overrides,
  };
}

export function buildRoundResultSnapshot(
  overrides: Partial<RoundResultSnapshot> = {},
): RoundResultSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'RESULTS',
    roundNumber: 1,
    totalRoundCount: 3,
    questioner: player('p1'),
    answerText: '한강 고양이',
    resultStartedAt: isoFromNow(0),
    resultDeadline: isoFromNow(60_000),
    voteSkippedReason: null,
    // p1=철수(출제자), p2=영희·p3=민수(추측자). 예시 라운드:
    // 영희 → 정답 투표(맞힘 +2) + 민수를 속임(+1) = 3점,
    // 철수(출제자) → 정답자 발생으로 +2, 민수 → 0점.
    results: [
      {
        player: player('p2'),
        guessText: '라면 고양이',
        isAnswer: false,
        roundScore: 3,
        voters: [player('p3')], // 민수가 영희 추측에 속아 투표
        scoreDetails: [
          { reason: 'CORRECT_ANSWER', label: '정답', score: 2 },
          { reason: 'FOOLED_PLAYER', label: '속임', score: 1 },
        ],
      },
      {
        player: player('p1'),
        guessText: '한강 고양이',
        isAnswer: true,
        roundScore: 2,
        voters: [player('p2')], // 영희가 정답에 투표
        scoreDetails: [{ reason: 'QUESTIONER', label: '출제자', score: 2 }],
      },
      {
        player: player('p3'),
        guessText: '산책하는 강아지',
        isAnswer: false,
        roundScore: 0,
        voters: [],
        scoreDetails: [],
      },
    ],
    players: [
      player('p1', { score: 2 }),
      player('p2', { score: 3 }),
      player('p3', { score: 0 }),
    ],
    ...overrides,
  };
}

export function buildGameResultSnapshot(
  overrides: Partial<GameResultSnapshot> = {},
): GameResultSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    phase: 'ENDED',
    finalRanking: [
      { player: player('p2', { score: 20 }), rank: 1, totalScore: 20 },
      { player: player('p1', { score: 15 }), rank: 2, totalScore: 15 },
      { player: player('p3', { score: 10 }), rank: 3, totalScore: 10 },
    ],
    ...overrides,
  };
}

/** user-queue(/user/queue/image-generation)로 보낼 bare 객체 빌더. */
export function buildImageGenerationSnapshot(
  overrides: Partial<ImageGenerationSnapshot> = {},
): ImageGenerationSnapshot {
  return {
    roomCode: DEFAULT_ROOM_CODE,
    status: 'GENERATING',
    prompt: '노란 고양이',
    imageUrl: null,
    errorMessage: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// topic 프레임 래퍼 ({type, payload}) — broker.pushTopic에 바로 넣는 형태
// ---------------------------------------------------------------------------

export function lobbyMessage(
  overrides?: Partial<RoomSnapshot>,
): TopicMessage {
  return { type: 'LOBBY_SNAPSHOT', payload: buildLobbySnapshot(overrides) };
}

export function promptSubmissionMessage(
  overrides?: Partial<PromptSubmissionSnapshot>,
): TopicMessage {
  return {
    type: 'PROMPT_SUBMISSION_SNAPSHOT',
    payload: buildPromptSubmissionSnapshot(overrides),
  };
}

export function roundMessage(
  overrides?: Partial<RoundSnapshot>,
): TopicMessage {
  return { type: 'ROUND_SNAPSHOT', payload: buildRoundSnapshot(overrides) };
}

export function voteMessage(overrides?: Partial<VoteSnapshot>): TopicMessage {
  return { type: 'VOTE_SNAPSHOT', payload: buildVoteSnapshot(overrides) };
}

export function voteSkippedMessage(
  overrides?: Partial<VoteSkippedSnapshot>,
): TopicMessage {
  return {
    type: 'VOTE_SKIPPED_SNAPSHOT',
    payload: buildVoteSkippedSnapshot(overrides),
  };
}

export function roundResultMessage(
  overrides?: Partial<RoundResultSnapshot>,
): TopicMessage {
  return {
    type: 'ROUND_RESULT_SNAPSHOT',
    payload: buildRoundResultSnapshot(overrides),
  };
}

export function gameResultMessage(
  overrides?: Partial<GameResultSnapshot>,
): TopicMessage {
  return {
    type: 'GAME_RESULT_SNAPSHOT',
    payload: buildGameResultSnapshot(overrides),
  };
}
