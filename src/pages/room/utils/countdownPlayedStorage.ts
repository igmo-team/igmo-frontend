const COUNTDOWN_PLAYED_KEY_PREFIX = 'igmo:room-countdown-played:';

export function readHasPlayedCountdown(roomCode: string) {
  try {
    return (
      sessionStorage.getItem(`${COUNTDOWN_PLAYED_KEY_PREFIX}${roomCode}`) ===
      'true'
    );
  } catch {
    return false;
  }
}

export function writeHasPlayedCountdown(roomCode: string) {
  try {
    sessionStorage.setItem(`${COUNTDOWN_PLAYED_KEY_PREFIX}${roomCode}`, 'true');
  } catch {
    // 저장에 실패해도 이번 재생에는 영향이 없어 무시한다.
  }
}
