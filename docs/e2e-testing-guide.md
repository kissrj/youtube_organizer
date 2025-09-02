# 🌐 E2E Testing Guide - YouTube Organizer

## Overview

This guide provides complete instructions for running end-to-end (E2E) tests in YouTube Organizer using Playwright. E2E tests simulate real user interactions, ensuring the entire application works correctly from the end user's perspective.

## 🛠️ Environment Setup

### Prerequisites

#### Required Software
- **Node.js 18+**
- **npm or yarn**
- **Git**
- **VS Code** (recommended)

#### Project Dependencies
```bash
npm install
# or
yarn install
```

#### Playwright Installation
```bash
# Install Playwright and browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

### Test Environment Configuration

#### Environment Variables
Create a `.env.test` file in the project root:

```env
# Application base URL
BASE_URL=http://localhost:3000

# Test credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# YouTube API (optional for tests)
YOUTUBE_API_KEY=your-test-api-key

# OpenAI API (optional)
OPENAI_API_KEY=your-test-openai-key
```

#### Test Database
```bash
# Configure SQLite database for tests
cp .env.example .env.test
# Edit DATABASE_URL to point to test database
```

## 🚀 Running Tests

### Basic Commands

#### Run All E2E Tests
```bash
npm run test:e2e
```

#### Run Tests in Specific Browser
```bash
# Chromium (Chrome)
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari (WebKit)
npx playwright test --project=webkit
```

#### Run Specific Test
```bash
# By file
npx playwright test collections-flow.test.ts

# By name pattern
npx playwright test --grep "create and manage"
```

#### Interactive Mode (Debug)
```bash
# Open Playwright visual interface
npx playwright test --ui

# Run in debug mode
npx playwright test --debug
```

### Advanced Options

#### Run with HTML Report
```bash
npx playwright test --reporter=html
# Opens report automatically
npx playwright show-report
```

#### Run in Parallel
```bash
# Use all available cores
npx playwright test --workers=4

# Run sequentially
npx playwright test --workers=1
```

#### Run with Screenshots
```bash
# Always take screenshots on failures
npx playwright test --screenshot=only-on-failure

# Take screenshots for all steps
npx playwright test --screenshot=on
```

## 📁 Test Structure

```bash
__tests__/
├── e2e/
│   ├── global-setup.ts          # Global configuration
│   ├── global-teardown.ts       # Global cleanup
│   ├── auth-flow.test.ts        # Authentication tests
│   ├── collections-flow.test.ts # Collection tests
│   ├── feeds-flow.test.ts       # Feed tests
│   ├── notifications-flow.test.ts # Notification tests
│   ├── videos-flow.test.ts      # Video tests
│   └── utils/                   # Test utilities
│       ├── test-helpers.ts
│       ├── api-helpers.ts
│       └── data-generators.ts
```

## 🔧 Test Utilities

### Authentication Helpers

```typescript
// __tests__/e2e/utils/auth-helpers.ts
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="signin-button"]');
  await page.waitForURL('/dashboard');
}

export async function logoutUser(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout"]');
  await page.waitForURL('/auth/signin');
}

export async function createTestUser() {
  // Logic to create test user via API
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    })
  });
  return response.json();
}
```

### Collection Helpers

```typescript
// __tests__/e2e/utils/collection-helpers.ts
export async function createTestCollection(page: Page, name: string, options = {}) {
  await page.click('[data-testid="create-collection"]');
  await page.fill('[data-testid="collection-name"]', name);

  if (options.description) {
    await page.fill('[data-testid="collection-description"]', options.description);
  }

  if (options.isPublic) {
    await page.check('[data-testid="collection-public"]');
  }

  await page.click('[data-testid="save-collection"]');
  await page.waitForSelector(`[data-testid="collection-title"]:has-text("${name}")`);
}

export async function addVideoToCollection(page: Page, videoUrl: string, collectionName: string) {
  // Open add video modal
  await page.click('[data-testid="add-video"]');

  // Insert URL
  await page.fill('[data-testid="video-url"]', videoUrl);
  await page.click('[data-testid="load-video"]');

  // Wait for metadata loading
  await page.waitForSelector('[data-testid="video-preview"]');

  // Select collection
  await page.selectOption('[data-testid="collection-select"]', collectionName);

  // Confirm
  await page.click('[data-testid="add-to-collection"]');
  await page.waitForSelector('[data-testid="success-message"]');
}

export async function deleteTestCollection(page: Page, name: string) {
  await page.click(`[data-testid="collection-menu-${name}"]`);
  await page.click('[data-testid="delete-collection"]');
  await page.click('[data-testid="confirm-delete"]');
  await page.waitForSelector(`[data-testid="collection-title"]:has-text("${name}")`, { state: 'hidden' });
}
```

### Data Generators

```typescript
// __tests__/e2e/utils/data-generators.ts
export function generateTestCollectionName() {
  return `Test Collection ${Date.now()}`;
}

