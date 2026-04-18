import { Locator, Page, expect } from '@playwright/test';
import {
  BasePolicyFormPage,
  ConditionOperator,
  Severity,
  SourceFilter,
} from './base-policy-form.page';

export type MetricAlertType = 'Threshold Alert' | 'Baseline Alert';
export type BaselineMode = 'Absolute' | 'Relative';

export interface MetricThresholdInput {
  alertType: 'Threshold Alert';
  name: string;
  tag?: string;
  /** Optional — framework picks the first counter when omitted. */
  counter?: string;
  sourceFilter: SourceFilter;
  source?: string;
  thresholds: Partial<Record<Severity, { op: ConditionOperator; value: number | string }>>;
  /** Dropdown option text, e.g. '5 min', '10 min'. */
  window?: string;
  /** Dropdown option text, e.g. '1', '3'. */
  abnormalityOccurrence?: string;
  /** Dropdown option text, e.g. 'Never', '10 min'. */
  autoClear?: string;
  notifyEmail?: string;
}

export interface MetricBaselineInput {
  alertType: 'Baseline Alert';
  name: string;
  tag?: string;
  counter?: string;
  sourceFilter: SourceFilter;
  source?: string;
  mode: BaselineMode;
  deviations: Partial<Record<Severity, number>>;
  autoClear?: string;
  notifyEmail?: string;
}

export type MetricPolicyInput = MetricThresholdInput | MetricBaselineInput;

export class MetricPolicyFormPage extends BasePolicyFormPage {
  protected readonly pageLoadedLocator: Locator;

  readonly formHeading: Locator;
  readonly counterInput: Locator;
  readonly windowInput: Locator;
  readonly occurrenceInput: Locator;
  readonly autoClearInput: Locator;

  constructor(page: Page) {
    super(page);

    this.formHeading = page.getByRole('heading', { name: /metric policy/i });

    // DOM evidence (from error-context):
    //   label text "Counter"  →  <input role="textbox" name="Select Metric">
    //   label text "Notify if Threshold value breach within" → <input role="textbox" name="Select">
    //   label text "Abnormality Occurrence" → <input role="textbox" name="Select">
    //   label text "Auto Clear" → <input role="textbox" name="Select">
    // The fieldByLabel helper (following::input[1]) matches all of them.
    this.counterInput = this.fieldByLabel('Counter');
    this.windowInput = this.fieldByLabel('Notify if Threshold value breach within');
    this.occurrenceInput = this.fieldByLabel('Abnormality Occurrence');
    this.autoClearInput = this.fieldByLabel('Auto Clear');

    this.pageLoadedLocator = this.formHeading;
  }

  async selectAlertType(type: MetricAlertType): Promise<void> {
    const radio = this.page.getByRole('radio', { name: type });
    await radio.check();
    await expect(radio).toBeChecked();
  }

  /** Selects a named counter, or the first available option when omitted. */
  async selectCounter(counter?: string): Promise<void> {
    if (counter) {
      await this.selectFromDropdown(this.counterInput, counter, true);
    } else {
      await this.selectFirstOption(this.counterInput);
    }
  }

  async selectWindow(option: string): Promise<void> {
    await this.selectFromDropdown(this.windowInput, option, false);
  }

  async selectAbnormalityOccurrence(option: string): Promise<void> {
    await this.selectFromDropdown(this.occurrenceInput, option, false);
  }

  async selectAutoClear(option: string): Promise<void> {
    await this.selectFromDropdown(this.autoClearInput, option, false);
  }

  async selectBaselineMode(mode: BaselineMode): Promise<void> {
    const control = this.page
      .getByRole('radio', { name: new RegExp(mode, 'i') })
      .or(this.page.getByText(new RegExp(mode, 'i')))
      .first();
    await control.click();
  }

  async setBaselineDeviation(severity: Severity, value: number): Promise<void> {
    const row = this.severityRow(severity);
    const valueInput = row.getByRole('textbox').first();
    await valueInput.fill(String(value));
  }

  private async assertFormOpen(step: string): Promise<void> {
    // Fails fast if the drawer dismissed — pinpoints which step killed it.
    await expect(this.formHeading, `form drawer closed after: ${step}`).toBeVisible({
      timeout: 2000,
    });
  }

  async createPolicy(input: MetricPolicyInput): Promise<void> {
    await this.fillPolicyName(input.name);
    await this.assertFormOpen('fillPolicyName');
    if (input.tag) await this.addTag(input.tag);
    await this.assertFormOpen('addTag');
    await this.selectAlertType(input.alertType);
    await this.assertFormOpen('selectAlertType');
    await this.selectCounter(input.counter);
    await this.assertFormOpen('selectCounter');
    // DEBUG: dump count of visible ant-select triggers before Source Filter step
    const sfTriggers = await this.page
      .locator('.ant-select')
      .filter({ visible: true })
      .count();
    this.log.info('pre-sourceFilter', { visibleAntSelects: sfTriggers });
    const sfHtml = await this.page
      .getByText('Source Filter', { exact: true })
      .first()
      .locator('xpath=..')
      .innerHTML()
      .catch(() => '<not found>');
    this.log.info('sourceFilter-parent-html', { html: sfHtml.slice(0, 500) });

    await this.selectSourceFilter(input.sourceFilter);
    await this.assertFormOpen('selectSourceFilter');
    if (input.sourceFilter !== 'Everywhere') {
      // selectSource picks the first available option when source is undefined.
      await this.selectSource(input.source);
      await this.assertFormOpen('selectSource');
    }

    if (input.alertType === 'Threshold Alert') {
      for (const [sev, cfg] of Object.entries(input.thresholds) as [
        Severity,
        { op: ConditionOperator; value: number | string },
      ][]) {
        if (cfg) await this.setCondition(sev, cfg.op, cfg.value);
      }
      if (input.window !== undefined) await this.selectWindow(input.window);
      if (input.abnormalityOccurrence !== undefined)
        await this.selectAbnormalityOccurrence(input.abnormalityOccurrence);
      if (input.autoClear !== undefined) await this.selectAutoClear(input.autoClear);
    } else {
      await this.selectBaselineMode(input.mode);
      for (const [sev, dev] of Object.entries(input.deviations) as [Severity, number][]) {
        if (dev !== undefined) await this.setBaselineDeviation(sev, dev);
      }
      if (input.autoClear !== undefined) await this.selectAutoClear(input.autoClear);
    }

    if (input.notifyEmail) await this.notifyByEmail(input.notifyEmail);
    await this.submit();
  }
}
