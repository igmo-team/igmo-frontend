import { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { Button, Input, Surface } from '../../../common/components';
import { PAGE_URL } from '../../../common/constants/pageUrl';
import postGamePlayer from '../apis/postGamePlayer';
import postGames from '../apis/postGames';
import {
  getNicknameErrorMessage,
  getRoomCodeErrorMessage,
} from '../utils/roomEntryValidation';
import { writeRoomSession } from '../../room/utils/roomSessionStorage';

type ErrorResponse = {
  message?: string;
};

type EntryMode = 'create' | 'join';

export function RoomEntryForm() {
  const navigate = useNavigate();
  const roomCodeInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [entryMode, setEntryMode] = useState<EntryMode>('create');
  const [errorMessage, setErrorMessage] = useState('');

  const isJoinMode = entryMode === 'join';
  const nicknameErrorMessage = getNicknameErrorMessage(nickname);
  const roomCodeErrorMessage = isJoinMode
    ? getRoomCodeErrorMessage(roomCode)
    : null;
  const isNicknameInvalid = errorMessage === nicknameErrorMessage;
  const isRoomCodeInvalid = errorMessage === roomCodeErrorMessage;
  const entryErrorMessageId = errorMessage ? 'entry-error' : undefined;

  useEffect(() => {
    if (isJoinMode) {
      roomCodeInputRef.current?.focus();
    }
  }, [isJoinMode]);

  const { mutate: createGame, isPending: isCreateGamePending } = useMutation({
    mutationFn: postGames,
    onSuccess: ({ roomCode, playerId, secret, snapshot }) => {
      writeRoomSession({ roomCode, playerId, secret });

      navigate(`${PAGE_URL.ROOM}/${roomCode}`, {
        state: {
          playerId,
          secret,
          snapshot,
        },
      });
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
    onSuccess: ({ playerId, secret, snapshot }) => {
      writeRoomSession({ roomCode: snapshot.roomCode, playerId, secret });

      navigate(`${PAGE_URL.ROOM}/${snapshot.roomCode}`, {
        state: {
          playerId,
          secret,
          snapshot,
        },
      });
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

  const submitCreateGame = (trimmedNickname: string) => {
    setErrorMessage('');
    createGame({ nickname: trimmedNickname });
  };

  const submitJoinGame = (trimmedNickname: string) => {
    const roomCodeErrorMessage = getRoomCodeErrorMessage(roomCode);

    if (roomCodeErrorMessage) {
      setErrorMessage(roomCodeErrorMessage);
      return;
    }

    setErrorMessage('');
    joinGame({ code: roomCode, nickname: trimmedNickname });
  };

  const isEntryPending = isCreateGamePending || isJoinGamePending;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEntryPending) {
      return;
    }

    if (nicknameErrorMessage) {
      setErrorMessage(nicknameErrorMessage);
      return;
    }

    const trimmedNickname = nickname.trim();

    if (isJoinMode) {
      submitJoinGame(trimmedNickname);
      return;
    }

    submitCreateGame(trimmedNickname);
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setErrorMessage('');
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value.toUpperCase());
    setErrorMessage('');
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
          aria-invalid={isNicknameInvalid}
          aria-describedby={isNicknameInvalid ? entryErrorMessageId : undefined}
          onChange={handleNicknameChange}
        />
        {isJoinMode && (
          <>
            <S_FieldLabel htmlFor="room-code">방 코드</S_FieldLabel>
            <Input
              ref={roomCodeInputRef}
              id="room-code"
              maxLength={4}
              placeholder="예: ABCD"
              value={roomCode}
              disabled={isEntryPending}
              aria-invalid={isRoomCodeInvalid}
              aria-describedby={
                isRoomCodeInvalid ? entryErrorMessageId : undefined
              }
              onChange={handleRoomCodeChange}
            />
          </>
        )}
        {errorMessage && (
          <S_ErrorMessage id="entry-error">{errorMessage}</S_ErrorMessage>
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
