import { test, expect } from '../../src/fixtures';
import type { ApmPolicyInput } from '../../src/pages/policy/apm-policy-form.page';

const policy: ApmPolicyInput = {
  name: 'Test Policy 1',
  tag: 'policy_1',
  type: 'Trace Metrics',
  counter: 'service.traces.volume.bytes',
  sourceFilter: 'Monitor',
  source: 'centos8_stream',
  condition: 'Greater than or equal to',
  thresholdValue: 1024,
  notifyEmail: 'sample@mail.com',
};

test.describe('APM Policy creation @smoke @regression', () => {
  test.afterEach(async ({ apmPolicyListPage }) => {
    await apmPolicyListPage.deletePolicyIfExists(policy.name);
  });

  test('creates a Trace Metrics policy end-to-end', async ({
    apmPolicyListPage,
    apmPolicyFormPage,
  }) => {
    await test.step('navigate to APM Policy list', async () => {
      await apmPolicyListPage.goto();
      await expect(apmPolicyListPage.createPolicyButton).toBeVisible();
    });

    await test.step('open Create Policy form', async () => {
      await apmPolicyListPage.openCreatePolicy();
      await apmPolicyFormPage.waitUntilLoaded();
    });

    await test.step('fill Policy Name and Tag', async () => {
      await apmPolicyFormPage.fillPolicyName(policy.name);
      await apmPolicyFormPage.addTag(policy.tag);
    });

    await test.step('select Policy Type = Trace Metrics', async () => {
      await apmPolicyFormPage.selectPolicyType(policy.type);
    });

    await test.step('select Counter', async () => {
      await apmPolicyFormPage.selectCounter(policy.counter);
    });

    await test.step('select Source Filter and Source', async () => {
      await apmPolicyFormPage.selectSourceFilter(policy.sourceFilter);
      await apmPolicyFormPage.selectSource(policy.source);
    });

    await test.step('set Critical Condition + threshold', async () => {
      await apmPolicyFormPage.setCondition('critical', policy.condition, policy.thresholdValue);
    });

    await test.step('add notify email', async () => {
      await apmPolicyFormPage.notifyByEmail(policy.notifyEmail);
    });

    await test.step('submit and verify success', async () => {
      await apmPolicyFormPage.submit();
      await apmPolicyListPage.expectSuccessToast();
    });

    await test.step('verify policy appears in grid', async () => {
      await apmPolicyListPage.searchPolicy(policy.name);
      await apmPolicyListPage.expectPolicyVisible(policy.name);
    });
  });
});