export function generateTestVideoUrls(count: number = 5) {
  const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll
    'https://www.youtube.com/watch?v=jNQXAC9IVRw', // Me at the zoo
    'https://www.youtube.com/watch?v=9bZkp7q19f0', // Gangnam Style
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk', // Despacito
    'https://www.youtube.com/watch?v=JGwWNGJdvx8', // Shape of You
  ];

  return testUrls.slice(0, count);
}

export function generateTestUserData() {
  return {
    name: `Test User ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  };
}
```

## 📝 Writing E2E Tests

### Basic Test Structure

```typescript
// __tests__/e2e/collections-flow.test.ts
import { test, expect } from '@playwright/test';
import { loginUser, createTestCollection, addVideoToCollection } from './utils/test-helpers';

test.describe('Collections Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
  });

  test('should create and manage collections', async ({ page }) => {
    // Arrange
    const collectionName = `Test Collection ${Date.now()}`;

    // Act: Create collection
    await createTestCollection(page, collectionName, {
      description: 'Test collection for E2E testing',
      isPublic: false
    });

    // Assert: Verify creation
    await expect(page.locator('[data-testid="collection-title"]')).toContainText(collectionName);
    await expect(page.locator('[data-testid="collection-description"]')).toContainText('Test collection for E2E testing');

    // Act: Add video
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    await addVideoToCollection(page, videoUrl, collectionName);

    // Assert: Verify video in collection
    await expect(page.locator('[data-testid="collection-video"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-title"]')).toContainText('Rick Astley');

    // Cleanup
    await page.click('[data-testid="delete-collection"]');
    await page.click('[data-testid="confirm-delete"]');
  });

  test('should handle collection search and filtering', async ({ page }) => {
    // Arrange: Create multiple collections
    await createTestCollection(page, 'React Collection');
    await createTestCollection(page, 'Vue Collection');
    await createTestCollection(page, 'Angular Collection');

    // Act: Search
    await page.fill('[data-testid="search-collections"]', 'React');
    await page.click('[data-testid="search-button"]');

    // Assert: Only React collection should appear
    await expect(page.locator('[data-testid="collection-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="collection-title"]')).toContainText('React Collection');

    // Cleanup
    const collections = page.locator('[data-testid="collection-item"]');
    const count = await collections.count();
    for (let i = 0; i < count; i++) {
      await collections.nth(i).click();
      await page.click('[data-testid="delete-collection"]');
      await page.click('[data-testid="confirm-delete"]');
    }
  });
});
```

### Recommended Test Patterns

#### 1. Complete Journey Test
```typescript
test('should complete full user journey', async ({ page }) => {
  // 1. Login
  await loginUser(page, email, password);

  // 2. Create collection
  await createTestCollection(page, 'My Journey Collection');

  // 3. Add videos
  await addVideoToCollection(page, videoUrl1);
  await addVideoToCollection(page, videoUrl2);

  // 4. Organize content
  await page.click('[data-testid="organize-videos"]');
  await page.dragAndDrop('[data-testid="video-1"]', '[data-testid="drop-zone"]');

  // 5. Share collection
  await page.click('[data-testid="share-collection"]');
  await page.check('[data-testid="public-share"]');
  await page.click('[data-testid="generate-link"]');

  // 6. Verify sharing
  const shareLink = await page.locator('[data-testid="share-link"]').inputValue();
  expect(shareLink).toBeTruthy();

  // 7. Logout
  await logoutUser(page);
});
```

#### 2. Specific Functionality Test
```typescript
test('should handle bulk video operations', async ({ page }) => {
  // Arrange
  await loginUser(page, email, password);
  await createTestCollection(page, 'Bulk Test Collection');

  // Act
  await page.click('[data-testid="bulk-add-mode"]');

  // Add multiple URLs
  const videoUrls = [
    'https://www.youtube.com/watch?v=video1',
    'https://www.youtube.com/watch?v=video2',
    'https://www.youtube.com/watch?v=video3'
  ];

  for (const url of videoUrls) {
    await page.fill('[data-testid="bulk-url-input"]', url);
    await page.click('[data-testid="add-url"]');
  }

  await page.click('[data-testid="bulk-add-confirm"]');

  // Assert
  await expect(page.locator('[data-testid="collection-video"]')).toHaveCount(3);
});
```

#### 3. Responsiveness Test
```typescript
test('should work on mobile viewport', async ({ page }) => {
  // Configure mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await loginUser(page, email, password);

  // Check mobile menu
  await page.click('[data-testid="mobile-menu"]');
  await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

  // Test functionality on mobile
  await page.click('[data-testid="create-collection-mobile"]');
  await expect(page.locator('[data-testid="collection-form"]')).toBeVisible();
});
```

## 🔍 Test Debugging

### Debugging Techniques

#### 1. Screenshots and Videos
```typescript
test('debug test with screenshots', async ({ page }) => {
  await page.goto('/');

  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png' });

  // Continue test...
});
```

#### 2. Pause and Step-through
```typescript
test('debug with pause', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Pause execution for manual debug

  // Code continues after manual interaction
});
```

#### 3. Console Logs
```typescript
test('debug with console logs', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('/');
  // Page logs will be shown in console
});
```

#### 4. Network Monitoring
```typescript
test('debug network requests', async ({ page }) => {
  page.on('request', request =>
    console.log('Request:', request.method(), request.url())
  );

  page.on('response', response =>
    console.log('Response:', response.status(), response.url())
  );

  await page.goto('/');
});
```

### VS Code Debugging

#### Launch.json Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Playwright Test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "--debug", "${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## 📊 Reports and Analysis

### Report Types

#### 1. HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

#### 2. JUnit Report (for CI/CD)
```bash
npx playwright test --reporter=junit
```

#### 3. JSON Report
```bash
npx playwright test --reporter=json
```

### Results Analysis

#### Important Metrics
- **Success rate**: Percentage of passing tests
- **Average execution time**: Test performance
- **Flaky tests**: Tests that fail intermittently
- **Scenario coverage**: How well tests cover functionalities

#### Identifying Problems
```typescript
// Flaky test - may fail randomly
test('flaky test example', async ({ page }) => {
  // This test may fail due to timing
  await page.click('[data-testid="async-button"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});

// Solution: Add appropriate waits
test('stable test example', async ({ page }) => {
  await page.click('[data-testid="async-button"]');
  await page.waitForSelector('[data-testid="result"]', { timeout: 10000 });
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Configuration for Different Environments

```typescript
// playwright.config.ts
const config = {
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  projects: [
    {
      name: 'staging',
      use: {
        baseURL: 'https://staging.youtube-organizer.com',
      },
    },
    {
      name: 'production',
      use: {
        baseURL: 'https://youtube-organizer.com',
      },
    },
  ],
};
```

## 🎯 Best Practices

### General Principles
1. **Test complete user journeys**
2. **Use stable selectors (data-testid)**
3. **Avoid sleeps, use appropriate waits**
4. **Clean test data after execution**
5. **Keep tests independent**

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeAll(async () => {
    // Global setup (ex: create test user)
  });

  test.beforeEach(async ({ page }) => {
    // Per-test setup (ex: login)
  });

  test.afterEach(async ({ page }) => {
    // Per-test cleanup
  });

  test.afterAll(async () => {
    // Global cleanup
  });

  test('should do something', async ({ page }) => {
    // Specific test
  });
});
```

### Selector Patterns
```typescript
// ✅ Good - Use data-testid
await page.click('[data-testid="create-collection"]');

// ❌ Bad - Implementation dependent
await page.click('.btn-primary');

// ❌ Bad - Text dependent
await page.click('text=Create Collection');
```

### Timing Handling
```typescript
// ✅ Good - Specific wait
await page.waitForSelector('[data-testid="result"]');

// ❌ Bad - Arbitrary sleep
await page.waitForTimeout(5000);

// ✅ Good - Wait for condition
await expect(page.locator('[data-testid="loading"]')).toBeHidden();
```

## 🔧 Troubleshooting

### Common Problems

#### Intermittently Failing Tests
**Possible causes:**
- Timing issues
- Unclean state between tests
- Network dependencies

**Solutions:**
```typescript
// Add retries
test('flaky test', async ({ page }) => {
  // Test logic
}).retries(3);

// Add more robust waits
await page.waitForLoadState('networkidle');
```

#### Elements Not Found
**Checks:**
1. Is the selector correct?
2. Is the element in an iframe?
3. Are there loading states?

**Solution:**
```typescript
// Check if element exists
const element = page.locator('[data-testid="element"]');
await expect(element).toBeVisible();

// For iframes
const frame = page.frameLocator('iframe');
await frame.locator('[data-testid="element"]').click();
```

#### Browser Does Not Start
**Checks:**
1. Is Playwright installed correctly?
2. Are system dependencies installed?
3. Is port 3000 free?

**Solution:**
```bash
# Reinstall Playwright
npx playwright install --force

# Install dependencies
npx playwright install-deps
```

## 📈 Metrics and Monitoring

### Monitoring Test Quality

#### 1. Success Rate
```bash
# Check overall success rate
npx playwright test --reporter=json | jq '.stats.expected'
```

#### 2. Execution Time
```bash
# Measure test time
time npm run test:e2e
```

#### 3. Scenario Coverage
- Maintain list of covered critical scenarios
- Review coverage periodically
- Add tests for new features

### Alerts and Notifications

#### Slack Integration
```yaml
# .github/workflows/e2e.yml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: 'E2E tests failed'
```

#### Metrics Dashboard
- Average execution time
- Success rate by suite
- Failure trends
- Test coverage

---

## 📚 Additional Resources

### Official Documentation
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Communities
- [Playwright Slack](https://playwright.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)
- [GitHub Discussions](https://github.com/microsoft/playwright/discussions)

### Useful Tools
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright Codegen](https://playwright.dev/docs/codegen)
- [Playwright Test Runner](https://playwright.dev/docs/test-runner)

---

Following this guide, you will have a robust E2E test suite that ensures the quality and reliability of YouTube Organizer from the end user's perspective.
