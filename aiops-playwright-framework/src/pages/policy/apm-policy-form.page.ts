import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';

export type ConditionOperator =
  | 'Greater than or equal to'
  | 'Greater than'
  | 'Less than or equal to'
  | 'Less than'
  | 'Equal to'
  | 'Equals'
  | 'Greater Than or Equal';

export type Severity = 'critical' | 'major' | 'warning';

export interface ApmPolicyInput {
  name: string;
  tag: string;
  type: 'Trace Metrics' | 'Trace Analytics';
  counter: string;
  sourceFilter: string;
  source: string;
  condition: ConditionOperator;
  thresholdValue: number;
  notifyEmail: string;
}

export class ApmPolicyFormPage extends BasePage {
  protected readonly path = '/settings/policy-settings/policies/apm/create';
  protected readonly pageLoadedLocator: Locator;

  // User-provided xpath locators (verbatim)
  readonly createPolicyButton: Locator;
  readonly policyNameInput: Locator;
  readonly tagPlaceholder: Locator;
  readonly traceMetricsOption: Locator;
  readonly counterOpener: Locator;
  readonly sourceFilterOpener: Locator;
  readonly sourceOpener: Locator;
  readonly criticalOperatorOpener: Locator;
  readonly criticalValueInput: Locator;
  readonly submitButton: Locator;

  // Legacy locators kept so old tests that reference them still compile
  readonly formHeading: Locator;
  readonly notifyTeamHeading: Locator;
  readonly notifyEmailInput: Locator;

  constructor(page: Page) {
    super(page);

    this.createPolicyButton = page.locator("xpath=//button[@id='create-policy-btn']");
    this.policyNameInput = page.locator("xpath=//input[@id='policy-name']");
    this.tagPlaceholder = page.locator("xpath=//div[@class='ant-select-selection__placeholder']");
    this.traceMetricsOption = page.locator("xpath=//span[normalize-space()='Trace Metrics']");
    this.counterOpener = page.locator("xpath=//input[@placeholder='Select Counter']");
    this.sourceFilterOpener = page.locator("xpath=//div[@id='entity']//input[@placeholder='Select']");
    this.sourceOpener = page.locator("xpath=//input[@placeholder=' ']");
    this.criticalOperatorOpener = page.locator(
      "xpath=//div[@id='critical-severity']//input[@placeholder='Select']",
    );
    this.criticalValueInput = page.locator("xpath=//input[@name='critical']");
    this.submitButton = page.locator("xpath=//button[@type='submit']");

    this.formHeading = page.getByRole('heading', { name: 'Create Policy', level: 4 });
    this.notifyTeamHeading = page.getByRole('heading', { name: 'Notify Team' });
    this.notifyEmailInput = page.getByRole('textbox', { name: /email/i });

    this.pageLoadedLocator = this.policyNameInput;
  }

  async fillPolicyName(name: string): Promise<void> {
    await this.policyNameInput.fill(name);
    await expect(this.policyNameInput).toHaveValue(name);
  }

  async addTag(tag: string): Promise<void> {
    await this.tagPlaceholder.first().click();
    await this.page.keyboard.type(tag);
    await this.page.keyboard.press('Enter');
    await expect(
      this.page.locator('.ant-select-selection__choice__content').filter({ hasText: tag }),
    ).toBeVisible();
  }

  async selectPolicyType(type: 'Trace Metrics' | 'Trace Analytics'): Promise<void> {
    if (type === 'Trace Metrics') {
      await this.traceMetricsOption.click();
      await expect(this.traceMetricsOption).toBeVisible();
    } else {
      const option = this.page.locator(`xpath=//span[normalize-space()='${type}']`);
      await option.click();
      await expect(option).toBeVisible();
    }
  }

  async selectCounter(search: string): Promise<void> {
    await this.counterOpener.click();
    const searchInput = this.page.locator("xpath=//input[@placeholder='Search']");
    await expect(searchInput.first()).toBeVisible();
    await searchInput.first().fill(search);
    await searchInput.first().press('Enter');
    await expect(this.counterOpener).not.toHaveValue('');
  }

  async selectSourceFilter(value: string): Promise<void> {
    await this.sourceFilterOpener.click();
    const option = this.page.locator(`xpath=//span[@title='${value}']`);
    await expect(option.first()).toBeVisible();
    await option.first().click();
  }

  async selectSource(serviceName: string): Promise<void> {
    await this.sourceOpener.first().click();
    const searchInput = this.page.locator("xpath=//input[@placeholder='Search']");
    await expect(searchInput.first()).toBeVisible();
    await searchInput.first().fill(serviceName);
    await searchInput.first().press('Enter');
  }

  async setCriticalCondition(op: string, value: number): Promise<void> {
    await this.criticalOperatorOpener.click();
    const opOption = this.page.locator(`xpath=//span[@title='${op}']`);
    await expect(opOption.first()).toBeVisible();
    await opOption.first().click();
    await this.criticalValueInput.fill(String(value));
    await expect(this.criticalValueInput).toHaveValue(String(value));
  }

  /**
   * Legacy API — kept for backwards compatibility with existing specs.
   * Delegates to setCriticalCondition when severity is 'critical'.
   */
  async setCondition(severity: Severity, op: ConditionOperator, value: number): Promise<void> {
    if (severity === 'critical') {
      await this.setCriticalCondition(op, value);
      return;
    }
    const valueInput = this.page.locator(`xpath=//input[@name='${severity}']`);
    const operatorInput = this.page.locator(
      `xpath=//div[@id='${severity}-severity']//input[@placeholder='Select']`,
    );
    await operatorInput.click();
    const opOption = this.page.locator(`xpath=//span[@title='${op}']`);
    await opOption.first().click();
    await valueInput.fill(String(value));
    await expect(valueInput).toHaveValue(String(value));
  }

  async notifyByEmail(email: string): Promise<void> {
    await this.notifyTeamHeading.click();
    await expect(this.notifyEmailInput).toBeVisible();
    await this.notifyEmailInput.fill(email);
    const confirmButton = this.notifyEmailInput
      .locator('xpath=ancestor::*[self::div or self::section][1]')
      .getByRole('button')
      .first();
    await confirmButton.click();
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async createPolicy(input: ApmPolicyInput): Promise<void> {
    await this.fillPolicyName(input.name);
    await this.addTag(input.tag);
    await this.selectPolicyType(input.type);
    await this.selectCounter(input.counter);
    await this.selectSourceFilter(input.sourceFilter);
    await this.selectSource(input.source);
    await this.setCondition('critical', input.condition, input.thresholdValue);
    await this.notifyByEmail(input.notifyEmail);
    await this.submit();
  }
}
