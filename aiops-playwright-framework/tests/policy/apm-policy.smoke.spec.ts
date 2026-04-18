import { test, expect } from '../../src/fixtures';
import { generatePolicyName } from '../../src/pages/policy/apm-policy-list.page';

const policyName = generatePolicyName();

test.describe('APM Policy Smoke @smoke', () => {
  test.afterEach(async ({ apmPolicyListPage }) => {
    await apmPolicyListPage.deletePolicyIfExists(policyName);
  });

  test('Create APM Trace Metrics Policy - Smoke @smoke', async ({
    page,
    settingsPage,
    policyNavigationPage,
    apmPolicyListPage,
    apmPolicyFormPage,
  }) => {
    await test.step('navigate to Settings', async () => {
      await settingsPage.goto();
      await settingsPage.expectLoaded();
    });

    await test.step('open Policy navigation', async () => {
      await expect(settingsPage.heading).toBeVisible();
    });

    await test.step('open APM Policy tab', async () => {
      await policyNavigationPage.openPolicy('APM');
      await expect(page).toHaveURL(/\/apm/);
    });

    await test.step('click Create Policy', async () => {
      await apmPolicyFormPage.createPolicyButton.click();
      await expect(page).toHaveURL(/\/settings\/policy-settings\/policies\/apm\/create$/);
    });

    await test.step('fill Policy Name', async () => {
      await apmPolicyFormPage.fillPolicyName(policyName);
    });

    await test.step('add Tag', async () => {
      await apmPolicyFormPage.addTag('Automation');
    });

    await test.step('select Policy Type = Trace Metrics', async () => {
      await apmPolicyFormPage.selectPolicyType('Trace Metrics');
    });

    await test.step('select Counter', async () => {
      await apmPolicyFormPage.selectCounter('service.traces.volume.bytes');
    });

    await test.step('select Source Filter = Services', async () => {
      await apmPolicyFormPage.selectSourceFilter('Services');
    });

    await test.step('select Source = Jboss_Demo_app', async () => {
      await apmPolicyFormPage.selectSource('Jboss_Demo_app');
    });

    await test.step('set Critical condition', async () => {
      await apmPolicyFormPage.setCriticalCondition('Greater Than or Equal', 1);
    });

    await test.step('submit and verify policy in grid', async () => {
      await apmPolicyFormPage.submit();
      // Toast is transient; assert the durable signal — the row in the list grid.
      await expect(page.getByRole('row').filter({ hasText: policyName })).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step('select the created policy', async () => {
      await apmPolicyListPage.selectPolicyByName(policyName);
    });

    await test.step('delete the policy', async () => {
      await apmPolicyListPage.deleteSelectedPolicy();
    });

    await test.step('verify policy removed', async () => {
      await apmPolicyListPage.expectPolicyDeleted(policyName);
    });
  });
});
