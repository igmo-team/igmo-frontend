const ROOM_CODE_PATTERN = /^[A-Z]{4}$/;

export function isRoomCodeValid(roomCode: string) {
  return ROOM_CODE_PATTERN.test(roomCode);
}
