import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * env 주의: Vite는 VITE_ 접두 변수를 **빌드 시점**에 정적 주입한다.
 * 셸/process.env 값이 .env 파일보다 우선하므로, 아래 env는 `npm run build` 단계에서 적용된다.
 * - VITE_API_BASE_URL: WS URL(ws://localhost/ws) 생성용. routeWebSocket('**\/ws')이 가로챈다.
 * - VITE_MIN_PLAYERS_TO_START: 로비 시작 게이팅 최소 인원.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      VITE_API_BASE_URL: 'http://localhost',
      VITE_MIN_PLAYERS_TO_START: '1',
    },
  },
});
