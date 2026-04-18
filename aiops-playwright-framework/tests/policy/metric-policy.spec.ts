import { test, expect } from '../../src/fixtures';
import { policyData } from '../../src/test-data/policy-data.factory';

/**
 * Metric Policy — Positive / Negative / Edge coverage.
 * Traceability IDs map to tests/test-cases/policy-test-cases.md.
 * Permissions, audit-log, integration, XSS/SQLi cases are marked fixme.
 */
test.describe('Metric Policy @regression', () => {
  const createdNames: string[] = [];

  test.afterEach(async ({ metricPolicyListPage }) => {
    while (createdNames.length) {
      const name = createdNames.pop()!;
      await metricPolicyListPage.deletePolicyIfExists(name);
    }
  });

  // ---------------------------------------------------------------- Positive

  test('MP-TA-001 create Threshold policy (Everywhere)', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.validThreshold();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.waitUntilLoaded();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
    await metricPolicyListPage.searchPolicy(data.name);
    await metricPolicyListPage.expectPolicyVisible(data.name);
  });

  test('MP-TA-002 create Threshold policy with Source=Monitor', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.withMonitorSource();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
    await metricPolicyListPage.expectPolicyVisible(data.name);
  });

  test('MP-TA-005 multi-severity thresholds (Critical/Major/Warning)', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.multiSeverityThreshold();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
  });

  test('MP-TA-006 evaluation window + abnormality occurrence', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.withWindowAndOccurrence('5 min', '3');
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
  });

  test('MP-TA-007 Auto Clear duration', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.withAutoClear('10 min');
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
  });

  test('MP-BA-001 Baseline Alert — Absolute (save only, not firing)', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.validBaselineAbsolute();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
    await metricPolicyListPage.expectPolicyVisible(data.name);
  });

  test('MP-BA-002 Baseline Alert — Relative % (save only, not firing)', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.validBaselineRelative();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
    await metricPolicyListPage.expectPolicyVisible(data.name);
  });

  // ------------------------------------------------------ Negative / Validation

  test('MP-V-001 Policy Name is required', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.waitUntilLoaded();
    await metricPolicyFormPage.submit();

    await expect(metricPolicyFormPage.fieldError('Policy Name')).toContainText(/required/i);
  });

  test('MP-V-002 Duplicate Policy Name (dynamic seed)', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const seed = policyData.metric.validThreshold();
    createdNames.push(seed.name);

    await test.step('seed: create original', async () => {
      await metricPolicyListPage.goto();
      await metricPolicyListPage.openCreatePolicy();
      await metricPolicyFormPage.createPolicy(seed);
      await metricPolicyListPage.expectSuccessToast();
    });

    await test.step('attempt duplicate', async () => {
      await metricPolicyListPage.goto();
      await metricPolicyListPage.openCreatePolicy();
      await metricPolicyFormPage.createPolicy({ ...seed, tag: 'dup' });
      await metricPolicyListPage.expectDuplicateError();
    });
  });

  test('MP-V-003 Counter is required', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.fillPolicyName(`mp-no-counter-${Date.now()}`);
    await metricPolicyFormPage.submit();

    await expect(metricPolicyFormPage.fieldError('Counter')).toBeVisible();
  });

  test('MP-V-004 Source required when Source Filter ≠ Everywhere', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.fillPolicyName(`mp-no-src-${Date.now()}`);
    await metricPolicyFormPage.selectAlertType('Threshold Alert');
    await metricPolicyFormPage.selectSourceFilter('Monitor');
    await metricPolicyFormPage.submit();

    await expect(metricPolicyFormPage.fieldError('Source')).toBeVisible();
  });

  test('MP-V-007 Non-numeric threshold is rejected', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.fillPolicyName(`mp-nan-${Date.now()}`);
    await metricPolicyFormPage.selectAlertType('Threshold Alert');

    const row = metricPolicyFormPage.severityRow('critical');
    const valueInput = row.getByRole('textbox', { name: 'Value' });
    await valueInput.fill('abc');
    // Either input rejects non-numeric keystrokes or the form shows an error on submit.
    await metricPolicyFormPage.submit();
    const visibleValue = await valueInput.inputValue();
    expect(visibleValue === '' || /^\d*$/.test(visibleValue)).toBeTruthy();
  });

  test('MP-V-009 Invalid email in Notify', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.fillPolicyName(`mp-badmail-${Date.now()}`);
    await metricPolicyFormPage.notifyTeamHeading.click();
    await metricPolicyFormPage.notifyEmailInput.fill('user@@x');
    await metricPolicyFormPage.submit();

    await expect(
      metricPolicyFormPage.fieldError('Email').or(
        metricPolicyFormPage.page.getByText(/invalid email/i),
      ),
    ).toBeVisible();
  });

  // --------------------------------------------------------------------- Edge

  test('MP-E-001 Threshold = 0 is accepted', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.edge.zeroThreshold();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
  });

  test('MP-E-003 Unicode + emoji in Policy Name', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.edge.unicodeName();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    await metricPolicyListPage.expectSuccessToast();
    await metricPolicyListPage.expectPolicyVisible(data.name);
  });

  test('MP-V-013 Max-length Policy Name enforced', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.edge.maxLengthName(500);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.fillPolicyName(data.name);

    const actual = await metricPolicyFormPage.policyNameInput.inputValue();
    // Either the field truncated input (maxlength), or the form rejects on submit.
    if (actual.length === data.name.length) {
      await metricPolicyFormPage.submit();
      await expect(metricPolicyFormPage.fieldError('Policy Name')).toBeVisible();
    } else {
      expect(actual.length).toBeLessThan(data.name.length);
    }
  });

  test('MP-E-004 Highest-severity rule surface-visible', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.edge.escalationOrdering();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);

    // Form either accepts (docs say highest-applicable wins at runtime) or blocks with an ordering error.
    const toast = metricPolicyListPage.successToast;
    const err = metricPolicyFormPage.fieldError('Severity');
    await expect(toast.or(err)).toBeVisible();
  });

  // --------------------------------------------------------------- Regression

  test('MP-R-001 Edit policy persists after reload', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
    page,
  }) => {
    const data = policyData.metric.validThreshold();
    createdNames.push(data.name);

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);
    await metricPolicyListPage.expectSuccessToast();

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openPolicyForEdit(data.name);
    await metricPolicyFormPage.waitUntilLoaded();

    const updatedTag = `edited-${Date.now()}`;
    await metricPolicyFormPage.addTag(updatedTag);
    await metricPolicyFormPage.submit();
    await metricPolicyListPage.expectSuccessToast();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await metricPolicyListPage.waitUntilLoaded();
    await metricPolicyListPage.openPolicyForEdit(data.name);

    await expect(
      page.locator('.ant-select-selection__choice__content').filter({ hasText: updatedTag }),
    ).toBeVisible();
  });

  test('MP-R-003 Delete policy removes it from grid', async ({
    metricPolicyListPage,
    metricPolicyFormPage,
  }) => {
    const data = policyData.metric.validThreshold();

    await metricPolicyListPage.goto();
    await metricPolicyListPage.openCreatePolicy();
    await metricPolicyFormPage.createPolicy(data);
    await metricPolicyListPage.expectSuccessToast();

    await metricPolicyListPage.deletePolicyIfExists(data.name);
    await metricPolicyListPage.goto();
    await metricPolicyListPage.searchBox.fill(data.name);
    await metricPolicyListPage.expectPolicyNotVisible(data.name);
  });

  // ------------------------------------------------------------------ fixmes

  test.fixme('MP-P-001 Admin full access', async () => {});
  test.fixme('MP-P-002 Read-only user cannot edit', async () => {});
  test.fixme('MP-P-003 Unauthorized API access returns 401/403', async () => {});
  test.fixme('MP-R-004 Audit log entries on create/edit/delete', async () => {});
  test.fixme('MP-TA-016 Integration profile triggered by severity', async () => {});
  test.fixme('MP-V-011 XSS in Subject/Message sanitized', async () => {});
  test.fixme('MP-V-012 SQL injection in Policy Name treated as literal', async () => {});
});
