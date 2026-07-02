import { useState } from 'react';

import styled from '@emotion/styled';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { Button, Input, Surface } from '../../../common/components';
import { PAGE_URL } from '../../../common/constants/pageUrl';
import postGames from '../apis/postGames';
import postGamePlayer from '../apis/postGamePlayer';

type ErrorResponse = {
  message?: string;
};

type EntryMode = 'create' | 'join';

export function LobbyEntryForm() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [entryMode, setEntryMode] = useState<EntryMode>('create');
  const [errorMessage, setErrorMessage] = useState('');

  const isJoinMode = entryMode === 'join';

  const { mutate: createGame, isPending: isCreateGamePending } = useMutation({
    mutationFn: postGames,
    onSuccess: ({ roomCode }) => {
      navigate(`${PAGE_URL.LOBBY}/${roomCode}`);
    },
    onError: (error) => {
      if (isAxiosError<ErrorResponse>(error)) {
        setErrorMessage(
          error.response?.data.message ??
            '방을 만들지 못했어요. 다시 시도해주세요.',
        );
        return;
      }

      setErrorMessage('방을 만들지 못했어요. 다시 시도해주세요.');
    },
  });

  const { mutate: joinGame, isPending: isJoinGamePending } = useMutation({
    mutationFn: postGamePlayer,
    onSuccess: ({ snapshot }) => {
      navigate(`${PAGE_URL.LOBBY}/${snapshot.roomCode}`);
    },
    onError: (error) => {
      if (isAxiosError<ErrorResponse>(error)) {
        setErrorMessage(
          error.response?.data.message ??
            '방에 참여하지 못했어요. 다시 시도해주세요.',
        );
        return;
      }

      setErrorMessage('방에 참여하지 못했어요. 다시 시도해주세요.');
    },
  });

  const isEntryPending = isCreateGamePending || isJoinGamePending;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEntryPending) {
      return;
    }

    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      setErrorMessage('닉네임은 2자 이상 10자 이하여야 합니다.');
      return;
    }

    if (isJoinMode) {
      if (!roomCode) {
        setErrorMessage('방 코드를 입력해주세요.');
        return;
      }

      if (!/^[A-Z]{4}$/.test(roomCode)) {
        setErrorMessage('방 코드는 대문자 4자리여야 합니다.');
        return;
      }

      setErrorMessage('');
      joinGame({ code: roomCode, nickname: trimmedNickname });
      return;
    }

    setErrorMessage('');
    createGame({ nickname: trimmedNickname });
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  const handleJoinModeButtonClick = () => {
    setEntryMode('join');
    setErrorMessage('');
  };

  const handleCancelJoinButtonClick = () => {
    setEntryMode('create');
    setRoomCode('');
    setErrorMessage('');
  };

  return (
    <S_Form onSubmit={handleSubmit}>
      <S_FormCard padding="lg">
        <S_FieldLabel htmlFor="nickname">닉네임</S_FieldLabel>
        <Input
          id="nickname"
          maxLength={10}
          placeholder="예: 그림탐정"
          value={nickname}
          disabled={isEntryPending}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'nickname-error' : undefined}
          onChange={handleNicknameChange}
        />
        {isJoinMode && (
          <>
            <S_FieldLabel htmlFor="room-code">방 코드</S_FieldLabel>
            <Input
              id="room-code"
              maxLength={4}
              placeholder="예: ABCD"
              value={roomCode}
              disabled={isEntryPending}
              onChange={handleRoomCodeChange}
            />
          </>
        )}
        {errorMessage && (
          <S_ErrorMessage id="nickname-error">{errorMessage}</S_ErrorMessage>
        )}
        {isJoinMode ? (
          <>
            <Button type="submit" disabled={isEntryPending}>
              {isJoinGamePending ? '참여 중...' : '참여하기'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isEntryPending}
              onClick={handleCancelJoinButtonClick}
            >
              취소
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" disabled={isEntryPending}>
              {isCreateGamePending ? '방 만드는 중...' : '새 방 만들기'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isEntryPending}
              onClick={handleJoinModeButtonClick}
            >
              코드로 참여하기
            </Button>
          </>
        )}
      </S_FormCard>
    </S_Form>
  );
}

const S_Form = styled.form`
  width: 100%;
  max-width: 40rem;
`;

const S_FormCard = styled(Surface)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const S_FieldLabel = styled.label`
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;

const S_ErrorMessage = styled.p`
  ${({ theme }) => theme.TYPOGRAPHY.B5_R}
  color: ${({ theme }) => theme.COLOR.DANGER};
`;
