---
name: testcase-writer
description: Use this skill to generate detailed, automation-ready manual test cases from a knowledge base. The knowledge base may include documentation website URLs, Jira stories (pasted text or attached docs), and existing Playwright code (.spec.ts / page objects). The output is structured markdown written to docs/testcases/<module>.md, designed to be converted into Playwright automation later. Triggers on phrases like "write test cases for this", "generate test cases from this Jira story", "analyze this doc and produce test cases", "create manual test cases", "convert this requirement into test cases", "I need testcases for the X module", even when the user misspells "testcase" or uses casual phrasing. Also triggers when the user shares a Jira URL, a product doc URL, or asks to derive test cases from existing automation code.
---

# Test case writer (knowledge-base → detailed manual test cases)

You generate **detailed, automation-ready manual test cases** for the AIOps product. The test cases you produce are the bridge between product knowledge (docs, Jira, code) and Playwright automation — they must contain enough concrete detail that a QA engineer or another skill can convert them directly into `.spec.ts` files.

---

## 1. Inputs you accept

The "knowledge base" can be any combination of:

1. **Documentation URLs** — product docs, user manuals, API references. Fetch them if a web tool is available; otherwise ask the user to paste the relevant section.
2. **Jira stories** — pasted text, linked URLs, or attached docs. Extract: acceptance criteria, actors/roles, preconditions, business rules, edge cases called out by product.
3. **Existing Playwright code** — `.spec.ts`, page objects, fixtures. Use these to:
   - Confirm real selectors and flows (ground truth for what the UI actually does)
   - Avoid reinventing test cases that already exist — call out overlaps
   - Borrow module/route names so generated cases match the real app

You must have **at least one** of these before generating. If the user asks for test cases with no source material, ask for it — do not invent requirements from training data.

---

## 2. Mandatory context gathering (BLOCKING)

Before writing test cases, confirm the following. Ask in a single numbered list if any are missing:

| # | Question | Why it matters |
|---|---|---|
| 1 | **Which module / feature?** (e.g., Login, Policy Engine, APM Dashboard, RUM) | Drives filename and the `Module` field on every case |
| 2 | **What's the knowledge base?** Paste docs / URLs / Jira text / point to code files | Without this the output is fiction |
| 3 | **Jira / story ID?** (if any) | Traceability field on every case |
| 4 | **Scope boundaries?** (e.g., "just the login form, not SSO") | Prevents scope creep |
| 5 | **Existing test cases file to extend, or new file?** | Decides whether you append or create |

If the user says "just analyze what I've given you", skip #3-5 and proceed — but never skip #1 or #2.

---

## 3. Analysis procedure

Once context is in hand, do this in order. Don't skip steps — skipping leads to generic test cases (which are forbidden, §7).

### Step A — Extract requirements

From the knowledge base, extract and list (internally, as a working scratch):
- **Actors / roles** (admin, operator, viewer, unauthenticated user)
- **Preconditions** (logged-in state, data already present, feature flag on)
- **User-facing flows** (what the user does, in order)
- **Business rules** (validation, limits, permissions, defaults)
- **Error / negative paths** (what the product says happens when things go wrong)
- **Data variations** (field types, min/max, formats, special characters)
- **Integration points** (API calls, other modules touched)

### Step B — Cross-reference with existing code

If Playwright code was provided:
- Open the relevant `src/pages/<module>/` and `tests/<module>/` files
- List test cases that already exist (to avoid duplicates)
- Note the real URL routes, element roles, and selectors — use them in test case "Steps" so automation conversion is trivial

### Step C — Generate test cases

Produce both **happy path** and **negative** test cases. Aim for this balance (adjust as the feature demands):

| Type | Share | Focus |
|---|---|---|
| Happy path | ~40% | Core success flows, one per primary user story |
| Negative | ~40% | Invalid input, missing permissions, backend errors, session expiry |
| Edge / boundary | ~20% | Min/max lengths, empty states, concurrent actions, pagination limits |

Tag cases so CI can filter: `@smoke` for must-pass, `@regression` for broader, `@negative` for failure paths.

---

## 4. Output format (strict)

Write one markdown file per module at **`docs/testcases/<module>.md`**. The filename uses lowercase kebab-case (`login.md`, `apm-dashboard.md`, `policy-engine.md`).

Use this exact structure — it's parseable and automation-ready:

```markdown
# Test Cases — <Module Name>

**Source:** <docs URL(s), Jira ID(s), code paths — whatever was used>
**Generated:** <YYYY-MM-DD>
**Total cases:** <N>  (Happy: <h>, Negative: <n>, Edge: <e>)

---

## TC-<MODULE>-001 — <Short imperative title>

- **Priority:** P1 | P2 | P3
- **Type:** Happy | Negative | Edge | Boundary
- **Tags:** @smoke @regression @negative
- **Module:** <Module Name>
- **Jira:** <ID or "N/A">
- **Preconditions:**
  - <one bullet per precondition — be concrete>
- **Test Data:**
  - <field>: <value or generation rule>
- **Steps:**
  1. <action> → **Expected:** <observable result>
  2. <action> → **Expected:** <observable result>
  3. ...
- **Post-conditions:** <system state after the test, or "none">
- **Automation notes:** <selector hints, fixtures to reuse, any gotchas — this is what the Playwright engineer will read>

---

## TC-<MODULE>-002 — ...
```

