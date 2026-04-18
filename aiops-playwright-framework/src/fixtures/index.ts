import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/common/login.page';
import { ApmDashboardPage } from '../pages/apm/apm-dashboard.page';
import { ApmPolicyListPage } from '../pages/policy/apm-policy-list.page';
import { ApmPolicyFormPage } from '../pages/policy/apm-policy-form.page';
import { MetricPolicyListPage } from '../pages/policy/metric-policy-list.page';
import { MetricPolicyFormPage } from '../pages/policy/metric-policy-form.page';
import { SettingsPage } from '../pages/settings/settings.page';
import { PolicyNavigationPage } from '../pages/settings/policy-navigation.page';

type Pages = {
  loginPage: LoginPage;
  apmDashboardPage: ApmDashboardPage;
  apmPolicyListPage: ApmPolicyListPage;
  apmPolicyFormPage: ApmPolicyFormPage;
  metricPolicyListPage: MetricPolicyListPage;
  metricPolicyFormPage: MetricPolicyFormPage;
  settingsPage: SettingsPage;
  policyNavigationPage: PolicyNavigationPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  apmDashboardPage: async ({ page }, use) => {
    await use(new ApmDashboardPage(page));
  },
  apmPolicyListPage: async ({ page }, use) => {
    await use(new ApmPolicyListPage(page));
  },
  apmPolicyFormPage: async ({ page }, use) => {
    await use(new ApmPolicyFormPage(page));
  },
  metricPolicyListPage: async ({ page }, use) => {
    await use(new MetricPolicyListPage(page));
  },
  metricPolicyFormPage: async ({ page }, use) => {
    await use(new MetricPolicyFormPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  policyNavigationPage: async ({ page }, use) => {
    await use(new PolicyNavigationPage(page));
  },
});

export { expect } from '@playwright/test';
