import type {
  MetricBaselineInput,
  MetricThresholdInput,
} from '../pages/policy/metric-policy-form.page';

const rand = () => Math.random().toString(36).slice(2, 7);
const uniqueName = (prefix: string) => `${prefix}-${Date.now()}-${rand()}`;

// Defaults for counters/sources reference likely-present values in the app.
// TODO(codegen): confirm these exist in the target env; override via env vars if needed.
const DEFAULTS = {
  // counter/monitor omitted by default — framework picks first option.
  email: 'sample@mail.com',
};

export const metric = {
  validThreshold(overrides: Partial<MetricThresholdInput> = {}): MetricThresholdInput {
    return {
      alertType: 'Threshold Alert',
      name: uniqueName('mp-thr'),
      tag: 'mp_auto',
      // Default to Monitor + first-available source; the form auto-selects
      // the first monitor when `source` is left undefined.
      sourceFilter: 'Monitor',
      thresholds: {
        critical: { op: 'Equals', value: 90 },
      },
      notifyEmail: DEFAULTS.email,
      ...overrides,
    };
  },

  multiSeverityThreshold(overrides: Partial<MetricThresholdInput> = {}): MetricThresholdInput {
    return metric.validThreshold({
      name: uniqueName('mp-multi'),
      thresholds: {
        critical: { op: 'Equals', value: 90 },
        major: { op: 'Equals', value: 75 },
        warning: { op: 'Equals', value: 60 },
      },
      ...overrides,
    });
  },

  /** Source left undefined — form picks first monitor in the dropdown. */
  withMonitorSource(): MetricThresholdInput {
    return metric.validThreshold({
      name: uniqueName('mp-mon'),
      sourceFilter: 'Monitor',
    });
  },

  withWindowAndOccurrence(window = '5 min', abnormality = '3'): MetricThresholdInput {
    return metric.validThreshold({
      name: uniqueName('mp-win'),
      window,
      abnormalityOccurrence: abnormality,
    });
  },

  withAutoClear(autoClear = '10 min'): MetricThresholdInput {
    return metric.validThreshold({
      name: uniqueName('mp-ac'),
      autoClear,
    });
  },

  validBaselineAbsolute(overrides: Partial<MetricBaselineInput> = {}): MetricBaselineInput {
    return {
      alertType: 'Baseline Alert',
      name: uniqueName('mp-base-abs'),
      sourceFilter: 'Monitor',
      mode: 'Absolute',
      deviations: { critical: 20, major: 15, warning: 10 },
      notifyEmail: DEFAULTS.email,
      ...overrides,
    };
  },

  validBaselineRelative(overrides: Partial<MetricBaselineInput> = {}): MetricBaselineInput {
    return metric.validBaselineAbsolute({
      name: uniqueName('mp-base-rel'),
      mode: 'Relative',
      deviations: { critical: 30, major: 20, warning: 10 },
      ...overrides,
    });
  },

  edge: {
    zeroThreshold(): MetricThresholdInput {
      return metric.validThreshold({
        name: uniqueName('mp-zero'),
        thresholds: { critical: { op: 'Equals', value: 0 } },
      });
    },
    unicodeName(): MetricThresholdInput {
      return metric.validThreshold({ name: `策略-🚨-${Date.now()}` });
    },
    maxLengthName(length = 255): MetricThresholdInput {
      return metric.validThreshold({ name: 'A'.repeat(length) });
    },
    escalationOrdering(): MetricThresholdInput {
      return metric.validThreshold({
        name: uniqueName('mp-esc'),
        thresholds: {
          critical: { op: 'Equals', value: 90 },
          major: { op: 'Equals', value: 95 }, // intentional wrong order
          warning: { op: 'Equals', value: 80 },
        },
      });
    },
  },

  invalid: {
    missingName(): MetricThresholdInput {
      return metric.validThreshold({ name: '' });
    },
    missingSource(): MetricThresholdInput {
      return metric.validThreshold({
        name: uniqueName('mp-nosrc'),
        sourceFilter: 'Monitor',
      });
    },
    nonNumericThreshold(): MetricThresholdInput {
      return metric.validThreshold({
        name: uniqueName('mp-nan'),
        thresholds: { critical: { op: 'Equals', value: 'abc' } },
      });
    },
    invalidEmail(): MetricThresholdInput {
      return metric.validThreshold({
        name: uniqueName('mp-badmail'),
        notifyEmail: 'user@@x',
      });
    },
  },
};

export const policyData = { metric };
