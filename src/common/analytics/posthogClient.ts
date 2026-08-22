import posthog from 'posthog-js';

const POSTHOG_PROJECT_TOKEN = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;

if (!POSTHOG_PROJECT_TOKEN) {
  throw new Error('VITE_POSTHOG_PROJECT_TOKEN is not defined');
}

if (!POSTHOG_HOST) {
  throw new Error('VITE_POSTHOG_HOST is not defined');
}

posthog.init(POSTHOG_PROJECT_TOKEN, {
  api_host: POSTHOG_HOST,
  autocapture: false,
  capture_pageview: false,
});

export default posthog;
