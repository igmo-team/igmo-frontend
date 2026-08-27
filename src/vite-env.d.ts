/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MIN_PLAYERS_TO_START: string;
  readonly VITE_POSTHOG_PROJECT_TOKEN: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_DEPLOY_NOTIFICATION_TEST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
