import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export class LoginPage extends BasePage {
  protected readonly path = '/login';
  protected readonly pageLoadedLocator: Locator;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
    this.pageLoadedLocator = this.submitButton;
  }

  async login(username: string, password: string): Promise<void> {
    this.log.info('login', { username });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL((url) => !url.pathname.includes('/login')),
      this.submitButton.click(),
    ]);
  }

  async expectLoginError(expected: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }
}
