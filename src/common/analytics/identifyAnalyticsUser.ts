import posthogClient from './posthogClient';

const ANALYTICS_USER_ID_KEY = 'igmo:analytics-user-id';

export function identifyAnalyticsUser(userId: string) {
  try {
    const identifiedUserId = sessionStorage.getItem(ANALYTICS_USER_ID_KEY);

    if (identifiedUserId === userId) {
      return;
    }

    if (identifiedUserId) {
      posthogClient.reset(true);
    }

    posthogClient.identify(userId);
    sessionStorage.setItem(ANALYTICS_USER_ID_KEY, userId);
  } catch (error) {
    console.warn('[analytics] failed to identify user', error);
  }
}
