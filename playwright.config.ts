import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:5173', channel: 'msedge', headless: true },
  workers: 1,
  reporter: 'list',
  outputDir: 'test-results',
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
})
