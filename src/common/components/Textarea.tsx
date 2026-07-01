import type { ComponentPropsWithRef } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import type { Theme } from '@emotion/react';

type TextareaProps = ComponentPropsWithRef<'textarea'>;

function Textarea(props: TextareaProps) {
  return <S_Textarea {...props} />;
}

export default Textarea;

// Input과 공유하는 필드 기본 룩. 지금은 각 컴포넌트에 정의해두고,
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
`;

const S_Textarea = styled.textarea`
  ${fieldBaseStyle}
  padding: 1.8rem;
  border-radius: ${({ theme }) => theme.RADIUS.LG};
  resize: none;
`;
