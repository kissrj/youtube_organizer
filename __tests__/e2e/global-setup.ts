import { chromium } from '@playwright/test';

async function globalSetup() {
  // Launch browser for global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');

    // Perform any global setup tasks
    // For example: create test users, seed database, etc.

    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
