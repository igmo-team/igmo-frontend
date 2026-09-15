import { isGameResultSnapshot } from './parseGameResultSnapshot';
import { isPromptSubmissionSnapshot } from './parsePromptSubmissionSnapshot';
import { isRoomSnapshot } from './parseRoomSnapshot';
import { isRoundResultSnapshot } from './parseRoundResultSnapshot';
import { isRoundSnapshot } from './parseRoundSnapshot';
import { isVoteSkippedSnapshot } from './parseVoteSkippedSnapshot';
import { isVoteSnapshot } from './parseVoteSnapshot';

import type {
  RoomMessage,
  RoomTopicSnapshot,
} from '../../../domain/room/types';

export function parseRoomTopicSnapshot(body: string): RoomTopicSnapshot | null {
  try {
    const data = JSON.parse(body) as RoomMessage<unknown>;

    switch (data.type) {
      case 'LOBBY_SNAPSHOT':
        return isRoomSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'LOBBY' }
          : null;
      case 'ROUND_SNAPSHOT':
        return isRoundSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'PLAYING' }
          : null;
      case 'PROMPT_SUBMISSION_SNAPSHOT':
        return isPromptSubmissionSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'GENERATING' }
          : null;
      case 'VOTE_SNAPSHOT':
        return isVoteSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'VOTING' }
          : null;
      case 'VOTE_SKIPPED_SNAPSHOT':
        return isVoteSkippedSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'VOTE_SKIPPED' }
          : null;
      case 'ROUND_RESULT_SNAPSHOT':
        return isRoundResultSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'RESULTS' }
          : null;
      case 'GAME_RESULT_SNAPSHOT':
        return isGameResultSnapshot(data.payload)
          ? { ...data.payload, type: data.type, phase: 'ENDED' }
          : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
