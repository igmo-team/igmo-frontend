import type { ComponentPropsWithRef } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import type { Theme } from '@emotion/react';

type InputSize = 'md' | 'lg';

type InputProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  size?: InputSize;
};

function Input({ size = 'md', ...rest }: InputProps) {
  return <S_Input inputSize={size} {...rest} />;
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

const sizeStyles = (theme: Theme) => ({
  md: css`
    padding: 1.5rem 1.8rem;
    font-size: 1.6rem;
    border-radius: ${theme.RADIUS.MD};
  `,
  lg: css`
    padding: 1.9rem 2rem;
    font-size: 1.9rem;
    border-radius: ${theme.RADIUS.MD};
  `,
});

const S_Input = styled('input', {
  shouldForwardProp: (prop) => prop !== 'inputSize',
})<{ inputSize: InputSize }>`
  ${fieldBaseStyle}
  ${({ theme, inputSize }) => sizeStyles(theme)[inputSize]}
`;