### Rules for writing steps

- **One action per step.** "Fill username and click login" is two steps, not one.
- **Expected results are observable.** "Dashboard loads" is weak; "URL matches `/apm/dashboard` AND heading 'APM Overview' is visible" is automatable.
- **Reference real selectors when code is provided.** If `login.page.ts` uses `getByRole('textbox', { name: 'Username' })`, say "Fill the Username textbox" — not "enter credentials". This removes guesswork during automation.
- **Never say "verify it works"** — say what specifically is verified.
- **Test data is concrete.** Put actual strings, or name a generator (e.g., `users.admin()`, `faker.internet.email()`).

### IDs

- Format: `TC-<MODULE_UPPER>-<NNN>` → `TC-LOGIN-001`, `TC-APM-014`
- Numbering is sequential within a module, never reused, never reordered after publish.
- When appending to an existing file, continue from the highest existing ID.

---

## 5. Examples

### Example 1 — Happy path (Login)

```markdown
## TC-LOGIN-001 — User logs in with valid credentials

- **Priority:** P1
- **Type:** Happy
- **Tags:** @smoke
- **Module:** Login
- **Jira:** AIOPS-1234
- **Preconditions:**
  - Application is deployed and reachable at BASE_URL
  - Admin user exists with username `admin` and known password
- **Test Data:**
  - username: `users.admin().username`
  - password: `users.admin().password`
- **Steps:**
  1. Navigate to `/login` → **Expected:** Login form is visible with Username textbox, Password textbox, and Login button
  2. Fill Username textbox with valid username → **Expected:** Value appears in the field; no validation error
  3. Fill Password textbox with valid password → **Expected:** Value is masked; no validation error
  4. Click the Login button → **Expected:** URL no longer contains `/login`; user lands on the post-login landing page
- **Post-conditions:** User session cookie is set; storageState captures authenticated state
- **Automation notes:** Use `LoginPage` from `src/pages/common/login.page.ts`. This flow already exists in `tests/setup/auth.setup.ts` — reuse storageState, don't duplicate the login in every spec.
```

### Example 2 — Negative (Login)

```markdown
## TC-LOGIN-004 — User cannot log in with invalid password

- **Priority:** P1
- **Type:** Negative
- **Tags:** @regression @negative
- **Module:** Login
- **Jira:** AIOPS-1234
- **Preconditions:**
  - Application is deployed and reachable at BASE_URL
  - Admin user exists
- **Test Data:**
  - username: valid admin username
  - password: `"wrong-password-xyz"`
- **Steps:**
  1. Navigate to `/login` → **Expected:** Login form visible
  2. Fill Username with valid username → **Expected:** Value appears
  3. Fill Password with incorrect password → **Expected:** Value masked
  4. Click Login button → **Expected:** URL still contains `/login`; an error alert is visible with text matching `/invalid|incorrect|failed/i`
- **Post-conditions:** No session cookie set
- **Automation notes:** Use `loginPage.expectLoginError(/invalid/i)` helper. Do not assert on exact error wording — the product team reserves the right to reword.
```

---

## 6. File output rules

- **Default path:** `docs/testcases/<module>.md`. Create the directory if missing.
- **If the file exists:** show the user the current top 3 test case IDs, confirm whether to append or replace. Never silently overwrite.
- **Appending:** continue numbering from the last ID. Update the header counts (Total cases, Happy, Negative, Edge).
- **Keep a single authoritative source.** If the user wants a branch per sprint, suggest `docs/testcases/<module>-<sprint>.md` but ask first.

---

## 7. Forbidden patterns (generic test cases are unacceptable)

- **Generic prose** like "Verify the user can log in." → Write concrete steps with observable expectations.
- **Fabricated requirements.** If the knowledge base doesn't mention password complexity, don't invent cases for it — ask, or omit.
- **One mega-test covering 10 flows.** Each test case covers one flow. Split.
- **"Should work correctly"** and similar weasel-expected-results. Unacceptable.
- **Copy-pasted Jira text with no analysis.** Restating acceptance criteria as "steps" is not a test case.
- **No "TODO", "TBD", "<fill in>".** Ask instead.
- **No marketing adjectives** — same bans as other writing in this project (no "seamless", "robust", "simply", "easy").

---

## 8. Chaining with other skills

- **After `playwright-engineer`** has produced new page objects or fixtures: re-read those files before generating cases, so automation notes reference the real APIs.
- **Before `playwright-engineer`**: the cases you generate become the input spec. Write automation notes in a form `playwright-engineer` can act on directly (fixture names, locator strategies).
- **With `doc-writer`**: doc-writer writes *about changes*; this skill writes *about behavior to verify*. Don't overlap — if the user asks for both, produce the test cases here and let doc-writer reference this file.

---

## 9. Review checklist (run before showing the user)

- [ ] Every test case traces to a real requirement in the knowledge base (quote the line if in doubt)
- [ ] Every step has a concrete, observable "Expected"
- [ ] Happy and negative balance roughly matches §3 Step C
- [ ] IDs are sequential, no duplicates
- [ ] Selectors / routes match the existing codebase where provided
- [ ] Automation notes are actionable by the Playwright engineer
- [ ] No forbidden patterns (§7)
- [ ] Filename is `docs/testcases/<module>.md` with kebab-case module name
- [ ] Header counts match the actual number of cases written
