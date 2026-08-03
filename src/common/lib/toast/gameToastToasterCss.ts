import { css } from '@emotion/react';

export const gameToastToasterCss = css`
  @media (min-width: 600px) {
    .game-toast-toaster[data-sonner-toaster][data-x-position='center'] {
      right: auto;
      left: 50%;
      width: 60rem;
      transform: translateX(-50%);
    }

    .game-toast-toaster[data-sonner-toaster] [data-sonner-toast] {
      right: auto;
      left: 0;
      width: 60rem;
    }
  }
`;
