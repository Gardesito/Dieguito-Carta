import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'tests/admin-e2e',
  use: { baseURL: 'http://127.0.0.1:5175', channel: 'msedge', headless: true },
  workers: 1,
  reporter: 'list',
  outputDir: 'test-results/admin',
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --port 5175 --strictPort',
    url: 'http://127.0.0.1:5175',
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      VITE_SUPABASE_URL: 'https://dieguito-test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'public-test-key-not-a-secret',
      VITE_DEFAULT_WHATSAPP: '5492901123456',
    },
  },
})
