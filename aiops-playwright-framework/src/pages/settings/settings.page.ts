import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export class SettingsPage extends BasePage {
  protected readonly path = '/settings';
  protected readonly pageLoadedLocator: Locator;

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /settings/i });
    this.pageLoadedLocator = this.heading;
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/settings/);
    await expect(this.heading).toBeVisible();
  }
}
