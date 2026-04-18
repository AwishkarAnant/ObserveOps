import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export type Severity = 'critical' | 'major' | 'warning';

export type ConditionOperator =
  | 'Greater than or equal to'
  | 'Greater than'
  | 'Less than or equal to'
  | 'Less than'
  | 'Equal to'
  | 'Equals';

export type SourceFilter = 'Monitor' | 'Group' | 'Tag' | 'Everywhere';

/**
 * Shared form primitives for every policy type (Metric/Flow/Log/Availability).
 * Subclasses own only the fields unique to their policy type.
 */
export abstract class BasePolicyFormPage extends BasePage {
  protected readonly path = '';

  readonly policyNameInput: Locator;
  readonly tagInput: Locator;
  readonly sourceFilterInput: Locator;
  readonly sourceInput: Locator;
  readonly notifyTeamHeading: Locator;
  readonly notifyEmailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    super(page);

    this.policyNameInput = this.fieldByLabel('Policy Name');
    this.tagInput = this.fieldByLabel('Tag');
    this.sourceFilterInput = this.fieldByLabel('Source Filter');
    this.sourceInput = this.fieldByLabel('Source');

    this.notifyTeamHeading = page.getByRole('heading', { name: /notify team/i });
    this.notifyEmailInput = page.getByRole('textbox', { name: /email/i }).first();

    this.subjectInput = this.fieldByLabel('Subject');
    this.messageInput = page.getByRole('textbox', { name: /message/i }).first();

    this.submitButton = page.getByRole('button', { name: /create policy/i });
    this.resetButton = page.getByRole('button', { name: /^reset$/i });
  }

  /**
   * Labels in this UI are sibling <div>s, not <label for>. Scope by DOM order.
   * Exclude hidden ant-select search inputs that live inside other open
   * dropdowns — those can steal the `following::input[1]` match after the
   * first dropdown interaction.
   */
  protected fieldByLabel(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .first()
      .locator('xpath=following::input')
      .filter({ visible: true })
      .first();
  }

  severityRow(severity: Severity): Locator {
    return this.page.getByText(severity, { exact: true }).locator('..');
  }

  /**
   * Locates the currently-open Ant-Design dropdown. Closed dropdowns stay in
   * the DOM (with or without `.ant-select-dropdown-hidden`) but are visually
   * hidden; use Playwright's `:visible` pseudo-class to pick only the live one.
   */
  protected openDropdown(): Locator {
    return this.page
      .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden):visible')
      .last();
  }

  /** Waits for any open ant-select dropdown to close before the next action. */
  protected async waitForDropdownClosed(): Promise<void> {
    await expect(this.openDropdown()).toHaveCount(0, { timeout: 3000 });
  }

  /**
   * Ant-Design-style Select: trigger click opens dropdown; keyboard
   * ArrowDown + Enter confirms selection. This is the only approach that
   * survives the form drawer's animation + focus behavior reliably.
   */
  protected async selectFromDropdown(
    trigger: Locator,
    value: string,
    searchable = true,
  ): Promise<void> {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dropdown = this.openDropdown();
    await expect(dropdown).toBeVisible();

    if (searchable) {
      await this.page.keyboard.type(value);
    }
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.waitForDropdownClosed();
  }

  /** Open the dropdown at `trigger` and select the first option via keyboard. */
  protected async selectFirstOption(trigger: Locator): Promise<void> {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dropdown = this.openDropdown();
    await expect(dropdown).toBeVisible();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.waitForDropdownClosed();
  }

  async fillPolicyName(name: string): Promise<void> {
    await this.policyNameInput.fill(name);
  }

  async addTag(tag: string): Promise<void> {
    await this.tagInput.click();
    await this.tagInput.fill(tag);
    await this.tagInput.press('Enter');
    await expect(
      this.page.locator('.ant-select-selection__choice__content').filter({ hasText: tag }),
    ).toBeVisible();
  }

  async selectSourceFilter(value: SourceFilter): Promise<void> {
    await this.selectFromDropdown(this.sourceFilterInput, value, false);
  }

  /** Selects a named source, or the first available option if `source` is omitted. */
  async selectSource(source?: string): Promise<void> {
    await expect(this.sourceInput).toBeEnabled();
    if (source) {
      await this.selectFromDropdown(this.sourceInput, source, true);
    } else {
      await this.selectFirstOption(this.sourceInput);
    }
  }

  async setCondition(
    severity: Severity,
    op: ConditionOperator,
    value: number | string,
  ): Promise<void> {
    const row = this.severityRow(severity);
    const operatorInput = row.getByRole('textbox', { name: 'Select' });
    const valueInput = row.getByRole('textbox', { name: 'Value' });

    await this.selectFromDropdown(operatorInput, op, false);
    await valueInput.fill(String(value));
  }

  async setSubject(subject: string): Promise<void> {
    await this.subjectInput.fill(subject);
  }

  async setMessage(msg: string): Promise<void> {
    await this.messageInput.fill(msg);
  }

  async expandSection(name: string | RegExp): Promise<void> {
    const heading = this.page.getByRole('heading', { name });
    await heading.click();
  }

  async notifyByEmail(email: string): Promise<void> {
    await this.expandSection(/notify team/i);
    // After expansion the email field appears; use a tolerant locator.
    const emailField = this.page
      .getByRole('textbox', { name: /email/i })
      .or(this.page.getByPlaceholder(/email/i))
      .first();
    await expect(emailField).toBeVisible();
    await emailField.fill(email);

    // TODO(codegen): verify confirm-button selector against live app
    const confirmButton = emailField
      .locator('xpath=ancestor::*[self::div or self::section][1]')
      .getByRole('button')
      .first();
    await confirmButton.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }

  /**
   * Field-level error is typically rendered as a sibling element with an
   * 'error' / 'has-error' class. Callers assert on visibility or class.
   */
  fieldError(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .locator('xpath=following::*[contains(@class,"error") or contains(@class,"has-error")][1]');
  }
}
