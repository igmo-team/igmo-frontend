import { captureAnalyticsEvent } from '../../common/analytics';

type RoomJoinedProperties = {
  entryMode: 'create' | 'join' | 'direct_link';
  roomCode?: string;
  playerId?: string;
  isHost?: boolean;
  playerCount?: number;
  nicknameLength: number;
};

type RoomJoinFailedProperties = {
  entryMode: 'create' | 'join' | 'direct_link';
  roomCode?: string;
  nicknameLength: number;
  reason: string;
};

export function trackRoomJoined(properties: RoomJoinedProperties) {
  captureAnalyticsEvent('room_joined', {
    entry_mode: properties.entryMode,
    room_code: properties.roomCode,
    player_id: properties.playerId,
    is_host: properties.isHost,
    player_count: properties.playerCount,
    nickname_length: properties.nicknameLength,
  });
}

export function trackRoomJoinFailed(properties: RoomJoinFailedProperties) {
  captureAnalyticsEvent('room_join_failed', {
    entry_mode: properties.entryMode,
    room_code: properties.roomCode,
    nickname_length: properties.nicknameLength,
    reason: properties.reason,
  });
}
