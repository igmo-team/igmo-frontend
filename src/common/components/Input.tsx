import type { ComponentPropsWithRef } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import type { Theme } from '@emotion/react';

type InputProps = ComponentPropsWithRef<'input'>;

function Input(props: InputProps) {
  return <S_Input {...props} />;
}

export default Input;

// Textarea와 공유하는 필드 기본 룩. 지금은 각 컴포넌트에 정의해두고,
// 필드 컴포넌트가 더 늘면 공통으로 추출한다.
const fieldBaseStyle = ({ theme }: { theme: Theme }) => css`
  width: 100%;
  border: ${theme.BORDER.DEFAULT};
  background: ${theme.COLOR.PINK50};
  color: ${theme.COLOR.TEXT};
  font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.5;
  outline: none;

  &::placeholder {
    color: ${theme.COLOR.TEXT_SUBTLE};
    opacity: 0.6;
  }

  &:focus {
    border-color: ${theme.COLOR.PRIMARY500};
  }

  &:disabled {
    color: ${theme.COLOR.TEXT_SUBTLE};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const S_Input = styled.input`
  ${fieldBaseStyle}
  padding: 1.5rem 1.8rem;
  border-radius: ${({ theme }) => theme.RADIUS.MD};
`;
