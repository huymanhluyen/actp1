import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  workers: 1,               
  retries: 0,
  reporter: [['./reporters/terminal-reporter.ts'], ['json', { outputFile: 'results.json' }], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://actp1.csc.edu.vn',
    actionTimeout: 15_000,       
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1366, height: 768 },   
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } }],
});
