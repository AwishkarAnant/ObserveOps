import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export function generatePolicyName(prefix = 'APM_test'): string {
  return `${prefix}_${Date.now()}`;
}

export class ApmPolicyListPage extends BasePage {
  protected readonly path = '/settings/policy-settings/apm';
  protected readonly pageLoadedLocator: Locator;

  readonly createPolicyButton: Locator;
  readonly searchBox: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);

    this.createPolicyButton = page.getByRole('button', { name: /create policy/i });
    // Multiple "Search" textboxes exist on this page (left nav + grid search).
    // Use the one named 'search' (input[name="search"]) — that's the grid search.
    this.searchBox = page.locator('input[name="search"]').first();
    this.successToast = page
      .getByRole('alert')
      .filter({ hasText: /policy created successfully/i })
      .or(page.getByText(/policy created successfully/i))
      .first();

    this.pageLoadedLocator = this.createPolicyButton;
  }

  async openCreatePolicy(): Promise<void> {
    await this.createPolicyButton.click();
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible();
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

  /**
   * "Select" = open the row's action menu. Clicks the 3-dot opener (the last
   * cursor-pointer element in the row's Action column), which renders
   * `ul#action-dropdown-id`. Uses a page-level xpath because the row's
   * accessibility-tree view can differ from its CSS descendant structure.
   */
  async selectPolicyByName(name: string): Promise<void> {
    const row = this.policyRow(name);
    await expect(row).toBeVisible({ timeout: 20000 });
    const actionOpener = this.page.locator(
      `xpath=//tr[.//*[normalize-space(text())='${name}']]//img[last()] | //tr[.//*[normalize-space(text())='${name}']]//*[self::svg or self::i][last()]`,
    );
    await expect(actionOpener.first()).toBeVisible();
    await actionOpener.first().click();
    await expect(this.page.locator("xpath=//ul[@id='action-dropdown-id']")).toBeVisible();
  }

  /**
   * Clicks the red "delete" entry in the already-open action menu, then
   * confirms deletion in the follow-up modal.
   */
  async deleteSelectedPolicy(): Promise<void> {
    const deleteOption = this.page.locator(
      "xpath=//span[@class='flex items-center text-secondary-red']",
    );
    await expect(deleteOption).toBeVisible();
    await deleteOption.click();

    const confirmYes = this.page.locator("xpath=//button[@id='confirm-yes']");
    await expect(confirmYes).toBeVisible();
    await confirmYes.click();
  }

  async expectPolicyDeleted(name: string): Promise<void> {
    const row = this.policyRow(name);
    await expect(row).toHaveCount(0, { timeout: 10000 });
  }

  /**
   * Best-effort cleanup. Swallows errors — a failed cleanup should never
   * mask a real test failure or block the next run. If a policy was not
   * created (test failed early), count === 0 and we return silently.
   */
  async deletePolicyIfExists(name: string): Promise<void> {
    try {
      await this.goto();
      await this.searchBox.fill(name);

      const row = this.policyRow(name);
      if ((await row.count()) === 0) return;

      await row.getByRole('button', { name: /delete|remove/i }).click();
      const dialog = this.page.getByRole('dialog');
      await dialog.getByRole('button', { name: /yes|delete|confirm|ok/i }).click();

      await expect(row).toHaveCount(0);
    } catch (err) {
      this.log.warn('cleanup-failed', { name, error: (err as Error).message });
    }
  }
}
