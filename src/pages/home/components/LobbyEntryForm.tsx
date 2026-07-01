import styled from '@emotion/styled';

import { Button, Input, Surface } from '../../../common/components';

export function LobbyEntryForm() {
  return (
    <S_FormCard padding="lg">
      <S_FieldLabel htmlFor="nickname">닉네임</S_FieldLabel>
      <Input id="nickname" maxLength={10} placeholder="예: 그림탐정" />
      <Button>새 방 만들기</Button>
      <Button variant="secondary" size="md">
        코드로 참여하기
      </Button>
    </S_FormCard>
  );
}

const S_FormCard = styled(Surface)`
  display: flex;
  max-width: 40rem;
  flex-direction: column;
  gap: 1.2rem;
`;

const S_FieldLabel = styled.label`
  ${({ theme }) => theme.TYPOGRAPHY.LABEL1}
  color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
`;
