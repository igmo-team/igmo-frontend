import { type ComponentPropsWithoutRef } from 'react';

import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import { MOBILE_MEDIA_QUERY } from '../styles/breakpoints';

type ToastProps = ComponentPropsWithoutRef<'div'> & {
  title: string;
  body?: string;
  icon?: string;
};

function Toast({ title, body, icon, ...rest }: ToastProps) {
  return (
    <S_Toast
      role="status"
      aria-live="polite"
      aria-atomic="true"
      hasBody={Boolean(body)}
      {...rest}
    >
      {icon && <S_Icon aria-hidden="true">{icon}</S_Icon>}
      <S_TextGroup hasBody={Boolean(body)}>
        <S_Title>{title}</S_Title>
        {body && <S_Body>{body}</S_Body>}
      </S_TextGroup>
    </S_Toast>
  );
}

export default Toast;

const toastEnter = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 0.8rem);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const S_Toast = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hasBody',
})<{ hasBody: boolean }>`
  position: fixed;
  z-index: 20;
  bottom: calc(9.6rem + env(safe-area-inset-bottom));
  left: 50%;
  display: grid;
  width: min(calc(100vw - 3.2rem), 77.6rem);
  min-height: ${({ hasBody }) => (hasBody ? '10.4rem' : '8.4rem')};
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 2rem;
  padding: ${({ hasBody }) => (hasBody ? '2rem 3.2rem' : '1.8rem 3.2rem')};
  border: 0.25rem solid #ead27a;
  border-radius: ${({ theme }) => theme.RADIUS.IMAGE};
  background: #fff7d7;
  color: #3c2a12;
  pointer-events: none;
  animation: ${toastEnter} 0.18s ease-out both;

  @media ${MOBILE_MEDIA_QUERY} {
    bottom: calc(10.4rem + env(safe-area-inset-bottom));
    width: min(calc(100vw - 2.4rem), 77.6rem);
    min-height: ${({ hasBody }) => (hasBody ? '8.8rem' : '7.2rem')};
    gap: 1.4rem;
    padding: ${({ hasBody }) => (hasBody ? '1.6rem 2rem' : '1.5rem 2rem')};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translate(-50%, 0);
  }
`;

const S_Icon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  flex: none;
  font-size: 3.4rem;
  line-height: 1;

  @media ${MOBILE_MEDIA_QUERY} {
    width: 3.4rem;
    height: 3.4rem;
    font-size: 2.9rem;
  }
`;

const S_TextGroup = styled('div', {
  shouldForwardProp: (prop) => prop !== 'hasBody',
})<{ hasBody: boolean }>`
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: ${({ hasBody }) => (hasBody ? '0.4rem' : '0')};
  ${({ hasBody }) =>
    !hasBody &&
    css`
      align-self: center;
    `}
`;

const S_Title = styled.strong`
  color: #3c2a12;
  overflow-wrap: anywhere;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE3}

  @media ${MOBILE_MEDIA_QUERY} {
    ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
  }
`;

const S_Body = styled.p`
  color: #7a5b18;
  overflow-wrap: anywhere;
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}

  @media ${MOBILE_MEDIA_QUERY} {
    ${({ theme }) => theme.TYPOGRAPHY.B4_B}
  }
`;
