import { defineConfig, devices } from '@playwright/test';

const browserChannel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    ...(browserChannel ? { channel: browserChannel } : {})
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'pnpm --filter @thc-u-know/server dev',
      cwd: '../..',
      url: 'http://127.0.0.1:5174/healthz',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    },
    {
      command: 'pnpm --filter @thc-u-know/web dev',
      cwd: '../..',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
});
