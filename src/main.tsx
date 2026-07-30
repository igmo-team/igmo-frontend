import { StrictMode } from 'react';

import { Global, ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import App from './App';
import { resetCss } from './common/styles/reset';
import { THEME } from './common/styles/theme';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={THEME}>
      <QueryClientProvider client={queryClient}>
        <Global styles={[resetCss]} />
        <App />
        <Toaster
          duration={2400}
          offset={{ bottom: 'var(--toast-bottom-offset, 9.6rem)' }}
          position="bottom-center"
        />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
