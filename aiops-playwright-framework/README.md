# aiops-playwright-framework

End-to-end test framework for the **Motadata AIOps** platform, built on Playwright Test + TypeScript.

## Tech

| | |
|---|---|
| Test runner | [Playwright Test](https://playwright.dev/) ^1.59 |
| Language | TypeScript 5.6 (strict, `exactOptionalPropertyTypes: true`) |
| Node | ≥ 20 |
| Lint / format | ESLint 9 + `eslint-plugin-playwright`, Prettier 3 |
| Env handling | `dotenv` + `cross-env` per-env npm scripts |

## Prerequisites

- Node.js ≥ 20
- A reachable Motadata AIOps instance (the test suite hits real APIs/UI)
- Credentials for a test admin user (set via env vars — see next section)

## Install

```bash
npm install
```

`postinstall` runs `playwright install --with-deps`, so browsers are fetched automatically.

## Environment config

Create a `.env` file (git-ignored) at the repo root:

```dotenv
APP_BASE_URL=https://<your-aiops-host>
APP_USERNAME=admin
APP_PASSWORD=<password>
```

Per-environment test runs use `cross-env TEST_ENV=<env>` which the config consumes; no code changes needed to switch targets.

## Running tests

| Script | When to use |
|---|---|
| `npm test` | Run every spec, all projects |
| `npm run test:dev` / `:qa` / `:staging` | Target a specific environment via `TEST_ENV` |
| `npm run test:chromium` | Chromium project only |
| `npm run test:api` | API project only |
| `npm run test:smoke` | Specs tagged `@smoke` |
| `npm run test:regression` | Specs tagged `@regression` |
| `npm run test:headed` | Watch the browser as tests execute |
| `npm run test:ui` | Playwright's UI-mode runner |
| `npm run test:debug` | Inspector attached |
| `npm run report` | Serve the last HTML report at `http://localhost:9323` |
| `npm run codegen` | Launch Playwright codegen for selector capture |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `npm run format` | ESLint / Prettier |

Example — run one spec, one project, headed:

```bash
npx playwright test tests/policy/apm-policy.smoke.spec.ts --project=chromium --headed
```

## Viewing reports

```bash
npm run report
```

Opens `http://localhost:9323`. If the port is occupied by a previous server, kill the old process or point your browser at that URL directly.

## Project layout

```
aiops-playwright-framework/
├── playwright.config.ts           # projects, storageState, trace/retry rules
├── src/
│   ├── core/
│   │   └── base.page.ts           # abstract BasePage (path, goto, reload)
│   ├── fixtures/
│   │   └── index.ts               # extends base test with all POM fixtures
│   ├── pages/
│   │   ├── common/login.page.ts
│   │   ├── apm/apm-dashboard.page.ts
│   │   ├── settings/{settings,policy-navigation}.page.ts
│   │   └── policy/
│   │       ├── base-policy-form.page.ts
│   │       ├── apm-policy-{list,form}.page.ts
│   │       └── metric-policy-{list,form}.page.ts
│   ├── test-data/policy-data.factory.ts
│   └── utils/{env,logger}.ts
├── tests/
│   ├── setup/auth.setup.ts        # storageState login (runs once per project)
│   ├── smoke/open-url.spec.ts
│   ├── apm/apm.spec.ts
│   └── policy/
│       ├── apm-policy.spec.ts            # full lifecycle (create only)
│       ├── apm-policy.smoke.spec.ts      # create → select → delete
│       ├── metric-policy.smoke.spec.ts   # navigation-only smoke
│       └── log-policy.smoke.spec.ts      # navigation-only smoke
├── tests/test-cases/              # human-readable test-case matrices (.md)
├── .claude/
│   ├── agents/                    # Claude Code subagent definitions
│   └── skills/                    # invocable skills (SKILL.md per folder)
└── CLAUDE.md                      # project rules for Claude Code
```

## Fixtures

All page objects are wired as Playwright fixtures in `src/fixtures/index.ts`. Import `test` and `expect` from there, not from `@playwright/test`:

```ts
import { test, expect } from '../../src/fixtures';
```

| Fixture | Purpose |
|---|---|
| `loginPage` | Username/password login flow |
| `apmDashboardPage` | APM dashboard assertions |
| `settingsPage` | `/settings` navigation + heading assertion |
| `policyNavigationPage` | URL-based jump to any policy tab |
| `apmPolicyListPage` | APM list: search, create-open, row-action, delete |
| `apmPolicyFormPage` | APM create-form primitives |
| `metricPolicyListPage` | Metric list |
| `metricPolicyFormPage` | Metric create-form primitives |

## Writing a new policy smoke

1. Use `policyNavigationPage.openPolicy('<Type>')` — URL-based navigation is more stable than sidebar clicks.
2. Click the grid's Create button: `//button[@id='create-policy-btn']`.
3. Fill Policy Name via `//input[@id='policy-name']` (shared across policy forms).
4. For Ant-Design dropdowns: **click trigger → type value → press Enter**. Do not `click()` the `<li>` option — options animate and fail the stability check.
5. Assert the row with `getByRole('row').filter({ hasText: name }).toBeVisible({ timeout: 20_000 })`. Do not assert transient toast text.
6. Delete: open the 3-dot action menu on the row, click the red delete option, confirm with `//button[@id='confirm-yes']`.

Full recipe — including dropdown quirks, anti-patterns, and a spec skeleton — lives in `.claude/skills/qa-playwright-authoring/SKILL.md`.

## Conventions

- **Page Object Model** — one POM per screen area; no locators in specs.
- **Dynamic test data** — names as `` `${prefix}_${Date.now()}` `` to avoid run-to-run collisions.
- **No hard waits** — `page.waitForTimeout()` is forbidden. Use `expect(locator).toBeVisible({ timeout })`.
- **User-supplied xpath** — used verbatim via `page.locator("xpath=//...")`. Do not rewrite.
- **Assertion after every action** — URL change, visibility, value, or count.
- **`afterEach` safety net** — `deletePolicyIfExists(name)` cleans up residue when a test fails mid-flow.
- **Tag every spec** — `@smoke` for fast gate, `@regression` for the broader suite.

## Troubleshooting

**A test fails — where are the details?**
`test-results/<test-id>/error-context.md` contains the full call-log stack and an accessibility-tree snapshot at failure time. Grep it:

```bash
grep -n "heading \|row \|<policy-name>" test-results/*/error-context.md
```

That tells you whether the form drawer was still open, whether the row rendered, etc.

**Port 9323 already in use when running `npm run report`.**
A previous `show-report` server is still running. Kill the stale process or open `http://localhost:9323` directly — it's already serving the latest report.

**Dropdown test times out on "element is not stable / not visible".**
Ant-Design option `<li>` elements race with open/close animations. The reliable pattern is click-trigger → keyboard type → keyboard Enter — do not call `.click()` on the option itself.

**`exactOptionalPropertyTypes` error after adding `field: undefined`.**
Strict TS rejects explicit `undefined` for optional fields. Omit the property instead, or `delete` it after construction.

## Contributing

Before opening a PR:

```bash
npm run typecheck   # tsc --noEmit — zero output = clean
npm run lint
npm run format
npm run test:smoke  # sanity
```

Rules for code-change authorship live in `CLAUDE.md`. Rules for writing new specs live in `.claude/skills/qa-playwright-authoring/SKILL.md`.
