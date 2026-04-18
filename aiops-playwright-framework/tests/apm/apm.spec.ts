import { test, expect } from '../../src/fixtures';

test.describe('APM dashboard @smoke', () => {
  test('loads dashboard for authenticated user', async ({ apmDashboardPage, page }) => {
    await apmDashboardPage.goto();

    await expect(apmDashboardPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/apm\/dashboard$/);
  });

  test('searches for a service @regression', async ({ apmDashboardPage }) => {
    await apmDashboardPage.goto();
    await apmDashboardPage.searchService('checkout-service');

    await expect(apmDashboardPage.serviceList).toContainText('checkout-service');
  });
});
