import { StrictMode } from 'react';

import { Global, ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import App from './App';
import { gameToastToasterCss } from './common/lib/toast';
import { resetCss } from './common/styles/reset';
import { THEME } from './common/styles/theme';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={THEME}>
      <QueryClientProvider client={queryClient}>
        <Global styles={[resetCss, gameToastToasterCss]} />
        <Toaster
          className="game-toast-toaster"
          offset={{ bottom: 'var(--toast-bottom-offset, 9.6rem)' }}
          mobileOffset={{ bottom: 'var(--toast-bottom-offset, 9.6rem)' }}
          position="bottom-center"
        />
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
