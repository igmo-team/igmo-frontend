import { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { Button, Input, Surface } from '../../../common/components';
import {
  trackRoomJoined,
  trackRoomJoinFailed,
} from '../../../domain/room/analytics';
import postGamePlayer from '../../home/apis/postGamePlayer';
import { getNicknameErrorMessage } from '../../home/utils/roomEntryValidation';

import type { RoomEntryState } from '../utils/getRoomEntryState';

type ErrorResponse = {
  message?: string;
};

type RoomGuestEntryModalProps = {
  roomCode: string;
  onSuccess: (entryState: RoomEntryState) => void;
};

export function RoomGuestEntryModal({
  roomCode,
  onSuccess,
}: RoomGuestEntryModalProps) {
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const nicknameErrorMessage = getNicknameErrorMessage(nickname);
  const isNicknameInvalid = errorMessage === nicknameErrorMessage;
  const entryErrorMessageId = errorMessage ? 'guest-entry-error' : undefined;

  useEffect(() => {
    nicknameInputRef.current?.focus();
  }, []);

  const { mutate: joinGame, isPending } = useMutation({
    mutationFn: postGamePlayer,
    onSuccess: ({ playerId, secret, snapshot }) => {
      trackRoomJoined({
        entryMode: 'direct_link',
        roomCode: snapshot.roomCode,
        playerId,
        isHost: snapshot.hostId === playerId,
        playerCount: snapshot.players.length,
        nicknameLength: nickname.trim().length,
      });
      onSuccess({
        playerId,
        secret,
        snapshot,
      });
    },
    onError: (error) => {
      if (isAxiosError<ErrorResponse>(error)) {
        trackRoomJoinFailed({
          entryMode: 'direct_link',
          roomCode,
          nicknameLength: nickname.trim().length,
          reason:
            error.response?.data.message ?? `HTTP_${error.response?.status}`,
        });

        setErrorMessage(
          error.response?.data.message ??
            '방에 참여하지 못했어요. 다시 시도해주세요.',
        );
        return;
      }

      trackRoomJoinFailed({
        entryMode: 'direct_link',
        roomCode,
        nicknameLength: nickname.trim().length,
        reason: 'UNKNOWN',
      });

      setErrorMessage('방에 참여하지 못했어요. 다시 시도해주세요.');
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isPending) {
      return;
    }

    if (nicknameErrorMessage) {
      setErrorMessage(nicknameErrorMessage);
      return;
    }

    setErrorMessage('');
    joinGame({ code: roomCode, nickname: nickname.trim() });
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setErrorMessage('');
  };

  return (
    <S_Overlay>
      <S_Form onSubmit={handleSubmit}>
        <S_FormCard padding="lg" shadow>
          <S_FieldLabel htmlFor="guest-nickname">닉네임</S_FieldLabel>
          <Input
            ref={nicknameInputRef}
            id="guest-nickname"
            maxLength={10}
            placeholder="예: 그림탐정"
            value={nickname}
            disabled={isPending}
            aria-invalid={isNicknameInvalid}
            aria-describedby={entryErrorMessageId}
            onChange={handleNicknameChange}
          />
          {errorMessage && (
            <S_ErrorMessage id="guest-entry-error" role="alert">
              {errorMessage}
            </S_ErrorMessage>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? '참여 중...' : '참여하기'}
          </Button>
        </S_FormCard>
      </S_Form>
    </S_Overlay>
  );
}

const S_Overlay = styled.div`
  display: flex;
  min-height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 4.4rem 2rem 9.6rem;
  background: ${({ theme }) => theme.COLOR.BACKGROUND};
`;

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
