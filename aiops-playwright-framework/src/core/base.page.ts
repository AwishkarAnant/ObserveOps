import { Page, Locator, expect } from '@playwright/test';
import { Logger, logger } from '../utils/logger';

export abstract class BasePage {
  protected readonly log: Logger;
  protected abstract readonly path: string;
  protected abstract readonly pageLoadedLocator: Locator;

  constructor(public readonly page: Page) {
    this.log = logger(this.constructor.name);
  }

  async goto(): Promise<void> {
    this.log.info('navigate', { path: this.path });
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.pageLoadedLocator).toBeVisible();
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.waitUntilLoaded();
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
