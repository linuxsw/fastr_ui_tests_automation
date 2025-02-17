import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 10 * 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 1000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use:
  {
    viewport: { width: 1920, height: 1080},
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    launchOptions: { 
      slowMo: 10,
    }
  },

  /* Configure projects for major browsers */
  projects: [
/*     {
      name: 'chromium',
      use: {
        headless: false,
        video: {mode: 'on', size: {width: 1920, height:1080}}, 
        screenshot: 'only-on-failure',
        ...devices['Desktop Chrome']
      },
    },

    {
      name: 'firefox',
      use: {
        headless:false,
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        headless:false,
        ...devices['Desktop Safari'],
      },
    }, */

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    {
       //Microsoft Edge
      name: 'edge',
      use: {
        headless: false,
        video: {mode: 'on', size: {width: 1920, height:1080}}, 
        screenshot: 'only-on-failure',
        channel: 'msedge',
      },
    },
    {
      //Google Chrome
      name: 'chrome',
      use: {
        headless: false,
        video: {mode: 'on', size: {width: 1920, height:1080}}, 
        screenshot: 'only-on-failure',
        channel: 'chrome',
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
};
export default config;
