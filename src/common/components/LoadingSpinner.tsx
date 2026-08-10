import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';

type LoadingSpinnerSize = 'md' | 'lg';

type LoadingSpinnerProps = {
  size?: LoadingSpinnerSize;
};

const spinnerSpin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const sizeStyles = {
  md: css`
    width: 4.8rem;
    height: 4.8rem;
    border-width: 0.7rem;
  `,
  lg: css`
    width: 6.4rem;
    height: 6.4rem;
    border-width: 0.9rem;
  `,
};

function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return <S_LoadingSpinner size={size} aria-hidden="true" />;
}

export default LoadingSpinner;

const S_LoadingSpinner = styled('div', {
  shouldForwardProp: (prop) => prop !== 'size',
})<Required<LoadingSpinnerProps>>`
  ${({ size }) => sizeStyles[size]}
  border-style: solid;
  border-color: ${({ theme }) => theme.COLOR.PERIWINKLE};
  border-left-color: transparent;
  border-radius: 50%;
  animation: ${spinnerSpin} 0.9s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
