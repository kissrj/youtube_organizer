# Code Citations

## License: unknown
https://github.com/saman-zdf/top_products_reports/blob/5ace3d51b8e002f9053bbbd8d2f3ac05071d3eab/jest.config.cjs

```
'^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src
```


## License: MPL-2.0
https://github.com/thorsten/phpMyFAQ/blob/7672332bc42db6840bd2f77179c5764dc171c500/playwright.config.js

```
{
  testDir: './__tests__/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json'
```


## License: unknown
https://github.com/PureMVC/puremvc-js-demo-employeeadmin/blob/f3fed53e718093eed94fec507f7e2734fe24f454/build/playwright.js

```
{
  testDir: './__tests__/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json'
```


## License: MIT
https://github.com/railflow/playwright-railflow-demo/blob/54805ed6a15b33348c6e9a1ffc1ef06b68180c49/playwright.config.ts

```
{
  testDir: './__tests__/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json'
```


## License: unknown
https://github.com/dekguh/react-atomic-boilerplate/blob/92ea1d0469defdbb70f6a68039df4ae8ac2544c3/playwright.config.ts

```
{
  testDir: './__tests__/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json'
```


## License: unknown
https://github.com/erandigit/playwright-sample/blob/eba1649a22b2194d22ae1d3c1d5f10c595e16bbb/playwright.config.ts

```
{
  testDir: './__tests__/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json'
```


## License: unknown
https://github.com/handsontable/handsontable/blob/57b4650418a2541240142bba73043c0cf0acd9f9/docs/playwright.config.ts

```
for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace:
```


## License: MIT
https://github.com/ls1intum/Artemis/blob/bb1df341c17cd89a4a1a78f7511a1494a1aa2d5b/src/test/playwright/playwright.config.ts

```
for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace:
```


## License: MIT
https://github.com/360macky/1spaceX/blob/dbe0172ae57b901983929e8c275bb5bc6f23b4bc/playwright.config.ts

```
for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace:
```


## License: MIT
https://github.com/ten-x-dev/french-house-stack/blob/721ad47fc6a48e8b5dfae1d4c19226740c4cc9ab/playwright.config.ts

```
for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace:
```


## License: MPL-2.0
https://github.com/thorsten/phpMyFAQ/blob/7672332bc42db6840bd2f77179c5764dc171c500/playwright.config.js

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: unknown
https://github.com/pnc/send-me-files/blob/2142cd9c3d69fd5c0c4532c08a82f5c1e5dc7223/playwright.config.ts

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: unknown
https://github.com/BallAerospace/COSMOS/blob/01afe3c501fea4c6221f3ee2c97425133978dd8d/playwright/playwright.config.ts

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: MIT
https://github.com/bendotcodes/cookies/blob/11c8c8278334066a60af4651503c9882bdaf502d/playwright.config.ts

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: unknown
https://github.com/michzuerch/michzuerch.github.io/blob/9161dd7fceb621543e5481af572107150cc8c49c/playwright.config.ts

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: unknown
https://github.com/blairphillips1/thepetbook/blob/3009e65fd146ef0be3c0088acafe88a4a52d5606/frontend/thepetbook-ui/playwright.config.ts

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: unknown
https://github.com/neu-info7500-spring-04/bitcoin-explorer/blob/df13a95c56850d70ed1ccae1cee799c4e76012ab/playwright.config.ts

```
'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer:
```


## License: unknown
https://github.com/Takyra/learning_application/blob/c8b535e6c08674245f1c0d1c239b97f8d982384d/server/libs/log.js

```
.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```


## License: MIT
https://github.com/luizcarlospedrosogomes/transparenciaBRAPI/blob/0378a8b7f9a796a13dd994d86b1c34be4bcd9137/src/config/logger.js

```
.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```


## License: MIT
https://github.com/JensWinter/sags-uns-einfach-twitter-bot/blob/0c7d57aab8d95c2cc3466945b80f50897e11826c/create-week-stats.js

```
.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

