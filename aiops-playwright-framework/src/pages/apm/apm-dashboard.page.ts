import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export class ApmDashboardPage extends BasePage {
  protected readonly path = '/apm/dashboard';
  protected readonly pageLoadedLocator: Locator;

  readonly heading: Locator;
  readonly serviceList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /apm|application performance/i });
    this.serviceList = page.getByTestId('apm-service-list');
    this.searchInput = page.getByRole('searchbox', { name: /search services/i });
    this.pageLoadedLocator = this.heading;
  }

  async searchService(name: string): Promise<void> {
    this.log.info('searchService', { name });
    await this.searchInput.fill(name);
    await this.page.keyboard.press('Enter');
    await expect(this.serviceList).toContainText(name);
  }

  async openService(name: string): Promise<void> {
    await this.serviceList.getByRole('link', { name }).click();
  }
}
