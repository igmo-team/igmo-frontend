import { type ComponentPropsWithoutRef } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { MOBILE_MEDIA_QUERY } from '../styles/breakpoints';

export type GameToastVariant = 'success' | 'info' | 'error';

export type GameToastProps = ComponentPropsWithoutRef<'div'> & {
  title: string;
  body?: string;
  icon?: string;
  variant?: GameToastVariant;
};

function GameToast({
  title,
  body,
  icon,
  variant = 'info',
  ...rest
}: GameToastProps) {
  return (
    <S_Toast
      role="status"
      aria-live="polite"
      aria-atomic="true"
      hasBody={Boolean(body)}
      variant={variant}
      {...rest}
    >
      {icon && <S_Icon aria-hidden="true">{icon}</S_Icon>}
      <S_TextGroup hasBody={Boolean(body)}>
        <S_Title variant={variant}>{title}</S_Title>
        {body && <S_Body variant={variant}>{body}</S_Body>}
      </S_TextGroup>
    </S_Toast>
  );
}

export default GameToast;

const TOAST_VARIANT_COLORS: Record<
  GameToastVariant,
  {
    background: string;
    border: string;
    title: string;
    body: string;
  }
> = {
  success: {
    background: '#E3EEE8',
    border: '#A6DDBE',
    title: '#147A3D',
    body: '#2F8354',
  },
  info: {
    background: '#FFF7D7',
    border: '#EAD27A',
    title: '#3C2A12',
    body: '#7A5B18',
  },
  error: {
    background: '#FFE8EE',
    border: '#FF9AAE',
    title: '#9F1239',
    body: '#BE3455',
  },
};

const S_Toast = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'hasBody' && prop !== 'variant',
})<{ hasBody: boolean; variant: GameToastVariant }>`
  display: grid;
  width: min(calc(100vw - 3.2rem), 77.6rem);
  min-height: ${({ hasBody }) => (hasBody ? '10.4rem' : '8.4rem')};
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 2rem;
  padding: ${({ hasBody }) => (hasBody ? '2rem 3.2rem' : '1.8rem 3.2rem')};
  border: 0.25rem solid
    ${({ variant }) => TOAST_VARIANT_COLORS[variant].border};
  border-radius: ${({ theme }) => theme.RADIUS.IMAGE};
  background: ${({ variant }) => TOAST_VARIANT_COLORS[variant].background};
  color: ${({ variant }) => TOAST_VARIANT_COLORS[variant].title};
  pointer-events: none;

  @media ${MOBILE_MEDIA_QUERY} {
    width: min(calc(100vw - 2.4rem), 77.6rem);
    min-height: ${({ hasBody }) => (hasBody ? '8.8rem' : '7.2rem')};
    gap: 1.4rem;
    padding: ${({ hasBody }) => (hasBody ? '1.6rem 2rem' : '1.5rem 2rem')};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
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

const S_Title = styled('strong', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: GameToastVariant }>`
  color: ${({ variant }) => TOAST_VARIANT_COLORS[variant].title};
  overflow-wrap: anywhere;
  ${({ theme }) => theme.TYPOGRAPHY.TITLE3}

  @media ${MOBILE_MEDIA_QUERY} {
    ${({ theme }) => theme.TYPOGRAPHY.TITLE4}
  }
`;

const S_Body = styled('p', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: GameToastVariant }>`
  color: ${({ variant }) => TOAST_VARIANT_COLORS[variant].body};
  overflow-wrap: anywhere;
  ${({ theme }) => theme.TYPOGRAPHY.B2_B}

  @media ${MOBILE_MEDIA_QUERY} {
    ${({ theme }) => theme.TYPOGRAPHY.B4_B}
  }
`;
