import { defineConfig, devices } from '@playwright/test';

// End-to-end tests (e2e/) against a running site and its real backend.
//   BASE_URL set   - test that site (CI: the Cloudflare Pages deploy that was just published)
//   BASE_URL unset - build and preview this checkout on :4173, talking to API_URL
//                    (default http://localhost:8080, the local compose backend)
const baseURL = process.env.BASE_URL?.replace(/\/+$/, '');
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 }, // the API container may be cold-starting
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list'], ['html']],
  use: {
    baseURL: baseURL || 'http://localhost:4173',
    // An English browser on purpose: the site must still open in Arabic
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: baseURL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: !CI,
        timeout: 180_000,
        env: { VITE_SERVER_URL: process.env.API_URL || 'http://localhost:8080' },
      },
});
