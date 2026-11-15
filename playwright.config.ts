import { defineConfig, devices } from '@playwright/test'

// e2e-тесты открывают собранный сайт (npm run build && npm run preview)
// в браузере с размером экрана iPhone.
export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173/My-shelf/',
    trace: 'off',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/My-shelf/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // Главный профиль: движок Safari (WebKit) и экран iPhone.
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
    // Запасной профиль на Chromium — для облачной среды разработки, где нет WebKit.
    {
      name: 'iphone-chromium',
      use: { ...devices['iPhone 13'], browserName: 'chromium', defaultBrowserType: 'chromium' },
    },
  ],
})
