export type RoomSession = {
  roomCode: string;
  playerId: string;
  secret: string;
};

const ROOM_SESSION_KEY_PREFIX = 'igmo:room-session:';

export function readRoomSession(roomCode: string): RoomSession | null {
  try {
    const value = sessionStorage.getItem(`${ROOM_SESSION_KEY_PREFIX}${roomCode}`);

    if (!value) {
      return null;
    }

    const session = JSON.parse(value) as Partial<RoomSession>;

    if (
      session.roomCode !== roomCode ||
      typeof session.playerId !== 'string' ||
      typeof session.secret !== 'string'
    ) {
      return null;
    }

    return {
      roomCode: session.roomCode,
      playerId: session.playerId,
      secret: session.secret,
    };
  } catch {
    return null;
  }
}

export function writeRoomSession(session: RoomSession) {
  try {
    sessionStorage.setItem(
      `${ROOM_SESSION_KEY_PREFIX}${session.roomCode}`,
      JSON.stringify(session),
    );
  } catch {
    // 세션 저장 실패 시 기존 라우터 state 기반 흐름은 유지한다.
  }
}

export function deleteRoomSession(roomCode: string) {
  try {
    sessionStorage.removeItem(`${ROOM_SESSION_KEY_PREFIX}${roomCode}`);
  } catch {
    // 삭제 실패는 화면 이동을 막을 이유가 없어 무시한다.
  }
}
