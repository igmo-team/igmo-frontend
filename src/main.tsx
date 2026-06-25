import { Global, ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

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
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
