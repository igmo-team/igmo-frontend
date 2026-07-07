import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';

type LogoMarkSize = 'sm' | 'lg';

type LogoMarkProps = {
  size?: LogoMarkSize;
  animated?: boolean;
};

const logoFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2.8rem);
  }
`;

const sizeStyles = {
  sm: css`
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 1.1rem;

    span {
      font-size: 1.9rem;
    }
  `,
  lg: css`
    width: 6.8rem;
    height: 6.8rem;
    border-radius: 2rem;

    span {
      font-size: 3.4rem;
    }
  `,
};

function LogoMark({ size = 'lg', animated = false }: LogoMarkProps) {
  return (
    <S_LogoMark size={size} animated={animated} aria-hidden="true">
      <span>?</span>
    </S_LogoMark>
  );
}

export default LogoMark;

const S_LogoMark = styled('div', {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'animated',
})<Required<LogoMarkProps>>`
  display: grid;
  place-items: center;
  border: ${({ theme }) => theme.BORDER.DEFAULT};
  background: ${({ theme }) => theme.COLOR.PRIMARY500};
  box-shadow: ${({ theme }) => theme.SHADOW.BUTTON};

  ${({ size }) => sizeStyles[size]}

  ${({ animated }) =>
    animated &&
    css`
      animation: ${logoFloat} 4s ease-in-out infinite;
      will-change: transform;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}

  span {
    color: ${({ theme }) => theme.COLOR.WHITE};
    font-family: 'Jua', 'Pretendard', 'Pretendard Variable', sans-serif;
    line-height: 1;
  }
`;
