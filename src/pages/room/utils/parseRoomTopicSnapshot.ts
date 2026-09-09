import { isGameResultSnapshot } from './parseGameResultSnapshot';
import { isPromptSubmissionSnapshot } from './parsePromptSubmissionSnapshot';
import { isRoomSnapshot } from './parseRoomSnapshot';
import { isRoundResultSnapshot } from './parseRoundResultSnapshot';
import { isRoundSnapshot } from './parseRoundSnapshot';
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
          ? { type: data.type, ...data.payload }
          : null;
      case 'ROUND_SNAPSHOT':
        return isRoundSnapshot(data.payload)
          ? { type: data.type, ...data.payload }
          : null;
      case 'PROMPT_SUBMISSION_SNAPSHOT':
        return isPromptSubmissionSnapshot(data.payload)
          ? { type: data.type, ...data.payload }
          : null;
      case 'VOTE_SNAPSHOT':
        return isVoteSnapshot(data.payload)
          ? { type: data.type, ...data.payload }
          : null;
      case 'ROUND_RESULT_SNAPSHOT':
        return isRoundResultSnapshot(data.payload)
          ? { type: data.type, ...data.payload }
          : null;
      case 'GAME_RESULT_SNAPSHOT':
        return isGameResultSnapshot(data.payload)
          ? { type: data.type, ...data.payload }
          : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
