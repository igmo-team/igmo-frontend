export function getNicknameErrorMessage(nickname: string) {
  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) {
    return '닉네임을 입력해주세요.';
  }

  if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
    return '닉네임은 2자 이상 10자 이하여야 합니다.';
  }

  return null;
}

export function getRoomCodeErrorMessage(roomCode: string) {
  if (!roomCode) {
    return '방 코드를 입력해주세요.';
  }

  if (!/^[A-Z]{4}$/.test(roomCode)) {
    return '방 코드는 대문자 4자리여야 합니다.';
  }

  return null;
}
