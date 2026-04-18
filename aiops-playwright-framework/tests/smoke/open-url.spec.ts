import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test.use({ storageState: { cookies: [], origins: [] } });

test('opens AIOps base URL @smoke', async ({ page, baseURL }) => {
  const response = await page.goto('/');
  expect(response?.ok() || response?.status() === 302 || response?.status() === 401).toBeTruthy();
  expect(page.url()).toContain(new URL(baseURL!).host);
});
