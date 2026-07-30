import { StrictMode } from 'react';

import { css, Global, ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import App from './App';
import { resetCss } from './common/styles/reset';
import { THEME } from './common/styles/theme';

const queryClient = new QueryClient();
const gameToastToasterCss = css`
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={THEME}>
      <QueryClientProvider client={queryClient}>
        <Global styles={[resetCss, gameToastToasterCss]} />
        <Toaster
          className="game-toast-toaster"
          duration={2400}
          offset={{ bottom: 'var(--toast-bottom-offset, 9.6rem)' }}
          mobileOffset={{ bottom: 'var(--toast-bottom-offset, 9.6rem)' }}
          position="bottom-center"
        />
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
