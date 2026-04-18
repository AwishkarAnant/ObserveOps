import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export type PolicyType =
  | 'Metric'
  | 'Log'
  | 'Flow'
  | 'Trap'
  | 'NetRoute'
  | 'APM'
  | 'Network Config'
  | 'RUM';

const PATH_FRAGMENTS: Record<PolicyType, string> = {
  Metric: '/settings/policy-settings/metric',
  Log: '/settings/policy-settings/log',
  Flow: '/settings/policy-settings/flow',
  Trap: '/settings/policy-settings/trap',
  NetRoute: '/settings/policy-settings/netroute',
  APM: '/settings/policy-settings/apm',
  'Network Config': '/settings/policy-settings/network-config',
  RUM: '/settings/policy-settings/rum',
};

export class PolicyNavigationPage extends BasePage {
  protected readonly path = '/settings/policy-settings';
  protected readonly pageLoadedLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.pageLoadedLocator = page.getByRole('heading', { name: /settings/i });
  }

  pathFor(type: PolicyType): string {
    return PATH_FRAGMENTS[type];
  }

  async openPolicy(type: PolicyType): Promise<void> {
    // Direct URL navigation is the most stable path — the left-nav is nested
    // (Policy Settings → expand → type) and menuitem labels vary by role.
    await this.page.goto(PATH_FRAGMENTS[type], { waitUntil: 'domcontentloaded' });
    await this.expectActive(type);
  }

  async expectActive(type: PolicyType): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(PATH_FRAGMENTS[type].replace(/\//g, '\\/')));
  }
}
