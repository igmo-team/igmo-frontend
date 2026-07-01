import type { ComponentPropsWithRef } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import type { Theme } from '@emotion/react';

type ButtonVariant = 'primary' | 'secondary' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonWidth = 'full' | 'hug' | 'flex';

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
};

function Button({
  type = 'button',
  variant = 'primary',
  size = 'lg',
  width = 'full',
  ...rest
}: ButtonProps) {
  return (
    <S_Button
      type={type}
      variant={variant}
      size={size}
      width={width}
      {...rest}
    />
  );
}

export default Button;

const variantStyles = (theme: Theme) => ({
  primary: css`
    background: ${theme.COLOR.PRIMARY500};
    color: ${theme.COLOR.WHITE};
    box-shadow: ${theme.SHADOW.BUTTON};
  `,
  secondary: css`
    background: ${theme.COLOR.PINK50};
    color: ${theme.COLOR.TEXT};
  `,
  dark: css`
    background: ${theme.COLOR.TEXT};
    color: ${theme.COLOR.WHITE};
  `,
});

const sizeStyles = (theme: Theme) => ({
  sm: css`
    padding: 1.1rem 1.8rem;
    font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
  `,
  md: css`
    padding: 1.4rem 2.2rem;
    font-family: 'Pretendard', 'Pretendard Variable', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
  `,
  lg: css`
    padding: 1.6rem 3.2rem;
    ${theme.TYPOGRAPHY.BUTTON2}
  `,
});

const WIDTH_STYLES = {
  full: css`
    width: 100%;
  `,
  hug: css`
    width: fit-content;
  `,
  flex: css`
    flex: 1;
  `,
};

const S_Button = styled('button', {
  shouldForwardProp: (prop) => !['variant', 'size', 'width'].includes(prop),
})<Required<Pick<ButtonProps, 'variant' | 'size' | 'width'>>>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  border-radius: ${({ theme }) => theme.RADIUS.MD};
  cursor: pointer;
  transition: filter 0.15s ease;

  ${({ theme, variant }) => variantStyles(theme)[variant]}
  ${({ theme, size }) => sizeStyles(theme)[size]}
  ${({ width }) => WIDTH_STYLES[width]}

  &:not(:disabled):hover {
    filter: brightness(1.03);
  }

  &:disabled {
    background: ${({ theme }) => theme.COLOR.PINK50};
    color: ${({ theme }) => theme.COLOR.TEXT_SUBTLE};
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;
