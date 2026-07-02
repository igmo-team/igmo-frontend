import { type FormEvent, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import { Button, Input, Surface } from '../../../common/components';
import { postGames } from '../apis/postGames';

type ErrorResponse = {
  message?: string;
};

export function LobbyEntryForm() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { mutateAsync: createGame, isPending } = useMutation({
    mutationFn: postGames,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    setErrorMessage('');

    try {
      const { roomCode } = await createGame({ nickname: trimmedNickname });

      navigate(`/lobby/${roomCode}`);
    } catch (error) {
      if (isAxiosError<ErrorResponse>(error)) {
        setErrorMessage(
          error.response?.data.message ??
            '방을 만들지 못했어요. 다시 시도해주세요.',
        );
        return;
      }

      setErrorMessage('방을 만들지 못했어요. 다시 시도해주세요.');
    }
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
          disabled={isPending}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'nickname-error' : undefined}
          onChange={(event) => setNickname(event.target.value)}
        />
        {errorMessage && (
          <S_ErrorMessage id="nickname-error">{errorMessage}</S_ErrorMessage>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? '방 만드는 중...' : '새 방 만들기'}
        </Button>
        <Button variant="secondary" size="md" disabled={isPending}>
          코드로 참여하기
        </Button>
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
