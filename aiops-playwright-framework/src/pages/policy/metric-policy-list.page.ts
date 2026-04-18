import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export class MetricPolicyListPage extends BasePage {
  // TODO(codegen): verify path against live app
  protected readonly path = '/settings/policy-settings/metric';
  protected readonly pageLoadedLocator: Locator;

  readonly createPolicyButton: Locator;
  readonly searchBox: Locator;
  readonly successToast: Locator;
  readonly duplicateErrorToast: Locator;

  constructor(page: Page) {
    super(page);

    this.createPolicyButton = page.getByRole('button', { name: /create policy/i });
    this.searchBox = page.locator('input[name="search"]').first();
    this.successToast = page
      .getByRole('alert')
      .filter({ hasText: /policy created successfully/i })
      .or(page.getByText(/policy created successfully/i))
      .first();
    this.duplicateErrorToast = page
      .getByRole('alert')
      .filter({ hasText: /already exists|duplicate/i })
      .or(page.getByText(/already exists|duplicate/i))
      .first();

    this.pageLoadedLocator = this.createPolicyButton;
  }

  async openCreatePolicy(): Promise<void> {
    await this.createPolicyButton.click();
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible();
  }

  async expectDuplicateError(): Promise<void> {
    await expect(this.duplicateErrorToast).toBeVisible();
  }

  private policyRow(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async expectPolicyVisible(name: string): Promise<void> {
    await expect(this.policyRow(name)).toBeVisible();
  }

  async expectPolicyNotVisible(name: string): Promise<void> {
    await expect(this.policyRow(name)).toHaveCount(0);
  }

  async searchPolicy(name: string): Promise<void> {
    await expect(this.searchBox).toBeVisible();
    await this.searchBox.fill(name);
    await expect(this.policyRow(name)).toBeVisible();
  }

  private editButton(row: Locator): Locator {
    return row
      .getByRole('button', { name: /edit/i })
      .or(row.locator('button:has(svg[aria-label="edit"])'))
      .first();
  }

  private deleteButton(row: Locator): Locator {
    return row
      .getByRole('button', { name: /delete|remove/i })
      .or(row.locator('button:has(svg[aria-label="delete"])'))
      .first();
  }

  async openPolicyForEdit(name: string): Promise<void> {
    await this.searchBox.fill(name);
    const row = this.policyRow(name);
    await this.editButton(row).click();
  }

  async deletePolicyIfExists(name: string): Promise<void> {
    try {
      await this.goto();
      await this.searchBox.fill(name);
      const row = this.policyRow(name);
      if ((await row.count()) === 0) return;

      await this.deleteButton(row).click();
      const dialog = this.page.getByRole('dialog');
      await dialog.getByRole('button', { name: /yes|delete|confirm|ok/i }).click();
      await expect(row).toHaveCount(0);
    } catch (err) {
      this.log.warn('cleanup-failed', { name, error: (err as Error).message });
    }
  }
}
